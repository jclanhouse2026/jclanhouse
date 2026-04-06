
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
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
  const location = useLocation();
  const { user, register, loginWithGoogle, logout } = useAuth();
  
  const from = location.state?.from?.pathname || null;

  // Redirect if user is authenticated
  useEffect(() => {
    if (user) {
      if (user.status === 'inactive') {
        logout(); // Desloga imediatamente
        setError('Esta conta foi desativada. Entre em contato com o suporte.');
        return;
      }
      
      // If there's a location to redirect to
      if (from) {
        navigate(from, { replace: true, state: location.state });
        return;
      }
      
      // Otherwise, redirect based on role
      if (user.role === 'admin') {
        navigate('/admin');
      } else if (user.role === 'moderator') {
        navigate('/pdv');
      } else if (user.role === 'client') {
        navigate('/cliente');
      }
    }
  }, [user, navigate, from, location.state, logout]);

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

  const handleGoogleLogin = async () => {
    setError('');
    try {
      await loginWithGoogle();
      // The useEffect above will handle redirection
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Ocorreu um erro inesperado.');
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

          <div className="relative mt-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Ou continue com</span>
            </div>
          </div>

          <div className="mt-6">
            <button 
              type="button" 
              onClick={handleGoogleLogin}
              className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-slate-600 rounded-md shadow-sm text-sm font-medium text-white bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-slate-500 transition-colors"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Entrar com Google
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