/* import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StructuredOutputParser } from "@langchain/core/output_parsers";
import { MongoClient } from "mongodb";
import { MongoDBAtlasVectorSearch } from "@langchain/mongodb";
import { z } from "zod";
import "dotenv/config"; */
const { ChatOpenAI, OpenAIEmbeddings } = require("@langchain/openai");
const { StructuredOutputParser } = require("@langchain/core/output_parsers");
const { Client } = require("appwrite");
/* const { MongoDBAtlasVectorSearch } = require("@langchain/mongodb"); */
const { z } = require("zod");
require("dotenv").config();
const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT) // Replace <REGION> with your Appwrite region
    .setProject(process.env.APPWRITE_PROJECT_ID); // BlackHouse Project ID


const llm = new ChatOpenAI({
  modelName: "gpt-4o-mini",
  temperature: 0.7,  //0is most deterministic
  openAIApiKey: process.env.OPENAI_API_KEY,
});

const postSchema = z.object({
  title: z.string(),
  caption: z.string(),
  tags: z.array(z.string()),
  imageUrl: z.string().url(),
  imageId: z.string(),
});

type Post = z.infer<typeof postSchema>;

const parser = StructuredOutputParser.fromZodSchema(z.array(postSchema));

async function generateSyntheticData(): Promise<Post[]> {
  const prompt = `You are a helpful assistant that generates post data. Generate 10 fictional post records. Each record should include the following fields: title, caption, tags, imageUrl, imageId. Ensure variety in the data and realistic values.

  ${parser.getFormatInstructions()}`;

  console.log("Generating synthetic data...");

  const response = await llm.invoke(prompt);
  return parser.parse(response.content as string);
}

async function createEmployeeSummary(employee: Employee): Promise<string> {
  return new Promise((resolve) => {
    const jobDetails = `${employee.job_details.job_title} in ${employee.job_details.department}`;
    const skills = employee.skills.join(", ");
    const performanceReviews = employee.performance_reviews
      .map(
        (review) =>
          `Rated ${review.rating} on ${review.review_date}: ${review.comments}`
      )
      .join(" ");
    const basicInfo = `${employee.first_name} ${employee.last_name}, born on ${employee.date_of_birth}`;
    const workLocation = `Works at ${employee.work_location.nearest_office}, Remote: ${employee.work_location.is_remote}`;
    const notes = employee.notes;

    const summary = `${basicInfo}. Job: ${jobDetails}. Skills: ${skills}. Reviews: ${performanceReviews}. Location: ${workLocation}. Notes: ${notes}`;

    resolve(summary);
  });
}

async function seedDatabase(): Promise<void> {
  try {
    console.log("action seeding database...");
    const syntheticData = await generateSyntheticData();

    const recordsWithSummaries = await Promise.all(
      syntheticData.map(async (record) => ({
        pageContent: await createEmployeeSummary(record),
        metadata: {...record},
      }))
    );
    
    for (const record of recordsWithSummaries) {
      await MongoDBAtlasVectorSearch.fromDocuments(
        [record],
        new OpenAIEmbeddings(),
        {
          collection,
          indexName: "vector_index",
          textKey: "embedding_text",
          embeddingKey: "embedding",
        }
      );

      console.log("Successfully processed & saved record:", record.metadata.employee_id);
    }

    console.log("Database seeding completed");

  } catch (error) {
    console.error("Error seeding database:", error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);