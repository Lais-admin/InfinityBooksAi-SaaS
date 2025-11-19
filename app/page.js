"use client";
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookOpen, Lock, Sparkles, ChefHat, Download, Upload, Type, Palette, ChevronLeft, Gem, FileText, LayoutTemplate } from 'lucide-react';

export default function Home() {
  // Estados do App
  const [step, setStep] = useState(1); // 1 = Form, 2 = Editor
  const [form, setForm] = useState({ code: '', topic: '', desc: '', mode: 'info' });
  const [ebookData, setEbookData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

  // Estados de Personalização (Editor)
  const [coverImage, setCoverImage] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#d4af37'); // Dourado padrão
  const [fontSize, setFontSize] = useState(16);
  
  const ebookRef = useRef(null); // Referência para tirar a "foto" do PDF

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  // Função 1: Gerar o Conteúdo (Chama a API)
  async function handleGenerate() {
    if (!form.code || !form.topic) return alert("Preencha a chave e o tema!");
    setLoading(true);
    setStatus('💎 Validando VIP e ativando IA...');

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ userCode: form.code, topic: form.topic, description: form.desc, mode: form.mode }),
      });
      const data = await res.json();

      if (data.error) throw new Error(data.error);

      setEbookData(data);
      setStep(2); // Vai para a tela de edição
    } catch (e) {
      alert("Erro: " + e.message);
    }
    setLoading(false);
  }

  // Função 2: Upload de Imagem de Capa
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Função 3: Baixar PDF (Tira foto da tela)
  const handleDownloadPDF = async () => {
    setStatus('✨ Renderizando PDF Premium...');
    const element = ebookRef.current;
    
    // Configuração para qualidade máxima
    const canvas = await html2canvas(element, {
      scale: 2, // Melhora a resolução
      useCORS: true,
      logging: false
    });

    const imgData = canvas.toDataURL('image/png');
    
    // Cria PDF A4
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgProps = pdf.getImageProperties(imgData);
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

    // Lógica para quebrar páginas se for muito longo
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save(`Ebook-${form.topic}.pdf`);
    setStatus('');
  };

  // TELA 1: FORMULÁRIO DE LUXO
  if (step === 1) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Glow sutil */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[100px]"></div>

        <div className="max-w-2xl w-full bg-zinc-900 border border-amber-900/30 p-8 rounded-2xl shadow-2xl relative z-10">
          
          {/* BARRA DEGRADE NO TOPO */}
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-t-2xl"></div>

          <div className="text-center mb-8 mt-2">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-2 drop-shadow-sm">
              InfinityBooks AI
            </h1>
            <p className="text-zinc-400 text-lg">Crie Ebooks Premium em segundos</p>
          </div>
          
          <div className="space-y-5">
            
            {/* Campo Chave VIP */}
            <div>
              <label className="flex items-center text-amber-500 text-sm mb-2 font-semibold">
                <Lock size={16} className="mr-2" /> Chave de Acesso VIP
              </label>
              <input 
                name="code" 
                placeholder="Ex: VIP-GOLD-2025" 
                onChange={handleChange} 
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-zinc-600" 
              />
            </div>

            {/* Botões de Seleção */}
            <div className="grid grid-cols-2 gap-4">
              <button 
                onClick={() => setForm({...form, mode: 'info'})} 
                className={`p-4 rounded-xl border flex items-center justify-center transition-all duration-300 ${form.mode === 'info' ? 'bg-amber-900/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
              >
                <BookOpen size={20} className="mr-2"/> Informativo
              </button>
              <button 
                onClick={() => setForm({...form, mode: 'receitas'})} 
                className={`p-4 rounded-xl border flex items-center justify-center transition-all duration-300 ${form.mode === 'receitas' ? 'bg-amber-900/20 border-amber-500 text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:border-zinc-600'}`}
              >
                <ChefHat size={20} className="mr-2"/> Receitas
              </button>
            </div>

            {/* Campo Tema */}
            <div>
              <label className="flex items-center text-amber-500 text-sm mb-2 font-semibold">
                <LayoutTemplate size={16} className="mr-2" /> Tema do Ebook
              </label>
              <input 
                name="topic" 
                placeholder="Ex: Confeitaria Lucrativa" 
                onChange={handleChange} 
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-zinc-600" 
              />
            </div>

            {/* Campo Detalhes */}
            <div>
              <label className="flex items-center text-amber-500 text-sm mb-2 font-semibold">
                <FileText size={16} className="mr-2" /> Detalhes & Descrição
              </label>
              <textarea 
                name="desc" 
                rows="3" 
                placeholder="Descreva o público alvo, o tom de voz ou ingredientes principais..." 
                onChange={handleChange} 
                className="w-full p-4 bg-zinc-950 border border-zinc-800 rounded-xl text-white focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all placeholder-zinc-600 resize-none" 
              />
            </div>

            {/* BOTÃO DE GERAR (COM DIAMANTE E BRILHO) */}
            <button 
              onClick={handleGenerate} 
              disabled={loading} 
              className="w-full py-5 mt-4 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 hover:from-amber-500 hover:via-yellow-400 hover:to-amber-500 text-black font-extrabold rounded-xl text-lg shadow-[0_0_25px_rgba(245,158,11,0.4)] hover:shadow-[0_0_35px_rgba(245,158,11,0.6)] transition-all duration-300 transform hover:-translate-y-1 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
            >
              {loading ? (
                <span className="animate-pulse">{status}</span>
              ) : (
                <>
                  <Gem size={24} className="animate-pulse"/> Gerar Ebook Premium
                </>
              )}
            </button>

            <p className="text-center text-zinc-600 text-xs mt-6">Powered by Gemini 2.5 Pro • Secure Engine</p>
          </div>
        </div>
      </div>
    );
  }

  // TELA 2: EDITOR E PREVIEW
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col md:flex-row">
      {/* BARRA LATERAL DE EDIÇÃO */}
      <div className="w-full md:w-80 bg-zinc-950 p-6 border-r border-zinc-800 overflow-y-auto z-20 shadow-2xl">
        <button onClick={() => setStep(1)} className="flex items-center text-zinc-400 hover:text-amber-500 transition mb-8 font-semibold"><ChevronLeft size={20} /> Voltar ao Início</button>
        
        <div className="mb-8 pb-8 border-b border-zinc-800">
           <h2 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-600 mb-2">Personalizar</h2>
           <p className="text-xs text-zinc-500">Edite antes de baixar</p>
        </div>
        
        <div className="space-y-6">
            {/* Upload de Capa */}
            <div>
            <label className="block text-amber-500 text-sm mb-2 font-bold flex items-center"><Upload size={16} className="mr-2"/> Capa do Ebook</label>
            <div className="relative">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"/>
                <div className="w-full p-3 bg-zinc-900 border border-zinc-700 rounded text-zinc-400 text-sm text-center hover:border-amber-500 hover:text-white transition">
                    Clique para enviar imagem
                </div>
            </div>
            </div>

            {/* Cor Principal */}
            <div>
            <label className="block text-amber-500 text-sm mb-2 font-bold flex items-center"><Palette size={16} className="mr-2"/> Cor dos Títulos</label>
            <div className="flex items-center gap-2 bg-zinc-900 p-2 rounded border border-zinc-700">
                <input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-8 h-8 bg-transparent cursor-pointer border-none outline-none"/>
                <span className="text-xs text-zinc-400 uppercase">{primaryColor}</span>
            </div>
            </div>

            {/* Tamanho da Fonte */}
            <div>
            <label className="block text-amber-500 text-sm mb-2 font-bold flex items-center"><Type size={16} className="mr-2"/> Tamanho do Texto: {fontSize}px</label>
            <input type="range" min="12" max="24" value={fontSize} onChange={(e) => setFontSize(e.target.value)} className="w-full accent-amber-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer"/>
            </div>
        </div>

        <button onClick={handleDownloadPDF} className="w-full mt-10 py-4 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 text-white font-bold rounded-xl flex items-center justify-center shadow-lg transition-all hover:scale-105">
          <Download size={20} className="mr-2"/> {status || 'Baixar PDF Final'}
        </button>
      </div>

      {/* ÁREA DE PREVIEW */}
      <div className="flex-1 bg-zinc-800 p-8 overflow-auto flex justify-center relative">
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-5 pointer-events-none"></div>
        
        <div 
          ref={ebookRef} 
          className="bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[210mm] min-h-[297mm] p-[20mm] relative z-10"
          style={{ fontSize: `${fontSize}px` }}
        >
          {/* CAPA */}
          <div className="flex flex-col items-center justify-center min-h-[800px] text-center mb-20 border-b-4 pb-10" style={{ borderColor: primaryColor }}>
            {coverImage ? (
              <img src={coverImage} alt="Capa" className="w-full h-[400px] object-cover rounded-lg shadow-2xl mb-10" />
            ) : (
              <div className="w-full h-[350px] bg-zinc-100 border-2 border-dashed border-zinc-300 flex flex-col items-center justify-center rounded-lg mb-10 text-zinc-400 gap-2">
                <Upload size={40} className="opacity-20"/>
                <p>Capa do Ebook</p>
              </div>
            )}
            <h1 className="text-5xl font-bold mb-6 leading-tight" contentEditable suppressContentEditableWarning style={{ color: primaryColor }}>
              {ebookData.title}
            </h1>
            <div className="h-1 w-20 mb-6" style={{ backgroundColor: primaryColor }}></div>
            <p className="text-xl text-zinc-600 font-light" contentEditable suppressContentEditableWarning>Um guia exclusivo gerado por InfinityBooks AI</p>
          </div>

          {/* CONTEÚDO DOS CAPÍTULOS */}
          <div className="space-y-14">
            {ebookData.chapters.map((chap, i) => (
              <div key={i} className="chapter">
                <div className="flex items-center gap-4 mb-6">
                    <span className="text-6xl font-black opacity-10" style={{ color: primaryColor }}>{i + 1}</span>
                    <h2 
                    className="text-3xl font-bold pb-2 border-b-2 flex-1" 
                    style={{ color: primaryColor, borderColor: primaryColor }}
                    contentEditable 
                    suppressContentEditableWarning
                    >
                    {chap.title}
                    </h2>
                </div>
                <div 
                  className="prose max-w-none leading-relaxed text-justify text-zinc-800"
                  contentEditable 
                  suppressContentEditableWarning
                  dangerouslySetInnerHTML={{ __html: chap.content }}
                />
              </div>
            ))}
          </div>

          {/* RODAPÉ */}
          <div className="mt-24 text-center text-[10px] text-zinc-400 border-t pt-6 uppercase tracking-widest">
            InfinityBooks AI • Documento Oficial
          </div>
        </div>
      </div>
    </div>
  );
}
// FIM DO ARQUIVO - VERIFIQUE SE COPIOU ATE AQUI
