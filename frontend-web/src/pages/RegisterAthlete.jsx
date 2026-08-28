import React, { useState } from 'react';
import api from '../api/axios';
import { Phone } from 'lucide-react';

export default function RegisterAthelete() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        cpf: '',
        position: 'Wide Receiver',
        password: '123@mudar'
    });

    const [status, setStatus] = useState({type: '', message: ''});

    const handleSubmit = async (e) => {
        e.preventDefault();
        setStatus({type:'', message: ''});
        try {
            await api.post('/auth/register', {...formData, role:'ATHLETE'});
            setStatus({ type: 'success', message: 'Atleta cadastrado com sueceso!'});
            setFormData({name:'', email: '', phone:'', cpf:'', position: '', password:'123@mudar'})
        } catch (error) {
            setStatus({ type: 'error', message: err.response?.data?.message || 'Erro ao cadastrar atleta' });
        }
    };

    return (
    <div className="max-w-2xl mx-auto p-6 bg-slate-800 text-white rounded-xl shadow-lg mt-6">
      <h2 className="text-2xl font-bold mb-6 text-indigo-400">Cadastrar Novo Atleta</h2>
      
      {status.message && (
        <div className={`p-4 mb-4 rounded ${status.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
          {status.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Nome Completo</label>
          <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">E-mail</label>
            <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">CPF</label>
            <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} placeholder="000.000.000-00" required className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white" />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Telefone</label>
            <input type="text" name="phone" value={formData.phone} onChange={handleChange} className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Posição</label>
            <select name="position" value={formData.position} onChange={handleChange} className="w-full p-2.5 rounded bg-slate-700 border border-slate-600 text-white">
              <option value="Goleiro">Goleiro</option>
              <option value="Zagueiro">Zagueiro</option>
              <option value="Lateral">Lateral</option>
              <option value="Meio-Campo">Meio-Campo</option>
              <option value="Atacante">Atacante</option>
              <option value="Pivô">Pivô</option>
              <option value="Ala">Ala</option>
            </select>
          </div>
        </div>

        <button type="submit" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white transition">
          Cadastrar Atleta
        </button>
      </form>
    </div>
  );
}