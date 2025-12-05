/* import { OpenAIEmbeddings } from "@langchain/openai";
import { ChatAnthropic } from "@langchain/anthropic";
import { AIMessage, BaseMessage, HumanMessage } from "@langchain/core/messages";
import {
  ChatPromptTemplate,
  MessagesPlaceholder,
} from "@langchain/core/prompts";
import { StateGraph } from "@langchain/langgraph";
import { Annotation } from "@langchain/langgraph";
import { tool } from "@langchain/core/tools";
import { ToolNode } from "@langchain/langgraph/prebuilt";
import { MongoDBSaver } from "@langchain/langgraph-checkpoint-mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { MongoClient } from "mongodb"; */
const {Annotation} = require( "@langchain/langgraph");
const { tool } = require( "@langchain/core/tools");
const { ToolNode } = require( "@langchain/langgraph/prebuilt");
const { ChatPromptTemplate, MessagesPlaceholder } = require( "@langchain/core/prompts");
const { StateGraph } = require( "@langchain/langgraph");
const { Client } = require( "appwrite");
const { getPostById,updatePostById } = require( "../lib/fileAPI"); 
const { z } = require( "zod");
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");

/* const { ChatAnthropic } = require("@langchain/anthropic"); */
const { AIMessage, HumanMessage } = require("@langchain/core/messages");
const dotenv = require('dotenv');
dotenv.config({path: '../.env' });
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) 
    .setProject(process.env.APPWRITE_PROJECT_ID); 

async function callAgent(client, query, thread_id) {
  // Define the MongoDB database and collection
/*   const dbName = "hr_database";
  const db = client.db(dbName);
  const collection = db.collection("employees");
 */
  // Define the graph state
  const GraphState = Annotation.Root({
    messages: Annotation({//<BaseMessage[]>
      reducer: (x, y) => x.concat(y),
    }),
  });

  // Define the tools for the agent to use
/*   const employeeLookupTool = tool(
    async ({ query, n = 10 }) => {
      console.log("Employee lookup tool called");

      const dbConfig = {
        collection: collection,
        indexName: "vector_index",
        textKey: "embedding_text",
        embeddingKey: "embedding",
      };

      // Initialize vector store
      const vectorStore = new MongoDBAtlasVectorSearch(
        new OpenAIEmbeddings(),
        dbConfig
      );

      const result = await vectorStore.similaritySearchWithScore(query, n);
      return JSON.stringify(result);
    },
    {
      name: "employee_lookup",
      description: "Gathers employee details from the HR database",
      schema: z.object({
        query: z.string().describe("The search query"),
        n: z
          .number()
          .optional()
          .default(10)
          .describe("Number of results to return"),
      }),
    }
  ); */

  const readDatabaseTool = tool(
    async ({ query }) => {
      console.log("Read database tool called");

      const filter = { $text: { $search: query } };
      const projection = { score: { $meta: "textScore" } };

      const results = await getPostById(query);

      return JSON.stringify(results);
    },
    {
      name: "read_database",
      description: "Reads post records from the post database",
      schema: z.object({
        query: z.string().describe("The search query"),
      }),
    }
  );
  const writeTagTool = tool(
    async ({ post_id, tag }) => {
      console.log("Write tag tool called");

      const filter = { post_id: post_id };
      const update = { $addToSet: { tags: tag } };

      //await collection.updateOne(filter, update);
      await updatePostById(post_id, update);
      return `Tag "${tag}" added to post with ID ${post_id}.`;
    },
    {
      name: "write_tag",
      description: "Writes a tag to a post record in the post database",
      schema: z.object({
        post_id: z.string().describe("The ID of the post"),
        tag: z.string().describe("The tag to add"),
      }),
    }
  );
  const tools = [readDatabaseTool, writeTagTool];

  // We can extract the state typing via `GraphState.State`
  const toolNode = new ToolNode<typeof GraphState.State>(tools);

/*   const model = new ChatDashScope({
    model: "claude-3-5-sonnet-20240620",
    temperature: 0,
  }).bindTools(tools); */
  const model = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,  //0is most deterministic
  openAIApiKey: process.env.OPENAI_API_KEY,
}).bindTools(tools);
  // Define the function that determines whether to continue or not
  function shouldContinue(state) { //: typeof GraphState.State
    const messages = state.messages;
    const lastMessage = messages[messages.length - 1]; //as AIMessage;

    // If the LLM makes a tool call, then we route to the "tools" node
    if (lastMessage.tool_calls?.length) {
      return "tools";
    }
    // Otherwise, we stop (reply to the user)
    return "__end__";
  }

  // Define the function that calls the model
  async function callModel(state) {//: typeof GraphState.State
    const prompt = ChatPromptTemplate.fromMessages([
      [
        "system",
        `You are a helpful AI assistant specializing in database interaction collaboration, working alongside other assistants. Use the provided \`writeDatabase\` and \`readDatabase\` tools to maintain continuous dialogue with the database: focus on generating tags for posts and updating these tags into the database to advance the task. If you cannot fully complete the task (e.g., failing to read existing post data from the database or encountering issues with tag update), that's OK—another assistant with different tool access or capabilities will take over from where you left off. Execute all operations you can (such as querying post content via \`readDatabase\` to draft tags, or initiating tag updates via \`writeDatabase\`) to make progress. If you or any of the other assistants have successfully generated post tags and completed the update to the database (i.e., achieved the final deliverable), prefix your response with **FINAL ANSWER** so the entire team knows to stop the workflow. You have access to the following tools: \`writeDatabase\`, \`readDatabase\`.\nYour core task is to maintain continuous dialogue with the database, specifically responsible for generating tags for posts and updating the generated tags into the database; during collaboration, prioritize using the provided tools to execute task steps and coordinate with other assistants to ensure task progression. \nCurrent time: {time}.`,
      ],
      new MessagesPlaceholder("messages"),
    ]);

    const formattedPrompt = await prompt.formatMessages({
      system_message: "You are helpful Database Chatbot Agent.",
      time: new Date().toISOString(),
      tool_names: tools.map((tool) => tool.name).join(", "),
      messages: state.messages,
    });

    const result = await model.invoke(formattedPrompt);

    return { messages: [result] };
  }

  // Define a new graph
  const workflow = new StateGraph(GraphState)
    .addNode("agent", callModel)
    .addNode("tools", toolNode.asRunnable ? toolNode.asRunnable() : toolNode.runnable)
    .addEdge("__start__", "agent")
    .addConditionalEdges("agent", shouldContinue)
    .addEdge("tools", "agent");

  // Initialize the MongoDB memory to persist state between graph runs
  const checkpointer = new MongoDBSaver({ client, dbName });

  // This compiles it into a LangChain Runnable.
  // Note that we're passing the memory when compiling the graph
  const app = workflow.compile({ checkpointer });

  // Use the Runnable
  const finalState = await app.invoke(
    {
      messages: [new HumanMessage(query)],
    },
    { recursionLimit: 15, configurable: { thread_id: thread_id } }
  );

  // console.log(JSON.stringify(finalState.messages, null, 2));
  console.log(finalState.messages[finalState.messages.length - 1].content);

  return finalState.messages[finalState.messages.length - 1].content;
}

module.exports = { callAgent };