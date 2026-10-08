import React, {useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api from '../api/axios';

export default function ActivateAccount({userId, onActiveationSuccess }){
    const [code, setCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate =  useNavigate();
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            const storedUser = localStorage.getItem("@AtletaCheckin:user");
            const user = storedUser ? JSON.parse(storedUser) : null;

            const userId = typeof user === "string" ? user.userId : user?.id;

            const response = await api.post('/auth/verify-activation', { userId, code });
            alert(response.data.message);
            navigate("/checkin");
            if (onActiveationSuccess) {
                onActiveationSuccess();
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Erro ao validar código');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ maxWidth: '400px', margin: '40px auto', textAlign: 'center' }}>
        <h2>Ativação de Conta</h2>
        <p>Insira o código de 6 dígitos enviado por E-mail / SMS para liberar seu acesso.</p>
        
        {error && <p style={{ color: 'red' }}>{error}</p>}

        <form onSubmit={handleSubmit}>
            <input
            type="text"
            maxLength="6"
            placeholder="000000"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            style={{
                letterSpacing: '8px',
                fontSize: '24px',
                textAlign: 'center',
                width: '100%',
                padding: '10px',
                marginBottom: '15px'
            }}
            required
            />
            <button type="submit" disabled={loading} style={{ width: '100%', padding: '12px' }}>
            {loading ? 'Validando...' : 'Ativar Conta'}
            </button>
        </form>
        </div>
    );
}