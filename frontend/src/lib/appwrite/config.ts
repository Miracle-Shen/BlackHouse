import { Client, Account, Databases, Storage, Avatars } from "appwrite";

export const appwriteConfig = {
  url: "https://nyc.cloud.appwrite.io/v1",
  projectId: '691ec46d0011cc0af217',
  databaseId:'691ec498000fad4f52be',
  storageId: '69230b780026a1648b96',
  userCollectionId: 'user',
  postCollectionId: 'post',
};

export const client = new Client();

client.setEndpoint(appwriteConfig.url);
client.setProject(appwriteConfig.projectId);

// export const account = new Account(client);
export const databases = new Databases(client);
export const storage = new Storage(client);
export const avatars = new Avatars(client);
