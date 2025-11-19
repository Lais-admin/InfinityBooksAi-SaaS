import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { validKeys } from "../../config/keys"; // Verifica se importa do lugar certo

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, description, userCode, mode } = body;

    console.log("Tentativa de acesso com chave:", userCode); // Log para debug

    // 1. Validação da Chave (Ignora espaços em branco extras)
    if (!validKeys.includes(userCode.trim())) {
      return NextResponse.json({ error: "Chave de Acesso Inválida." }, { status: 401 });
    }

    // 2. Configuração do Gemini
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // Usando o modelo PRO (Equilibrio perfeito entre inteligência e compatibilidade)
    const model = genai.getGenerativeModel({ model: "gemini-3-pro" });

    // 3. Definição do Prompt (Otimizado para HTML rico)
    let systemInstruction = "";
    if (mode === "receitas") {
      systemInstruction = `Você é um Chef Executivo. Crie um ebook de receitas sofisticado.
      Tema: ${topic}. Detalhes: ${description}.
      Retorne EXATAMENTE este formato JSON:
      { 
        "title": "Título Criativo", 
        "author": "Chef IA",
        "chapters": [ 
          { 
            "title": "Nome da Receita", 
            "content": "<div class='recipe'><h3>🛒 Ingredientes</h3><ul><li>Ingrediente 1</li><li>Ingrediente 2</li></ul><h3>🍳 Modo de Preparo</h3><ol><li>Passo 1</li><li>Passo 2</li></ol><div class='tip'><strong>Dica:</strong> Segredo do chef.</div></div>" 
          } 
        ] 
      }
      Gere 4 receitas completas.`;
    } else {
      systemInstruction = `Você é um Editor Best-Seller. Crie um ebook informativo.
      Tema: ${topic}. Detalhes: ${description}.
      Retorne EXATAMENTE este formato JSON:
      { 
        "title": "Título do Livro", 
        "author": "Especialista IA",
        "chapters": [ 
          { 
            "title": "Nome do Capítulo", 
            "content": "<p>Parágrafo de introdução.</p><h3>Subtítulo</h3><p>Conteúdo detalhado...</p><ul><li>Item importante</li></ul>" 
          } 
        ] 
      }
      Gere 5 capítulos detalhados.`;
    }

    // 4. Geração
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    let text = response.text();
    
    // Limpeza
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("Erro:", error);
    return NextResponse.json({ error: "Erro no servidor: " + error.message }, { status: 500 });
  }
}
