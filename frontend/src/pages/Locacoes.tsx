import { useEffect, useState } from 'react';
import { ChevronRight, Trash, Check } from 'tabler-icons-react';
import './Locacoes.css';
import api from '../services/api';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  email: string;
  telefone: string;
  cnh: string;
}

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria?: number;
}

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: Categoria;
  status: 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO';
}

interface LocacaoAtiva {
  id: number;
  cliente: Cliente;
  veiculo: Veiculo;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva: string | null;
  valorPrevisto: number;
  status: 'ATIVA' | 'FINALIZADA' | 'CANCELADA';
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
  const [tab, setTab] = useState<'criar' | 'gerenciar'>('criar');
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [locacoesAtivas, setLocacoesAtivas] = useState<LocacaoAtiva[]>([]);
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
  const [finalizandoId, setFinalizandoId] = useState<number | null>(null);
  const [dataEntrega, setDataEntrega] = useState('');
  const [valorFinal, setValorFinal] = useState('');

  useEffect(() => {
    fetchClientes();
    fetchVeiculos();
    fetchLocacoesAtivas();
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

  const fetchLocacoesAtivas = async () => {
    try {
      const res = await api.get<LocacaoAtiva[]>('/locacoes');
      const ativas = res.data.filter(l => l.status === 'ATIVA');
      setLocacoesAtivas(ativas);
    } catch (err) {
      console.error('Erro ao buscar locações', err);
    }
  };

  const handleFinalizarLocacao = async (locacaoId: number) => {
    if (!dataEntrega || !valorFinal) {
      setError('Preencha a data de entrega e o valor final');
      return;
    }

    try {
      setLoading(true);
      await api.post(`/locacoes/${locacaoId}/finalizar`, {
        valorFinal: parseFloat(valorFinal),
      });
      setLocacoesAtivas((prev) => prev.filter(l => l.id !== locacaoId));
      setFinalizandoId(null);
      setDataEntrega('');
      setValorFinal('');
      setError('');
      await fetchVeiculos();
      await fetchLocacoesAtivas();
    } catch (err: any) {
      console.error('Erro ao finalizar locação', err);
      setError(err?.response?.data?.message || 'Erro ao finalizar locação');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelarLocacao = async (locacaoId: number) => {
    if (!window.confirm('Tem certeza que deseja cancelar esta locação? Esta ação não pode ser desfeita.')) {
      return;
    }

    try {
      setLoading(true);
      await api.delete(`/locacoes/${locacaoId}`);
      setLocacoesAtivas((prev) => prev.filter(l => l.id !== locacaoId));
      setError('');
      await fetchVeiculos();
      await fetchLocacoesAtivas();
    } catch (err: any) {
      console.error('Erro ao cancelar locação', err);
      setError(err?.response?.data?.message || 'Erro ao cancelar locação');
    } finally {
      setLoading(false);
    }
  };

  const calcularTotal = (dataInicio: string, dataFim: string): number => {
    if (!dataInicio || !dataFim) return 0;
    const inicio = new Date(dataInicio);
    const fim = new Date(dataFim);
    const dias = Math.ceil((fim.getTime() - inicio.getTime()) / (1000 * 60 * 60 * 24));
    
    const veiculo = veiculos.find(v => v.id === selection.veiculoId);
    const tarifa = veiculo?.categoria?.tarifaDiaria || 150;
    return dias * tarifa;
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
        <h1>Locações</h1>
        <p>Gerenciar aluguel de veículos</p>
      </div>

      <div className="locacoes-tabs">
        <button 
          className={`tab ${tab === 'criar' ? 'active' : ''}`}
          onClick={() => setTab('criar')}
        >
          ➕ Nova Locação
        </button>
        <button 
          className={`tab ${tab === 'gerenciar' ? 'active' : ''}`}
          onClick={() => { setTab('gerenciar'); fetchLocacoesAtivas(); }}
        >
          📋 Gerenciar Locações ({locacoesAtivas.length})
        </button>
      </div>

      {error && <div style={{ padding: '1rem', backgroundColor: '#fee', color: '#c00', borderRadius: '4px', marginBottom: '1rem' }}>{error}</div>}

      {tab === 'criar' ? (
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
                    <small>{veiculo.ano} - {veiculo.categoria?.nome || 'N/A'}</small>
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
      ) : (
        <div className="gerenciar-locacoes">
          <div className="locacoes-lista">
            {locacoesAtivas.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '2rem', color: '#999' }}>
                <p>Nenhuma locação ativa no momento</p>
              </div>
            ) : (
              locacoesAtivas.map((locacao) => (
                <div key={locacao.id} className="locacao-card">
                  <div className="locacao-header">
                    <div>
                      <h3>{locacao.cliente.nome}</h3>
                      <p className="locacao-info">{locacao.veiculo.marca} {locacao.veiculo.modelo} - {locacao.veiculo.placa}</p>
                    </div>
                    <div className="locacao-dates">
                      <small>Retirada: {new Date(locacao.dataRetirada).toLocaleDateString('pt-BR')}</small>
                      <small>Devolução: {new Date(locacao.dataDevolucaoPrevista).toLocaleDateString('pt-BR')}</small>
                    </div>
                  </div>
                  
                  {finalizandoId === locacao.id ? (
                    <div className="locacao-finalizar">
                      <h4>Finalizar Locação</h4>
                      <div className="form-group">
                        <label>Data da Entrega</label>
                        <input
                          type="date"
                          value={dataEntrega}
                          onChange={(e) => setDataEntrega(e.target.value)}
                          max={new Date().toISOString().split('T')[0]}
                        />
                      </div>
                      <div className="form-group">
                        <label>Valor Final (R$)</label>
                        <input
                          type="number"
                          step="0.01"
                          value={valorFinal}
                          onChange={(e) => setValorFinal(e.target.value)}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="form-actions">
                        <button
                          className="btn-confirm"
                          onClick={() => handleFinalizarLocacao(locacao.id)}
                          disabled={loading}
                        >
                          <Check size={16} /> Confirmar Entrega
                        </button>
                        <button
                          className="btn-cancel"
                          onClick={() => { setFinalizandoId(null); setDataEntrega(''); setValorFinal(''); }}
                          disabled={loading}
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="locacao-actions">
                      <button
                        className="btn-finalizar"
                        onClick={() => setFinalizandoId(locacao.id)}
                        title="Registrar devolução e finalizar locação"
                      >
                        <Check size={16} /> Finalizar/Entregar
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleCancelarLocacao(locacao.id)}
                        title="Cancelar locação"
                      >
                        <Trash size={16} /> Cancelar
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
