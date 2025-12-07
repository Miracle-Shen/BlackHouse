
/** ---------- 通用工具函数 ---------- */
function ok(data) {
  return { ok: true, data };
}

function err(code, message, extra = {}) {
  return {
    ok: false,
    error: {
      code,
      message,
      ...extra,
    },
  };
}

function logInfo(tag, ...args) {
  console.log(`[${tag}]`, ...args);
}

function logError(tag, ...args) {
  console.error(`[${tag}]`, ...args);
}

module.exports = { ok, err, logInfo, logError };