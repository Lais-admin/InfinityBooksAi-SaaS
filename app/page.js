"use client";
import { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { BookOpen, Lock, Sparkles, ChefHat, Download, Upload, Type, Palette, ChevronLeft } from 'lucide-react';

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
    setStatus('Validando licença e criando conteúdo...');

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
    setStatus('Diagramando PDF em Alta Qualidade...');
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

  // TELA 1: FORMULÁRIO
  if (step === 1) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white font-sans flex items-center justify-center p-4">
        <div className="max-w-2xl w-full bg-zinc-900 border border-amber-900/30 p-8 rounded-2xl shadow-2xl">
          <h1 className="text-4xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-600 mb-6">InfinityBooks AI</h1>
          
          <div className="space-y-4">
            <div>
              <label className="block text-amber-500 text-sm mb-1">Chave VIP</label>
              <input name="code" placeholder="VIP-GOLD-2025" onChange={handleChange} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-white focus:border-amber-500 outline-none" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <button onClick={() => setForm({...form, mode: 'info'})} className={`p-3 rounded border ${form.mode === 'info' ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-zinc-950 border-zinc-800'}`}>Informativo</button>
              <button onClick={() => setForm({...form, mode: 'receitas'})} className={`p-3 rounded border ${form.mode === 'receitas' ? 'bg-amber-900/40 border-amber-500 text-amber-400' : 'bg-zinc-950 border-zinc-800'}`}>Receitas</button>
            </div>
            <div>
              <label className="block text-amber-500 text-sm mb-1">Tema</label>
              <input name="topic" placeholder="Ex: Confeitaria Lucrativa" onChange={handleChange} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-white outline-none" />
            </div>
            <div>
              <label className="block text-amber-500 text-sm mb-1">Detalhes</label>
              <textarea name="desc" rows="3" placeholder="Descreva o que quer no ebook..." onChange={handleChange} className="w-full p-3 bg-zinc-950 border border-zinc-800 rounded text-white outline-none" />
            </div>
            <button onClick={handleGenerate} disabled={loading} className="w-full py-4 bg-amber-600 hover:bg-amber-500 text-black font-bold rounded text-lg transition">
              {loading ? status : 'Gerar Ebook e Editar'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // TELA 2: EDITOR E PREVIEW
  return (
    <div className="min-h-screen bg-zinc-900 flex flex-col md:flex-row">
      {/* BARRA LATERAL DE EDIÇÃO */}
      <div className="w-full md:w-80 bg-zinc-950 p-6 border-r border-zinc-800 overflow-y-auto">
        <button onClick={() => setStep(1)} className="flex items
