// api/get_namespaces/route.js
import { NextResponse } from "next/server";
import { Pinecone } from "@pinecone-database/pinecone";

export async function GET() {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY,
    });
    const index = pc.index("code", process.env.PINECONE_INDEX_HOST);
    const namespaces = await index.describeIndexStats();
    return NextResponse.json({
      namespaces: Object.keys(namespaces.namespaces),
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch namespaces" },
      { status: 500 }
    );
  }
}
