import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Pencil, Trash2, X, AlertTriangle } from 'lucide-react';

export default function RegisterAthlete() {
  const [athletes, setAthletes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modal de confirmação
  const [deletingAthlete, setDeletingAthlete] = useState(null);

  // Edição
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    position: 'WR',
    password: '123@mudar'
  });

  const [status, setStatus] = useState({ type: '', message: '' });

  const fetchAthletes = async () => {
    try {
      setLoading(true);
      const response = await api.get('/athletes');
      // Filtra apenas os que estão ativos ou sem o campo status definido como false
      const statusAthletes = (response.data || []).filter(a => a.status !== false);
      setAthletes(statusAthletes);
    } catch (err) {
      console.error('Erro ao buscar atletas:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAthletes();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleEdit = (athlete) => {
    setEditingId(athlete._id);
    setFormData({
      name: athlete.name || '',
      email: athlete.email || '',
      phone: athlete.phone || '',
      cpf: athlete.cpf || '',
      position: athlete.position || 'WR',
      password: ''
    });
    setStatus({ type: '', message: '' });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      name: '',
      email: '',
      phone: '',
      cpf: '',
      position: 'WR',
      password: '123@mudar'
    });
  };

  // Confirmação via Modal para inativação
  const confirmInactivate = async () => {
    if (!deletingAthlete) return;

    try {
      await api.put(`/athletes/${deletingAthlete._id}`, { status: false });
      setStatus({ type: 'success', message: 'Atleta desativado com sucesso!' });
      setDeletingAthlete(null);
      fetchAthletes();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao desativar atleta'
      });
      setDeletingAthlete(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      if (editingId) {
        await api.put(`/athletes/${editingId}`, formData);
        setStatus({ type: 'success', message: 'Atleta atualizado com sucesso!' });
      } else {
        await api.post('/auth/register', { ...formData, role: 'ATHLETE' });
        setStatus({ type: 'success', message: 'Atleta cadastrado com sucesso!' });
      }

      handleCancelEdit();
      fetchAthletes();
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao processar requisição'
      });
    }
  };

  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name?.toLowerCase().includes(search.toLowerCase()) ||
    athlete.cpf?.includes(search) ||
    athlete.position?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="w-full max-w-7xl mx-auto py-4 relative">
      <div className="flex flex-col lg:flex-row gap-6">

        {/* LISTA */}
        <div className="w-full lg:w-[60%] bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
            <div>
              <h2 className="text-xl font-bold text-indigo-400">Elenco / Atletas</h2>
              <p className="text-xs text-slate-400">Total: {athletes.length} cadastrados</p>
            </div>
            <input
              type="text"
              placeholder="Buscar por nome, CPF ou posição..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="p-2 text-sm bg-slate-700 border border-slate-600 rounded text-white focus:outline-none focus:border-indigo-500 w-full sm:w-64"
            />
          </div>

          <div className="overflow-x-auto flex-1">
            {loading ? (
              <p className="text-slate-400 text-sm py-4">Carregando atletas...</p>
            ) : filteredAthletes.length === 0 ? (
              <p className="text-slate-400 text-sm py-4">Nenhum atleta encontrado.</p>
            ) : (
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-700 text-slate-200 uppercase text-xs font-semibold">
                  <tr>
                    <th className="p-3">Nome</th>
                    <th className="p-3">Posição</th>
                    <th className="p-3">CPF</th>
                    <th className="p-3 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-700">
                  {filteredAthletes.map((athlete) => (
                    <tr key={athlete._id} className="hover:bg-slate-700/50 transition">
                      <td className="p-3 font-medium text-white">{athlete.name}</td>
                      <td className="p-3">
                        <span className="px-2 py-0.5 text-xs bg-indigo-900/60 text-indigo-300 border border-indigo-700 rounded-full font-bold">
                          {athlete.position || 'N/I'}
                        </span>
                      </td>
                      <td className="p-3 text-xs text-slate-400">{athlete.cpf || '-'}</td>
                      <td className="p-3">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleEdit(athlete)}
                            title="Editar Atleta"
                            className="p-1.5 text-slate-300 hover:text-indigo-400 hover:bg-slate-700 rounded transition"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingAthlete(athlete)}
                            title="Inativar Atleta"
                            className="p-1.5 text-slate-300 hover:text-red-400 hover:bg-slate-700 rounded transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>

        {/* FORMULÁRIO */}
        <div className="w-full lg:w-[40%] bg-slate-800 p-6 rounded-xl shadow-lg border border-slate-700 h-fit">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-indigo-400">
              {editingId ? 'Editar Atleta' : 'Cadastrar Novo Atleta'}
            </h2>
            {editingId && (
              <button
                onClick={handleCancelEdit}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white bg-slate-700 px-2 py-1 rounded"
              >
                <X className="w-3 h-3" /> Cancelar
              </button>
            )}
          </div>

          {status.message && (
            <div className={`p-3 mb-4 text-sm rounded font-medium ${status.type === 'success' ? 'bg-green-900/80 text-green-200 border border-green-700' : 'bg-red-900/80 text-red-200 border border-red-700'}`}>
              {status.message}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nome Completo *</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">E-mail *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">CPF *</label>
                <input
                  type="text"
                  name="cpf"
                  value={formData.cpf}
                  onChange={handleChange}
                  placeholder="000.000.000-00"
                  required
                  className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Telefone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Posição</label>
                <select
                  name="position"
                  value={formData.position}
                  onChange={handleChange}
                  className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                >
                  <option value="WR">WR</option>
                  <option value="RB">RB</option>
                  <option value="QB">QB</option>
                  <option value="LB">LB</option>
                  <option value="CB">CB</option>
                  <option value="OL">OL</option>
                  <option value="DL">DL</option>
                </select>
              </div>

              {!editingId && (
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">Senha *</label>
                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!editingId}
                    className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              className={`w-full py-3 rounded-lg font-bold text-white text-sm transition mt-2 shadow-md ${
                editingId ? 'bg-amber-600 hover:bg-amber-700' : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {editingId ? 'Atualizar Atleta' : 'Cadastrar Atleta'}
            </button>
          </form>
        </div>
      </div>

      {/* MODAL DE CONFIRMAÇÃO DE DESATIVAÇÃO */}
      {deletingAthlete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center gap-3 text-amber-400">
              <AlertTriangle className="w-6 h-6" />
              <h3 className="text-lg font-bold text-white">Confirmar Desativação</h3>
            </div>
            
            <p className="text-sm text-slate-300">
              Tem certeza da desativação do Atleta <strong className="text-white">{deletingAthlete.name}</strong>?
            </p>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeletingAthlete(null)}
                className="px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmInactivate}
                className="px-4 py-2 text-sm text-white bg-red-600 hover:bg-red-700 font-medium rounded-lg transition shadow-md"
              >
                Sim, desativar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}