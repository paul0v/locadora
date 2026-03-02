import { useState } from 'react';
import { Search, Plus, Edit, Trash } from 'tabler-icons-react';
import Modal from '../components/Modal';
import './Veiculos.css';

interface Veiculo {
  id: number;
  nome: string;
  marca: string;
  placa: string;
  categoria: string;
  diaria: string;
  status: 'Disponível' | 'Locado' | 'Manutenção';
}

interface VeiculoFormData {
  nome: string;
  marca: string;
  placa: string;
  categoria: string;
  diaria: string;
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([
    { id: 1, nome: 'Polo', marca: 'VW - 2023', placa: 'ABC-1234', categoria: 'Econômico', diaria: 'R$ 120.00', status: 'Disponível' },
    { id: 2, nome: 'Corolla', marca: 'Toyota - 2024', placa: 'XYZ-9876', categoria: 'Sedan Premium', diaria: 'R$ 280.00', status: 'Locado' },
    { id: 3, nome: 'Renegade', marca: 'Jeep - 2023', placa: 'KJF-4432', categoria: 'SUV', diaria: 'R$ 220.00', status: 'Manutenção' },
    { id: 4, nome: 'Cronos', marca: 'Fiat - 2022', placa: 'PQP-1010', categoria: 'Sedan', diaria: 'R$ 150.00', status: 'Disponível' },
  ]);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);

  const statusColor = {
    'Disponível': 'available',
    'Locado': 'rented',
    'Manutenção': 'maintenance',
  };

  const handleNewVeiculo = (data: VeiculoFormData) => {
    const newVeiculo: Veiculo = {
      id: Math.max(...veiculos.map(v => v.id), 0) + 1,
      ...data,
      status: 'Disponível',
    };
    setVeiculos([...veiculos, newVeiculo]);
    setIsNewModalOpen(false);
  };

  const handleEditVeiculo = (data: VeiculoFormData) => {
    if (!selectedVeiculo) return;
    setVeiculos(veiculos.map(v => v.id === selectedVeiculo.id ? { ...v, ...data } : v));
    setIsEditModalOpen(false);
    setSelectedVeiculo(null);
  };

  const handleDeleteVeiculo = () => {
    if (!selectedVeiculo) return;
    setVeiculos(veiculos.filter(v => v.id !== selectedVeiculo.id));
    setIsDeleteModalOpen(false);
    setSelectedVeiculo(null);
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
    v.nome.toLowerCase().includes(search.toLowerCase()) ||
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
              <th>Veículo</th>
              <th>Placa</th>
              <th>Categoria</th>
              <th>Diária</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredVeiculos.map((veiculo) => (
              <tr key={veiculo.id}>
                <td>
                  <div className="veiculo-info">
                    <strong>{veiculo.nome}</strong>
                    <small>{veiculo.marca}</small>
                  </div>
                </td>
                <td>{veiculo.placa}</td>
                <td>{veiculo.categoria}</td>
                <td>{veiculo.diaria}</td>
                <td>
                  <span className={`status ${statusColor[veiculo.status]}`}>
                    {veiculo.status}
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
              nome: selectedVeiculo.nome,
              marca: selectedVeiculo.marca,
              placa: selectedVeiculo.placa,
              categoria: selectedVeiculo.categoria,
              diaria: selectedVeiculo.diaria.replace('R$ ', '').replace('.00', ''),
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
        <p>Tem certeza que deseja deletar o veículo <strong>{selectedVeiculo?.nome}</strong> ({selectedVeiculo?.placa})?</p>
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
      nome: '',
      marca: '',
      placa: '',
      categoria: '',
      diaria: '',
    }
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!formData.nome.trim()) newErrors.nome = 'Nome é obrigatório';
    if (!formData.placa.trim()) newErrors.placa = 'Placa é obrigatória';
    if (!formData.categoria.trim()) newErrors.categoria = 'Categoria é obrigatória';
    if (!formData.diaria.trim()) newErrors.diaria = 'Diária é obrigatória';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit(formData);
  };

  return (
    <form className="veiculo-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label>Nome do Veículo</label>
        <input
          type="text"
          value={formData.nome}
          onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
          placeholder="Ex: Polo"
        />
        {errors.nome && <span className="error">{errors.nome}</span>}
      </div>

      <div className="form-group">
        <label>Marca e Ano</label>
        <input
          type="text"
          value={formData.marca}
          onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
          placeholder="Ex: VW - 2023"
        />
      </div>

      <div className="form-group">
        <label>Placa</label>
        <input
          type="text"
          value={formData.placa}
          onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
          placeholder="Ex: ABC-1234"
        />
        {errors.placa && <span className="error">{errors.placa}</span>}
      </div>

      <div className="form-group">
        <label>Categoria</label>
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

      <div className="form-group">
        <label>Diária (R$)</label>
        <input
          type="number"
          step="0.01"
          value={formData.diaria}
          onChange={(e) => setFormData({ ...formData, diaria: e.target.value })}
          placeholder="Ex: 120.00"
        />
        {errors.diaria && <span className="error">{errors.diaria}</span>}
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
        {initialData ? 'Atualizar' : 'Criar'} Veículo
      </button>
    </form>
  );
}
