import React, { useState } from "react";
import { useSearchParams, useNavigate } from 'react-router-dom';
import { api } from '../api/axios';

export default function ResetPassword() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    const navigate = useNavigate();

    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (newPassword !== confirmPassword) {
        return setError('As senhas não coincidem.');
        }

        try {
        setError('');
        const response = await api.post('/auth/reset-password', { token, newPassword });
        setMessage(response.data.message);
        setTimeout(() => navigate('/login'), 3000);
        } catch (err) {
        setError(err.response?.data?.message || 'Erro ao redefinir a senha.');
        }
    };

    return (
    <div style={{ maxWidth: '400px', margin: '50px auto' }}>
        <h2>Redefinir Senha</h2>
        {message && <p style={{ color: 'green' }}>{message}</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: '10px' }}>
            <label>Nova Senha:</label>
            <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
                required
            />
            </div>
            <div style={{ marginBottom: '15px' }}>
            <label>Confirme a Nova Senha:</label>
            <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                style={{ width: '100%', padding: '8px' }}
                required
            />
            </div>
            <button type="submit" style={{ width: '100%', padding: '10px' }}>
            Alterar Senha
            </button>
        </form>
        </div>
    );
}