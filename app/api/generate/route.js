import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";
import { validKeys } from "../../config/keys";

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, description, userCode, mode } = body;

    if (!validKeys.includes(userCode)) {
      return NextResponse.json({ error: "Chave de Acesso Inválida." }, { status: 401 });
    }

    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    // Usando o modelo Pro
    const model = genai.getGenerativeModel({ model: "gemini-2.5-pro" });

    let systemInstruction = "";
    if (mode === "receitas") {
      systemInstruction = `Você é um Chef Executivo. Crie um ebook de receitas sofisticado e visualmente rico.
      Tema: ${topic}. Detalhes: ${description}.
      Estruture o conteúdo para ser exibido em HTML.
      Retorne EXATAMENTE este formato JSON:
      { 
        "title": "Título Criativo do Livro", 
        "author": "Chef IA",
        "chapters": [ 
          { 
            "title": "Nome da Receita", 
            "content": "<div class='recipe-intro'><p>Breve introdução apetitosa sobre o prato.</p></div><div class='recipe-grid'><div><h3>🛒 Ingredientes</h3><ul><li>Item 1</li><li>Item 2</li></ul></div><div><h3>🍳 Modo de Preparo</h3><ol><li>Passo 1 detalhado.</li><li>Passo 2 detalhado.</li></ol></div></div><div class='chef-tip'><strong>💡 Dica do Chef:</strong> Segredo para não errar.</div>" 
          } 
        ] 
      }
      Gere pelo menos 10 receitas completas.`;
    } else {
      systemInstruction = `Você é um Editor de Livros Best-Seller. Crie um ebook informativo, profundo e bem estruturado.
      Tema: ${topic}. Detalhes: ${description}.
      Retorne EXATAMENTE este formato JSON:
      { 
        "title": "Título Impactante", 
        "author": "Especialista IA",
        "chapters": [ 
          { 
            "title": "Nome do Capítulo", 
            "content": "<p class='intro'>Parágrafo introdutório forte.</p><h3>Subtítulo Importante</h3><p>Texto explicativo detalhado...</p><ul><li>Ponto chave 1</li><li>Ponto chave 2</li></ul><div class='highlight'><strong>Importante:</strong> Uma caixa de destaque com informação crucial.</div>" 
          } 
        ] 
      }
      Gere 5 capítulos densos.`;
    }

    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    let text = response.text();
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    return NextResponse.json({ error: "Erro ao gerar: " + error.message }, { status: 500 });
  }
}
