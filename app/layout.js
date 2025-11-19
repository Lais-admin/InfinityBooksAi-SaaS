export const metadata = {
  title: 'InfinityBooks AI',
  description: 'Gerador de Ebooks Premium',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Carrega o Tailwind CSS para o design funcionar */}
        <script src="https://cdn.tailwindcss.com"></script>
        {/* CSS para a diagramação das receitas (O GRANDE FIX) */}
        <style>
          {`
            .recipe-grid {
              display: grid;
              grid-template-columns: 1fr 1fr; /* Coloca Ingredientes e Preparo lado a lado */
              gap: 20px;
              margin-top: 20px;
              line-height: 1.5;
            }
            .recipe-grid ul, .recipe-grid ol {
              padding-left: 20px;
            }
            .chef-tip {
              margin-top: 20px;
              padding: 10px;
              background-color: #fff9e6; /* Fundo amarelo claro para destaque */
              border-left: 4px solid #d4af37;
              font-style: italic;
            }
            /* Garantir que o texto Gemini não seja muito apertado */
            .prose h3 { margin-top: 1.5em; color: #333; }
            .prose p { margin-bottom: 1em; }
          `}
        </style>
      </head>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
