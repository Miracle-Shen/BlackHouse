const { ChatOpenAI } = require("@langchain/openai");
require("dotenv").config({ path: "../.env" });

function ok(data) {
  return { ok: true, data };
}

function err(code, message, extra = {}) {
  return {
    ok: false,
    error: { code, message, ...extra },
  };
}

function logInfo(tag, ...args) {
  console.log(`[${tag}]`, ...args);
}

function logError(tag, ...args) {
  console.error(`[${tag}]`, ...args);
}

/**
 * 调用 Ark 模型，根据 tag 生成内容
 */
async function generateContentByTag({ tag, thread_id }) {
  if (!tag) {
    return err("BAD_REQUEST", "tag is required.");
  }

  logInfo("CONTENT_MODEL", "start", { tag, thread_id });

  const model = new ChatOpenAI({
    model: "doubao-seed-1-6-251015", // 和 tag agent 一样的 Ark 模型
    temperature: 0.7,
    configuration: {
      baseURL: "https://ark.cn-beijing.volces.com/api/v3",
      apiKey: process.env.ARK_API_KEY,
    },
  });

  const systemPrompt = `
你是一个内容生成助手，会根据给定的 tag 生成一段可直接用来发帖的推荐内容。

要求：
- 语言：优先使用中文
- 风格：自然、口语化，适合社区发帖
- 不要解释你在做什么，也不要输出“这是一个示例”之类的话
- 不要输出 tag 本身，直接输出内容正文
- 尽量控制在 200～400 字以内，可分段
`;

  const userPrompt = `
请根据下面的 tag 生成一段推荐内容：

tag: ${tag}
`;

  try {
    const aiMsg = await model.invoke([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ]);

    const content = aiMsg.content;
    logInfo("CONTENT_MODEL", "success");
    return ok({ tag, content });
  } catch (error) {
    logError("CONTENT_MODEL", "error", error);
    return err("MODEL_ERROR", "content model failed.", {
      detail: error?.message ?? String(error),
    });
  }
}

module.exports = {
  generateContentByTag,
};
