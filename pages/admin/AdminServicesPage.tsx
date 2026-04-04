import React, { useState, useEffect } from 'react';
import BriefcaseIcon from '../../components/icons/BriefcaseIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import { useServicePricing } from '../../context/ServicePricingContext';
import { safeToFixed } from '../../lib/formatters';
import AdminApostilaPage from './AdminApostilaPage';

// FIX: Changed 'cartoes' to 'cartoes_visita' to match the property in the pricing data object.
type ServiceTab = 'caderneta' | 'adesivos_escolares' | 'adesivos_premium' | 'cartoes_visita' | 'panfletos' | 'impressao' | 'encadernacao';

const ServiceSection: React.FC<{ title: string; children: React.ReactNode; onAdd?: () => void; description?: string }> = ({ title, children, onAdd, description }) => (
    <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700/50">
        <div className="flex justify-between items-center mb-1">
            <h3 className="text-lg font-bold text-white">{title}</h3>
            {onAdd && (
                <button onClick={onAdd} className="bg-slate-600 hover:bg-slate-500 text-white text-sm font-bold py-1 px-3 rounded-lg flex items-center gap-1">
                    <PlusIcon className="w-4 h-4" /> Adicionar
                </button>
            )}
        </div>
        {description && <p className="text-xs text-slate-400 mb-4">{description}</p>}
        <div className="space-y-3">{children}</div>
    </div>
);

const EditableRow: React.FC<{ children: React.ReactNode; onDelete: () => void; className?: string }> = ({ children, onDelete, className = '' }) => (
    <div className={`flex items-center gap-3 p-3 bg-slate-700/50 rounded-lg ${className}`}>
        <div className="flex-grow grid grid-cols-1 md:grid-cols-3 gap-3 items-center">
            {children}
        </div>
        <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-md">
            <TrashIcon className="w-5 h-5" />
        </button>
    </div>
);

const InputField: React.FC<{ label: string; value: string | number; type?: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string, colSpan?: number }> = ({ label, value, type = "text", onChange, placeholder, colSpan = 1 }) => (
    <div style={{ gridColumn: `span ${colSpan}`}}>
        <label className="text-xs text-slate-400 block mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            className="w-full bg-slate-600 p-2 rounded-md text-sm border border-slate-500 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
        />
    </div>
);


const AdminServicesPage: React.FC = () => {
    const { pricing, updatePricing, loading } = useServicePricing();
    const [localPricing, setLocalPricing] = useState(pricing);
    const [activeTab, setActiveTab] = useState<ServiceTab>('caderneta');
    const [isSaving, setIsSaving] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        // Quando os dados do contexto são carregados, atualiza o estado local.
        setLocalPricing(pricing);
    }, [pricing]);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updatePricing(localPricing);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error(error);
            alert("Falha ao salvar as alterações.");
        } finally {
            setIsSaving(false);
        }
    };
    
    // --- Funções de Manipulação do Estado Local ---
    const handleItemChange = (tab: ServiceTab, section: string, index: number, field: string, value: string | number) => {
        setLocalPricing((prev: any) => {
            const newTabState = { ...prev[tab] };
            const newSection = [...newTabState[section]];
            newSection[index] = { ...newSection[index], [field]: value };
            return { ...prev, [tab]: { ...newTabState, [section]: newSection } };
        });
    };
    
    const handleSingleItemChange = (tab: ServiceTab, section: string, field: string, value: string | number) => {
        setLocalPricing((prev: any) => {
             const newTabState = { ...prev[tab] };
             newTabState[section] = { ...newTabState[section], [field]: value };
             return { ...prev, [tab]: newTabState };
        });
    };
    
    const handleArrayChange = (tab: ServiceTab, section: string, value: string) => {
         setLocalPricing((prev: any) => {
            const newArray = value.split(',').map(s => Number(s.trim())).filter(n => !isNaN(n));
            return { ...prev, [tab]: { ...prev[tab], [section]: newArray } };
        });
    };

    const addItem = (tab: ServiceTab, section: string, newItem: any) => {
        setLocalPricing((prev: any) => {
            const newTabState = { ...prev[tab] };
            const newSection = [...newTabState[section], newItem];
            return { ...prev, [tab]: { ...newTabState, [section]: newSection } };
        });
    };

    const deleteItem = (tab: ServiceTab, section: string, index: number) => {
        setLocalPricing((prev: any) => {
            const newTabState = { ...prev[tab] };
            const newSection = newTabState[section].filter((_: any, i: number) => i !== index);
            return { ...prev, [tab]: { ...newTabState, [section]: newSection } };
        });
    };
    
    // -- Fim --

    if (loading || !localPricing.caderneta) {
        return <div>Carregando configurações de preço...</div>;
    }
    
    const { caderneta, adesivos_escolares, adesivos_premium, cartoes_visita, panfletos, impressao } = localPricing;

    const TabButton: React.FC<{tabId: ServiceTab, children: React.ReactNode}> = ({ tabId, children }) => (
        <button
            onClick={() => setActiveTab(tabId)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap ${ activeTab === tabId ? 'bg-cyan-500 text-white' : 'text-slate-300 hover:bg-slate-700' }`}
        >
            {children}
        </button>
    );

    const renderContent = () => {
        switch (activeTab) {
            case 'caderneta':
                return <>
                    <ServiceSection title="Opções Principais" onAdd={() => addItem('caderneta', 'mainOptions', { id: `new_${Date.now()}`, name: 'Nova Opção', price: 0 })}>
                        {caderneta.mainOptions.map((opt: any, index: number) => (
                            <EditableRow key={opt.id} onDelete={() => deleteItem('caderneta', 'mainOptions', index)} className="md:grid-cols-2">
                                <InputField label="Nome da Opção" value={opt.name} onChange={(e) => handleItemChange('caderneta', 'mainOptions', index, 'name', e.target.value)} />
                                <InputField label="Preço (R$)" type="number" value={opt.price} onChange={(e) => handleItemChange('caderneta', 'mainOptions', index, 'price', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                    <ServiceSection title="Adicionais de Luxo" onAdd={() => addItem('caderneta', 'luxuryAddons', { id: `new_${Date.now()}`, name: 'Novo Adicional', price: 0 })}>
                        {caderneta.luxuryAddons.map((addon: any, index: number) => (
                             <EditableRow key={addon.id} onDelete={() => deleteItem('caderneta', 'luxuryAddons', index)} className="md:grid-cols-2">
                                <InputField label="Nome do Adicional" value={addon.name} onChange={(e) => handleItemChange('caderneta', 'luxuryAddons', index, 'name', e.target.value)} />
                                <InputField label="Preço (R$)" type="number" value={addon.price} onChange={(e) => handleItemChange('caderneta', 'luxuryAddons', index, 'price', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                </>;
             case 'adesivos_escolares':
                 return <>
                    <ServiceSection title="Pacotes" onAdd={() => addItem('adesivos_escolares', 'packages', {id: `new_${Date.now()}`, name: 'Novo Kit', description: 'Descrição...', price: 0})}>
                        {adesivos_escolares.packages.map((pkg: any, index: number) => (
                            <EditableRow key={pkg.id} onDelete={() => deleteItem('adesivos_escolares', 'packages', index)} className="md:grid-cols-3">
                                <InputField label="Nome do Pacote" value={pkg.name} onChange={(e) => handleItemChange('adesivos_escolares','packages', index, 'name', e.target.value)} />
                                <InputField label="Descrição" value={pkg.description} onChange={(e) => handleItemChange('adesivos_escolares', 'packages', index, 'description', e.target.value)} />
                                <InputField label="Preço (R$)" type="number" value={pkg.price} onChange={(e) => handleItemChange('adesivos_escolares', 'packages', index, 'price', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                    <ServiceSection title="Tipos de Material" onAdd={() => addItem('adesivos_escolares', 'materials', {id: `new_${Date.now()}`, name: 'Novo Material'})}>
                        {adesivos_escolares.materials.map((mat: any, index: number) => (
                             <EditableRow key={mat.id} onDelete={() => deleteItem('adesivos_escolares', 'materials', index)} className="md:grid-cols-1">
                                <InputField label="Nome do Material" value={mat.name} onChange={(e) => handleItemChange('adesivos_escolares', 'materials', index, 'name', e.target.value)} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                </>;
            case 'adesivos_premium':
                return <>
                    <ServiceSection title="Tamanhos Disponíveis (cm)" description="Separe os valores por vírgula. Ex: 2, 3, 4, 5">
                        <InputField label="Tamanhos" value={adesivos_premium.sizes.join(', ')} onChange={e => handleArrayChange('adesivos_premium', 'sizes', e.target.value)} />
                    </ServiceSection>
                    <ServiceSection title="Materiais e Acabamento" onAdd={() => addItem('adesivos_premium', 'materials', {id: `new_${Date.now()}`, name: 'Novo Material', priceModifier: 1, priceText: '+R$ 0.00 / UN'})}>
                        {adesivos_premium.materials.map((mat: any, index: number) => (
                            <EditableRow key={mat.id} onDelete={() => deleteItem('adesivos_premium', 'materials', index)}>
                                <InputField label="Nome do Material" value={mat.name} onChange={e => handleItemChange('adesivos_premium', 'materials', index, 'name', e.target.value)} />
                                <InputField label="Modificador de Preço" type="number" value={mat.priceModifier} onChange={e => handleItemChange('adesivos_premium', 'materials', index, 'priceModifier', parseFloat(e.target.value))} />
                                <InputField label="Texto do Preço" value={mat.priceText} onChange={e => handleItemChange('adesivos_premium', 'materials', index, 'priceText', e.target.value)} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                    <ServiceSection title="Laminação (Proteção Extra)">
                         <div className="p-3 bg-slate-700/50 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3">
                            <InputField label="Nome da Opção" value={adesivos_premium.lamination.name} onChange={e => handleSingleItemChange('adesivos_premium', 'lamination', 'name', e.target.value)} />
                            <InputField label="Preço por Unidade (R$)" type="number" value={adesivos_premium.lamination.pricePerUnit} onChange={e => handleSingleItemChange('adesivos_premium', 'lamination', 'pricePerUnit', parseFloat(e.target.value))} />
                            <InputField label="Texto do Preço" value={adesivos_premium.lamination.priceText} onChange={e => handleSingleItemChange('adesivos_premium', 'lamination', 'priceText', e.target.value)} />
                        </div>
                    </ServiceSection>
                </>;
            // FIX: Changed case from 'cartoes' to 'cartoes_visita' to match the updated ServiceTab type.
            case 'cartoes_visita':
                return <>
                    <ServiceSection title="Quantidades Disponíveis" description="Separe os valores por vírgula. Ex: 100, 200, 500">
                        <InputField label="Quantidades" value={cartoes_visita.quantities.join(', ')} onChange={e => handleArrayChange('cartoes_visita', 'quantities', e.target.value)} />
                    </ServiceSection>
                    <ServiceSection title="Tipos de Papel" onAdd={() => addItem('cartoes_visita', 'papers', {id: `new_${Date.now()}`, name: 'Novo Papel', description: 'Descrição', basePrice: 0})}>
                        {cartoes_visita.papers.map((paper: any, index: number) => (
                            <EditableRow key={paper.id} onDelete={() => deleteItem('cartoes_visita', 'papers', index)}>
                                <InputField label="Nome do Papel" value={paper.name} onChange={e => handleItemChange('cartoes_visita', 'papers', index, 'name', e.target.value)} />
                                <InputField label="Descrição" value={paper.description} onChange={e => handleItemChange('cartoes_visita', 'papers', index, 'description', e.target.value)} />
                                <InputField label="Preço Base (R$)" type="number" value={paper.basePrice} onChange={e => handleItemChange('cartoes_visita', 'papers', index, 'basePrice', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                    <ServiceSection title="Adicionais" onAdd={() => addItem('cartoes_visita', 'addons', {id: `new_${Date.now()}`, name: 'Novo Adicional', priceMultiplier: 1.0})}>
                        {cartoes_visita.addons.map((addon: any, index: number) => (
                             <EditableRow key={addon.id} onDelete={() => deleteItem('cartoes_visita', 'addons', index)} className="md:grid-cols-2">
                                <InputField label="Nome do Adicional" value={addon.name} onChange={e => handleItemChange('cartoes_visita', 'addons', index, 'name', e.target.value)} />
                                <InputField label="Multiplicador de Preço" type="number" value={addon.priceMultiplier} onChange={e => handleItemChange('cartoes_visita', 'addons', index, 'priceMultiplier', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                </>;
            case 'panfletos':
                const handlePriceChange = (formatId: string, qty: number, price: number) => {
                    setLocalPricing((prev: any) => ({
                        ...prev,
                        panfletos: {
                            ...prev.panfletos,
                            prices: {
                                ...prev.panfletos.prices,
                                [formatId]: { ...prev.panfletos.prices[formatId], [qty]: price }
                            }
                        }
                    }))
                };
                return <>
                    <ServiceSection title="Formatos" onAdd={() => addItem('panfletos', 'formats', {id:`new_${Date.now()}`, name: 'Novo Formato', description: 'Descrição'})}>
                        {panfletos.formats.map((format: any, index: number) => (
                             <EditableRow key={format.id} onDelete={() => deleteItem('panfletos', 'formats', index)} className="md:grid-cols-2">
                                <InputField label="Nome do Formato" value={format.name} onChange={(e) => handleItemChange('panfletos', 'formats', index, 'name', e.target.value)} />
                                <InputField label="Descrição" value={format.description} onChange={(e) => handleItemChange('panfletos', 'formats', index, 'description', e.target.value)} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                     <ServiceSection title="Tabela de Preços" description="Edite os preços para cada combinação de formato e quantidade.">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-slate-400 uppercase">
                                    <tr>
                                        <th className="py-3 px-2">Formato</th>
                                        {panfletos.quantities.map((qty: number) => <th key={qty} className="py-3 px-2 text-center">{qty} un.</th>)}
                                    </tr>
                                </thead>
                                <tbody>
                                    {panfletos.formats.map((format: any) => (
                                        <tr key={format.id} className="bg-slate-700/50 border-b border-slate-700">
                                            <td className="py-2 px-2 font-medium text-white">{format.name}</td>
                                            {panfletos.quantities.map((qty: number) => (
                                                <td key={qty} className="py-2 px-2">
                                                    <input 
                                                        type="number" 
                                                        value={safeToFixed(panfletos.prices[format.id]?.[qty])}
                                                        onChange={(e) => handlePriceChange(format.id, qty, parseFloat(e.target.value))}
                                                        className="w-24 bg-slate-600 p-2 rounded-md text-sm border border-slate-500"
                                                    />
                                                </td>
                                            ))}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </ServiceSection>
                </>;
            case 'impressao':
                 return <>
                    <ServiceSection title="Preço Base" description="Custo inicial para qualquer impressão, antes dos modificadores.">
                        <div className="max-w-xs">
                             <InputField 
                                label="Preço Base (R$)"
                                type="number"
                                value={impressao.basePrice}
                                onChange={(e) => setLocalPricing(prev => ({ ...prev, impressao: { ...prev.impressao, basePrice: parseFloat(e.target.value) } }))}
                            />
                        </div>
                    </ServiceSection>
                    <ServiceSection title="Modificadores de Tecnologia" description="Multiplicadores de preço para cada tecnologia de impressão.">
                        <div className="p-3 bg-slate-700/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Laser Pro</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Base (P&B)" type="number" value={impressao.techModifiers.laser.base} onChange={e => setLocalPricing(prev => ({...prev, impressao: {...prev.impressao, techModifiers: {...prev.impressao.techModifiers, laser: {...prev.impressao.techModifiers.laser, base: parseFloat(e.target.value) }}} }))} />
                                <InputField label="Colorido" type="number" value={impressao.techModifiers.laser.color} onChange={e => setLocalPricing(prev => ({...prev, impressao: {...prev.impressao, techModifiers: {...prev.impressao.techModifiers, laser: {...prev.impressao.techModifiers.laser, color: parseFloat(e.target.value) }}} }))} />
                            </div>
                        </div>
                         <div className="p-3 bg-slate-700/50 rounded-lg">
                            <h4 className="font-semibold mb-2">Jato de Tinta</h4>
                            <div className="grid grid-cols-2 gap-4">
                                <InputField label="Base (P&B)" type="number" value={impressao.techModifiers.inkjet.base} onChange={e => setLocalPricing(prev => ({...prev, impressao: {...prev.impressao, techModifiers: {...prev.impressao.techModifiers, inkjet: {...prev.impressao.techModifiers.inkjet, base: parseFloat(e.target.value) }}} }))} />
                                <InputField label="Colorido" type="number" value={impressao.techModifiers.inkjet.color} onChange={e => setLocalPricing(prev => ({...prev, impressao: {...prev.impressao, techModifiers: {...prev.impressao.techModifiers, inkjet: {...prev.impressao.techModifiers.inkjet, color: parseFloat(e.target.value) }}} }))} />
                            </div>
                        </div>
                    </ServiceSection>
                    <ServiceSection title="Modificadores de Formato de Papel" onAdd={() => addItem('impressao', 'formatModifiers', {id: `new_${Date.now()}`, name: 'Novo Formato', modifier: 1.0})}>
                         {impressao.formatModifiers.map((item: any, index: number) => (
                             <EditableRow key={item.id} onDelete={() => deleteItem('impressao', 'formatModifiers', index)} className="md:grid-cols-2">
                                <InputField label="Nome do Formato (Ex: A4)" value={item.name} onChange={(e) => handleItemChange('impressao', 'formatModifiers', index, 'name', e.target.value)} />
                                <InputField label="Multiplicador" type="number" value={item.modifier} onChange={(e) => handleItemChange('impressao', 'formatModifiers', index, 'modifier', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                     <ServiceSection title="Modificadores de Mídia/Papel" onAdd={() => addItem('impressao', 'mediaModifiers', {id: `new_${Date.now()}`, name: 'Nova Mídia', modifier: 1.0})}>
                         {impressao.mediaModifiers.map((item: any, index: number) => (
                             <EditableRow key={item.id} onDelete={() => deleteItem('impressao', 'mediaModifiers', index)} className="md:grid-cols-2">
                                <InputField label="Nome da Mídia (Ex: Sulfite 75g)" value={item.name} onChange={(e) => handleItemChange('impressao', 'mediaModifiers', index, 'name', e.target.value)} />
                                <InputField label="Multiplicador" type="number" value={item.modifier} onChange={(e) => handleItemChange('impressao', 'mediaModifiers', index, 'modifier', parseFloat(e.target.value))} />
                            </EditableRow>
                        ))}
                    </ServiceSection>
                </>;
            default:
                return <div className="text-slate-400">Configurações para "{activeTab}" ainda não implementadas.</div>;
        }
    };

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-white flex items-center gap-3">
                    <BriefcaseIcon className="w-6 h-6" />
                    Gerenciamento de Preços de Serviços
                </h1>
                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-cyan-500 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-600 transition-colors relative disabled:bg-slate-600"
                >
                    {isSaving ? 'Salvando...' : 'Salvar Alterações'}
                    {showSuccess && <span className="absolute -top-2 -right-2 text-xs bg-emerald-500 text-white rounded-full px-2 py-0.5 animate-pulse">Salvo!</span>}
                </button>
            </div>

            <div className="bg-slate-800 rounded-xl shadow-lg border border-slate-700">
                <div className="p-4 border-b border-slate-700">
                    <div className="flex space-x-2 overflow-x-auto pb-2 -mb-2">
                        <TabButton tabId="caderneta">Cadernetas</TabButton>
                        <TabButton tabId="adesivos_escolares">Adesivos Escolares</TabButton>
                        <TabButton tabId="adesivos_premium">Adesivos Premium</TabButton>
                        {/* FIX: Changed tabId from 'cartoes' to 'cartoes_visita' to match the updated ServiceTab type. */}
                        <TabButton tabId="cartoes_visita">Cartões de Visita</TabButton>
                        <TabButton tabId="panfletos">Panfletos</TabButton>
                        <TabButton tabId="impressao">Impressão</TabButton>
                        <TabButton tabId="encadernacao">Encadernação</TabButton>
                    </div>
                </div>
                <div className="p-6 space-y-6">
                    {activeTab === 'encadernacao' ? (
                        <AdminApostilaPage hideHeader={true} />
                    ) : (
                        renderContent()
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminServicesPage;
