"use client";
import { useState, useRef, createRef, useEffect } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookOpen, Lock, Sparkles, ChefHat, Download, Upload, Type, Palette, ChevronLeft, ChevronRight, Gem, FileText, LayoutTemplate, Layers, Image as ImageIcon, Undo, Redo, Share2, Grid } from 'lucide-react';
import './globals.css'; // Importa os estilos globais

export default function Home() {
  // --- ESTADOS GERAIS ---
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ code: '', topic: '', desc: '', mode: 'info' });
  const [ebookData, setEbookData] = useState(null);

  // --- ESTADOS DO EDITOR ---
  const [activeTab, setActiveTab] = useState('background');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(16);
  const [coverImage, setCoverImage] = useState(null);
  const [primaryColor, setPrimaryColor] = useState('#d4af37'); 
  
  // Referência para as MÚLTIPLAS PÁGINAS 
  const pageRefs = useRef([]);
  const [pageCount, setPageCount] = useState(0);

  useEffect(() => {
    if (ebookData) {
        const count = (ebookData.chapters?.length || 0) + 1; 
        setPageCount(count);
        pageRefs.current = Array(count).fill(null).map((_, i) => pageRefs.current[i] || createRef());
    }
  }, [ebookData]);

  // --- FUNÇÕES ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleGenerate() {
    if (!form.code || !form.topic) return alert("Preencha a chave e o tema!");
    setLoading(true);
    setStatus('💎 Validando VIP e ativando GPT-4o...'); // LIMPO

    try {
      const res = await fetch('/api/generate', {
        method: 'POST',
        body: JSON.stringify({ userCode: form.code, topic: form.topic, description: form.desc, mode: form.mode }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setEbookData(data);
      setStep(2);
    } catch (e) {
      alert("Erro: " + e.message);
    }
    setLoading(false);
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCoverImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  // Função de Download (Tira foto de PÁGINA POR PÁGINA)
  const handleDownloadPDF = async () => {
    if (!pageRefs.current.length) return;
    setStatus('Renderizando PDF em Alta Definição...');
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    let isFirstPage = true;

    for (let i = 0; i < pageCount; i++) {
        const pageElement = pageRefs.current[i]?.current;
        if (!pageElement) continue;

        const canvas = await html2canvas(pageElement, { scale: 2 });
        const imgData = canvas.toDataURL('image/png');

        if (!isFirstPage) {
            pdf.addPage();
        }
        
        pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
        isFirstPage = false;
    }

    pdf.save(`Ebook-${form.topic}.pdf`);
    setStatus('');
  };


  // TELA 1: FORMULÁRIO DE LUXO (LIMPO)
  if (step === 1) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
        
        {/* Background Glow sutil */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-amber-600/10 rounded-full blur-[100px]"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-yellow-600/10 rounded-full blur-[100px]"></div>

        {loading ? (
          <div className="flex flex-col items-center justify-center text-center z-10">
            <h1 className="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-400 to-amber-600 mb-4 animate-pulse">InfinityBooks AI</h1>
            <div className="flex gap-2 my-6"><div className="w-3 h-3 bg-amber-500 rounded-full animate-bounce"></div><div className="w-3 h-3 bg-yellow-500 rounded-full animate-bounce delay-75"></div><div className="w-3 h-3 bg-amber-600 rounded-full animate-bounce delay-150"></div></div>
            <p className="text-zinc-400">{status}</p>
          </div>
        ) : (
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

              <p className="text-center text-zinc-600 text-xs mt-6">Powered by GPT-4o • Secure Engine</p>
            </div>
          </div>
        )}
      </div>
    );
  }

  // TELA 2: EDITOR PROFISSIONAL (ESTILO CANVA)
  return (
    <div className="h-screen w-full bg-[#252525] flex flex-col overflow-hidden font-sans">
      
      {/* 1. BARRA SUPERIOR (TOOLBAR) */}
      <div className="h-16 bg-[#0f0f0f] border-b border-[#2a2a2a] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(1)} className="text-white hover:bg-zinc-800 p-2 rounded"><ChevronLeft /></button>
          <div className="text-white font-bold">{ebookData?.title || form.topic}</div>
          <div className="flex gap-2 ml-6">
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"><Undo size={18}/></button>
            <button className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-800 rounded"><Redo size={18}/></button>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 text-white bg-zinc-800 rounded hover:bg-zinc-700 flex items-center gap-2 text-sm"><Share2 size={16}/> Compartilhar</button>
          <button onClick={() => setShowDownloadModal(true)} className="px-4 py-2 bg-amber-600 text-black font-bold rounded hover:bg-amber-500 flex items-center gap-2 text-sm"><Download size={16}/> Download</button>
        </div>
      </div>

      {/* 2. ÁREA PRINCIPAL DO EDITOR */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* A. SIDEBAR DE ÍCONES (ESQUERDA) */}
        <div className="w-20 bg-[#0f0f0f] border-r border-[#2a2a2a] flex flex-col items-center py-4 gap-6 z-40">
          <SidebarIcon icon={Grid} label="Fundo" active={activeTab === 'background'} onClick={() => setActiveTab('background')} />
          <SidebarIcon icon={ImageIcon} label="Fotos" active={activeTab === 'photos'} onClick={() => setActiveTab('photos')} />
          <SidebarIcon icon={Type} label="Texto" active={activeTab === 'text'} onClick={() => setActiveTab('text')} />
          <SidebarIcon icon={Upload} label="Uploads" active={activeTab === 'uploads'} onClick={() => setActiveTab('uploads')} />
          <SidebarIcon icon={Layers} label="Camadas" active={activeTab === 'layers'} onClick={() => setActiveTab('layers')} />
        </div>

        {/* B. PAINEL DE OPÇÕES (SUB-SIDEBAR) */}
        <div className="w-80 bg-[#1e1e1e] border-r border-[#2a2a2a] flex flex-col z-30 shadow-xl">
          
          {/* Painel de Fundo */}
          {activeTab === 'background' && (
            <div className="p-4">
              <h3 className="text-white font-bold mb-4">Cor do Fundo</h3>
              <div className="grid grid-cols-4 gap-2 mb-6">
                {['#ffffff', '#f8f9fa', '#fffbeb', '#f0fdf4', '#eff6ff', '#faf5ff', '#18181b', '#27272a'].map(color => (
                  <div 
                    key={color} 
                    onClick={() => setBgColor(color)}
                    className="w-10 h-10 rounded-lg cursor-pointer border border-zinc-700 hover:scale-110 transition"
                    style={{ backgroundColor: color }}
                  ></div>
                ))}
              </div>
              <h3 className="text-white font-bold mb-4">Gradientes</h3>
              <div className="grid grid-cols-2 gap-2">
                <div onClick={() => setBgColor('linear-gradient(to right, #ffecd2 0%, #fcb69f 100%)')} className="h-20 rounded-lg cursor-pointer bg-gradient-to-r from-orange-100 to-red-200"></div>
                <div onClick={() => setBgColor('linear-gradient(120deg, #e0c3fc 0%, #8ec5fc 100%)')} className="h-20 rounded-lg cursor-pointer bg-gradient-to-r from-purple-200 to-blue-200"></div>
              </div>
            </div>
          )}

          {/* Painel de Fotos (Simulado) */}
          {activeTab === 'photos' && (
            <div className="p-4 h-full overflow-y-auto">
               <h3 className="text-white font-bold mb-4">Fotos Unsplash</h3>
               <input placeholder="Buscar fotos..." className="w-full p-2 bg-black border border-zinc-700 rounded mb-4 text-white text-sm"/>
               <div className="grid grid-cols-2 gap-2">
                 {[1,2,3,4,5,6].map(i => (
                   <div key={i} className="h-24 bg-zinc-800 rounded hover:opacity-80 cursor-pointer bg-cover bg-center" style={{ backgroundImage: `url(https://source.unsplash.com/random/200x200?sig=${i})` }}></div>
                 ))}
               </div>
            </div>
          )}
          
          {/* Painel Padrão para outros */}
          {!['background', 'photos'].includes(activeTab) && (
            <div className="p-4 text-zinc-500 text-center mt-10">
              Funcionalidade em desenvolvimento para a versão Pro.
            </div>
          )}
        </div>

        {/* C. CANVAS (ÁREA DE TRABALHO) */}
        <div ref={contentDivRef} className="flex-1 bg-[#252525] overflow-auto flex flex-col items-center p-10 relative space-y-10">
            
            {/* Mapeamento de PÁGINAS INDIVIDUAIS */}
            {[...Array(pageCount)].map((_, i) => (
                <div 
                    key={i}
                    ref={pageRefs.current[i]}
                    className="bg-white text-black shadow-[0_0_50px_rgba(0,0,0,0.5)] w-[210mm] min-h-[297mm] p-[20mm] relative transition-colors duration-300"
                    style={{ backgroundColor: bgColor, fontSize: `${fontSize}px` }}
                >
                    {/* Renderiza a Capa (i=0) ou o Conteúdo (i>0) */}
                    {i === 0 && (
                        <div className="w-full h-full flex flex-col items-center justify-center p-10 text-center">
                            <div className="mt-auto">
                                <h1 className="text-5xl font-serif font-bold mb-6 text-zinc-900" contentEditable suppressContentEditableWarning>
                                    {ebookData?.title || form.topic}
                                </h1>
                                <div className="h-1 w-20 mx-auto bg-amber-500 mb-6"></div>
                                <p className="text-xl text-zinc-600 font-light italic">Página de Rosto • Edição Premium</p>
                            </div>
                            <div className="mt-auto text-sm text-zinc-400">Desenvolvido com GPT-4o</div>
                        </div>
                    )}

                    {i > 0 && ebookData?.chapters?.[i-1] && (
                        <div className="h-full w-full">
                             <h2 className="text-3xl font-bold text-amber-600 border-b-2 border-amber-200 pb-2 mb-6">{ebookData.chapters[i-1].title}</h2>
                             <div 
                                className="prose max-w-none text-justify text-zinc-800 leading-relaxed"
                                contentEditable 
                                suppressContentEditableWarning
                                dangerouslySetInnerHTML={{ __html: ebookData.chapters[i-1].content }}
                             />
                        </div>
                    )}
                </div>
            ))}
        </div>
      </div>

      {/* 3. MODAL DE DOWNLOAD */}
      {/* CÓDIGO DO MODAL AQUI */}

    </div>
  );
}

// Componente Auxiliar para Ícones da Sidebar (Deve estar no final do arquivo)
function SidebarIcon({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex flex-col items-center justify-center w-full py-3 transition-colors ${active ? 'text-white border-l-2 border-amber-500 bg-zinc-800' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'}`}
    >
      <Icon size={24} className="mb-1"/>
      <span className="text-[10px] font-medium">{label}</span>
    </button>
  )
}

// FIM DO ARQUIVO - VERIFIQUE SE COPIOU TUDO!
