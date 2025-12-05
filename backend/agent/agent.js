const { Annotation } = require("@langchain/langgraph");
const { tool } = require("@langchain/core/tools");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { StateGraph } = require("@langchain/langgraph");

const { getPostById, updatePostById } = require("../lib/fileAPI");
const { z } = require("zod");
const { ChatOpenAI } = require("@langchain/openai");

const { AIMessage, HumanMessage } = require("@langchain/core/messages");

require("dotenv").config({ path: "../.env" });

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env['ARK_API_KEY'],
  baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
});

/**
 * ------------------------------------------------------------
 * callAgent()
 * 一个使用 LangGraph 构建的自动化数据库智能代理:
 * - 读取 post 数据
 * - 自动生成标签
 * - 使用工具调用写入 tag 到数据库
 * ------------------------------------------------------------
 */
async function callAgent(client, query, thread_id) {
  console.log("[CALL_AGENT] Starting callAgent function");

  /**
   * 1️⃣ 定义 Graph 状态结构
   * messages 是一个 BaseMessage[]，由 reducer 自动 append
   */
  console.log("[CALL_AGENT] Defining GraphState");
  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
  });

  /**
   * 2️⃣ 定义工具：读取数据库
   */
  console.log("[CALL_AGENT] Defining readDatabaseTool");
  const readDatabaseTool = tool(
    async ({ query }) => {
      console.log("[TOOL] read_database called with query:", query);
      const result = await getPostById(query);
      console.log("[TOOL] read_database result:", result);
      return JSON.stringify(result);
    },
    {
      name: "read_database",
      description: "Query post content by post_id",
      schema: z.object({
        query: z.string(),
      }),
    }
  );

  /**
   * 3️⃣ 定义工具：写 tag 到数据库
   */
  console.log("[CALL_AGENT] Defining writeTagTool");
  const writeTagTool = tool(
    async ({ post_id, tag }) => {
      console.log("[TOOL] write_tag called with post_id:", post_id, "and tag:", tag);

      await updatePostById(post_id, {
        $addToSet: { tags: tag },
      });

      console.log("[TOOL] write_tag completed for post_id:", post_id);
      return `Tag \"${tag}\" added to post ${post_id}`;
    },
    {
      name: "write_tag",
      description: "Save a new tag onto a post",
      schema: z.object({
        post_id: z.string(),
        tag: z.string(),
      }),
    }
  );

  const tools = [readDatabaseTool, writeTagTool];

  /**
   * 4️⃣ ToolNode —— 自动根据 AIMessage 中的 tool_calls 调用工具
   */
  console.log("[CALL_AGENT] Initializing ToolNode");
  const toolNode = new ToolNode(tools);

  /**
   * 5️⃣ LLM 模型 + 绑定工具
   */
  console.log("[CALL_AGENT] Initializing ChatOpenAI model");
  const model = new ChatOpenAI({
    modelName: "gpt-3.5-turbo",
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  }).bindTools(tools);

  /**
   * 6️⃣ Agent 节点：负责执行 LLM 推理
   * - 根据过往 messages
   * - 调用 LLM
   * - 返回 AIMessage
   */
  async function callModel(state) {
    console.log("[CALL_AGENT] callModel invoked with state:", state);
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful AI assistant specializing in database interaction collaboration, working alongside other assistants. Use the provided \writeDatabase\ and \readDatabase\ tools to maintain continuous dialogue with the database: focus on generating tags for posts and updating these tags into the database to advance the task. If you cannot fully complete the task (e.g., failing to read existing post data from the database or encountering issues with tag update), that's OK—another assistant with different tool access or capabilities will take over from where you left off. Execute all operations you can (such as querying post content via \readDatabase\ to draft tags, or initiating tag updates via \writeDatabase\) to make progress. If you or any of the other assistants have successfully generated post tags and completed the update to the database (i.e., achieved the final deliverable), prefix your response with **FINAL ANSWER** so the entire team knows to stop the workflow. You have access to the following tools: \writeDatabase\, \readDatabase\.\nYour core task is to maintain continuous dialogue with the database, specifically responsible for generating tags for posts and updating the generated tags into the database; during collaboration, prioritize using the provided tools to execute task steps and coordinate with other assistants to ensure task progression. \nCurrent time: {time}.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    // 格式化 prompt
    const formatted = await prompt.formatMessages({
      messages: state.messages,
      time: new Date().toISOString(), // Pass the current timestamp as the `time` variable
    });

    console.log("[CALL_AGENT] Formatted prompt:", formatted);

    // 调用 LLM
    const aiMsg = await model.invoke(formatted);

    console.log("[CALL_AGENT] AIMessage received:", aiMsg);
    return { messages: [aiMsg] };
  }

  /**
   * 7️⃣ Router —— 判断下一步去 agent 还是 tools
   */
  function shouldContinue(state) {
    console.log("[CALL_AGENT] shouldContinue invoked with state:", state);
    const msgs = state.messages;
    const last = msgs[msgs.length - 1];

    // 如果 LLM 要调用工具，则跳到 tools 节点
    if (last.tool_calls?.length) {
      console.log("[CALL_AGENT] Routing to tools");
      return "tools";
    }

    // 否则终止工作流
    console.log("[CALL_AGENT] Workflow complete");
    return "__end__";
  }

  /**
   * 8️⃣ 创建完整 StateGraph
   */
  console.log("[CALL_AGENT] Creating StateGraph workflow");
  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel) // LLM node
    .addNode("tools", toolNode)  // 工具节点
    .addEdge("__start__", "agent") // 启动
    .addConditionalEdges("agent", shouldContinue) // router
    .addEdge("tools", "agent"); // 工具结束后回去继续 agent

  /**
   * 9️⃣ 编译 graph（必须要有）
   */
  console.log("[CALL_AGENT] Compiling workflow");
  const app = workflow.compile();

  /**
   * 🔟 执行 agent → 返回结果
   */
  console.log("[CALL_AGENT] Invoking workflow with query:", query);
  const finalState = await app.invoke(
    {
      messages: [new HumanMessage(query)],
      timetime: new Date().toISOString(),
    },
    {
      recursionLimit: 20,
      configurable: { thread_id },
    }
  );

  console.log("[CALL_AGENT] Final state:", finalState);
  const output = finalState.messages[finalState.messages.length - 1].content;

  console.log("[AGENT OUTPUT]", output);
  return output;
}

main();

module.exports = { callAgent };
