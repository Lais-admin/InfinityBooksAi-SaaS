import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { validKeys } from "../../config/keys";

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, description, userCode, mode } = body;

    // 1. SEGURANÇA: Verifica se a chave existe na lista
    if (!validKeys.includes(userCode)) {
      return NextResponse.json({ error: "Chave de Acesso Inválida ou Expirada." }, { status: 401 });
    }

    // 2. CONFIGURAÇÃO DA IA
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genai.getGenerativeModel({ model: "gemini-pro" });

    // 3. MONTAGEM DO PROMPT
    let systemInstruction = "";
    if (mode === "receitas") {
      systemInstruction = `Você é um Chef renomado. Crie um ebook de receitas sofisticado.
      Tema: ${topic}. Detalhes extras: ${description}.
      Retorne EXATAMENTE este formato JSON:
      { "title": "Titulo do Livro", "chapters": [ { "title": "Nome do Prato", "content": "<h3>Ingredientes</h3>... <h3>Modo de Preparo</h3>..." } ] }
      Gere pelo menos 5 receitas completas.`;
    } else {
      systemInstruction = `Você é um autor Best-Seller. Crie um ebook informativo denso e rico.
      Tema: ${topic}. Público/Detalhes: ${description}.
      Retorne EXATAMENTE este formato JSON:
      { "title": "Titulo do Livro", "chapters": [ { "title": "Titulo Capitulo", "content": "<p>Texto longo e detalhado...</p>" } ] }
      Gere 5 capítulos longos. Use tags HTML simples (<p>, <h3>, <ul>) para formatar o texto.`;
    }

    // 4. GERAÇÃO
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    let text = response.text();
    
    // Limpeza do JSON (caso a IA mande marcadores de código)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    return NextResponse.json({ error: "Erro no servidor: " + error.message }, { status: 500 });
  }
}
