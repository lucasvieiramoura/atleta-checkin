import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { Trash2, Save, Plus, X } from 'lucide-react';

export default function EditForms() {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);
  const [formData, setFormData] = useState({ title: '', questions: [] });
  const [status, setStatus] = useState({ type: '', message: '' });

  // 1. Carregar Formulários
  const fetchForms = async () => {
    try {
      const response = await api.get('/forms');
      setForms(response.data || []);
    } catch (err) {
      console.error('Erro ao buscar formulários:', err);
    }
  };

  useEffect(() => {
    fetchForms();
  }, []);

  // 2. Abrir Modal de Edição
  const handleOpenEdit = (form) => {
    setSelectedForm(form);
    setFormData({
      title: form.title || '',
      questions: Array.isArray(form.questions)
        ? form.questions.map((q) => ({
            label: typeof q === 'string' ? q : q.label || '',
            type: q.type || 'text' // 'text', 'number', 'scale'
          }))
        : []
    });
    setStatus({ type: '', message: '' });
  };

  // 3. Atualizar campos da Pergunta no estado local
  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...formData.questions];
    updatedQuestions[index][field] = value;
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // 4. Adicionar Nova Pergunta
  const handleAddQuestion = () => {
    setFormData({
      ...formData,
      questions: [...formData.questions, { label: '', type: 'text' }]
    });
  };

  // 5. Excluir Pergunta (Lixeira Vermelha)
  const handleDeleteQuestion = (index) => {
    const updatedQuestions = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: updatedQuestions });
  };

  // 6. Salvar Pergunta Individual (Disquete) ou Formulário Completo
  const handleSaveForm = async (e) => {
    if (e) e.preventDefault();
    setStatus({ type: '', message: '' });

    try {
      await api.put(`/forms/${selectedForm._id}`, formData);
      setStatus({ type: 'success', message: 'Formulário e perguntas salvos com sucesso!' });
      fetchForms();
    } catch (error) {
      console.error('Erro ao salvar formulário:', error);
      setStatus({
        type: 'error',
        message: error.response?.data?.message || 'Erro ao salvar o formulário na API.'
      });
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-6 text-white space-y-6">
      <h2 className="text-2xl font-bold text-indigo-400">Formulários de Check-in e Avaliação</h2>

      {/* Lista de Formulários Cadastrados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {forms.map((form) => (
          <div
            key={form._id}
            className="bg-slate-800 p-5 rounded-xl border border-slate-700 shadow-md flex justify-between items-center"
          >
            <div>
              <h3 className="font-bold text-lg text-slate-100">{form.title}</h3>
              <p className="text-xs text-slate-400">{form.questions?.length || 0} perguntas cadastradas</p>
            </div>
            <button
              onClick={() => handleOpenEdit(form)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
            >
              Editar Perguntas
            </button>
          </div>
        ))}
      </div>

      {/* MODAL DE EDIÇÃO DE FORMULÁRIO */}
      {selectedForm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 max-w-2xl w-full shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            
            {/* Cabecalho do Modal */}
            <div className="flex items-center justify-between border-b border-slate-700 pb-3">
              <h3 className="text-lg font-bold text-indigo-400">
                Editar Formulário: {selectedForm.title}
              </h3>
              <button
                onClick={() => setSelectedForm(null)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {status.message && (
              <div
                className={`p-3 text-xs rounded font-medium ${
                  status.type === 'success'
                    ? 'bg-green-900/80 text-green-200 border border-green-700'
                    : 'bg-red-900/80 text-red-200 border border-red-700'
                }`}
              >
                {status.message}
              </div>
            )}

            <div className="space-y-4 overflow-y-auto pr-1 flex-1">
              {/* Título do Formulário */}
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Título do Formulário</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 rounded-lg bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Lista de Perguntas */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">Perguntas:</label>
                  <button
                    type="button"
                    onClick={handleAddQuestion}
                    className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Adicionar Pergunta
                  </button>
                </div>

                {formData.questions.map((q, idx) => (
                  <div
                    key={idx}
                    className="flex flex-col sm:flex-row items-center gap-2 bg-slate-700/50 p-3 rounded-lg border border-slate-600"
                  >
                    {/* Texto da Pergunta */}
                    <input
                      type="text"
                      value={q.label}
                      onChange={(e) => handleQuestionChange(idx, 'label', e.target.value)}
                      placeholder={`Pergunta ${idx + 1}`}
                      className="w-full sm:flex-1 p-2 rounded bg-slate-700 border border-slate-600 text-white text-sm focus:outline-none focus:border-indigo-500"
                    />

                    {/* Seleção do Tipo de Resposta */}
                    <select
                      value={q.type}
                      onChange={(e) => handleQuestionChange(idx, 'type', e.target.value)}
                      className="p-2 rounded bg-slate-700 border border-slate-600 text-white text-xs focus:outline-none focus:border-indigo-500"
                    >
                      <option value="text">Texto</option>
                      <option value="number">Número</option>
                      <option value="scale">Escala (1-10)</option>
                    </select>

                    {/* Ações por Linha */}
                    <div className="flex items-center gap-1">
                      {/* Ícone de Disquete (Salva o formulário com a alteração) */}
                      <button
                        type="button"
                        onClick={handleSaveForm}
                        title="Salvar esta alteração"
                        className="p-2 text-slate-300 hover:text-emerald-400 hover:bg-slate-600 rounded transition"
                      >
                        <Save className="w-4 h-4" />
                      </button>

                      {/* Ícone de Lixeira Vermelha */}
                      <button
                        type="button"
                        onClick={() => handleDeleteQuestion(idx)}
                        title="Excluir pergunta"
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-slate-600 rounded transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Rodapé do Modal */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-700">
              <button
                type="button"
                onClick={() => setSelectedForm(null)}
                className="px-4 py-2 text-sm text-slate-300 bg-slate-700 hover:bg-slate-600 rounded-lg transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveForm}
                className="px-4 py-2 text-sm text-white bg-indigo-600 hover:bg-indigo-700 font-bold rounded-lg transition shadow-md"
              >
                Salvar Formulário
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}