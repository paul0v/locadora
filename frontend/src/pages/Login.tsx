import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Login.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Simple auth - in production use proper auth
    if (email && password) {
      navigate('/');
    }
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-icon">🚗</div>
        <h1>AutoGestão</h1>
        <p className="login-subtitle">Acesse sua conta para gerenciar a frota</p>

        <form onSubmit={handleLogin} className="login-form">
          <div className="form-group">
            <label>Usuário</label>
            <input
              type="email"
              placeholder="Digite seu e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Senha</label>
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button type="submit" className="login-btn">
            Entrar no Sistema
          </button>
        </form>

        <p className="login-footer">LOCADORA DE VEÍCULOS CORPORATIVA V1.0</p>
      </div>
    </div>
  );
}
