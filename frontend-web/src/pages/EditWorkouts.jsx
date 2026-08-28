import React, { useState, useEffect } from 'react';
import api from '../api/axios';

export default function EditWorkouts() {
  const [workouts, setWorkouts] = useState([]);
  const [editingWorkout, setEditingWorkout] = useState(null);

  useEffect(() => { loadWorkouts(); }, []);

  const loadWorkouts = async () => {
    const res = await api.get('/workouts');
    setWorkouts(res.data);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await api.put(`/workouts/${editingWorkout._id}`, editingWorkout);
    setEditingWorkout(null);
    loadWorkouts();
  };

  return (
    <div className="p-6 text-white">
      <h2 className="text-2xl font-bold mb-6">Gerenciar e Editar Treinos</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {workouts.map((w) => (
          <div key={w._id} className="bg-slate-800 p-4 rounded-xl border border-slate-700">
            <h3 className="font-bold text-lg text-indigo-400">{w.title}</h3>
            <p className="text-sm text-slate-300">{w.description}</p>
            <p className="text-xs text-slate-400 mt-2">Data: {new Date(w.date).toLocaleString('pt-BR')}</p>
            <button 
              onClick={() => setEditingWorkout(w)}
              className="mt-4 px-4 py-2 bg-amber-600 hover:bg-amber-700 rounded text-sm font-semibold">
              Editar Treino
            </button>
          </div>
        ))}
      </div>

      {editingWorkout && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4">
          <form onSubmit={handleUpdate} className="bg-slate-800 p-6 rounded-xl w-full max-w-md space-y-4">
            <h3 className="text-xl font-bold text-white">Editar Treino</h3>
            <input 
              type="text" 
              value={editingWorkout.title} 
              onChange={(e) => setEditingWorkout({...editingWorkout, title: e.target.value})}
              className="w-full p-2.5 rounded bg-slate-700 text-white" 
            />
            <textarea 
              value={editingWorkout.description} 
              onChange={(e) => setEditingWorkout({...editingWorkout, description: e.target.value})}
              className="w-full p-2.5 rounded bg-slate-700 text-white" 
            />
            <div className="flex justify-end gap-2">
              <button type="button" onClick={() => setEditingWorkout(null)} className="px-4 py-2 bg-slate-600 rounded">Cancelar</button>
              <button type="submit" className="px-4 py-2 bg-indigo-600 rounded font-bold">Salvar Alterações</button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}