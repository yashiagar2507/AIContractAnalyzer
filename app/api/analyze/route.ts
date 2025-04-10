import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { contractText } = await request.json();

    const prompt = `
You are a legal AI assistant. Analyze this contract and return:

{
  "summary": "Short summary (max 2 sentences)",
  "redFlags": ["Only serious legal issues"],
  "complianceNotes": ["Only if laws like GDPR, SOX, CCPA are missing or vague"]
}

Avoid markdown, intros, or extra text. Just return valid JSON.

Contract:
"""${contractText}"""`;

    const response = await fetch("http://localhost:11434/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "mistral",
        messages: [{ role: "user", content: prompt }],
      }),
    });

    const result = await response.json();
    let aiContent = result.choices?.[0]?.message?.content?.trim() || "";

    if (aiContent.startsWith("```")) {
      aiContent = aiContent.replace(/^```[a-z]*\n?/i, "").replace(/```$/, "").trim();
    }

    const jsonStart = aiContent.indexOf("{");
    if (jsonStart !== -1) aiContent = aiContent.slice(jsonStart);
    aiContent = aiContent.replace(/,\s*}/g, "}").replace(/,\s*\]/g, "]");

    let analysis;
    try {
      analysis = JSON.parse(aiContent);
      analysis.riskScore = (analysis.redFlags?.length || 0) * 20;
    } catch (err) {
      console.error("Failed to parse AI output:", aiContent);
      analysis = {
        summary: "",
        redFlags: [],
        complianceNotes: [],
        riskScore: 0,
        rawOutput: aiContent,
      };
    }

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("❌ Analyze API Error:", error);
    return NextResponse.json({ error: "Analysis failed." }, { status: 500 });
  }
}
