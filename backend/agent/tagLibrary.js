const fs = require("fs");
const path = require("path");

// === tags.json 一次性加载 ===
const TAGS_PATH = path.join(__dirname, "../model/tags.json"); // 你按实际路径改
let TAG_INDEX = null;

function buildTagIndex() {
  if (TAG_INDEX) return TAG_INDEX;

  const raw = JSON.parse(fs.readFileSync(TAGS_PATH, "utf-8"));
  const canonicalSet = new Set();
  const aliasToCanonical = new Map();

  for (const item of raw) {
    const canonical = normalizeTag(item.name);
    if (!canonical) continue;

    canonicalSet.add(canonical);
    aliasToCanonical.set(canonical, canonical);

    const aliases = Array.isArray(item.alias) ? item.alias : [];
    for (const a of aliases) {
      const na = normalizeTag(a);
      if (na) aliasToCanonical.set(na, canonical);
    }
  }

  TAG_INDEX = { canonicalSet, aliasToCanonical };
  return TAG_INDEX;
}
function normalizeTag(input) {
  if (input == null) return "";
  let s = String(input);

  // Unicode 规范化：把全角字符等尽量规整（Node 16+ 支持）
  try { s = s.normalize("NFKC"); } catch {}

  s = s.trim();

  // 常见前缀符号清理
  s = s.replace(/^#+/, "");      // "#摄影" -> "摄影"
  s = s.replace(/^@+/, "");
  s = s.replace(/^\s+|\s+$/g, "");
  s = s.replace(/\s+/g, " ");    // 合并多空白

  // 去掉两侧标点（保留中间的）
  s = s.replace(/^[\p{P}\p{S}]+|[\p{P}\p{S}]+$/gu, "");

  return s;
}

function isAllChineseStrict(s) {
  // 只允许中文字符（可按你业务放宽，比如允许“·”“-”等）
  return /^[\u4e00-\u9fff]+$/u.test(s);
}

function correctTagOrThrow(inputTag) {
  const { canonicalSet, aliasToCanonical } = buildTagIndex();

  const norm = normalizeTag(inputTag);
  if (!norm) {
    return { ok: false, error: err("VALIDATION_FAILED", "tag is empty after normalize.", { inputTag }) };
  }

  // 先 alias 映射
  const mapped = aliasToCanonical.get(norm) || norm;

  // 中文校验（强制中文 tag）
  if (!isAllChineseStrict(mapped)) {
    return { ok: false, error: err("VALIDATION_FAILED", "tag must be Chinese only.", { inputTag, normalized: norm, mapped }) };
  }

  // 必须在 tags.json
  if (!canonicalSet.has(mapped)) {
    return { ok: false, error: err("VALIDATION_FAILED", "tag not in tags.json.", { inputTag, normalized: norm, mapped }) };
  }

  // 长度限制（可选）
  if (mapped.length > 12) {
    return { ok: false, error: err("VALIDATION_FAILED", "tag too long.", { inputTag, mapped, maxLen: 12 }) };
  }

  return { ok: true, tag: mapped, normalized: norm };
}
