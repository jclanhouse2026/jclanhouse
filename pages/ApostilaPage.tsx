import React, { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useApostila } from '../context/ApostilaContext';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Printer, 
  FileText, 
  Layers, 
  BookOpen, 
  Palette, 
  Calendar, 
  Hash, 
  Plus, 
  Minus, 
  AlertCircle, 
  CheckCircle2,
  ShoppingCart,
  Calculator,
  Info
} from 'lucide-react';
import { db } from '../lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from '../lib/errorHandlers';
import { useNavigate } from 'react-router-dom';

const ApostilaPage: React.FC = () => {
  const { settings, colors, loading } = useApostila();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [title, setTitle] = useState<string>('');
  const [printType, setPrintType] = useState<'bw' | 'color'>('bw');
  const [pages, setPages] = useState<number>(10);
  const [sides, setSides] = useState<'single' | 'double'>('double');
  const [binding, setBinding] = useState<'spiral' | 'wireo'>('spiral');
  const [coverColor, setCoverColor] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);

  // Calculations
  const sheetCount = useMemo(() => {
    return sides === 'double' ? Math.ceil(pages / 2) : pages;
  }, [pages, sides]);

  const calculations = useMemo(() => {
    if (!settings) return { pagePrice: 0, bindingPrice: 0, subtotal: 0, total: 0 };

    const pagePrice = printType === 'bw' ? settings.price_bw : settings.price_color;
    const bindingPrice = binding === 'spiral' ? settings.price_spiral : settings.price_wireo;
    
    // Subtotal per unit
    const subtotal = (pages * pagePrice + bindingPrice);
    const total = subtotal * quantity;

    return { pagePrice, bindingPrice, subtotal, total };
  }, [settings, printType, pages, binding, quantity]);

  // Limits Check
  const limitExceeded = useMemo(() => {
    if (!settings) return false;
    const limit = binding === 'spiral' ? settings.limit_spiral : settings.limit_wireo;
    return sheetCount > limit;
  }, [settings, sheetCount, binding]);

  // Min Date
  const minDate = useMemo(() => {
    if (!settings) return '';
    const date = new Date();
    date.setDate(date.getDate() + settings.min_delivery_days);
    return date.toISOString().split('T')[0];
  }, [settings]);

  useEffect(() => {
    if (colors.length > 0 && !coverColor) {
      setCoverColor(colors[0].name);
    }
  }, [colors, coverColor]);

  const handleIncrementPages = () => setPages(prev => prev + 1);
  const handleDecrementPages = () => setPages(prev => Math.max(1, prev - 1));
  const handleIncrementQty = () => setQuantity(prev => prev + 1);
  const handleDecrementQty = () => setQuantity(prev => Math.max(1, prev - 1));

  const handleSubmit = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (limitExceeded) return;

    setIsSubmitting(true);
    try {
      const orderData = {
        user_id: user.id,
        user_name: user.name || 'Cliente',
        user_whatsapp: '', // Could be fetched from profile
        title,
        print_type: printType,
        pages,
        sides,
        binding,
        cover_color: coverColor,
        delivery_date: deliveryDate,
        quantity,
        subtotal: calculations.subtotal,
        total: calculations.total,
        status: 'pending',
        created_at: serverTimestamp()
      };

      await addDoc(collection(db, 'apostila_orders'), orderData);
      
      // Also send to WhatsApp if needed
      const message = `*Novo Pedido de Apostila*%0A%0A` +
        (title ? `*Título:* ${title}%0A` : '') +
        `*Tipo:* ${printType === 'bw' ? 'Preto e Branco' : 'Colorido'}%0A` +
        `*Páginas:* ${pages}%0A` +
        `*Impressão:* ${sides === 'double' ? 'Frente e Verso' : 'Somente Frente'}%0A` +
        `*Encadernação:* ${binding === 'spiral' ? 'Espiral' : 'Wire-o'}%0A` +
        `*Cor da Capa:* ${coverColor}%0A` +
        `*Quantidade:* ${quantity}%0A` +
        `*Data de Entrega:* ${deliveryDate}%0A` +
        `*Total:* R$ ${calculations.total.toFixed(2)}`;
      
      window.open(`https://wa.me/5511999999999?text=${message}`, '_blank');

      setOrderSuccess(true);
      setTimeout(() => setOrderSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting order:', error);
      handleFirestoreError(error, OperationType.CREATE, 'apostila_orders');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || !settings) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-white font-sans">
      <Header />
      
      <main className="container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-6xl mx-auto">
          <header className="mb-10 text-center">
            <h1 className="text-4xl font-bold text-white mb-2">Apostila e Encadernação</h1>
            <p className="text-slate-400">Personalize sua apostila e receba um orçamento instantâneo.</p>
          </header>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Configuration Form */}
            <div className="lg:col-span-2 space-y-8">
              {/* Title */}
              <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <FileText size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Identificação da Apostila</h2>
                </div>
                <input
                  type="text"
                  placeholder="Ex: Apostila de Matemática - 1º Bimestre"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </section>

              {/* Print Type */}
              <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Printer size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Tipo de Impressão</h2>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <button
                    onClick={() => setPrintType('bw')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      printType === 'bw' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${printType === 'bw' ? 'border-cyan-500' : 'border-slate-600'}`}>
                      {printType === 'bw' && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
                    </div>
                    <span className="font-medium">Preto e Branco</span>
                    <span className="text-xs opacity-60">R$ {settings.price_bw.toFixed(2)} / pág</span>
                  </button>
                  <button
                    onClick={() => setPrintType('color')}
                    className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                      printType === 'color' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${printType === 'color' ? 'border-cyan-500' : 'border-slate-600'}`}>
                      {printType === 'color' && <div className="w-3 h-3 bg-cyan-500 rounded-full" />}
                    </div>
                    <span className="font-medium">Colorido</span>
                    <span className="text-xs opacity-60">R$ {settings.price_color.toFixed(2)} / pág</span>
                  </button>
                </div>
              </section>

              {/* Pages and Sides */}
              <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <FileText size={24} />
                      </div>
                      <h2 className="text-xl font-semibold">Quantidade de Páginas</h2>
                    </div>
                    <div className="flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <button 
                          onClick={handleDecrementPages}
                          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                        >
                          <Minus size={20} />
                        </button>
                        <input
                          type="number"
                          value={pages}
                          onChange={(e) => setPages(Math.max(1, parseInt(e.target.value) || 0))}
                          className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-center text-xl font-bold focus:outline-none focus:border-cyan-500"
                        />
                        <button 
                          onClick={handleIncrementPages}
                          className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                        >
                          <Plus size={20} />
                        </button>
                      </div>
                      <div className="flex justify-between items-center px-2">
                        <span className="text-sm text-slate-400">Total de folhas:</span>
                        <span className="text-sm font-bold text-cyan-400">{sheetCount} folhas</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                        <Layers size={24} />
                      </div>
                      <h2 className="text-xl font-semibold">Modo de Impressão</h2>
                    </div>
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-700">
                      <button
                        onClick={() => setSides('single')}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${sides === 'single' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                      >
                        Somente Frente
                      </button>
                      <button
                        onClick={() => setSides('double')}
                        className={`flex-1 py-3 px-4 rounded-lg transition-all font-medium ${sides === 'double' ? 'bg-cyan-500 text-white shadow-lg' : 'text-slate-400 hover:text-white'}`}
                        disabled={!settings.enable_double_sided}
                      >
                        Frente e Verso
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* Binding */}
              <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Tipo de Encadernação</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setBinding('spiral')}
                    disabled={!settings.enable_spiral}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-start gap-2 relative overflow-hidden ${
                      binding === 'spiral' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className="font-bold text-lg">Espiral</span>
                      <span className="text-cyan-400 font-bold">R$ {settings.price_spiral.toFixed(2)}</span>
                    </div>
                    <p className="text-sm opacity-60 text-left">Ideal para apostilas grandes. Até {settings.limit_spiral} folhas.</p>
                    {binding === 'spiral' && <div className="absolute top-0 right-0 p-1 bg-cyan-500 rounded-bl-lg"><CheckCircle2 size={16} /></div>}
                  </button>
                  <button
                    onClick={() => setBinding('wireo')}
                    disabled={!settings.enable_wireo}
                    className={`p-6 rounded-xl border-2 transition-all flex flex-col items-start gap-2 relative overflow-hidden ${
                      binding === 'wireo' 
                        ? 'border-cyan-500 bg-cyan-500/10 text-white' 
                        : 'border-slate-700 bg-slate-900/50 text-slate-400 hover:border-slate-600'
                    }`}
                  >
                    <div className="flex justify-between w-full items-center">
                      <span className="font-bold text-lg">Wire-o</span>
                      <span className="text-cyan-400 font-bold">R$ {settings.price_wireo.toFixed(2)}</span>
                    </div>
                    <p className="text-sm opacity-60 text-left">Acabamento premium metálico. Até {settings.limit_wireo} folhas.</p>
                    {binding === 'wireo' && <div className="absolute top-0 right-0 p-1 bg-cyan-500 rounded-bl-lg"><CheckCircle2 size={16} /></div>}
                  </button>
                </div>

                <AnimatePresence>
                  {limitExceeded && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-xl flex items-center gap-3 text-red-400"
                    >
                      <AlertCircle size={20} className="flex-shrink-0" />
                      <p className="text-sm font-medium">Limite máximo excedido para este tipo de encadernação</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </section>

              {/* Cover Color */}
              <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                    <Palette size={24} />
                  </div>
                  <h2 className="text-xl font-semibold">Cor da Capa</h2>
                </div>
                {colors.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {colors.filter(c => c.active).map((color) => (
                      <button
                        key={color.id}
                        onClick={() => setCoverColor(color.name)}
                        className={`group relative flex flex-col items-center gap-2 p-2 rounded-xl border-2 transition-all ${
                          coverColor === color.name ? 'border-cyan-500 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600'
                        }`}
                      >
                        <div 
                          className="w-12 h-12 rounded-lg shadow-inner border border-white/10"
                          style={{ backgroundColor: color.hex }}
                        />
                        <span className="text-xs font-medium">{color.name}</span>
                        {coverColor === color.name && (
                          <div className="absolute -top-2 -right-2 bg-cyan-500 rounded-full p-0.5">
                            <CheckCircle2 size={14} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 bg-slate-900/50 rounded-xl text-slate-500 text-center italic">
                    Não temos cores disponíveis no momento
                  </div>
                )}
              </section>

              {/* Delivery and Quantity */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                      <Calendar size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Data de Entrega</h2>
                  </div>
                  <input
                    type="date"
                    min={minDate}
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500 [color-scheme:dark]"
                  />
                </section>

                <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-cyan-500/20 rounded-lg text-cyan-400">
                      <Hash size={24} />
                    </div>
                    <h2 className="text-xl font-semibold">Quantidade de Apostilas</h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <button 
                      onClick={handleDecrementQty}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                    >
                      <Minus size={20} />
                    </button>
                    <input
                      type="number"
                      value={quantity}
                      onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 0))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-center text-xl font-bold focus:outline-none focus:border-cyan-500"
                    />
                    <button 
                      onClick={handleIncrementQty}
                      className="p-3 bg-slate-700 hover:bg-slate-600 rounded-xl transition-colors"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                </section>

                {/* Summary Info */}
                <div className="bg-cyan-500/5 border border-cyan-500/20 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-cyan-500/20 rounded-full text-cyan-400">
                      <Info size={24} />
                    </div>
                    <div>
                      <p className="text-slate-400 text-sm">Resumo da configuração:</p>
                      <p className="text-white font-bold">{pages} páginas ({sheetCount} folhas) • {sides === 'double' ? 'Frente e Verso' : 'Somente Frente'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-slate-400 text-sm">Subtotal por apostila:</p>
                    <p className="text-2xl font-black text-cyan-400">R$ {calculations.subtotal.toFixed(2)}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Order Summary Sticky Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <section className="bg-slate-800 rounded-2xl border border-slate-700 shadow-2xl overflow-hidden">
                  <div className="bg-cyan-500 p-4 flex items-center gap-3">
                    <Calculator size={24} className="text-white" />
                    <h2 className="text-xl font-bold text-white">Resumo do Pedido</h2>
                  </div>
                  
                  <div className="p-6 space-y-4">
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Impressão ({printType === 'bw' ? 'P&B' : 'Color'})</span>
                      <span className="text-white font-medium">R$ {(pages * calculations.pagePrice).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Encadernação ({binding === 'spiral' ? 'Espiral' : 'Wire-o'})</span>
                      <span className="text-white font-medium">R$ {calculations.bindingPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Subtotal (por apostila)</span>
                      <span className="text-white font-medium">R$ {calculations.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-slate-400 text-sm">
                      <span>Quantidade</span>
                      <span className="text-white font-medium">x {quantity}</span>
                    </div>
                    
                    <div className="pt-4 border-t border-slate-700">
                      <div className="flex justify-between items-end">
                        <span className="text-lg font-bold text-white">Total Final</span>
                        <span className="text-3xl font-black text-cyan-400">R$ {calculations.total.toFixed(2)}</span>
                      </div>
                    </div>

                    <button
                      onClick={handleSubmit}
                      disabled={isSubmitting || limitExceeded || !deliveryDate}
                      className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all shadow-lg ${
                        isSubmitting || limitExceeded || !deliveryDate
                          ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                          : 'bg-cyan-500 hover:bg-cyan-600 text-white hover:scale-[1.02] active:scale-[0.98]'
                      }`}
                    >
                      {isSubmitting ? (
                        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      ) : (
                        <>
                          <ShoppingCart size={20} />
                          Finalizar Pedido
                        </>
                      )}
                    </button>

                    {!deliveryDate && (
                      <p className="text-xs text-center text-amber-400 flex items-center justify-center gap-1">
                        <Info size={12} /> Selecione uma data de entrega
                      </p>
                    )}
                  </div>
                </section>

                {/* Success Message */}
                <AnimatePresence>
                  {orderSuccess && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      className="p-6 bg-emerald-500/20 border border-emerald-500/50 rounded-2xl text-center"
                    >
                      <div className="inline-flex p-3 bg-emerald-500 rounded-full text-white mb-3">
                        <CheckCircle2 size={32} />
                      </div>
                      <h3 className="text-xl font-bold text-emerald-400 mb-1">Pedido Enviado!</h3>
                      <p className="text-sm text-slate-300">Seu pedido foi registrado e enviado para o WhatsApp.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ApostilaPage;
