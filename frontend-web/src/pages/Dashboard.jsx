import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, Plus, LogOut, CheckSquare, Clock, MapPin } from 'lucide-react';
import api from "../api/axios";
import { useActionState } from "react";

export default function Dashboard() {
    const [workouts, setWorkouts] = useState('');
    const [forms, setForms] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    //Estados dos Formulários de Novo Treino
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [date, setDate] = useState('');
    const [formId, setFormId] = useState('');
    const [error, setError] = useState('');

    const navigate = useNavigate();
    const user = JSON.parse(localStorage.getItem('@AtletaCheckin:user') || '{}');

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [workoutsRes, formsRes] = await Promise.all([
                api.get('/workouts'),
                api.get('/forms')
            ]);
            setWorkouts(workoutsRes.data);
            setForms(formsRes.data);
        } catch (error) {
            console.error('Erro ao carregar dados: ',error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateWorkout = async (e) =>{
        e.preventDefault();
        setError('');

        if (!title || !date) {
            setError('Título e Data/Horário são obrigatórios.');
            return;
        }

        try {
            await api.post('/workouts', {
                title,
                description,
                date: new Date(date).toISOString(),
                formId: formId || null
            });

            // Resetar formulário e fechar Modal
            setTitle('');
            setDescription('');
            setDate('');
            setFormId('');
            setShowModal('');

            // Recarregar a lista
            fetchData();
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao agendar treino.');
        }
    };

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100">
            
            {/* Conteúdo Principal */}
            <main className="max-w-6xl mx-auto p-6">
                <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold">Agenda de Treinos</h2>
                    <p className="text-gray-400 text-sm">Gerencie os treinos cadastrados e acompanhe as chamadas.</p>
                </div>
                <button 
                    onClick={() => setShowModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-medium px-4 py-2 rounded-lg shadow-lg transition"
                >
                    <Plus className="w-5 h-5" /> Novo Treino
                    
                </button>
                <button 
                    onClick={() => navigate('/forms')}
                    className="flex items-center gap-2 bg-gray-800 hover:bg-gray-700 text-gray-200 font-medium px-4 py-2 rounded-lg transition"
                    >
                    <CheckSquare className="w-5 h-5 text-indigo-400" /> Formulários
                    </button>
                </div>

                {/* Lista de Treinos */}
                {loading ? (
                <p className="text-gray-400 text-center py-10">Carregando treinos...</p>
                ) : workouts.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-8 text-center">
                    <p className="text-gray-400">Nenhum treino agendado no momento.</p>
                </div>
                ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workouts.map((workout) => (
                    <div key={workout._id} className="bg-gray-900 border border-gray-800 rounded-xl p-5 hover:border-gray-700 transition">
                        <div className="flex justify-between items-start mb-3">
                        <h3 className="text-lg font-bold text-indigo-400">{workout.title}</h3>
                        {workout.formId && (
                            <span className="bg-emerald-500/10 text-emerald-400 text-xs px-2.5 py-1 rounded-full flex items-center gap-1">
                            <CheckSquare className="w-3 h-3" /> Form Incluso
                            </span>
                        )}
                        </div>
                        
                        <p className="text-gray-400 text-sm mb-4 line-clamp-2">{workout.description || 'Sem descrição.'}</p>
                        
                        <div className="flex items-center gap-2 text-xs text-gray-300 border-t border-gray-800 pt-3">
                        <Clock className="w-4 h-4 text-indigo-400" />
                        {new Date(workout.date).toLocaleString('pt-BR', {
                            dateStyle: 'short',
                            timeStyle: 'short'
                        })}
                        </div>
                    </div>
                    ))}
                </div>
                )}
            </main>

            {/* Modal de Agendamento */}
            {showModal && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
                    <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 w-full max-w-lg shadow-2xl">
                        <h3 className="text-xl font-bold mb-4 text-white">Agendar Novo Treino</h3>
                        
                        {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}

                        <form onSubmit={handleCreateWorkout} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300">Título do Treino</label>
                            <input 
                            type="text"
                            required
                            placeholder="Ex: Treino Tático / Físico"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300">Descrição</label>
                            <textarea 
                            rows="3"
                            placeholder="Instruções ou observações para os atletas..."
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300">Data e Horário</label>
                            <input 
                            type="datetime-local"
                            required
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1 text-gray-300">Formulário Obrigatório (Opcional)</label>
                            <select 
                            value={formId}
                            onChange={(e) => setFormId(e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                            >
                            <option value="">Sem formulário vinculado</option>
                            {forms.map((f) => (
                                <option key={f._id} value={f._id}>{f.title}</option>
                            ))}
                            </select>
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t border-gray-800">
                            <button 
                            type="button"
                            onClick={() => setShowModal(false)}
                            className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded-lg text-sm font-medium transition"
                            >
                            Cancelar
                            </button>
                            <button 
                            type="submit"
                            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-medium transition"
                            >
                            Agendar Treino
                            </button>
                        </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}