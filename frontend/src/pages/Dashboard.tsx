import React, { useEffect, useState } from 'react';
import { Car, TrendingUp, Users, AlertTriangle, CurrencyDollar } from 'tabler-icons-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { api } from '../services/api';
import './Dashboard.css';

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  cor?: string;
  quilometragemAtual: string;
  status: string;
  categoria?: { id: number; nome: string; tarifaDiaria: string };
}

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
  endereco?: any;
}

interface Locacao {
  id: number;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva?: string;
  valorPrevisto: string;
  valorFinal?: string;
  status: string;
  cliente: Cliente;
  veiculo: Veiculo;
  funcionario?: any;
}

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria: string;
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

export default function Dashboard() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [veiculosRes, clientesRes, locacoesRes, categoriasRes] = await Promise.all([
          api.get('/veiculos'),
          api.get('/clientes'),
          api.get('/locacoes'),
          api.get('/categorias')
        ]);

        setVeiculos(veiculosRes.data);
        setClientes(clientesRes.data);
        setLocacoes(locacoesRes.data);
        setCategorias(categoriasRes.data);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
        // Dados mock como fallback
        setVeiculos([]);
        setClientes([]);
        setLocacoes([]);
        setCategorias([]);
      } finally {
        setLoading(false);
      }
    };

    carregarDados();
  }, []);

  // Cálculos das métricas
  const veiculosDisponiveis = veiculos.filter(v => v.status === 'DISPONIVEL').length;
  const veiculosLocados = veiculos.filter(v => v.status === 'ALUGADO').length;
  const veiculosManutencao = veiculos.filter(v => ['EM_MANUTENCAO', 'INATIVO', 'VENDIDO'].includes(v.status)).length;
  const locacoesAtivas = locacoes.filter(l => l.status === 'ATIVA').length;
  const totalClientes = clientes.length;

  // Receita estimada (valorPrevisto das locações ativas)
  const receitaEstimada = locacoes
    .filter(l => l.status === 'ATIVA')
    .reduce((total, locacao) => total + parseFloat(locacao.valorPrevisto), 0);

  // Dados para gráfico de pizza (distribuição por categoria)
  const categoriaData = categorias.map(categoria => {
    const count = veiculos.filter(v => v.categoria?.id === categoria.id).length;
    return {
      name: categoria.nome,
      value: count,
      tarifaMedia: parseFloat(categoria.tarifaDiaria)
    };
  }).filter(item => item.value > 0);

  // Dados para gráfico de receita (simulado baseado em locações)
  const receitaData = [
    { month: 'Jan', value: 4500 },
    { month: 'Fev', value: 5200 },
    { month: 'Mar', value: 3800 },
    { month: 'Abr', value: 6000 },
    { month: 'Mai', value: 5800 },
    { month: 'Jun', value: receitaEstimada },
  ];

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Carregando dados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Bem-vindo de volta! Aqui está o resumo atual da locadora.</p>
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
            <p className="stat-label">Locações ativas</p>
            <h3>{locacoesAtivas}</h3>
            <span className="stat-info">em andamento</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e8f5e8' }}>
            <Users color="#2e7d32" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Clientes cadastrados</p>
            <h3>{totalClientes}</h3>
            <span className="stat-info">clientes ativos</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#fff3e0' }}>
            <AlertTriangle color="#e65100" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Veículos em manutenção</p>
            <h3>{veiculosManutencao}</h3>
            <span className="stat-info">indisponíveis</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#f3e5f5' }}>
            <CurrencyDollar color="#7b1fa2" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Receita estimada</p>
            <h3>R$ {receitaEstimada.toFixed(2)}</h3>
            <span className="stat-info">locações ativas</span>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon" style={{ background: '#e3f2fd' }}>
            <Car color="#1976d2" size={28} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Veículos locados</p>
            <h3>{veiculosLocados}</h3>
            <span className="stat-info">em uso</span>
          </div>
        </div>
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <h3>Receita Mensal</h3>
          <p>Faturamento projetado nos últimos meses</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={receitaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
              <Line type="monotone" dataKey="value" stroke="#3b82f6" strokeWidth={3} dot={{ fill: '#3b82f6', r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-container">
          <h3>Distribuição por Categoria</h3>
          <p>Veículos por categoria de preço</p>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoriaData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent = 0 }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {categoriaData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="recent-section">
        <div className="recent-container">
          <h3>Locações Recentes</h3>
          <div className="recent-list">
            {locacoes.slice(0, 5).map((locacao) => (
              <div className="recent-item" key={locacao.id}>
                <div className="recent-info">
                  <p className="recent-title">{locacao.cliente.nome}</p>
                  <p className="recent-subtitle">{locacao.veiculo.marca} {locacao.veiculo.modelo} - {locacao.veiculo.placa}</p>
                  <p className="recent-date">Retirada: {new Date(locacao.dataRetirada).toLocaleDateString('pt-BR')}</p>
                </div>
                <div className="recent-amount">
                  R$ {parseFloat(locacao.valorPrevisto).toFixed(2)}
                </div>
                <span className={`status ${locacao.status.toLowerCase()}`}>
                  {locacao.status}
                </span>
              </div>
            ))}
            {locacoes.length === 0 && (
              <p className="no-data">Nenhuma locação encontrada</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
