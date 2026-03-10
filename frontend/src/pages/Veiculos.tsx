import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash } from 'tabler-icons-react';
import Modal from '../components/Modal';
import './Veiculos.css';
import { api } from '../services/api';

type BackendStatus = 'DISPONIVEL' | 'ALUGADO' | 'MANUTENCAO';

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: string;
  status: BackendStatus;
}

interface VeiculoFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: string;
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);

  const statusColor = {
    'DISPONIVEL': 'available',
    'ALUGADO': 'rented',
    'MANUTENCAO': 'maintenance',
  } as Record<BackendStatus, string>;

  const statusLabel = {
    'DISPONIVEL': 'Disponível',
    'ALUGADO': 'Locado',
    'MANUTENCAO': 'Manutenção',
  } as Record<BackendStatus, string>;

  useEffect(() => {
    fetchVeiculos();
  }, []);

  const fetchVeiculos = async () => {
    try {
      const res = await api.get<Veiculo[]>('/veiculos');
      setVeiculos(res.data);
    } catch (err) {
      console.error('Erro ao buscar veículos', err);
    }
  };

  const handleNewVeiculo = async (data: VeiculoFormData) => {
    try {
      const res = await api.post<Veiculo>('/veiculos', data);
      setVeiculos((prev) => [...prev, res.data]);
      setIsNewModalOpen(false);
    } catch (err) {
      console.error('Erro ao criar veículo', err);
      alert('Erro ao criar veículo');
    }
  };

  const handleEditVeiculo = async (data: VeiculoFormData) => {
    if (!selectedVeiculo) return;
    try {
      await api.put(`/veiculos/${selectedVeiculo.id}`, data);
      setVeiculos((prev) => prev.map(v => v.id === selectedVeiculo.id ? { ...v, ...data } as Veiculo : v));
      setIsEditModalOpen(false);
      setSelectedVeiculo(null);
    } catch (err) {
      console.error('Erro ao atualizar veículo', err);
      alert('Erro ao atualizar veículo');
    }
  };

  const handleDeleteVeiculo = async () => {
    if (!selectedVeiculo) return;
    try {
      await api.delete(`/veiculos/${selectedVeiculo.id}`);
      setVeiculos((prev) => prev.filter(v => v.id !== selectedVeiculo.id));
      setIsDeleteModalOpen(false);
      setSelectedVeiculo(null);
    } catch (err) {
      console.error('Erro ao deletar veículo', err);
    }
  };

  const openEditModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (veiculo: Veiculo) => {
    setSelectedVeiculo(veiculo);
    setIsDeleteModalOpen(true);
  };

  const filteredVeiculos = veiculos.filter(v =>
    v.marca.toLowerCase().includes(search.toLowerCase()) ||
    v.placa.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="veiculos-page">
      <div className="page-header">
        <h1>Veículos</h1>
        <p>Gerencie a frota da locadora</p>
      </div>

      <div className="page-actions">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por placa ou modelo..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
          <Plus size={18} />
          Novo Veículo
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Placa</th>
              <th>Veículo</th>
              <th>Ano</th>
              <th>Categoria</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredVeiculos.map((veiculo) => (
              <tr key={veiculo.id}>
                <td><strong>{veiculo.placa}</strong></td>
                <td>{veiculo.marca} {veiculo.modelo}</td>
                <td>{veiculo.ano}</td>
                <td>{veiculo.categoria}</td>
                <td>
                  <span className={`status ${statusColor[veiculo.status]}`}>
                    {statusLabel[veiculo.status]}
                  </span>
                </td>
                <td className="table-actions">
                  <button className="btn-icon" onClick={() => openEditModal(veiculo)}>
                    <Edit size={16} />
                  </button>
                  <button className="btn-icon delete" onClick={() => openDeleteModal(veiculo)}>
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal
        isOpen={isNewModalOpen}
        title="Novo Veículo"
        onClose={() => setIsNewModalOpen(false)}
        onConfirm={() => {}}
        confirmText="Salvar"
      >
        <VeiculoForm onSubmit={handleNewVeiculo} />
      </Modal>

      <Modal
        isOpen={isEditModalOpen}
        title="Editar Veículo"
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedVeiculo(null);
        }}
        onConfirm={() => {}}
        confirmText="Atualizar"
      >
        {selectedVeiculo && (
          <VeiculoForm
            initialData={{
              placa: selectedVeiculo.placa,
              marca: selectedVeiculo.marca,
              modelo: selectedVeiculo.modelo,
              ano: selectedVeiculo.ano,
              categoria: selectedVeiculo.categoria,
            }}
            onSubmit={handleEditVeiculo}
          />
        )}
      </Modal>

      <Modal
        isOpen={isDeleteModalOpen}
        title="Confirmar Exclusão"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedVeiculo(null);
        }}
        onConfirm={handleDeleteVeiculo}
        confirmText="Deletar"
        isDangerous
      >
        <p>Tem certeza que deseja deletar o veículo <strong>{selectedVeiculo?.marca} {selectedVeiculo?.modelo}</strong> ({selectedVeiculo?.placa})?</p>
        <p style={{ color: '#666', fontSize: '0.9em' }}>Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}

interface VeiculoFormProps {
  initialData?: VeiculoFormData;
  onSubmit: (data: VeiculoFormData) => void;
}

function VeiculoForm({ initialData, onSubmit }: VeiculoFormProps) {
  const [formData, setFormData] = useState<VeiculoFormData>(
    initialData || {
      placa: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      categoria: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.placa.trim()) newErrors.placa = 'Placa é obrigatória';
    if (!formData.marca.trim()) newErrors.marca = 'Marca é obrigatória';
    if (!formData.modelo.trim()) newErrors.modelo = 'Modelo é obrigatório';
    if (!formData.ano) newErrors.ano = 'Ano é obrigatório';
    if (!formData.categoria.trim()) newErrors.categoria = 'Categoria é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="veiculo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Placa *</label>
        <input
          type="text"
          value={formData.placa}
          onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
          placeholder="Ex: ABC1234"
        />
        {errors.placa && <span className="error">{errors.placa}</span>}
      </div>

      <div className="form-group">
        <label>Marca *</label>
        <input
          type="text"
          value={formData.marca}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          placeholder="Ex: Toyota"
        />
        {errors.marca && <span className="error">{errors.marca}</span>}
      </div>

      <div className="form-group">
        <label>Modelo *</label>
        <input
          type="text"
          value={formData.modelo}
          onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
          placeholder="Ex: Corolla"
        />
        {errors.modelo && <span className="error">{errors.modelo}</span>}
      </div>

      <div className="form-group">
        <label>Ano *</label>
        <input
          type="number"
          value={formData.ano}
          onChange={(e) => setFormData({ ...formData, ano: parseInt(e.target.value) })}
          placeholder="Ex: 2023"
          min="1990"
          max={new Date().getFullYear()}
        />
        {errors.ano && <span className="error">{errors.ano}</span>}
      </div>

      <div className="form-group">
        <label>Categoria *</label>
        <select
          value={formData.categoria}
          onChange={(e) => setFormData({ ...formData, categoria: e.target.value })}
        >
          <option value="">Selecione uma categoria</option>
          <option value="Econômico">Econômico</option>
          <option value="Sedan">Sedan</option>
          <option value="Sedan Premium">Sedan Premium</option>
          <option value="SUV">SUV</option>
          <option value="Luxo">Luxo</option>
        </select>
        {errors.categoria && <span className="error">{errors.categoria}</span>}
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
        {initialData ? 'Atualizar' : 'Criar'} Veículo
      </button>
    </form>
  );
}
