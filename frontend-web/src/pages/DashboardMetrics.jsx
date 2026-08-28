import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function DashboardMetrics() {
  const [attendances, setAttendances] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [stats, setStats] = useState({ totalWorkouts: 0, totalPresences: 0, presenceRate: 0 });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      const res = await api.get('/attendance/dashboard');
      setAttendances(res.data.records || []);
      setStats({
        totalWorkouts: res.data.totalWorkouts || 0,
        totalPresences: res.data.totalPresences || 0,
        presenceRate: res.data.presenceRate || 0,
      });
    } catch (err) {
      console.error('Erro ao carregar dados do Dashboard', err);
    }
  };

  const filteredRecords = attendances.filter((record) =>
    record.athleteName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    record.cpf?.includes(searchTerm)
  );

  return (
    <div className="p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold">Dashboard de Presença</h2>

      {/* Cartões de Indicadores Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total de Treinos Realizados</p>
          <h3 className="text-3xl font-extrabold text-indigo-400 mt-2">{stats.totalWorkouts}</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Total de Confirmados</p>
          <h3 className="text-3xl font-extrabold text-emerald-400 mt-2">{stats.totalPresences}</h3>
        </div>
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
          <p className="text-sm text-slate-400">Taxa Média de Presença</p>
          <h3 className="text-3xl font-extrabold text-amber-400 mt-2">{stats.presenceRate}%</h3>
        </div>
      </div>

      {/* Tabela com Filtro de Atletas */}
      <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <h3 className="text-xl font-semibold">Histórico de Presenças</h3>
          <input
            type="text"
            placeholder="Buscar por atleta ou CPF..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white w-full md:w-72"
          />
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-700 text-slate-200 uppercase text-xs">
              <tr>
                <th className="p-3">Atleta</th>
                <th className="p-3">CPF</th>
                <th className="p-3">Posição</th>
                <th className="p-3">Treino</th>
                <th className="p-3">Data</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700">
              {filteredRecords.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-750">
                  <td className="p-3 font-medium text-white">{item.athleteName}</td>
                  <td className="p-3">{item.cpf || 'N/A'}</td>
                  <td className="p-3">{item.position || 'N/A'}</td>
                  <td className="p-3">{item.workoutTitle}</td>
                  <td className="p-3">{new Date(item.date).toLocaleDateString('pt-BR')}</td>
                  <td className="p-3">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${item.isPresent ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                      {item.isPresent ? 'Presente' : 'Ausente'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}