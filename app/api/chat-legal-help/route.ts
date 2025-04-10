import { NextResponse } from "next/server";
import { getRelevantClause } from "@/lib/VectorSearch"; // Your vector search helper

export async function POST(request: Request) {
  try {
    const { redFlag, question } = await request.json();

    const retrievedClause = await getRelevantClause(redFlag); // RAG result

    const prompt = `
You're a contract expert. A user flagged: "${redFlag}".
Relevant context: "${retrievedClause}"
User question: "${question}"
Provide a concise legal fix with context-aware advice.
`;

    const res = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const result = await res.json();
    const reply = result.choices?.[0]?.message?.content?.trim() || "⚠️ No response.";
    return NextResponse.json({ reply });
  } catch (err) {
    console.error("❌ Chatbot error:", err);
    return NextResponse.json({ reply: "⚠️ Error processing your request." }, { status: 500 });
  }
}
