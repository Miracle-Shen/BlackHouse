const {
  Client,
  Databases,
  Storage,
  Query,
  ID,
  InputFile,
} = require("node-appwrite");
const sharp = require("sharp");
const { Readable } = require("stream");
// require("dotenv").config({ path: "../.env" });

const appwriteConfig = {
  url: "https://nyc.cloud.appwrite.io/v1",
  projectId: "691ec46d0011cc0af217",
  databaseId: "691ec498000fad4f52be",
  storageId: "69230b780026a1648b96",
};

const client = new Client()
  .setEndpoint(appwriteConfig.url)
  .setProject(appwriteConfig.projectId)

const databases = new Databases(client);
const storage = new Storage(client);

// 缩略图设置
const THUMB_MAX_WIDTH = 400;
const THUMB_MAX_HEIGHT = 400;
const THUMB_QUALITY = 70;

async function migrateThumbnails() {
  const docs = await databases.listDocuments(
    appwriteConfig.databaseId,
    "post",
    [Query.orderDesc("$createdAt"), Query.limit(20)]
  );

  console.log(`获取到 ${docs.documents.length} 个文档进行处理`);

  for (const doc of docs.documents) {
    try {
      const imageId =
        doc.imageId || extractFileIdFromUrl(doc.imageUrl);
      if (!imageId) {
        console.warn(`文档 ${doc.$id} 没有 imageId/imageUrl，跳过`);
        continue;
      }
      console.log(`处理文档: ${doc.$id} 图片ID:${imageId}`);

      const originalBuffer = await downloadFileAsBuffer(
        appwriteConfig.storageId,
        imageId
      );

      const thumbBuffer = await sharp(originalBuffer)
        .resize(THUMB_MAX_WIDTH, THUMB_MAX_HEIGHT, {
          fit: "inside",
          withoutEnlargement: true,
        })
        .webp({ quality: THUMB_QUALITY })
        .toBuffer();

      const thumbFileId = ID.unique();
      const thumbFile = await storage.createFile(
        appwriteConfig.storageId,
        thumbFileId,
        InputFile.fromBuffer(thumbBuffer, `thumb_${imageId}.webp`)
      );

      const thumbnailUrl = `${appwriteConfig.url}/storage/buckets/${appwriteConfig.storageId}/files/${thumbFile.$id}/view?project=${appwriteConfig.projectId}&mode=admin`;

      await databases.updateDocument(
        appwriteConfig.databaseId,
        "post",
        doc.$id,
        { thumbnailUrl }
      );

      console.log(`✅ 文档 ${doc.$id} 处理完成`);
    } catch (err) {
      console.error(`❌ 文档 ${doc.$id} 处理失败`, err);
    }
  }
}

function extractFileIdFromUrl(url) {
  if (!url) return undefined;
  try {
    const u = new URL(url);
    const parts = u.pathname.split("/");
    const idx = parts.indexOf("files");
    if (idx >= 0 && parts[idx + 1]) {
      return parts[idx + 1];
    }
  } catch {}
  return undefined;
}

async function downloadFileAsBuffer(bucketId, fileId) {
  const res = await storage.getFileDownload(bucketId, fileId);

  if (Buffer.isBuffer(res)) return res;

  if (res instanceof Readable) {
    const chunks = [];
    for await (const chunk of res) chunks.push(chunk);
    return Buffer.concat(chunks);
  }

  if (res instanceof ArrayBuffer) return Buffer.from(res);

  if (res && typeof res.arrayBuffer === "function") {
    const ab = await res.arrayBuffer();
    return Buffer.from(ab);
  }

  throw new Error("Unknown response type from getFileDownload");
}

migrateThumbnails()
  .then(() => console.log("全部迁移流程结束"))
  .catch((err) => {
    console.error("迁移过程中发生错误", err);
    process.exitCode = 1;
  });
