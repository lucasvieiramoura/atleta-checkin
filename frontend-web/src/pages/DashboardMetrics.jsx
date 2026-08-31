import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DashboardMetrics() {
  const [attendances, setAttendances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalWorkouts: 0,
    totalPresences: 0,
    presenceRate: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const res = await api.get('/attendance/dashboard');
      setAttendances(res.data.records || []);
      setStats({
        totalWorkouts: res.data.totalWorkouts || 0,
        totalPresences: res.data.totalPresences || 0,
        presenceRate: res.data.presenceRate || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar dados do Dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredRecords = attendances.filter((record) => {
    const term = searchTerm.toLowerCase();
    const nameMatch = record.athleteName?.toLowerCase().includes(term);
    const cpfMatch = record.cpf?.includes(term);
    const positionMatch = record.position?.toLowerCase().includes(term);
    return nameMatch || cpfMatch || positionMatch;
  });

  return (
    <div className="w-full max-w-7xl mx-auto p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold text-indigo-400">Dashboard de Presença</h2>

      {/* Cartões de Indicadores Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-sm font-medium text-slate-400">Total de Treinos Realizados</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">
            {loading ? '-' : stats.totalWorkouts}
          </h3>
        </div>
        
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-sm font-medium text-slate-400">Total de Confirmados</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">
            {loading ? '-' : stats.totalPresences}
          </h3>
        </div>

        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 shadow-lg">
          <p className="text-sm font-medium text-slate-400">Taxa Média de Presença</p>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">
            {loading ? '-' : `${stats.presenceRate}%`}
          </h3>
        </div>
      </div>

      {/* Tabela com Filtro de Atletas */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4 shadow-lg">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold text-slate-200">Histórico de Presenças</h3>
          <input
            type="text"
            placeholder="Buscar por atleta, CPF ou posição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500 w-full md:w-80"
          />
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="text-slate-400 text-sm py-4">Carregando histórico...</p>
          ) : filteredRecords.length === 0 ? (
            <p className="text-slate-400 text-sm py-4">Nenhum registro de presença encontrado.</p>
          ) : (
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-700 text-slate-200 uppercase text-xs">
                <tr>
                  <th className="p-3">Atleta</th>
                  <th className="p-3">CPF</th>
                  <th className="p-3">Posição</th>
                  <th className="p-3">Treino</th>
                  <th className="p-3">Data</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {filteredRecords.map((item, idx) => (
                  <tr key={item._id || idx} className="hover:bg-slate-700/50 transition">
                    <td className="p-3 font-medium text-white">{item.athleteName}</td>
                    <td className="p-3 text-xs text-slate-400">{item.cpf}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700 rounded-full font-bold">
                        {item.position}
                      </span>
                    </td>
                    <td className="p-3">{item.workoutTitle}</td>
                    <td className="p-3 text-xs text-slate-400">
                      {new Date(item.date).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="p-3 text-center">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.isPresent ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-700/50' : 'bg-red-500/20 text-red-400 border border-red-700/50'}`}>
                        {item.isPresent ? 'Confirmado' : 'Ausente'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}