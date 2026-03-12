import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash } from 'tabler-icons-react';
import Modal from '../components/Modal';
import './Veiculos.css';
import { api } from '../services/api';

type BackendStatus = 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO' | 'INATIVO' | 'VENDIDO';

interface Categoria {
  id: number;
  nome: string;
}

interface Veiculo {
  id: number;
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoria: Categoria;
  status: BackendStatus;
}

interface VeiculoFormData {
  placa: string;
  marca: string;
  modelo: string;
  ano: number;
  categoriaId: number | '';
}

interface VeiculoFormProps {
  initialData?: VeiculoFormData;
  categorias: Categoria[];
  onSubmit: (data: VeiculoFormData) => void;
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedVeiculo, setSelectedVeiculo] = useState<Veiculo | null>(null);

  const statusColor: Record<BackendStatus, string> = {
    'DISPONIVEL': 'available',
    'ALUGADO': 'rented',
    'EM_MANUTENCAO': 'maintenance',
    'INATIVO': 'maintenance',
    'VENDIDO': 'maintenance',
  };

  const statusLabel: Record<BackendStatus, string> = {
    'DISPONIVEL': 'Disponível',
    'ALUGADO': 'Locado',
    'EM_MANUTENCAO': 'Em Manutenção',
    'INATIVO': 'Inativo',
    'VENDIDO': 'Vendido',
  };

  useEffect(() => {
    fetchVeiculos();
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await api.get<Categoria[]>('/categorias');
      setCategorias(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias', err);
    }
  };

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
      const payload = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        categoria: { id: data.categoriaId },
      };
      const res = await api.post<Veiculo>('/veiculos', payload);
      setVeiculos((prev) => [...prev, res.data]);
      setIsNewModalOpen(false);
    } catch (err: any) {
      console.error('Erro ao criar veículo', err);
      alert(err?.response?.data?.message || 'Erro ao criar veículo');
    }
  };

  const handleEditVeiculo = async (data: VeiculoFormData) => {
    if (!selectedVeiculo) return;
    try {
      const payload = {
        placa: data.placa,
        marca: data.marca,
        modelo: data.modelo,
        ano: data.ano,
        categoria: { id: data.categoriaId },
      };
      await api.put(`/veiculos/${selectedVeiculo.id}`, payload);
      setVeiculos((prev) => prev.map(v => v.id === selectedVeiculo.id ? { ...v, ...payload } as Veiculo : v));
      setIsEditModalOpen(false);
      setSelectedVeiculo(null);
    } catch (err: any) {
      console.error('Erro ao atualizar veículo', err);
      alert(err?.response?.data?.message || 'Erro ao atualizar veículo');
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
                <td>{veiculo.categoria?.nome || '-'}</td>
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
        <VeiculoForm categorias={categorias} onSubmit={handleNewVeiculo} />
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
            categorias={categorias}
            initialData={{
              placa: selectedVeiculo.placa,
              marca: selectedVeiculo.marca,
              modelo: selectedVeiculo.modelo,
              ano: selectedVeiculo.ano,
              categoriaId: selectedVeiculo.categoria?.id || ''
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

function VeiculoForm({ initialData, categorias, onSubmit }: VeiculoFormProps) {
  const [formData, setFormData] = useState<VeiculoFormData>(
    initialData || {
      placa: '',
      marca: '',
      modelo: '',
      ano: new Date().getFullYear(),
      categoriaId: '',
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
    if (!formData.categoriaId) newErrors.categoriaId = 'Categoria é obrigatória';

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
          value={formData.categoriaId}
          onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
        >
          <option value="">Selecione uma categoria</option>
          {categorias.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nome}</option>
          ))}
        </select>
        {errors.categoriaId && <span className="error">{errors.categoriaId}</span>}
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
        {initialData ? 'Atualizar' : 'Criar'} Veículo
      </button>
    </form>
  );
}

