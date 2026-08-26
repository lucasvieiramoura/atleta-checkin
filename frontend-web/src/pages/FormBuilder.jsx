import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2, CheckCircle2, ArrowLeft, FormInput } from 'lucide-react';
import api from "../api/axios";

export default function() {
    const [title, setTitle] = useState('');
    const [questions,setQuestions] = useState([
        {label: '', type: 'scale_1_10', required: true}
    ]);
    const [formsList, setFormsList] = useState([]);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchForms();
    }, []);

    const fetchForms = async () => {
        try {
            const response = await api.get('/forms');
            setFormsList(response.data);
        } catch (error) {
            console.error('Erro ao buscar formulários.', error);            
        }
    };

    const handleAddQuestion = () => {
        setQuestions([
            ...questions,
            {label: '', type: 'scale_1_10', required: true}
        ]);
    };

    const handleRemoveQuestion = (index) => {
        if (questions.length === 1) return;
        const updated = questions.filter((_, i) => i !== index);
        setQuestions(updated);
    };

    const handleQuestionChange = (index, field, value) => {
        const updated = [...questions];
        updated[index][field] = value;
        setQuestions(updated);
    };

    const handleSaveForm = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!title.trim()) {
            setError('O título do formulário é obrigatório. ');
            return;
        }

        const hasEmptyQuestion = questions.some((q) => !q.label.trim());
        if (hasEmptyQuestion) {
            setError('Preencha o texto de todas as perguntas antes de salvar. ');
            return;
        }

        try {
            await api.post('/forms', {title, questions});
            setSuccess('Formulário criado com sucesso!');
            setTitle('');
            setQuestions([{label: '', type: 'scale_1_10', required: true}]);
            fetchForms();
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao criar formulário.');
        }
    };

    const handleDeleteForm = async (id) => {
        if (!confirm('Deseja realmente remover este formulário?'));
        try {
            await api.delete(`/forms/${id}`);
            fetchForms();
        } catch (error) {
            alert('Erro ao excluir formulário.');
        }
    };

    return(
        <div className="min-h-screen bg-gray-950 text-gray-100">
        {/* Header */}
        <header className="bg-gray-900 border-b border-gray-800 px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
            <button 
                onClick={() => navigate('/dashboard')}
                className="p-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-gray-300 transition"
            >
                <ArrowLeft className="w-5 h-5" />
            </button>
            <FormInput className="w-6 h-6 text-indigo-500" />
            <h1 className="text-xl font-bold">Construtor de Formulários</h1>
            </div>
        </header>

        <main className="max-w-6xl mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Formulário de Criação */}
            <div className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
            <h2 className="text-xl font-bold mb-4 text-white">Criar Novo Formulário</h2>

            {error && <div className="bg-red-500/20 text-red-400 p-3 rounded mb-4 text-sm">{error}</div>}
            {success && <div className="bg-emerald-500/20 text-emerald-400 p-3 rounded mb-4 text-sm">{success}</div>}

            <form onSubmit={handleSaveForm} className="space-y-6">
                <div>
                <label className="block text-sm font-medium mb-1 text-gray-300">Título do Formulário</label>
                <input 
                    type="text"
                    placeholder="Ex: Percepção de Esforço / PSE Pós-Treino"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
                </div>

                <div className="space-y-4">
                <div className="flex justify-between items-center">
                    <label className="block text-sm font-medium text-gray-300">Perguntas</label>
                    <button 
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/30 px-3 py-1.5 rounded-lg transition"
                    >
                    <Plus className="w-4 h-4" /> Adicionar Pergunta
                    </button>
                </div>

                {questions.map((q, index) => (
                    <div key={index} className="bg-gray-800/50 border border-gray-700/60 p-4 rounded-xl space-y-3 relative">
                    <div className="flex gap-2">
                        <input 
                        type="text"
                        placeholder={`Pergunta ${index + 1}`}
                        value={q.label}
                        onChange={(e) => handleQuestionChange(index, 'label', e.target.value)}
                        className="flex-1 bg-gray-800 border border-gray-700 rounded-lg p-2 text-sm text-white focus:outline-none focus:border-indigo-500"
                        />
                        {questions.length > 1 && (
                        <button 
                            type="button"
                            onClick={() => handleRemoveQuestion(index)}
                            className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition"
                        >
                            <Trash2 className="w-4 h-4" />
                        </button>
                        )}
                    </div>

                    <div className="flex items-center gap-4 text-xs">
                        <div className="flex-1">
                        <label className="block text-gray-400 mb-1">Tipo de Resposta</label>
                        <select 
                            value={q.type}
                            onChange={(e) => handleQuestionChange(index, 'type', e.target.value)}
                            className="w-full bg-gray-800 border border-gray-700 rounded-lg p-2 text-white focus:outline-none focus:border-indigo-500"
                        >
                            <option value="scale_1_10">Escala de 1 a 10</option>
                            <option value="text">Texto Livre</option>
                            <option value="number">Número</option>
                        </select>
                        </div>

                        <label className="flex items-center gap-2 cursor-pointer mt-5">
                        <input 
                            type="checkbox"
                            checked={q.required}
                            onChange={(e) => handleQuestionChange(index, 'required', e.target.checked)}
                            className="rounded bg-gray-800 border-gray-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-gray-300">Obrigatória</span>
                        </label>
                    </div>
                    </div>
                ))}
                </div>

                <button 
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium p-3 rounded-xl shadow-lg transition"
                >
                Salvar Formulário
                </button>
            </form>
            </div>

            {/* Lista de Formulários Criados */}
            <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl h-fit">
            <h2 className="text-xl font-bold mb-4 text-white">Formulários Salvos</h2>
            {formsList.length === 0 ? (
                <p className="text-gray-400 text-sm">Nenhum formulário cadastrado.</p>
            ) : (
                <div className="space-y-3">
                {formsList.map((form) => (
                    <div key={form._id} className="bg-gray-800/40 border border-gray-700/50 p-3 rounded-xl flex justify-between items-center">
                    <div>
                        <h3 className="font-semibold text-sm text-indigo-300">{form.title}</h3>
                        <p className="text-xs text-gray-400">{form.questions?.length || 0} pergunta(s)</p>
                    </div>
                    <button 
                        onClick={() => handleDeleteForm(form._id)}
                        className="p-1.5 text-gray-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition"
                    >
                        <Trash2 className="w-4 h-4" />
                    </button>
                    </div>
                ))}
                </div>
            )}
            </div>
        </main>
        </div>
    );
}