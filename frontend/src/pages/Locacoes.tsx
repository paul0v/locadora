import { useEffect, useState } from 'react';
import { ChevronRight } from 'tabler-icons-react';
import './Locacoes.css';
import { api } from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cnh: string;
}

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: string;
  status: 'DISPONIVEL' | 'ALUGADO' | 'MANUTENCAO';
}

interface SelectionData {
  clienteId: number | null;
  clienteNome: string;
  veiculoId: number | null;
  veiculoNome: string;
  dataInicio: string;
  dataFim: string;
  total: number;
}

export default function Locacoes() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selection, setSelection] = useState<SelectionData>({
    clienteId: null,
    clienteNome: '',
    veiculoId: null,
    veiculoNome: '',
    dataInicio: '',
    dataFim: '',
    total: 0,
  });

  useEffect(() => {
    fetchClientes();
    fetchVeiculos();
  }, []);

  const fetchClientes = async () => {
    try {
      const res = await api.get<Cliente[]>('/clientes');
      setClientes(res.data);
    } catch (err) {
      console.error('Erro ao buscar clientes', err);
      setError('Erro ao buscar clientes');
    }
  };

  const fetchVeiculos = async () => {
    try {
      const res = await api.get<Veiculo[]>('/veiculos');
      const disponiveis = res.data.filter(v => v.status === 'DISPONIVEL');
      setVeiculos(disponiveis);
    } catch (err) {
      console.error('Erro ao buscar veículos', err);
      setError('Erro ao buscar veículos');
    }
  };

  const calcularTotal = (dataInicio: string, dataFim: string): number => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    
    const diariaMap: Record<string, number> = {
      'Econômico': 120,
      'Sedan': 150,
      'Sedan Premium': 280,
      'SUV': 220,
      'Luxo': 350,
    };
    
    const diariaVeiculo = diariaMap[veiculos.find(v => v.id === selection.veiculoId)?.categoria || 'Sedan'] || 150;
    return dias * diariaVeiculo;
  };

  const handleSelectCliente = (cliente: Cliente) => {
    setSelection({
      ...selection,
      clienteId: cliente.id,
      clienteNome: cliente.nome,
    });
    setStep(2);
  };

  const handleSelectVeiculo = (veiculo: Veiculo) => {
    setSelection({
      ...selection,
      veiculoId: veiculo.id,
      veiculoNome: `${veiculo.marca} ${veiculo.modelo}`,
    });
    setStep(3);
  };

  const handleDateChange = (tipo: 'inicio' | 'fim', value: string) => {
    const newSelection = {
      ...selection,
      ...(tipo === 'inicio' ? { dataInicio: value } : { dataFim: value }),
    };
    const total = calcularTotal(newSelection.dataInicio, newSelection.dataFim);
    setSelection({ ...newSelection, total });
  };

  const handleConfirmLocacao = async () => {
    if (!selection.clienteId || !selection.veiculoId || !selection.dataInicio || !selection.dataFim) {
      setError('Preencha todos os campos');
      return;
    }

    setLoading(true);
    try {
      await api.post('/locacoes', {
        clienteId: selection.clienteId,
        veiculoId: selection.veiculoId,
        dataRetirada: selection.dataInicio,
        dataDevolucaoPrevista: selection.dataFim,
      });
      alert('Locação criada com sucesso!');
      setSelection({
        clienteId: null,
        clienteNome: '',
        veiculoId: null,
        veiculoNome: '',
        dataInicio: '',
        dataFim: '',
        total: 0,
      });
      setStep(1);
      fetchVeiculos(); // Atualizar lista de veículos disponíveis
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao criar locação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="locacoes-page">
      <div className="page-header">
        <h1>Nova Locação</h1>
        <p>Selecione o cliente e o veículo disponível para iniciar</p>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      <div className="form-container">
        <div className="steps-header">
          <div className={`step ${step === 1 ? 'active' : 'done'}`}>
            <span>1</span>
            <p>Seleção de Cliente</p>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step === 2 ? 'active' : step > 2 ? 'done' : ''}`}>
            <span>2</span>
            <p>Seleção de Veículo</p>
          </div>
          <div className="step-connector"></div>
          <div className={`step ${step === 3 ? 'active' : ''}`}>
            <span>3</span>
            <p>Período da Locação</p>
          </div>
        </div>

        {step === 1 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">👤</span> 1. Seleção de Cliente
            </h3>
            <div className="clients-list">
              {clientes.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999' }}>Nenhum cliente cadastrado</p>
              ) : (
                clientes.map((cliente) => (
                  <div
                    key={cliente.id}
                    className="client-item"
                    onClick={() => handleSelectCliente(cliente)}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold' }}>{cliente.nome}</p>
                      <small style={{ color: '#666' }}>{cliente.cpf}</small>
                    </div>
                    <ChevronRight size={18} />
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">🚗</span> 2. Seleção de Veículo
            </h3>
            <div className="vehicles-grid">
              {veiculos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#999', gridColumn: '1/-1' }}>Nenhum veículo disponível</p>
              ) : (
                veiculos.map((veiculo) => (
                  <div
                    key={veiculo.id}
                    className="vehicle-card"
                    onClick={() => handleSelectVeiculo(veiculo)}
                  >
                    <strong>{veiculo.marca} {veiculo.modelo}</strong>
                    <p>{veiculo.placa}</p>
                    <small>{veiculo.ano} - {veiculo.categoria}</small>
                  </div>
                ))
              )}
            </div>
            {step === 2 && (
              <button
                onClick={() => setStep(1)}
                style={{ marginTop: '1rem', background: '#999' }}
                className="btn-primary"
              >
                ← Voltar
              </button>
            )}
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">📅</span> 3. Período da Locação
            </h3>
            <div className="date-inputs">
              <div className="form-group">
                <label>Data Inicial</label>
                <input
                  type="date"
                  value={selection.dataInicio}
                  onChange={(e) => handleDateChange('inicio', e.target.value)}
                />
              </div>
              <div className="form-group">
                <label>Data Final</label>
                <input
                  type="date"
                  value={selection.dataFim}
                  onChange={(e) => handleDateChange('fim', e.target.value)}
                />
              </div>
            </div>
            <div className="summary">
              <h3>Resumo da Locação</h3>
              <div className="summary-row">
                <span>CLIENTE</span>
                <p>{selection.clienteNome}</p>
              </div>
              <div className="summary-row">
                <span>VEÍCULO</span>
                <p>{selection.veiculoNome}</p>
              </div>
              <div className="summary-row total">
                <span>TOTAL</span>
                <h2>R$ {selection.total.toFixed(2).replace('.', ',')}</h2>
              </div>
              <button
                className="btn-confirm"
                onClick={handleConfirmLocacao}
                disabled={loading}
              >
                {loading ? 'Confirmando...' : 'Confirmar Locação'}
              </button>
              <button
                onClick={() => setStep(2)}
                style={{ marginTop: '0.5rem', background: '#999' }}
                className="btn-primary"
              >
                ← Voltar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
