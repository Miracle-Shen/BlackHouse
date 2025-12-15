const { Annotation, StateGraph } = require("@langchain/langgraph");
const { tool } = require("@langchain/core/tools");
const { ToolNode } = require("@langchain/langgraph/prebuilt");
const { ChatPromptTemplate, MessagesPlaceholder } = require("@langchain/core/prompts");
const { ChatOpenAI } = require("@langchain/openai");
const { getPostById, addTagToPost } = require("../lib/fileAPI");
const { z } = require("zod");
const { HumanMessage } = require("@langchain/core/messages");
const { logInfo, logError, ok, err } = require("../lib/commonfunc");
require("dotenv").config({ path: "../.env" });

// 原生 Ark OpenAI 客户端（目前在这个文件里其实没用到，保留给后续扩展）
// const openai = new OpenAI({
//   apiKey: process.env.ARK_API_KEY,
//   baseURL: "https://ark.cn-beijing.volces.com/api/v3",
// });

/**
 * callAgent
 * LangGraph 构建的“打 tag”代理：
 * - read_database: 根据 post_id 读取 post 内容
 * - write_tag:     往 post 上追加 tag
 */
async function callAgent(client, query, thread_id) {
  console.log("[CALL_AGENT] start, query:", query);
  const match = /postID:([a-zA-Z0-9]+)/.exec(query);
  const boundPostId = match ? match[1] : null;
  if (!boundPostId) {
    throw new Error(
      'No postID found in query. Expected something like "postID:693178a70021395a87fe".'
    );
  }


  // 1. 定义 Graph 状态：只维护一个 message 列表
  const GraphState = Annotation.Root({
    messages: Annotation({
      reducer: (x, y) => x.concat(y),
      default: () => [],
    }),
  });

  // 2. 工具：读数据库（按 post_id 查一条）
  const readDatabaseTool = tool(
    async () => {
      logInfo("TOOL/read_database", "called for boundPostId:", boundPostId);

      try {
        const result = await getPostById(boundPostId);

        if (!result) {
          logInfo("TOOL/read_database", "post not found, post_id:", boundPostId);
          return JSON.stringify(
            err("NOT_FOUND", "No post found with this post_id.", { post_id: boundPostId })
          );
        }

        logInfo("TOOL/read_database", "success, post_id:", boundPostId);
        return JSON.stringify(ok(result));
      } catch (error) {
        logError("TOOL/read_database", "exception:", error);

        return JSON.stringify(
          err(
            "DB_ERROR",
            "read_database failed.",
            {
              post_id: boundPostId,
              detail: error?.message ?? String(error),
            }
          )
        );
      }
    },
    {
      name: "read_database",
      description:
        "Read the bound post of this conversation. No arguments. Always uses the current post_id.",
      schema: z.object({}), //无参数
    }
  );

  // 3. 工具：写 tag 到数据库（固定写 boundPostId）
  const writeTagTool = tool(
    async ({ tag }) => {
      logInfo("TOOL/write_tag", "post_id:", boundPostId, "tag:", tag);

      try {
        const updatedPost = await addTagToPost(boundPostId, tag);

        logInfo("TOOL/write_tag", "done, updated tags:", updatedPost.tags);
        return JSON.stringify(
          ok({
            post_id: boundPostId,
            tag,
            tags: updatedPost.tags,
          })
        );
      } catch (error) {
        logError("TOOL/write_tag", "error:", error);
        return JSON.stringify(
          err("DB_ERROR", "write_tag failed.", {
            post_id: boundPostId,
            tag,
            detail: error?.message ?? String(error),
          })
        );
      }
    },
    {
      name: "write_tag",
      description:
        "Append a tag into the `tags` array of the bound post. Takes only `tag` as argument.",
      schema: z.object({
        tag: z.string(),
      }),
    }
  );


  const tools = [readDatabaseTool, writeTagTool];

  // 4. ToolNode：根据 AIMessage.tool_calls 自动调工具
  const toolNode = new ToolNode(tools);

  // 5. 初始化 LLM，并绑定工具
  const model = new ChatOpenAI({
    model: "doubao-seed-1-6-251015", // Ark 模型名
    temperature: 0.7,
    configuration: {
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      apiKey: process.env.ARK_API_KEY,
    },
  }).bindTools(tools);

  // 6. agent 节点：组装 prompt + 调用 LLM
  async function callModel(state) {
    console.log("[NODE/agent] state messages length:", state.messages.length);

    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a tagging agent that ONLY works with two tools: read_database and write_tag.

    - There is exactly ONE bound post_id in this conversation. You must NEVER try to change it.
    - read_database: takes NO arguments, always reads the bound post.
    - write_tag: takes only a 'tag' (string), and always writes this tag into the bound post.

    Never send SQL or raw database commands.

    When a tool returns JSON:
    - If ok === true: use data to continue tagging logic.
    - If ok === false:
      - If error.code === "NOT_FOUND": explain that the post_id does not exist and stop.
      - If error.code === "DB_ERROR": do NOT call tools again with similar input. Explain the error and stop.

    If tags have been successfully written, start your reply with **FINAL ANSWER**.
    Current time: {time}.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);


    const formatted = await prompt.formatMessages({
      messages: state.messages,
      time: new Date().toISOString(),
    });

    console.log("[NODE/agent] formatted messages count:", formatted.length);

    const aiMsg = await model.invoke(formatted);

    console.log(
      "[NODE/agent] aiMsg finish_reason:",
      aiMsg.response_metadata?.finish_reason,
      "tool_calls:",
      aiMsg.tool_calls?.length || 0
    );

    return { messages: [aiMsg] };
  }

  // 7. Router：如果模型返回 tool_calls 就走 tools，否则结束
  function shouldContinue(state) {
    const msgs = state.messages;
    const last = msgs[msgs.length - 1];

    console.log(
      "[ROUTER] last message type:",
      last._getType?.() || typeof last,
      "tool_calls:",
      last.tool_calls?.length || 0
    );

    if (last.tool_calls?.length) {
      console.log("[ROUTER] -> tools");
      return "tools";
    }

    console.log("[ROUTER] -> __end__");
    return "__end__";
  }

  // 8. 拼装 StateGraph
  console.log("[CALL_AGENT] build workflow");
  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  // 9. 编译 graph
  console.log("[CALL_AGENT] compile workflow");
  const app = workflow.compile();

  // 10. 执行一次完整 workflow
  console.log("[CALL_AGENT] invoke workflow");
  const finalState = await app.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    {
      recursionLimit: 20, // 最大往返 agent<->tools 次数
      configurable: { thread_id },
    }
  );

  console.log("[CALL_AGENT] finalState messages length:", finalState.messages.length);

  const output = finalState.messages[finalState.messages.length - 1].content;

  console.log("[AGENT OUTPUT]", output);
  return output;
}

module.exports = { callAgent };
