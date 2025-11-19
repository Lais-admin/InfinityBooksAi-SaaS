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
      </head>
      <body className="bg-black text-white">
        {children}
      </body>
    </html>
  )
}
