import './globals.css'; 
// Não precisa mais do script do Tailwind aqui, ele é importado pelo globals.css

export const metadata = {
  title: 'InfinityBooks AI',
  description: 'Gerador de Ebooks Premium',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body>
        {children}
      </body>
    </html>
  )
}
