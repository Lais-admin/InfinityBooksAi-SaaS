"use client";
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { 
  LayoutTemplate, Type, Image as ImageIcon, Upload, Layers, Grid, 
  Download, Share2, Settings, ChevronLeft, ChevronRight, 
  Undo, Redo, FileText, Gem, Lock, BookOpen, ChefHat, Check, X 
} from 'lucide-react';

export default function Home() {
  // --- ESTADOS GERAIS ---
  const [step, setStep] = useState(1); // 1 = Form Inicial, 2 = Editor Profissional
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [form, setForm] = useState({ code: '', topic: '', desc: '', mode: 'info' });
  const [ebookData, setEbookData] = useState(null);

  // --- ESTADOS DO EDITOR ---
  const [activeTab, setActiveTab] = useState('background'); // Qual aba lateral está aberta
  const [bgColor, setBgColor] = useState('#ffffff'); // Cor de fundo das páginas
  const [showDownloadModal, setShowDownloadModal] = useState(false); // Modal de download
  const [currentPage, setCurrentPage] = useState(0); // Paginação simples para visualização

  const ebookRef = useRef(null);

  // --- FUNÇÕES ---
  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function handleGenerate() {
    if (!form.code || !form.topic) return alert("Preencha a chave e o tema!");
    setLoading(true);
    setStatus('💎 Conectando ao Gemini 2.5 Pro...');

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

  // Função de Download (PDF)
  const handleDownloadPDF = async () => {
    setShowDownloadModal(false);
    setStatus('Renderizando PDF em Alta Definição...');
    const element = ebookRef.current;
    const canvas = await html2canvas(element, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;
    
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

  // --- TELA 1: FORMULÁRIO DE ENTRADA (Manteve o design bonito) ---
  if (step === 1) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4 relative overflow-hidden">
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
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-600 rounded-t-2xl"></div>
            <div className="text-center mb-8">
              <h1 className="text-4xl font-bold text-white mb-2">InfinityBooks AI</h1>
              <p className="text-zinc-500">Crie Ebooks Profissionais</p>
            </div>
            <div className="space-y-4">
               <div><label className="text-amber-500 text-sm font-bold">Chave VIP</label><input name="code" onChange={handleChange} className="w-full p-3 bg-black border border-zinc-800 rounded-lg text-white" placeholder="VIP-GOLD-2025" /></div>
               <div className="grid grid-cols-2 gap-4">
                 <button onClick={() => setForm({...form, mode: 'info'})} className={`p-3 border rounded-lg ${form.mode === 'info' ? 'border-amber-500 bg-amber-900/20 text-amber-500' : 'border-zinc-800 bg-black text-zinc-500'}`}>Informativo</button>
                 <button onClick={() => setForm({...form, mode: 'receitas'})} className={`p-3 border rounded-lg ${form.mode === 'receitas' ? 'border-amber-500 bg-amber-900/20 text-amber-500' : 'border-zinc-800 bg-black text-zinc-500'}`}>Receitas</button>
               </div>
               <div><label className="text-amber-500 text-sm font-bold">Tema</label><input name="topic" onChange={handleChange} className="w-full p-3 bg-black border border-zinc-800 rounded-lg text-white" placeholder="Ex: Panetones Gourmet" /></div>
               <div><label className="text-amber-500 text-sm font-bold">Detalhes</label><textarea name="desc" onChange={handleChange} className="w-full p-3 bg-black border border-zinc-800 rounded-lg text-white" placeholder="Detalhes do conteúdo..." /></div>
               <button onClick={handleGenerate} className="w-full py-4 bg-gradient-to-r from-amber-600 to-yellow-500 text-black font-bold rounded-lg shadow-lg hover:scale-[1.02] transition-transform flex justify-center items-center gap-2"><Gem size={20}/> Gerar Ebook Premium</button>
            </div>
          </div>
        )}
      </div>
    );
  }

  // --- TELA 2: EDITOR PROFISSIONAL (ESTILO CANVA) ---
  return (
    <div className="h-screen w-full bg-[#1e1e1e] flex flex-col overflow-hidden font-sans">
      
      {/* 1. BARRA SUPERIOR (TOOLBAR) */}
      <div className="h-16 bg-[#0f0f0f] border-b border-[#2a2a2a] flex items-center justify-between px-4 z-50">
        <div className="flex items-center gap-4">
          <button onClick={() => setStep(1)} className="text-white hover:bg-zinc-800 p-2 rounded"><ChevronLeft /></button>
          <div className="text-white font-bold">Arquivo: {form.topic}</div>
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
        <div className="flex-1 bg-[#252525] overflow-auto flex justify-center p-10 relative">
          
          {/* Botões de Navegação Flutuantes */}
          <button className="absolute left-4 top-1/2 -translate-y-1/2 bg-[#0f0f0f] text-white p-3 rounded-full shadow-xl hover:bg-zinc-800 z-50"><ChevronLeft /></button>
          <button className="absolute right-4 top-1/2 -translate-y-1/2 bg-[#0f0f0f] text-white p-3 rounded-full shadow-xl hover:bg-zinc-800 z-50"><ChevronRight /></button>

          {/* A FOLHA DE PAPEL (A4) */}
          <div 
            ref={ebookRef}
            className="w-[210mm] min-h-[297mm] bg-white shadow-[0_0_50px_rgba(0,0,0,0.5)] transition-colors duration-300"
            style={{ background: bgColor }}
          >
             {/* CAPA */}
            <div className="w-full h-[297mm] flex flex-col items-center justify-center p-20 text-center relative page-break-after">
                <div className="w-full h-1 bg-amber-500 mb-10"></div>
                <h1 className="text-6xl font-serif font-bold text-zinc-900 mb-6">{ebookData?.title || "Seu Título Aqui"}</h1>
                <p className="text-2xl text-zinc-600 font-light italic">Uma coleção exclusiva</p>
                <div className="mt-auto text-sm text-zinc-400">Edição Especial • InfinityBooks AI</div>
            </div>

            {/* CONTEÚDO */}
            <div className="p-[20mm]">
              {ebookData?.chapters?.map((chap, i) => (
                <div key={i} className="mb-16">
                   <h2 className="text-3xl font-bold text-amber-600 border-b-2 border-amber-200 pb-2 mb-6">{chap.title}</h2>
                   <div className="prose max-w-none text-justify text-zinc-800 leading-relaxed" dangerouslySetInnerHTML={{ __html: chap.content }} contentEditable suppressContentEditableWarning />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* 3. MODAL DE DOWNLOAD */}
      {showDownloadModal && (
        <div className="fixed inset-0 bg-black/80 z-[100] flex items-center justify-center backdrop-blur-sm">
          <div className="bg-[#1e1e1e] p-6 rounded-xl w-96 border border-zinc-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-white font-bold text-xl">Download Ebook</h3>
              <button onClick={() => setShowDownloadModal(false)} className="text-zinc-500 hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="space-y-3">
              <button onClick={handleDownloadPDF} className="w-full p-4 bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 rounded-lg flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-900/30 text-red-500 rounded"><FileText size={20}/></div>
                  <div className="text-left">
                    <div className="text-white font-semibold group-hover:text-amber-500 transition">PDF (Padrão)</div>
                    <div className="text-xs text-zinc-500">Melhor para impressão e leitura</div>
                  </div>
                </div>
                {status ? <div className="text-amber-500 text-xs animate-pulse">Gerando...</div> : <ChevronRight size={16} className="text-zinc-600"/>}
              </button>

              <button className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 text-blue-500 rounded"><BookOpen size={20}/></div>
                  <div className="text-left">
                    <div className="text-zinc-400 font-semibold">EPUB</div>
                    <div className="text-xs text-zinc-600">Para Kindle e Apple Books</div>
                  </div>
                </div>
                <div className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded">PRO</div>
              </button>

              <button className="w-full p-4 bg-zinc-900 border border-zinc-700 rounded-lg flex items-center justify-between opacity-50 cursor-not-allowed">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-900/30 text-blue-500 rounded"><FileText size={20}/></div>
                  <div className="text-left">
                    <div className="text-zinc-400 font-semibold">DOCX (Word)</div>
                    <div className="text-xs text-zinc-600">Editável no Word</div>
                  </div>
                </div>
                <div className="text-[10px] bg-amber-500/20 text-amber-500 px-2 py-1 rounded">PRO</div>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Componente Auxiliar para Ícones da Sidebar
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
// FIM DO ARQUIVO
