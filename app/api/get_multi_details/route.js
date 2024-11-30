// app/api/get_multi_details/route.js
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";
import { OpenAI } from "openai";

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});

const index = pc.index("code", process.env.PINECONE_INDEX_HOST);

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

async function performMultiRag(query, namespaces) {
  try {
    const embeddings = await getHuggingFaceEmbeddings(query);

    // Query each namespace
    const allResults = await Promise.all(
      namespaces.map(async (namespace) => {
        const searchResponse = await index.namespace(namespace).query({
          vector: embeddings,
          topK: 3,
          includeMetadata: true,
        });
        return {
          namespace,
          contexts: searchResponse.matches.map((match) => match.metadata.text),
        };
      })
    );

    // Combine contexts with namespace information
    const combinedContext = allResults
      .map(
        (result) =>
          `From ${result.namespace.split("/").pop()}:\n${result.contexts.join(
            "\n\n"
          )}`
      )
      .join("\n\n---\n\n");

    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content:
            "You are a Senior Software Engineer. Answer questions about multiple codebases based on the provided context. Structure your response to reference specific repositories when discussing different parts of the code.",
        },
        {
          role: "user",
          content: `Context from multiple repositories:\n\n${combinedContext}\n\nQuestion: ${query}`,
        },
      ],
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error("Multi-RAG Error:", error);
    throw error;
  }
}

export async function POST(request) {
  try {
    const { query, namespaces } = await request.json();
    const response = await performMultiRag(query, namespaces);
    return NextResponse.json({ response });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
