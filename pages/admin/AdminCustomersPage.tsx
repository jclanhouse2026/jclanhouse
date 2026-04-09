import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';

// Icons
import UserIcon from '../../components/icons/UserIcon';
import PlusIcon from '../../components/icons/PlusIcon';
import TrashIcon from '../../components/icons/TrashIcon';
import PencilIcon from '../../components/icons/PencilIcon';
import XCircleIcon from '../../components/icons/XCircleIcon';
import ChevronLeftIcon from '../../components/icons/ChevronLeftIcon';
import UploadIcon from '../../components/icons/UploadIcon';


// Context and Types
import { useCustomers } from '../../context/CustomerContext';
import { SafeImage } from '../../components/SafeImage';
import type { Customer, Address } from '../../types';

const emptyAddress: Address = { cep: '', street: '', number: '', neighborhood: '', city: '', state: '' };

// --- CustomerModal Component ---
const CustomerModal: React.FC<{
    customer: Customer | null;
    onSave: (customerData: Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'> & { id?: string; file?: File }) => void;
    onClose: () => void;
}> = ({ customer, onSave, onClose }) => {
    
    const [formData, setFormData] = useState({
        fullName: customer?.fullName || '',
        cpf: customer?.cpf || '',
        email: customer?.email || '',
        phone: customer?.phone || '',
        dob: customer?.dob || '',
        avatarUrl: customer?.avatarUrl || '',
        address: customer?.address || emptyAddress
    });
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [loadingCep, setLoadingCep] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, address: { ...prev.address, [name]: value } }));
    };

    const handleCepBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cep = e.target.value.replace(/\D/g, '');
        if (cep.length !== 8) return;

        setLoadingCep(true);
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            const data = await response.json();
            if (!data.erro) {
                setFormData(prev => ({
                    ...prev,
                    address: {
                        ...prev.address,
                        street: data.logradouro,
                        neighborhood: data.bairro,
                        city: data.localidade,
                        state: data.uf,
                    }
                }));
            }
        } catch (error) {
            console.error("Erro ao buscar CEP:", error);
        } finally {
            setLoadingCep(false);
        }
    };
    
    const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setSelectedFile(file);
            const reader = new FileReader();
            reader.onload = (event) => {
                setFormData(prev => ({ ...prev, avatarUrl: event.target?.result as string }));
            };
            reader.readAsDataURL(file);
        }
        e.target.value = '';
    };


    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave({
            id: customer?.id,
            ...formData,
            file: selectedFile || undefined
        });
    };
    
    const formatCPF = (value: string) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})/, '$1-$2').slice(0, 14);
    const formatPhone = (value: string) => value.replace(/\D/g, '').replace(/^(\d{2})(\d)/g, '($1) $2').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 15);
    const formatCep = (value: string) => value.replace(/\D/g, '').replace(/(\d{5})(\d)/, '$1-$2').slice(0, 9);


    return (
        <div className="fixed inset-0 bg-black/60 z-50 flex justify-center items-start p-4 overflow-y-auto">
            <div className="bg-slate-800 rounded-xl shadow-2xl w-full max-w-3xl my-8 border border-slate-700">
                <form onSubmit={handleSubmit}>
                    <div className="flex justify-between items-center p-4 border-b border-slate-700">
                        <h2 className="text-lg font-bold text-white">{customer ? 'Editar Cliente' : 'Adicionar Novo Cliente'}</h2>
                        <button type="button" onClick={onClose}><XCircleIcon className="w-6 h-6 text-slate-400 hover:text-white"/></button>
                    </div>

                    <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                        <div className="flex items-center gap-6">
                            <div className="relative">
                                <SafeImage src={formData.avatarUrl} alt="Avatar" className="w-24 h-24 rounded-full border-2 border-cyan-400 object-cover" fallbackType="avatar" />
                                <button type="button" onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-slate-600 p-1.5 rounded-full text-white hover:bg-slate-500"><UploadIcon className="w-4 h-4" /></button>
                                <input type="file" ref={fileInputRef} onChange={handleAvatarUpload} className="hidden" accept="image/*"/>
                            </div>
                            <div className="flex-grow">
                                <InputField label="Nome Completo *" name="fullName" value={formData.fullName} onChange={handleInputChange} required />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="CPF" name="cpf" value={formatCPF(formData.cpf)} onChange={handleInputChange} placeholder="000.000.000-00" />
                            <InputField label="Data de Nascimento" name="dob" type="date" value={formData.dob} onChange={handleInputChange} />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                           <InputField label="Email" name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="cliente@email.com" />
                           <InputField label="Telefone *" name="phone" value={formatPhone(formData.phone)} onChange={handleInputChange} placeholder="(XX) XXXXX-XXXX" required />
                        </div>
                        
                        <div className="pt-4 border-t border-slate-700 space-y-4">
                            <h3 className="font-semibold text-white">Endereço</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-1 relative">
                                    <InputField label="CEP" name="cep" value={formatCep(formData.address.cep)} onChange={handleAddressChange} placeholder="00000-000" onBlur={handleCepBlur} />
                                    {loadingCep && <div className="absolute top-9 right-3 h-5 w-5 border-2 border-slate-400 border-t-transparent rounded-full animate-spin"></div>}
                                </div>
                                <InputField label="Estado" name="state" value={formData.address.state} onChange={handleAddressChange} placeholder="Estado" readOnly disabled />
                                <InputField label="Cidade" name="city" value={formData.address.city} onChange={handleAddressChange} placeholder="Cidade" readOnly disabled />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="md:col-span-2"><InputField label="Rua / Logradouro" name="street" value={formData.address.street} onChange={handleAddressChange} placeholder="Sua rua" /></div>
                                <InputField label="Número" name="number" value={formData.address.number} onChange={handleAddressChange} placeholder="Nº" />
                            </div>
                            <InputField label="Bairro" name="neighborhood" value={formData.address.neighborhood} onChange={handleAddressChange} placeholder="Seu bairro" />
                        </div>

                        <p className="text-xs text-slate-500 pt-2">Campos marcados com * são obrigatórios.</p>
                    </div>

                    <div className="p-4 bg-slate-800/50 border-t border-slate-700 text-right">
                        <button type="button" onClick={onClose} className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors mr-2">Cancelar</button>
                        <button type="submit" className="bg-cyan-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-cyan-700 transition-colors">Salvar Cliente</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const InputField: React.FC<{label: string; name: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; type?: string; required?: boolean; placeholder?: string; onBlur?: (e: React.FocusEvent<HTMLInputElement>) => void; disabled?: boolean; readOnly?: boolean; }> = ({ label, name, value, onChange, type = 'text', required = false, placeholder, onBlur, disabled, readOnly }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input type={type} name={name} value={value} onChange={onChange} required={required} placeholder={placeholder} onBlur={onBlur} disabled={disabled} readOnly={readOnly} className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none disabled:bg-slate-700/50 disabled:cursor-not-allowed"/>
    </div>
);


// --- AdminCustomersPage Component ---
const AdminCustomersPage: React.FC = () => {
    const { customers, addCustomer, updateCustomer, deleteCustomer } = useCustomers();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);

    const openModal = (customer: Customer | null = null) => {
        setEditingCustomer(customer);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingCustomer(null);
    };

    const handleSave = (customerData: Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'> & { id?: string }) => {
        if (customerData.id) {
            const originalCustomer = customers.find(c => c.id === customerData.id);
            if(originalCustomer) {
                updateCustomer({
                    ...originalCustomer,
                    ...customerData
                });
            }
        } else {
            addCustomer(customerData as Omit<Customer, 'id' | 'userId' | 'signupDate' | 'status'>);
        }
        closeModal();
    };

    const handleDelete = (customerId: string) => {
        deleteCustomer(customerId);
    };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-white flex items-center gap-3">
          <UserIcon className="w-6 h-6" />
          Gerenciamento de Clientes
        </h1>
        <div className="flex items-center gap-4">
          <Link to="/pdv" className="bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition-colors flex items-center gap-2">
              <ChevronLeftIcon className="w-5 h-5" />
              Voltar para PDV
          </Link>
          <button onClick={() => openModal()} className="bg-cyan-500 text-white font-bold py-2 px-4 rounded-lg hover:bg-cyan-600 transition-colors flex items-center gap-2">
              <PlusIcon className="w-5 h-5" />
              Adicionar Cliente
          </button>
        </div>
      </div>

      <div className="bg-slate-800 rounded-xl p-6 shadow-lg border border-slate-700">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-slate-700 text-sm text-slate-400">
                <th className="py-3 pr-3">Cliente</th>
                <th className="py-3 px-3">Contato</th>
                <th className="py-3 px-3">Data de Cadastro</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 pl-3 text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {customers.map(customer => (
                <tr key={customer.id} className="border-b border-slate-700/50 hover:bg-slate-700/50">
                  <td className="py-3 pr-3">
                    <div className="flex items-center gap-3">
                        <SafeImage src={customer.avatarUrl} alt={customer.fullName} className="w-9 h-9 rounded-full" fallbackType="avatar" />
                        <span className="font-medium text-white">{customer.fullName}</span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">
                      <div>{customer.email}</div>
                      <div className="text-xs text-slate-400">{customer.phone}</div>
                  </td>
                  <td className="py-3 px-3 text-slate-300">{new Date(customer.signupDate).toLocaleDateString('pt-BR')}</td>
                  <td className="py-3 px-3">
                    <span className={`px-2 py-1 text-xs font-semibold rounded-full ${customer.status === 'Ativo' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>
                      {customer.status}
                    </span>
                  </td>
                  <td className="py-3 pl-3 text-right">
                    <button onClick={() => openModal(customer)} className="p-2 text-slate-400 hover:text-white hover:bg-slate-600 rounded-md"><PencilIcon className="w-5 h-5" /></button>
                    <button onClick={() => handleDelete(customer.id)} className="p-2 text-slate-400 hover:text-red-400 hover:bg-slate-600 rounded-md ml-2"><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      {isModalOpen && <CustomerModal customer={editingCustomer} onSave={handleSave} onClose={closeModal} />}
    </div>
  );
};

export default AdminCustomersPage;