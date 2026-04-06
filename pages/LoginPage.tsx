
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
  const { user, login, loginWithGoogle, logout } = useAuth();
  
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
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-slate-800 text-slate-400">Ou continue com</span>
            </div>
          </div>

          <div>
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
