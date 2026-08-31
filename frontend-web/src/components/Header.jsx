import React from "react";
import { Link, useNavigate } from 'react-router-dom';

export default function Header() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('@AtletaCheckin:token');
        localStorage.removeItem('AtletaCheckin:user');
        navigate('/login');
    };

    return(
    <header className="bg-slate-900 border-b border-slate-800 text-white px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4">
      <div className="flex items-center gap-2 font-bold text-xl text-indigo-400">
        <Link to="/dashboard">📌 Atleta Check-in Coach</Link>
      </div>

      <nav className="flex flex-wrap items-center gap-4 text-sm font-medium">
        <Link to="/dashboard" className="hover:text-indigo-400 transition">Agenda</Link>
        <Link to="/coach/metrics" className="hover:text-indigo-400 transition">Indicadores</Link>
        <Link to="/coach/register-athlete" className="hover:text-indigo-400 transition">+ Atleta</Link>
        <Link to="/coach/workouts" className="hover:text-indigo-400 transition">Treinos</Link>
        <Link to="/coach/forms" className="hover:text-indigo-400 transition">Formulários</Link>
      </nav>

      <button 
        onClick={handleLogout} 
        className="px-4 py-2 bg-slate-800 hover:bg-red-600 rounded-lg text-xs font-bold transition">
        Sair
      </button>
    </header>
  );
}