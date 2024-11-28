// app/api/get_details/route.js
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

// Initialize Pinecone
const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

// Get index with specific host
const index = pc.index("code", process.env.PINECONE_INDEX_HOST);

// Initialize OpenAI/Groq client
const client = new OpenAI({
  apiKey: process.env.NEXT_PUBLIC_GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

async function getHuggingFaceEmbeddings(text) {
  try {
    if (!text || typeof text !== "string") {
      throw new Error("Invalid input: text must be a non-empty string");
    }

    const response = await fetch(
      "https://api-inference.huggingface.co/pipeline/feature-extraction/sentence-transformers/all-mpnet-base-v2",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ inputs: text }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `HuggingFace API error: ${response.status} ${response.statusText}`
      );
    }

    const result = await response.json();
    console.log("HuggingFace response:", JSON.stringify(result).slice(0, 100));

    // HuggingFace returns a single embedding array
    if (!Array.isArray(result) || result.length === 0) {
      throw new Error("Invalid embedding format from HuggingFace API");
    }

    return result; // Return the full embedding vector
  } catch (error) {
    console.error("Error getting embeddings:", error);
    throw error;
  }
}

// Update performRag function
async function performRag(query) {
  try {
    console.log("Getting embeddings for query:", query);
    const embeddings = await getHuggingFaceEmbeddings(query);

    console.log("Querying Pinecone index...");
    const searchResponse = await index
      .namespace("https://github.com/pc9350/Calmify")
      .query({
        vector: embeddings, // Remove [0] since embeddings is already the vector
        topK: 5,
        includeMetadata: true,
      });

    console.log("Search response:", {
      matches: searchResponse.matches?.length,
      firstMatch: searchResponse.matches?.[0],
    });

    if (!searchResponse.matches?.length) {
      // Index some sample content if empty
      return "No relevant content found in the codebase.";
    }

    const contexts = searchResponse.matches.map((match) => match.metadata.text);
    const augmentedQuery = `<CONTEXT>\n${contexts.join(
      "\n\n-------\n\n"
    )}\n-------\n</CONTEXT>\n\n\n\nMY QUESTION:\n${query}`;

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a Senior Software Engineer. Answer questions about the codebase based on the provided context.",
        },
        {
          role: "user",
          content: augmentedQuery,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("RAG Error:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { query } = await request.json();
    const response = await performRag(query);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
