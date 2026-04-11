import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `You are RecycleBot 🤖, the friendly recycling assistant for GREEN LOOP — a plastic recovery and carbon-credit platform.

Your role:
- Help users understand plastic types (PET #1, HDPE #2, PVC #3, LDPE #4, PP #5, PS #6, Other #7)
- Explain how to prepare plastic for recycling (clean, dry, sort by type)
- Answer questions about the GREEN LOOP app (booking pickups, earning points, redeeming rewards)
- Share recycling tips and environmental impact facts
- Guide users on which plastics are recyclable and which aren't
- Motivate users with positive environmental impact messaging

Key platform facts:
- 100g of plastic = 10 points = ₹1
- Users can schedule home pickups or use Reverse Vending Machines (RVMs)
- Points can be redeemed for cash, discounts, or donations
- GREEN LOOP supports plastic roads and plastic bricks from recycled material where programs exist

Keep responses concise (2-4 sentences), friendly, and encouraging. Use emojis sparingly. If asked about something unrelated to recycling or the platform, gently redirect the conversation back to recycling topics.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();

    if (!Array.isArray(messages) || messages.length === 0) {
      return new Response(JSON.stringify({ error: "messages must be a non-empty array" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [{ role: "system", content: SYSTEM_PROMPT }, ...messages],
        stream: false,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      const status = response.status;

      if (status === 429) {
        return new Response(JSON.stringify({ error: "Too many requests. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      if (status === 402) {
        return new Response(JSON.stringify({ error: "AI usage limit reached. Please try again later." }), {
          status: 402,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      console.error("AI gateway error:", status, text);
      return new Response(JSON.stringify({ error: "AI service temporarily unavailable." }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const data = await response.json();
    const reply = data?.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(JSON.stringify({ error: "No response generated" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ reply }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("chat error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
