const OpenAI = require ("openai");
const dotenv =  require ("dotenv");

dotenv.config({ path: "../.env" });

// 加载环境变量（从.env文件读取API Key，避免硬编码）
dotenv.config();

// 初始化火山方舟客户端（核心：baseURL指向火山接口，apiKey用环境变量）
const arkClient = new OpenAI({
  apiKey: process.env.ARK_API_KEY, // 环境变量中的API Key
  baseURL: "https://ark.cn-beijing.volces.com/api/v3", // 火山方舟北京地域接口（稳定）
  timeout: 30000, // 超时时间（30秒，避免请求挂死）
});

/**
 * 调用火山方舟模型（支持单轮/多轮对话，可选流式响应）
 * @param {string} userInput - 用户输入内容
 * @param {boolean} stream - 是否开启流式响应（前端实时展示时用true）
 */
async function callArkModel(userInput, stream = false) {
  try {
    const completion = await arkClient.chat.completions.create({
      model: "doubao-seed-1-6-251015", // 替换为你的Model ID（如deepseek-r1）
      messages: [
        { role: "system", content: "你是专业的技术助手，回答简洁准确" }, // 系统指令（可自定义）
        { role: "user", content: userInput }, // 用户输入
      ],
      temperature: 0.7, // 随机性（0-1，0为确定性输出，1为创造性输出）
      max_tokens: 2000, // 最大生成Token数（避免输出过长）
      stream: stream, // 是否流式响应
    });

    // 非流式：直接返回完整结果
    if (!stream) {
      const answer = completion.choices[0].message.content;
      console.log("模型响应：", answer);
      return answer;
    }

    // 流式：逐段返回结果（适合前端实时渲染）
    console.log("流式响应开始：");
    for await (const chunk of completion) {
      const content = chunk.choices[0]?.delta?.content;
      if (content) process.stdout.write(content); // 实时打印
    }
    console.log("\n流式响应结束");

  } catch (error) {
    // 错误处理（常见错误：API Key错误、余额不足、Model ID错误）
    console.error("\n调用失败：", {
      code: error.status,
      message: error.message,
      details: error.error?.message || "无额外信息",
    });
    throw error; // 可选：向上抛出错误，便于业务层处理
  }
}

// 测试调用（单轮对话，非流式）
callArkModel("解释下火山方舟平台的核心优势");

// 测试流式调用（取消注释即可）
// callArkModel("用100字介绍Node.js", true);