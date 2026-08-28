import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function EditForms() {
  const [forms, setForms] = useState([]);
  const [selectedForm, setSelectedForm] = useState(null);

  useEffect(() => {
    api.get('/forms').then((res) => setForms(res.data));
  }, []);

  const handleSaveForm = async (e) => {
    e.preventDefault();
    await api.put(`/forms/${selectedForm._id}`, selectedForm);
    setSelectedForm(null);
    const res = await api.get('/forms');
    setForms(res.data);
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Formulários de Check-in e Avaliação</h2>
      
      <div className="space-y-4">
        {forms.map((form) => (
          <div key={form._id} className="bg-slate-800 p-4 rounded-xl flex justify-between items-center">
            <div>
              <h4 className="font-bold text-lg">{form.title}</h4>
              <p className="text-sm text-slate-400">{form.questions?.length || 0} perguntas cadastradas</p>
            </div>
            <button onClick={() => setSelectedForm(form)} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded font-semibold text-sm">
              Editar Perguntas
            </button>
          </div>
        ))}
      </div>

      {selectedForm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleSaveForm} className="bg-slate-800 p-6 rounded-xl w-full max-w-lg space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold">Editar Formulário: {selectedForm.title}</h3>
            <input 
              type="text" 
              value={selectedForm.title} 
              onChange={(e) => setSelectedForm({...selectedForm, title: e.target.value})}
              className="w-full p-2.5 rounded bg-slate-700 text-white" 
            />
            
            <div className="space-y-2">
              <label className="font-semibold text-sm">Perguntas:</label>
              {selectedForm.questions?.map((q, idx) => (
                <input 
                  key={idx}
                  type="text" 
                  value={q.questionText} 
                  onChange={(e) => {
                    const updated = [...selectedForm.questions];
                    updated[idx].questionText = e.target.value;
                    setSelectedForm({...selectedForm, questions: updated});
                  }}
                  className="w-full p-2 rounded bg-slate-700 text-white text-sm" 
                />
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button type="button" onClick={() => setSelectedForm(null)} className="px-4 py-2 bg-slate-600 rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 rounded font-bold">Salvar Formulário</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}