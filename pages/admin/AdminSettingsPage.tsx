import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSettings } from '../../context/SettingsContext';
import { SafeImage } from '../../components/SafeImage';
import type { User } from '../../types';
import UploadIcon from '../../components/icons/UploadIcon';
import CheckBadgeIcon from '../../components/icons/CheckBadgeIcon';

type Tab = 'general' | 'appearance' | 'account';

const AdminSettingsPage: React.FC = () => {
  const { user, adminUpdateUser, refetchUser } = useAuth();
  const { settings, updateSettings } = useSettings();
  const [activeTab, setActiveTab] = useState<Tab>('general');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // State for forms
  const [siteName, setSiteName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [primaryColor, setPrimaryColor] = useState('');
  const [homeBgUrl, setHomeBgUrl] = useState('');
  const [aiKey, setAiKey] = useState('');

  const [adminName, setAdminName] = useState('');
  const [adminUsername, setAdminUsername] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setAdminName(user.name);
      setAdminUsername(user.username || '');
      setAdminEmail(user.email || '');
      setAvatarUrl(user.avatarUrl || `https://ui-avatars.com/api/?name=${(user.name || 'User').replace(' ', '+')}&background=0891b2&color=fff`);
    }
  }, [user]);

  useEffect(() => {
    if (settings) {
      setSiteName(settings.siteName);
      setContactEmail(settings.contactEmail);
      setPrimaryColor(settings.primaryColor);
      setHomeBgUrl(settings.homeBgUrl);
      setAiKey(settings.aiKey || '');
    }
  }, [settings]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
        const file = e.target.files[0];
        const reader = new FileReader();
        reader.onloadend = () => {
            setAvatarUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
    }
    e.target.value = '';
  };

  const handleSave = async () => {
    setError('');
    setShowSuccess(false);
    
    try {
        if (activeTab === 'account') {
            if (newPassword && newPassword !== confirmPassword) {
                setError('As novas senhas não correspondem.');
                return;
            }
            if (!user) {
                setError('Usuário admin não encontrado para atualizar.');
                return;
            }
            if (!adminUsername.trim()) {
                setError('O nome de usuário (login) não pode estar vazio.');
                return;
            }

            const updates: Partial<User> = {
                name: adminName,
                username: adminUsername,
                email: adminEmail,
                avatarUrl: avatarUrl
            };
            if (newPassword) {
                updates.password = newPassword;
            }
            await adminUpdateUser(user.id, updates);
            await refetchUser();
            setNewPassword('');
            setConfirmPassword('');
        } else if (activeTab === 'general') {
            await updateSettings({ siteName, contactEmail, aiKey });
        } else if (activeTab === 'appearance') {
            await updateSettings({ primaryColor, homeBgUrl });
        }

        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    } catch (err) {
        if (err instanceof Error) {
            setError(err.message);
        } else {
            setError('Ocorreu um erro desconhecido ao salvar.');
        }
    }
  };

  const TabButton: React.FC<{tabId: Tab, children: React.ReactNode}> = ({ tabId, children }) => (
    <button
      onClick={() => { setActiveTab(tabId); setError(''); }}
      className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
        activeTab === tabId ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700'
      }`}
    >
      {children}
    </button>
  );

  return (
    <div>
      <h1 className="text-2xl font-bold text-white mb-6">Configurações</h1>
      <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
        <div className="p-4 border-b border-slate-700">
          <div className="flex space-x-2">
            <TabButton tabId="general">Geral</TabButton>
            <TabButton tabId="appearance">Aparência</TabButton>
            <TabButton tabId="account">Minha Conta</TabButton>
          </div>
        </div>
        <div className="p-6">
          {activeTab === 'general' && (
            <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-white">Configurações Gerais do Site</h3>
              <div>
                <label htmlFor="siteName" className="text-sm font-bold text-slate-300 block mb-2">Nome do Site</label>
                <input type="text" id="siteName" value={siteName} onChange={(e) => setSiteName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label htmlFor="contactEmail" className="text-sm font-bold text-slate-300 block mb-2">Email de Contato</label>
                <input type="email" id="contactEmail" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" />
              </div>
              <hr className="border-slate-700" />
              <div>
                <label htmlFor="aiKey" className="text-sm font-bold text-slate-300 block mb-2">Chave de API do Groq (IA)</label>
                <input type="password" id="aiKey" value={aiKey} onChange={(e) => setAiKey(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" placeholder="Digite sua chave de API do Groq" />
                <p className="text-xs text-slate-400 mt-1">Necessário para que as funções de IA funcionem após a publicação do site.</p>
              </div>
            </div>
          )}
          {activeTab === 'appearance' && (
             <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-white">Aparência Visual</h3>
              <div>
                <label htmlFor="primaryColor" className="text-sm font-bold text-slate-300 block mb-2">Cor Principal (Ex: botões)</label>
                <input type="color" id="primaryColor" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-20 h-10 p-1 bg-slate-700 border border-slate-600 rounded-md" />
              </div>
              <div>
                <label htmlFor="homeBgUrl" className="text-sm font-bold text-slate-300 block mb-2">URL da Imagem de Fundo (Home)</label>
                <input type="text" id="homeBgUrl" value={homeBgUrl} onChange={(e) => setHomeBgUrl(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" />
              </div>
            </div>
          )}
          {activeTab === 'account' && (
             <div className="space-y-6 max-w-2xl">
              <h3 className="text-lg font-semibold text-white">Minha Conta de Administrador</h3>
              {error && <p className="text-sm text-red-400 p-3 bg-red-500/20 rounded-md">{error}</p>}

              <div className="flex items-center gap-6">
                 <div className="relative">
                    <SafeImage src={avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover" fallbackType="avatar" />
                    <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute bottom-0 right-0 bg-slate-600 p-1.5 rounded-full text-white hover:bg-slate-500"
                    >
                        <UploadIcon className="w-4 h-4" />
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleImageUpload} className="hidden" accept="image/*"/>
                </div>
                <div className="flex-grow">
                     <label htmlFor="adminName" className="text-sm font-bold text-slate-300 block mb-2">Nome</label>
                    <input type="text" id="adminName" value={adminName} onChange={e => setAdminName(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="adminUsername" className="text-sm font-bold text-slate-300 block mb-2">Nome de Usuário (login)</label>
                    <input
                        type="text"
                        id="adminUsername"
                        value={adminUsername}
                        onChange={e => setAdminUsername(e.target.value)}
                        className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none disabled:bg-slate-700/50 disabled:cursor-not-allowed"
                        required
                        disabled={user?.username === 'gelsonlucas'}
                    />
                    {user?.username === 'gelsonlucas' && (
                        <p className="text-xs text-slate-400 mt-1">O nome de usuário do administrador principal é permanente.</p>
                    )}
                  </div>
                   <div>
                        <label htmlFor="adminEmail" className="text-sm font-bold text-slate-300 block mb-2">Email</label>
                        <input type="email" id="adminEmail" value={adminEmail} onChange={e => setAdminEmail(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" />
                   </div>
              </div>
              
              <hr className="border-slate-700" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="newPassword"className="text-sm font-bold text-slate-300 block mb-2">Nova Senha</label>
                    <input type="password" id="newPassword" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" placeholder="Deixe em branco para não alterar" />
                  </div>
                   <div>
                    <label htmlFor="confirmPassword"className="text-sm font-bold text-slate-300 block mb-2">Confirmar Nova Senha</label>
                    <input type="password" id="confirmPassword" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600" />
                  </div>
              </div>
            </div>
          )}
        </div>
        <div className="p-6 bg-slate-800/50 border-t border-slate-700 text-right">
            <button onClick={handleSave} className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors relative">
                Salvar Alterações
                {showSuccess && <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5 animate-pulse">Salvo!</span>}
            </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettingsPage;