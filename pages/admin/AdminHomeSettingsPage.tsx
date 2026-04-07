
import React, { useState } from 'react';
import { useHomeSettings } from '../../context/HomeSettingsContext';
import { iconOptions, IconMap } from '../../components/IconMap';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import HomeModernIcon from '../../components/icons/HomeModernIcon';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
        <h3 className="text-xl font-bold text-white mb-4">{title}</h3>
        <div className="space-y-4">{children}</div>
    </div>
);

const InputField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; }> = ({ label, value, onChange }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-1">{label}</label>
        <input type="text" value={value} onChange={onChange} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600"/>
    </div>
);

const SelectField: React.FC<{label: string; value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: {value: string; label: string}[]}> = ({label, value, onChange, options}) => (
     <div>
        <label className="text-sm font-bold text-slate-300 block mb-1">{label}</label>
        <select value={value} onChange={onChange} className="w-full p-2 bg-slate-700 rounded-md text-sm border border-slate-600">
            {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
        </select>
    </div>
)


const AdminHomeSettingsPage: React.FC = () => {
    const { settings, updateSettings } = useHomeSettings();
    const [localSettings, setLocalSettings] = useState(settings);
    const [showSuccess, setShowSuccess] = useState(false);
    
    const handleSave = () => {
        updateSettings(localSettings);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
    };

    const handleHeroChange = (field: keyof typeof localSettings.hero, value: string) => {
        setLocalSettings(prev => ({...prev, hero: {...prev.hero, [field]: value }}));
    };

    const handleMugBannerChange = (field: string, value: any) => {
        setLocalSettings(prev => ({
            ...prev, 
            mugThemesBanner: {
                ...(prev.mugThemesBanner || {
                    enabled: true,
                    title: "Temas de Canecas Personalizadas",
                    subtitle: "Escolha entre centenas de estampas exclusivas para sua caneca.",
                    buttonText: "VER TODOS OS TEMAS",
                    link: "/temas-canecas",
                    fullClickable: true
                }),
                [field]: value 
            }
        }));
    };

    const handleItemChange = (section: 'categories' | 'differentials' | 'siteLinks' | 'serviceLinks', index: number, field: string, value: string) => {
        setLocalSettings(prev => {
            const newSection = [...prev[section]];
            (newSection[index] as any)[field] = value;
            if (section === 'siteLinks' || section === 'serviceLinks') {
                 return { ...prev, footer: { ...prev.footer, [section]: newSection } };
            }
            return { ...prev, [section]: newSection };
        });
    };

    const addItem = (section: 'categories' | 'differentials' | 'siteLinks' | 'serviceLinks') => {
        const newItem = {
            id: Date.now(),
            name: 'Novo Item',
            icon: 'GiftIcon',
            link: '/',
            title: 'Novo Item',
            description: 'Descrição',
            text: 'Novo Link'
        };
        setLocalSettings(prev => {
            const newSection = [...prev[section], newItem];
            if (section === 'siteLinks' || section === 'serviceLinks') {
                 return { ...prev, footer: { ...prev.footer, [section]: newSection } };
            }
            return { ...prev, [section]: newSection };
        });
    };
    
    const removeItem = (section: 'categories' | 'differentials' | 'siteLinks' | 'serviceLinks', index: number) => {
        setLocalSettings(prev => {
            const newSection = prev[section].filter((_, i) => i !== index);
             if (section === 'siteLinks' || section === 'serviceLinks') {
                 return { ...prev, footer: { ...prev.footer, [section]: newSection } };
            }
            return { ...prev, [section]: newSection };
        });
    };
    
    const handleFooterTextChange = (field: 'aboutText' | 'email' | 'phone' | 'whatsapp', value: string) => {
         setLocalSettings(prev => {
            if (field === 'aboutText') {
                return { ...prev, footer: { ...prev.footer, aboutText: value }};
            }
            return { ...prev, footer: { ...prev.footer, contact: { ...prev.footer.contact, [field]: value }}};
         });
    }

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                 <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <HomeModernIcon className="w-6 h-6" />
                    Configurações da Página Inicial
                </h1>
                <button onClick={handleSave} className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors relative">
                    Salvar Alterações
                    {showSuccess && <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5">Salvo!</span>}
                </button>
            </div>

            <div className="space-y-6">
                <Section title="Banner Principal (Hero)">
                    <InputField label="URL da Imagem de Fundo" value={localSettings.hero.imageUrl} onChange={e => handleHeroChange('imageUrl', e.target.value)} />
                    <InputField label="Título Principal" value={localSettings.hero.title} onChange={e => handleHeroChange('title', e.target.value)} />
                    <InputField label="Subtítulo" value={localSettings.hero.subtitle} onChange={e => handleHeroChange('subtitle', e.target.value)} />
                </Section>

                <Section title="Banner de Temas de Caneca (Home)">
                    <div className="flex items-center gap-4 mb-4 p-4 bg-slate-700/30 rounded-lg">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={localSettings.mugThemesBanner?.enabled ?? true} 
                                onChange={e => handleMugBannerChange('enabled', e.target.checked)}
                                className="w-4 h-4 accent-cyan-500"
                            />
                            <span className="text-sm font-bold text-white">Ativar Seção na Home</span>
                        </label>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input 
                                type="checkbox" 
                                checked={localSettings.mugThemesBanner?.fullClickable ?? true} 
                                onChange={e => handleMugBannerChange('fullClickable', e.target.checked)}
                                className="w-4 h-4 accent-cyan-500"
                            />
                            <span className="text-sm font-bold text-white">Tornar Card Inteiro Clicável</span>
                        </label>
                    </div>
                    <InputField label="Título do Banner" value={localSettings.mugThemesBanner?.title || ''} onChange={e => handleMugBannerChange('title', e.target.value)} />
                    <InputField label="Subtítulo/Descrição" value={localSettings.mugThemesBanner?.subtitle || ''} onChange={e => handleMugBannerChange('subtitle', e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <InputField label="Texto do Botão" value={localSettings.mugThemesBanner?.buttonText || ''} onChange={e => handleMugBannerChange('buttonText', e.target.value)} />
                        <InputField label="Link de Destino" value={localSettings.mugThemesBanner?.link || ''} onChange={e => handleMugBannerChange('link', e.target.value)} />
                    </div>
                </Section>
                
                <Section title="Seção de Categorias">
                    {localSettings.categories.map((cat, index) => (
                        <div key={cat.id} className="grid grid-cols-1 md:grid-cols-4 items-end gap-3 p-3 bg-slate-700/50 rounded-lg">
                            <InputField label="Nome" value={cat.name} onChange={e => handleItemChange('categories', index, 'name', e.target.value)} />
                            <SelectField label="Ícone" value={cat.icon} onChange={e => handleItemChange('categories', index, 'icon', e.target.value)} options={iconOptions} />
                            <InputField label="Link de Destino" value={cat.link} onChange={e => handleItemChange('categories', index, 'link', e.target.value)} />
                            <button onClick={() => removeItem('categories', index)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 w-10 h-10"><TrashIcon className="w-5 h-5 mx-auto"/></button>
                        </div>
                    ))}
                    <button onClick={() => addItem('categories')} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"><PlusIcon className="w-4 h-4" />Adicionar Categoria</button>
                </Section>

                <Section title="Seção 'Nossos Diferenciais'">
                    {localSettings.differentials.map((item, index) => (
                         <div key={item.id} className="grid grid-cols-1 md:grid-cols-4 items-end gap-3 p-3 bg-slate-700/50 rounded-lg">
                            <SelectField label="Ícone" value={item.icon} onChange={e => handleItemChange('differentials', index, 'icon', e.target.value)} options={iconOptions} />
                            <InputField label="Título" value={item.title} onChange={e => handleItemChange('differentials', index, 'title', e.target.value)} />
                            <InputField label="Descrição" value={item.description} onChange={e => handleItemChange('differentials', index, 'description', e.target.value)} />
                            <button onClick={() => removeItem('differentials', index)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 w-10 h-10"><TrashIcon className="w-5 h-5 mx-auto"/></button>
                        </div>
                    ))}
                     <button onClick={() => addItem('differentials')} className="flex items-center gap-2 text-sm font-semibold text-cyan-400 hover:text-cyan-300"><PlusIcon className="w-4 h-4" />Adicionar Diferencial</button>
                </Section>

                <Section title="Rodapé">
                    <InputField label="Texto 'Sobre'" value={localSettings.footer.aboutText} onChange={e => handleFooterTextChange('aboutText', e.target.value)} />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <InputField label="Email de Contato" value={localSettings.footer.contact.email} onChange={e => handleFooterTextChange('email', e.target.value)} />
                        <InputField label="Telefone" value={localSettings.footer.contact.phone} onChange={e => handleFooterTextChange('phone', e.target.value)} />
                        <InputField label="Link do WhatsApp" value={localSettings.footer.contact.whatsapp} onChange={e => handleFooterTextChange('whatsapp', e.target.value)} />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-700">
                        <div>
                            <h4 className="font-semibold mb-2">Links do Site</h4>
                             {localSettings.footer.siteLinks.map((link, index) => (
                                <div key={link.id} className="flex items-end gap-2 mb-2">
                                    <InputField label="Texto" value={link.text} onChange={e => handleItemChange('siteLinks', index, 'text', e.target.value)} />
                                    <InputField label="Link" value={link.link} onChange={e => handleItemChange('siteLinks', index, 'link', e.target.value)} />
                                    <button onClick={() => removeItem('siteLinks', index)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 h-10 flex-shrink-0"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                             <button onClick={() => addItem('siteLinks')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">+ Adicionar Link</button>
                        </div>
                         <div>
                            <h4 className="font-semibold mb-2">Links de Serviços</h4>
                             {localSettings.footer.serviceLinks.map((link, index) => (
                                <div key={link.id} className="flex items-end gap-2 mb-2">
                                    <InputField label="Texto" value={link.text} onChange={e => handleItemChange('serviceLinks', index, 'text', e.target.value)} />
                                    <InputField label="Link" value={link.link} onChange={e => handleItemChange('serviceLinks', index, 'link', e.target.value)} />
                                    <button onClick={() => removeItem('serviceLinks', index)} className="p-2 bg-red-500/20 text-red-400 rounded-md hover:bg-red-500/40 h-10 flex-shrink-0"><TrashIcon className="w-4 h-4"/></button>
                                </div>
                            ))}
                             <button onClick={() => addItem('serviceLinks')} className="text-xs font-semibold text-cyan-400 hover:text-cyan-300">+ Adicionar Link</button>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
};

export default AdminHomeSettingsPage;
