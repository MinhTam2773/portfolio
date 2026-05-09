import { NextRequest, NextResponse } from "next/server";

type Message = {
  role: "user" | "assistant";
  content: string;
};

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const RATE_LIMIT_WINDOW_MS = 60_000;
const RATE_LIMIT_MAX_REQUESTS = 10;
const rateLimitStore = new Map<string, RateLimitEntry>();

const SYSTEM_PROMPT = `You are Tam's AI assistant on his portfolio website.

Your job:
- Answer questions about Minh Tam Nguyen (goes by Tam), his portfolio, projects, education, experience, skills, and contact information.
- Keep a professional but warm tone.
- Be accurate. Do not invent facts that are not in the profile below.
- If asked a general technical question, answer briefly and clearly, then connect it back to Tam's work when natural.
- If you do not know something from the profile, say so plainly and redirect to what you do know.
- Keep answers concise but useful for portfolio visitors.

Profile facts:
- Full name: Minh Tam Nguyen (Tam)
- Location: Calgary, Alberta, Canada
- Website: minhtam.info
- Email: tamnguyen277353@gmail.com
- GitHub: github.com/MinhTam2077
- LinkedIn: linkedin.com/in/minhtam-dev
- Work authorization: legally authorized to work in Canada
- Languages: English, Vietnamese

Education:
- SAIT Diploma in Software Development, expected April 2026
- GPA: 4.0 / 4.0 across 45 completed credits
- 2nd place at MegaHacks in January 2026 for VibeMap

Technical strengths:
- Languages: Python, TypeScript, JavaScript, C#, Java, Node.js
- Frontend: React, Next.js, React Native, Expo, Tailwind CSS
- Backend: Express.js, Django, .NET, REST APIs, AI/RAG pipelines, serverless functions
- Databases: PostgreSQL, Supabase, Firebase, Convex, Prisma ORM, MySQL
- Cloud/DevOps: AWS, Azure, Vercel, Docker, CI/CD, OpenTelemetry, Inngest
- AI/ML: RAG, agentic workflows, LLM tool calling, structured output validation, embeddings, vector databases
- Testing: Playwright, Vitest

Key projects:
- AllBarber: multi-tenant barbershop management SaaS built with Next.js, TypeScript, Supabase, PostgreSQL, Stripe, Twilio, and Inngest. Includes real-time queue management, POS, CRM, RLS, and team leadership across 6 developers.
- Pathr: AI-powered education and career pathways platform using Next.js, Convex, Vercel AI SDK, OpenAI GPT-4o, Claude 3.5 Sonnet, and RAG. Includes a 5-stage AI pipeline: Understand, Retrieve, Reason, Validate, Present.
- Sound Wave: audio-sharing social platform with Next.js, Supabase, TypeScript, FFmpeg.wasm, and Wavesurfer.js.
- Happy Study: cross-platform mobile quiz app using Expo, React Native, PostgreSQL, and Gemini API.
- VibeMap: community emotional mapping platform built at a hackathon with Next.js, Firebase, Leaflet.js, and OpenStreetMap.

When relevant, highlight Tam's strengths in full-stack development, AI integration, secure system design, real-time systems, testing discipline, and leadership.`;

function getClientIp(request: NextRequest) {
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) {
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  return request.headers.get("x-real-ip") ?? "unknown";
}

function isRateLimited(ip: string) {
  const now = Date.now();
  const current = rateLimitStore.get(ip);

  if (!current || current.resetAt <= now) {
    rateLimitStore.set(ip, {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW_MS,
    });
    return false;
  }

  if (current.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  current.count += 1;
  rateLimitStore.set(ip, current);
  return false;
}

export async function POST(request: NextRequest) {
  if (!GEMINI_API_KEY) {
    return NextResponse.json(
      { error: "Server configuration error: missing Gemini API key." },
      { status: 500 }
    );
  }

  const ip = getClientIp(request);
  if (isRateLimited(ip)) {
    return NextResponse.json(
      { error: "Too many messages. Please wait a moment and try again." },
      { status: 429 }
    );
  }

  let body: { messages?: Message[] };

  try {
    body = (await request.json()) as { messages?: Message[] };
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const messages = body.messages?.filter(
    (message): message is Message =>
      Boolean(
        message &&
          (message.role === "user" || message.role === "assistant") &&
          typeof message.content === "string" &&
          message.content.trim()
      )
  );

  if (!messages || messages.length === 0) {
    return NextResponse.json({ error: "Messages are required." }, { status: 400 });
  }

  const contents = messages.map((message) => ({
    role: message.role === "assistant" ? "model" : "user",
    parts: [{ text: message.content }],
  }));

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          systemInstruction: {
            parts: [{ text: SYSTEM_PROMPT }],
          },
          contents,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 500,
          },
        }),
      }
    );

    if (!response.ok) {
      return NextResponse.json(
        { error: "The assistant is unavailable right now. Please try again." },
        { status: 502 }
      );
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: {
          parts?: Array<{
            text?: string;
          }>;
        };
      }>;
    };

    const reply = data.candidates?.[0]?.content?.parts?.map((part) => part.text ?? "").join("").trim();

    if (!reply) {
      return NextResponse.json(
        { error: "The assistant returned an empty response." },
        { status: 502 }
      );
    }

    return NextResponse.json({ reply });
  } catch {
    return NextResponse.json(
      { error: "The assistant is unavailable right now. Please try again." },
      { status: 502 }
    );
  }
}
