import OpenAI from "openai";
import { NextResponse } from "next/server";

// Lista de Senhas (Continua a mesma)
const VALID_KEYS = [
  "VIP-GOLD-2025",
  "TESTE-ADMIN",
  "LAIS-CEO"
];

export async function POST(req) {
  try {
    const body = await req.json();
    const { topic, description, userCode, mode } = body;

    // 1. Validação da Chave
    if (!VALID_KEYS.includes(userCode.trim())) {
      return NextResponse.json({ error: "Chave de Acesso Inválida. Verifique se digitou corretamente." }, { status: 401 });
    }

    // 2. Conexão com OpenAI (Pegando a nova chave da Vercel)
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // 3. Instruções para o GPT-4o (Definindo o formato de saída)
    const systemMessage = `
    Você é um editor de livros e chef de cozinha renomado, focado em criar conteúdo de alto valor e fácil leitura para um ebook premium. 
    Seu trabalho é retornar OBRIGATORIAMENTE APENAS um objeto JSON. 
    O TEMA principal é: "${topic}". O contexto adicional é: "${description}".
    
    A estrutura do seu retorno DEVE SER EXATAMENTE:
    { "title": "Título Impactante do Ebook", "chapters": [ {"title": "Nome do Capítulo", "content": "Seu texto em HTML" } ] }

    REGRAS DE CONTEÚ
    - Para o modo 'receitas', gere 4 receitas completas, com tags <h3> para Ingredientes e <ol> para Preparo.
    - Para o modo 'informativo', gere 5 capítulos densos, usando tags <p> e <h3>.
    `;
    
    // 4. Geração com GPT-4o
    const completion = await openai.chat.completions.create({
        model: "gpt-4o", // Modelo mais rápido e inteligente
        messages: [{ role: "system", content: systemMessage }],
        response_format: { type: "json_object" }, // Garante que a saída é JSON
    });

    const jsonText = completion.choices[0].message.content;
    
    return NextResponse.json(JSON.parse(jsonText));

  } catch (error) {
    console.error("Erro no Backend:", error);
    // Erro 401 do OpenAI é a Chave API errada
    if (error.status === 401) {
        return NextResponse.json({ error: "ERRO DE CHAVE OPENAI: Sua chave de API está inválida ou expirou. Verifique as Variaveis de Ambiente na Vercel." }, { status: 500 });
    }
    return NextResponse.json({ error: "Erro na IA: " + error.message }, { status: 500 });
  }
}
