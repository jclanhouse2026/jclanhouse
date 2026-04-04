
import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import HomeIcon from '../components/icons/HomeIcon';
import { useAuth } from '../context/AuthContext';

const RegisterPage: React.FC = () => {
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (password !== confirmPassword) {
      setError('As senhas não correspondem.');
      return;
    }
    
    if (!/^[a-zA-Z0-9_.-]+$/.test(username)) {
        setError('Nome de usuário pode conter apenas letras, números e os caracteres _, . e -');
        return;
    }

    try {
      await register(name, email, username, password);
      setSuccess('Cadastro realizado com sucesso! Você será redirecionado para o login.');
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado durante o cadastro.');
      }
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white">Crie sua Conta</h2>
          <p className="text-slate-400 mt-2">Cadastre-se para ter acesso ao seu painel e mais.</p>
        </div>
        <form className="space-y-4" onSubmit={handleRegister}>
          <InputField label="Nome Completo" type="text" value={name} onChange={e => setName(e.target.value)} required />
          <InputField label="Nome de Usuário (login)" type="text" value={username} onChange={e => setUsername(e.target.value)} required />
          <InputField label="Email" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
          <InputField label="Senha" type="password" value={password} onChange={e => setPassword(e.target.value)} required />
          <InputField label="Confirmar Senha" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
          
          {error && <p className="text-sm text-red-400 text-center">{error}</p>}
          {success && <p className="text-sm text-emerald-400 text-center">{success}</p>}

          <div>
            <button type="submit" disabled={!!success} className="w-full flex justify-center mt-4 py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 disabled:bg-slate-600">
              Criar Conta
            </button>
          </div>
        </form>
         <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Já tem uma conta? <Link to="/login" className="font-medium text-cyan-400 hover:text-cyan-300">Faça login</Link>
          </p>
          <p className="mt-2">
            <Link to="/" className="font-medium text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1">
                <HomeIcon className="w-4 h-4" /> Voltar para a Home
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

const InputField: React.FC<{ label: string; type: string; value: string; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; required?: boolean }> = ({ label, type, value, onChange, required }) => (
    <div>
        <label className="text-sm font-bold text-slate-300 block mb-2">{label}</label>
        <input 
            type={type}
            value={value}
            onChange={onChange}
            required={required}
            className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none"
        />
    </div>
);

export default RegisterPage;