const { ChatOpenAI } =  require( "@langchain/openai");
const OpenAI = require ("openai");
require("dotenv").config({ path: "../.env" });


async function testModel() {
  console.log("[CALL_AGENT] Initializing ChatOpenAI model");

  const model = new ChatOpenAI({
    modelName: "gpt-4o-mini",   // 推荐使用最新官方模型
    temperature: 0,
    openAIApiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const response = await model.invoke([
      { role: "user", content: "Hello, can you hear me?" }
    ]);

    console.log("Response from model:", response);
  } catch (err) {
    console.error("❌ Model request failed:", err);
  }
}

testModel();
