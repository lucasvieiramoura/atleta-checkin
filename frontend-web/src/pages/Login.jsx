import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from '../api/axios';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const navigate =  useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('')

        try {
            const response = await api.post('/auth/login', { email, password });

            if (response.data.user.role !== 'COACH') {
                setError('Acesso permitido apenas para Coaches.');
                return;
            }

            localStorage.setItem('@AtletaCheckin:token', response.data.token);
            localStorage.setItem('@AtletaCheckin:user', JSON.stringify(response.data.user));

            navigate('/dashboard');
        } catch (error) {
            setError(error.respose?.data?.message || 'Falha ao realizar login.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white p-4">
      <form onSubmit={handleLogin} className="bg-gray-800 p-8 rounded-xl shadow-lg w-full max-w-md space-y-6">
        <h2 className="text-2xl font-bold text-center text-indigo-400">Painel do Coach</h2>
        
        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded text-sm">{error}</div>}

        <div>
          <label className="block text-sm font-medium mb-1">E-mail</label>
          <input 
            type="email" 
            required 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Senha</label>
          <input 
            type="password" 
            required 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-gray-700 rounded p-2 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          />
        </div>

        <button type="submit" className="w-full bg-indigo-600 hover:bg-indigo-500 font-semibold p-2 rounded transition">
          Entrar
        </button>
      </form>
    </div>
    );
}