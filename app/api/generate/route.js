import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// 1. LISTA DE SENHAS (Definida aqui mesmo para não ter erro de arquivo)
const VALID_KEYS = [
  "VIP-GOLD-2025",
  "TESTE-ADMIN",
  "LAIS-CEO"
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, description, userCode, mode } = body;

    // Log para você ver na Vercel o que está chegando
    console.log("Cliente digitou:", userCode); 

    // 2. VERIFICAÇÃO DE SEGURANÇA
    // Se o código não estiver na lista, barra a entrada
    if (!VALID_KEYS.includes(userCode.trim())) {
      return NextResponse.json({ error: "Chave de Acesso Inválida. Verifique se digitou corretamente." }, { status: 401 });
    }

    // 3. CONEXÃO COM GOOGLE
    const genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    
    // IMPORTANTE: Usamos o 'gemini-1.5-pro'
    // Ele é o modelo mais inteligente LIBERADO publicamente. 
    // Se colocarmos nomes beta (2.5 ou 3), vai dar erro 404.
    const model = genai.getGenerativeModel({ model: "gemini-1.5-pro" });

    // 4. INSTRUÇÕES PARA A IA (PROMPT)
    let systemInstruction = "";
    
    if (mode === "receitas") {
      systemInstruction = `Você é um Chef Executivo premiado. Crie um ebook de receitas de alto padrão.
      TEMA: ${topic}
      DETALHES DO CLIENTE: ${description}
      
      REGRAS DE FORMATAÇÃO (JSON):
      Retorne APENAS um JSON exato com esta estrutura:
      { 
        "title": "Título Elegante do Ebook", 
        "chapters": [ 
          { 
            "title": "Nome da Receita", 
            "content": "<div class='recipe-card'><h3>🛒 Ingredientes</h3><ul><li>Ingrediente 1</li><li>Ingrediente 2</li></ul><h3>🔥 Modo de Preparo</h3><ol><li>Passo 1 detalhado.</li><li>Passo 2 detalhado.</li></ol><div class='chef-secret'><strong>💡 Segredo do Chef:</strong> Dica valiosa.</div></div>" 
          } 
        ] 
      }
      Gere 4 receitas completas e detalhadas.`;
    } else {
      systemInstruction = `Você é um Autor Best-Seller e Especialista no assunto.
      TEMA: ${topic}
      DETALHES DO CLIENTE: ${description}
      
      REGRAS DE FORMATAÇÃO (JSON):
      Retorne APENAS um JSON exato com esta estrutura:
      { 
        "title": "Título Impactante do Livro", 
        "chapters": [ 
          { 
            "title": "Título do Capítulo", 
            "content": "<p class='intro'>Introdução envolvente...</p><h3>Subtítulo Relevante</h3><p>Conteúdo profundo e prático...</p><ul><li>Ponto chave</li></ul><div class='highlight'><strong>Importante:</strong> Destaque final.</div>" 
          } 
        ] 
      }
      Gere 5 capítulos densos (mínimo 400 palavras por capítulo).`;
    }

    // 5. GERAÇÃO
    const result = await model.generateContent(systemInstruction);
    const response = await result.response;
    let text = response.text();
    
    // Limpeza para garantir que o JSON venha puro
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    return NextResponse.json(JSON.parse(text));

  } catch (error) {
    console.error("Erro no servidor:", error);
    return NextResponse.json({ error: "Erro ao conectar com a IA: " + error.message }, { status: 500 });
  }
}
