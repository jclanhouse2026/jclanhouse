import React, { useState, useEffect } from 'react';
import { useApostila } from '../../context/ApostilaContext';
import { db } from '../../lib/firebase';
import { 
  collection, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { 
  Save, 
  Plus, 
  Trash2, 
  Check, 
  X, 
  Settings, 
  Palette, 
  DollarSign, 
  AlertTriangle,
  ClipboardList,
  Eye,
  CheckCircle,
  Clock
} from 'lucide-react';
import { motion } from 'motion/react';

interface AdminApostilaPageProps {
  hideHeader?: boolean;
}

const AdminApostilaPage: React.FC<AdminApostilaPageProps> = ({ hideHeader = false }) => {
  const { settings, colors, loading } = useApostila();
  const [orders, setOrders] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'config' | 'colors' | 'orders'>('config');

  // Settings Form State
  const [settingsForm, setSettingsForm] = useState<any>(null);
  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Colors Form State
  const [newColor, setNewColor] = useState({ name: '', hex: '#000000', active: true });
  const [isAddingColor, setIsAddingColor] = useState(false);

  useEffect(() => {
    if (settings) {
      setSettingsForm({ ...settings });
    }
  }, [settings]);

  useEffect(() => {
    const q = query(collection(db, 'apostila_orders'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, []);

  const handleUpdateSettings = async () => {
    if (!settingsForm) return;
    setIsSavingSettings(true);
    try {
      const { id, ...data } = settingsForm;
      await updateDoc(doc(db, 'apostila_settings', 'default'), data);
      alert('Configurações atualizadas com sucesso!');
    } catch (error) {
      console.error('Error updating settings:', error);
      alert('Erro ao atualizar configurações.');
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddColor = async () => {
    if (!newColor.name) return;
    setIsAddingColor(true);
    try {
      await addDoc(collection(db, 'apostila_colors'), newColor);
      setNewColor({ name: '', hex: '#000000', active: true });
    } catch (error) {
      console.error('Error adding color:', error);
    } finally {
      setIsAddingColor(false);
    }
  };

  const handleToggleColor = async (color: any) => {
    try {
      await updateDoc(doc(db, 'apostila_colors', color.id), { active: !color.active });
    } catch (error) {
      console.error('Error toggling color:', error);
    }
  };

  const handleDeleteColor = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'apostila_colors', id));
    } catch (error) {
      console.error('Error deleting color:', error);
    }
  };

  const handleUpdateOrderStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'apostila_orders', orderId), { status });
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading || !settingsForm) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {!hideHeader && (
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white">Apostila e Encadernação</h1>
            <p className="text-slate-400">Gerencie preços, limites, cores e pedidos de apostilas.</p>
          </div>
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Configurações
            </button>
            <button
              onClick={() => setActiveTab('colors')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'colors' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Cores de Capa
            </button>
            <button
              onClick={() => setActiveTab('orders')}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
            >
              Pedidos
            </button>
          </div>
        </header>
      )}

      {hideHeader && (
        <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700 w-fit mb-6">
          <button
            onClick={() => setActiveTab('config')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'config' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Configurações
          </button>
          <button
            onClick={() => setActiveTab('colors')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'colors' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Cores de Capa
          </button>
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'orders' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'}`}
          >
            Pedidos
          </button>
        </div>
      )}

      {activeTab === 'config' && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Prices */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <DollarSign className="text-cyan-400" />
              <h2 className="text-xl font-bold">Preços por Página</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Preto e Branco (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.price_bw}
                  onChange={(e) => setSettingsForm({ ...settingsForm, price_bw: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Colorido (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.price_color}
                  onChange={(e) => setSettingsForm({ ...settingsForm, price_color: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mt-8 mb-6">
              <Settings className="text-cyan-400" />
              <h2 className="text-xl font-bold">Preços de Encadernação</h2>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Espiral (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.price_spiral}
                  onChange={(e) => setSettingsForm({ ...settingsForm, price_spiral: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Wire-o (R$)</label>
                <input
                  type="number"
                  step="0.01"
                  value={settingsForm.price_wireo}
                  onChange={(e) => setSettingsForm({ ...settingsForm, price_wireo: parseFloat(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>
          </section>

          {/* Limits and Options */}
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl flex flex-col">
            <div className="flex items-center gap-3 mb-6">
              <AlertTriangle className="text-amber-400" />
              <h2 className="text-xl font-bold">Limites de Folhas</h2>
            </div>
            <div className="space-y-4 mb-8">
              <div>
                <label className="block text-sm text-slate-400 mb-1">Limite Espiral (folhas)</label>
                <input
                  type="number"
                  value={settingsForm.limit_spiral}
                  onChange={(e) => setSettingsForm({ ...settingsForm, limit_spiral: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Limite Wire-o (folhas)</label>
                <input
                  type="number"
                  value={settingsForm.limit_wireo}
                  onChange={(e) => setSettingsForm({ ...settingsForm, limit_wireo: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <CheckCircle className="text-cyan-400" />
              <h2 className="text-xl font-bold">Opções Ativas</h2>
            </div>
            <div className="space-y-3 flex-grow">
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={settingsForm.enable_double_sided}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enable_double_sided: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                />
                <span className="font-medium">Habilitar Frente e Verso</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={settingsForm.enable_spiral}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enable_spiral: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                />
                <span className="font-medium">Habilitar Espiral</span>
              </label>
              <label className="flex items-center gap-3 p-3 bg-slate-900/50 rounded-xl border border-slate-700 cursor-pointer hover:bg-slate-900 transition-colors">
                <input
                  type="checkbox"
                  checked={settingsForm.enable_wireo}
                  onChange={(e) => setSettingsForm({ ...settingsForm, enable_wireo: e.target.checked })}
                  className="w-5 h-5 rounded border-slate-700 text-cyan-500 focus:ring-cyan-500 bg-slate-800"
                />
                <span className="font-medium">Habilitar Wire-o</span>
              </label>
              <div className="pt-4">
                <label className="block text-sm text-slate-400 mb-1 flex items-center gap-2">
                  <Clock size={14} /> Prazo Mínimo de Entrega (dias)
                </label>
                <input
                  type="number"
                  value={settingsForm.min_delivery_days}
                  onChange={(e) => setSettingsForm({ ...settingsForm, min_delivery_days: parseInt(e.target.value) })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <button
              onClick={handleUpdateSettings}
              disabled={isSavingSettings}
              className="mt-8 w-full bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-cyan-500/20"
            >
              {isSavingSettings ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <><Save size={20} /> Salvar Configurações</>}
            </button>
          </section>
        </motion.div>
      )}

      {activeTab === 'colors' && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          <section className="bg-slate-800 p-6 rounded-2xl border border-slate-700 shadow-xl">
            <div className="flex items-center gap-3 mb-6">
              <Palette className="text-cyan-400" />
              <h2 className="text-xl font-bold">Adicionar Nova Cor</h2>
            </div>
            <div className="flex flex-wrap gap-4 items-end">
              <div className="flex-1 min-w-[200px]">
                <label className="block text-sm text-slate-400 mb-1">Nome da Cor</label>
                <input
                  type="text"
                  placeholder="Ex: Azul Royal"
                  value={newColor.name}
                  onChange={(e) => setNewColor({ ...newColor, name: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl py-3 px-4 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Cor Visual</label>
                <input
                  type="color"
                  value={newColor.hex}
                  onChange={(e) => setNewColor({ ...newColor, hex: e.target.value })}
                  className="w-16 h-[50px] bg-slate-900 border border-slate-700 rounded-xl p-1 cursor-pointer"
                />
              </div>
              <button
                onClick={handleAddColor}
                disabled={isAddingColor || !newColor.name}
                className="bg-cyan-500 hover:bg-cyan-600 disabled:bg-slate-700 text-white font-bold py-3.5 px-8 rounded-xl flex items-center gap-2 transition-all"
              >
                <Plus size={20} /> Adicionar
              </button>
            </div>
          </section>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {colors.map((color) => (
              <div key={color.id} className="bg-slate-800 p-4 rounded-2xl border border-slate-700 flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg border border-white/10 shadow-inner" style={{ backgroundColor: color.hex }} />
                  <div>
                    <h3 className="font-bold">{color.name}</h3>
                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full ${color.active ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'}`}>
                      {color.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleColor(color)}
                    className={`p-2 rounded-lg transition-colors ${color.active ? 'text-amber-400 hover:bg-amber-400/10' : 'text-emerald-400 hover:bg-emerald-400/10'}`}
                    title={color.active ? 'Desativar' : 'Ativar'}
                  >
                    {color.active ? <X size={18} /> : <Check size={18} />}
                  </button>
                  <button
                    onClick={() => handleDeleteColor(color.id)}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                    title="Excluir"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {activeTab === 'orders' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-slate-800 rounded-2xl border border-slate-700 shadow-xl overflow-hidden">
          <div className="p-6 border-b border-slate-700 flex items-center gap-3">
            <ClipboardList className="text-cyan-400" />
            <h2 className="text-xl font-bold">Pedidos Recentes</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-900/50 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="px-6 py-4 font-medium">Cliente</th>
                  <th className="px-6 py-4 font-medium">Configuração</th>
                  <th className="px-6 py-4 font-medium">Total</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-slate-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-bold">{order.user_name}</div>
                      <div className="text-xs text-slate-500">{new Date(order.created_at?.toDate()).toLocaleString()}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-white">
                        {order.title || 'Sem Título'}
                      </div>
                      <div className="text-xs text-slate-400">
                        {order.pages} pág. {order.print_type === 'bw' ? 'P&B' : 'Color'} | {order.binding === 'spiral' ? 'Espiral' : 'Wire-o'}
                      </div>
                      <div className="text-xs text-slate-500">
                        {order.sides === 'double' ? 'Frente/Verso' : 'Frente'} | Capa: {order.cover_color}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-cyan-400">R$ {order.total.toFixed(2)}</div>
                      <div className="text-[10px] text-slate-500">Qtd: {order.quantity}</div>
                    </td>
                    <td className="px-6 py-4">
                      <select
                        value={order.status}
                        onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1 rounded-full bg-slate-900 border border-slate-700 focus:outline-none focus:border-cyan-500 ${
                          order.status === 'completed' ? 'text-emerald-400' : 
                          order.status === 'pending' ? 'text-amber-400' : 'text-slate-400'
                        }`}
                      >
                        <option value="pending">Pendente</option>
                        <option value="processing">Em Produção</option>
                        <option value="completed">Concluído</option>
                        <option value="cancelled">Cancelado</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <button className="p-2 text-slate-400 hover:text-white transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500 italic">
                      Nenhum pedido encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default AdminApostilaPage;
