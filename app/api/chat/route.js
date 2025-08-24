import { OpenAI } from "openai";
import curriculo from "./curriculo.json";

const openai = new OpenAI({
  baseURL: "https://openrouter.ai/api/v1",
  apiKey: process.env.OPENROUTER_API_KEY,
});

export async function POST(req) {
  try {
    const { message } = await req.json();
    const prompt = `Com base no seguinte currículo, responda à pergunta do usuário:
${JSON.stringify(curriculo, null, 2)}

Pergunta do usuário: ${message}`;

    const completion = await openai.chat.completions.create({
      extra_headers: {
        "HTTP-Referer": "https://dutradev28.github.io/portfolio-dev-rpa",
        "X-Title": "Chatbot",
      },
      model: "deepseek/deepseek-r1-0528:free",
      messages: [
        {
          role: "system",
          content: "Você é um assistente que responde perguntas sobre o currículo de Luis Carlos Dutra Junior. Responda de forma clara e concisa, com base nas informações fornecidas.",
        },
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    return new Response(JSON.stringify({ response: completion.choices[0].message.content }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  } catch (error) {
    console.error("Erro ao chamar a API do OpenRouter:", error);
    return new Response(JSON.stringify({ error: "Erro ao processar a requisição" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
      },
    });
  }
}