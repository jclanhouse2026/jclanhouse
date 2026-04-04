
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import HomeIcon from '../components/icons/HomeIcon';
import { useAuth } from '../context/AuthContext';

const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout } = useAuth();
  
  const from = location.state?.from?.pathname || null;

  // Redirect if user is authenticated
  useEffect(() => {
    if (user) {
      if (user.status === 'inactive') {
        logout(); // Desloga imediatamente
        setError('Esta conta foi desativada. Entre em contato com o suporte.');
        return;
      }
      
      // If there's a location to redirect to (e.g., from the resume page)
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

  const handleLogin = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setError('');
    try {
      await login(identifier, password, rememberMe);
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
          <h2 className="text-3xl font-bold text-white">Bem-vindo de Volta</h2>
          <p className="text-slate-400 mt-2">Acesse seu painel para continuar.</p>
        </div>
        <form className="space-y-6" onSubmit={handleLogin}>
          <div>
            <label htmlFor="email" className="text-sm font-bold text-slate-300 block mb-2">Email ou Nome de Usuário</label>
            <input 
              type="text" 
              id="email" 
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" 
              placeholder="email@exemplo.com ou seu_usuario" 
              required
            />
          </div>
          <div>
            <label htmlFor="password"className="text-sm font-bold text-slate-300 block mb-2">Senha</label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 bg-slate-700 rounded-md text-white border border-slate-600 focus:border-cyan-500 focus:ring-cyan-500 focus:outline-none" 
              placeholder="••••••••" 
              required
            />
          </div>
           <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input 
                id="remember-me" 
                name="remember-me" 
                type="checkbox" 
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-cyan-600 focus:ring-cyan-500 border-slate-600 rounded bg-slate-700" 
              />
              <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-300">Lembrar-me</label>
            </div>
            <div className="text-sm">
              <a href="#" className="font-medium text-cyan-400 hover:text-cyan-300">Esqueceu a senha?</a>
            </div>
          </div>

          {error && (
            <div className="bg-red-500/20 p-3 rounded-md text-center">
                <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          <div>
            <button 
              type="submit" 
              id="btnLogin" 
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              Entrar
            </button>
          </div>
        </form>
         <div className="mt-6 text-center text-sm text-slate-400">
          <p>
            Não tem uma conta? <Link to="/register" className="font-medium text-cyan-400 hover:text-cyan-300">Crie uma agora</Link>
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

export default LoginPage;
