"use client";
import { useState } from 'react';
import jsPDF from 'jspdf';
import { BookOpen, Lock, Sparkles, ChefHat, FileText } from 'lucide-react';

export default function Home() {
  const [form, setForm] = useState({ code: '', topic: '', desc: '', mode: 'info' });
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleGenerate() {
    if (!form.code || !form.topic) return alert("Preencha a chave e o tema!");
    
    setLoading(true);
    setStatus('💎 Validando sua licença Premium...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ 
          userCode: form.code, 
          topic: form.topic, 
          description: form.desc, 
          mode: form.mode 
        }),
      });

      const data = await res.json();

      if (data.error) {
        alert("ERRO: " + data.error);
        setLoading(false);
        return;
      }

      setStatus('✨ Escrevendo seu livro com IA...');

      // GERAÇÃO DO PDF
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      const maxLineWidth = pageWidth - (margin * 2);
      let y = 40;

      // Capa Simples
      doc.setFillColor(20, 20, 20); // Fundo escuro capa
      doc.rect(0, 0, pageWidth, 300, 'F');
      doc.setTextColor(218, 165, 32); // Dourado
      doc.setFontSize(30);
      doc.text(data.title, pageWidth / 2, 100, { align: 'center' });
      doc.setFontSize(14);
      doc.setTextColor(255, 255, 255);
      doc.text("Gerado por InfinityBooks AI", pageWidth / 2, 120, { align: 'center' });
      doc.addPage();

      // Conteúdo
      doc.setTextColor(0, 0, 0); // Texto preto nas paginas internas
      
      data.chapters.forEach((chap) => {
        if (y > 250) { doc.addPage(); y = 40; }
        
        doc.setFontSize(22);
        doc.setTextColor(218, 165, 32); // Titulo Dourado
        doc.text(chap.title, margin, y);
        y += 15;

        doc.setFontSize(12);
        doc.setTextColor(60, 60, 60);
        
        // Remove HTML tags para o PDF simples
        const cleanText = chap.content.replace(/<[^>]*>?/gm, '\n');
        const lines = doc.splitTextToSize(cleanText, maxLineWidth);
        doc.text(lines, margin, y);
        y += (lines.length * 7) + 20;
      });

      doc.save(`Ebook-${form.topic}.pdf`);
      setStatus('✅ Sucesso! Download iniciado.');

    } catch (e) {
      alert("Erro fatal: " + e.message);
    }
    setLoading(false);
  }

  // ESTILOS CSS (Tailwind embutido via style para simplificar sem config extra)
  const inputStyle = "w-full p-3 bg-zinc-900 border border-zinc-700 rounded text-white focus:border-amber-500 outline-none transition mb-4";
  const labelStyle = "block text-amber-500 text-sm mb-1 font-semibold";

  return (
    <div className="min-h-screen bg-black text-white font-sans flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-zinc-950 border border-amber-900/30 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        
        {/* Efeito de brilho no fundo */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-black via-amber-600 to-black"></div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-2">
            InfinityBooks AI
          </h1>
          <p className="text-zinc-500">Crie Ebooks Premium em segundos</p>
        </div>

        {/* Formulário */}
        <div className="space-y-2">
          
          <div>
            <label className={labelStyle}><Lock size={14} className="inline mr-1"/> Chave de Acesso VIP</label>
            <input name="code" type="text" placeholder="Ex: VIP-GOLD-2025" onChange={handleChange} className={inputStyle} />
          </div>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <button 
              onClick={() => setForm({...form, mode: 'info'})}
              className={`p-3 rounded border ${form.mode === 'info' ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
              <BookOpen size={18} className="inline mb-1 mr-2"/> Informativo
            </button>
            <button 
              onClick={() => setForm({...form, mode: 'receitas'})}
              className={`p-3 rounded border ${form.mode === 'receitas' ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-zinc-900 border-zinc-800 text-zinc-500'}`}
            >
              <ChefHat size={18} className="inline mb-1 mr-2"/> Receitas
            </button>
          </div>

          <div>
            <label className={labelStyle}>Tema do Ebook</label>
            <input name="topic" type="text" placeholder="Ex: Marketing Digital ou Risotos" onChange={handleChange} className={inputStyle} />
          </div>

          <div>
            <label className={labelStyle}>Descrição & Detalhes (Opcional)</label>
            <textarea 
              name="desc" 
              rows="3"
              placeholder="Descreva o público alvo, o tom de voz ou ingredientes..." 
              onChange={handleChange} 
              className={inputStyle} 
            />
          </div>

          <button 
            onClick={handleGenerate} 
            disabled={loading}
            className="w-full py-4 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-bold rounded text-lg shadow-[0_0_20px_rgba(245,158,11,0.3)] transition transform hover:scale-[1.02]"
          >
            {loading ? (
              <span className="animate-pulse">{status}</span>
            ) : (
              <><Sparkles size={20} className="inline mr-2"/> Gerar Ebook PDF</>
            )}
          </button>

        </div>
        
        <p className="text-center text-zinc-700 text-xs mt-6">Powered by Gemini 1.5 Flash • Secure Engine</p>
      </div>
    </div>
  );
}
