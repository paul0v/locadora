import React, { useEffect, useState } from 'react';
import { Car, TrendingUp, Users, Calendar } from 'tabler-icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { api } from '../services/api';
import './Dashboard.css';

const revenueData = [
  { month: 'Jan', value: 4500 },
  { month: 'Fev', value: 5200 },
  { month: 'Mar', value: 3800 },
  { month: 'Abr', value: 6000 },
  { month: 'Mai', value: 5800 },
  { month: 'Jun', value: 7200 },
];

interface Veiculo {
  id: number;
  nome: string;
  marca: string;
  placa: string;
  categoria: string;
  diaria: string;
  status: 'Disponível' | 'Locado' | 'Manutenção';
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
}

export default function Dashboard() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [locacoesAtivas, setLocacoesAtivas] = useState(0);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        // Tenta carregar da API
        const veiculosResponse = await api.get('/veiculos');
        const clientesResponse = await api.get('/clientes');
        setVeiculos(veiculosResponse.data);
        setClientes(clientesResponse.data);
      } catch (error) {
        // Usa dados mock se API não estiver disponível
        setVeiculos([
          { id: 1, nome: 'Polo', marca: 'VW - 2023', placa: 'ABC-1234', categoria: 'Econômico', diaria: 'R$ 120.00', status: 'Disponível' },
          { id: 2, nome: 'Corolla', marca: 'Toyota - 2024', placa: 'XYZ-9876', categoria: 'Sedan Premium', diaria: 'R$ 280.00', status: 'Locado' },
          { id: 3, nome: 'Renegade', marca: 'Jeep - 2023', placa: 'KJF-4432', categoria: 'SUV', diaria: 'R$ 220.00', status: 'Manutenção' },
          { id: 4, nome: 'Cronos', marca: 'Fiat - 2022', placa: 'PQP-1010', categoria: 'Sedan', diaria: 'R$ 150.00', status: 'Disponível' },
        ]);
        setClientes([
          { id: 1, nome: 'Ana Beatriz Silva', cpf: '123.456.789-00', telefone: '(11) 98765-4321', email: 'ana.beatriz@email.com', cnh: 'ABC12345' },
          { id: 2, nome: 'Carlos Eduardo Oliveira', cpf: '987.654.321-11', telefone: '(21) 97654-3210', email: 'carlos.oliver@email.com', cnh: 'XYZ67890' },
          { id: 3, nome: 'Juliana Santos', cpf: '456.789.123-22', telefone: '(31) 96543-2109', email: 'juju.santos@email.com', cnh: 'DEF45678' },
          { id: 4, nome: 'Ricardo Ferreira', cpf: '789.123.456-33', telefone: '(41) 95432-1098', email: 'ric.fer@email.com', cnh: 'GHI90123' },
        ]);
      }
    };

    carregarDados();
  }, []);

  // Calcula estatísticas dinamicamente
  const veiculosDisponiveis = veiculos.filter(v => v.status === 'Disponível').length;
  const veiculosLocados = veiculos.filter(v => v.status === 'Locado').length;
  const veiculosManutencao = veiculos.filter(v => v.status === 'Manutenção').length;
  const totalClientes = clientes.length;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo de volta! Aqui está o resumo de hoje.</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <Car color="#1976d2" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Veículos disponíveis</p>
            <h3>{veiculosDisponiveis}</h3>
            <span className="stat-info">de {veiculos.length} total</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <TrendingUp color="#7b1fa2" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Veículos locados</p>
            <h3>{veiculosLocados}</h3>
            <span className="stat-info">em operação</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <Users color="#7b1fa2" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Clientes cadastrados</p>
            <h3>{totalClientes}</h3>
            <span className="stat-info">clientes ativos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <Calendar color="#e65100" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Veículos em manutenção</p>
            <h3>{veiculosManutencao}</h3>
            <span className="stat-info">em revisão</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Receita Mensal</h3>
          <p>Faturamento nos últimos 6 meses</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={revenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container small">
          <h3>Veículos Cadastrados</h3>
          <p>Frota da locadora hoje</p>
          <div className="recent-rentals">
            {veiculos.map((veiculo) => (
              <div className="rental-item" key={veiculo.id}>
                <div>
                  <p className="rental-name">{veiculo.nome}</p>
                  <p className="rental-vehicle">{veiculo.marca}</p>
                </div>
                <div className="rental-amount">{veiculo.diaria}</div>
                <span className={`status ${veiculo.status.toLowerCase().replace(/\s+/g, '-')}`}>
                  {veiculo.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
