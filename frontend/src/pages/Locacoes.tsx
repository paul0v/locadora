import { useState } from 'react';
import { Plus, ChevronRight } from 'tabler-icons-react';
import './Locacoes.css';

interface SelectionData {
  cliente: string;
  veiculo: string;
  dataInicio: string;
  dataFim: string;
  total: string;
}

export default function Locacoes() {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [selection, setSelection] = useState<SelectionData>({
    cliente: '',
    veiculo: '',
    dataInicio: '',
    dataFim: '',
    total: 'R$ 0,00',
  });

  const clientes = [
    'Ana Silva',
    'Carlos Oliveira',
    'Juliana Santos',
    'Ricardo Ferreira',
  ];

  const veiculos = [
    { nome: 'VW Polo 2023', placa: 'ABC-1234', diaria: 'R$ 120.00' },
    { nome: 'Fiat Cronos 2022', placa: 'PQP-1010', diaria: 'R$ 150.00' },
  ];

  return (
    <div className="locacoes-page">
      <div className="page-header">
        <h1>Nova Locação</h1>
        <p>Selecione o cliente e o veículo disponível para iniciar</p>
      </div>

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
            <div className="search-group">
              <label>Buscar Cliente</label>
              <input
                type="text"
                placeholder="Selecione um cliente..."
                value={selection.cliente}
                onChange={(e) => setSelection({ ...selection, cliente: e.target.value })}
              />
            </div>
            <div className="clients-list">
              {clientes.map((cliente) => (
                <div
                  key={cliente}
                  className="client-item"
                  onClick={() => {
                    setSelection({ ...selection, cliente });
                    setStep(2);
                  }}
                >
                  <span>{cliente}</span>
                  <ChevronRight size={18} />
                </div>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <h3>
              <span className="step-icon">🚗</span> 2. Seleção de Veículo
            </h3>
            <div className="vehicles-grid">
              {veiculos.map((veiculo, idx) => (
                <div
                  key={idx}
                  className="vehicle-card"
                  onClick={() => {
                    setSelection({ ...selection, veiculo: veiculo.nome });
                    setStep(3);
                  }}
                >
                  <strong>{veiculo.nome}</strong>
                  <p>{veiculo.placa}</p>
                  <p className="price">{veiculo.diaria} / dia</p>
                </div>
              ))}
            </div>
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
                <input type="date" />
              </div>
              <div className="form-group">
                <label>Data Final</label>
                <input type="date" />
              </div>
            </div>
            <div className="summary">
              <h3>Resumo da Locação</h3>
              <div className="summary-row">
                <span>CLIENTE</span>
                <p>-</p>
              </div>
              <div className="summary-row">
                <span>VEÍCULO</span>
                <p>-</p>
              </div>
              <div className="summary-row">
                <span>TOTAL</span>
                <h2>R$ 0,00</h2>
                <small>Cálculo baseado em 5 dias</small>
              </div>
              <button className="btn-confirm">Confirmar Locação</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
