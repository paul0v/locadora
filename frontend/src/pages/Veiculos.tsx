import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash, Calendar } from 'tabler-icons-react';
import Modal from '../components/Modal';
import './Veiculos.css';
import api from '../services/api';

type BackendStatus = 'DISPONIVEL' | 'ALUGADO' | 'EM_MANUTENCAO' | 'INATIVO' | 'VENDIDO';
type StatusLocacao = 'ATIVA' | 'FINALIZADA' | 'CANCELADA';

interface Categoria {
  id: number;
  nome: string;
  tarifaDiaria?: number;
}

interface Cliente {
  id: number;
  nome: string;
}

interface Locacao {
  id: number;
  veiculo: Veiculo;
  cliente: Cliente;
  dataRetirada: string;
  dataDevolucaoPrevista: string;
  dataDevolucaoEfetiva: string | null;
  valorPrevisto: number;
  status: StatusLocacao;
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
  onAddCategoria?: (categoria: Categoria) => void;
}

export default function Veiculos() {
  const [veiculos, setVeiculos] = useState<Veiculo[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [locacoes, setLocacoes] = useState<Locacao[]>([]);
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
    fetchLocacoes();
  }, []);

  const fetchCategorias = async () => {
    try {
      const res = await api.get<Categoria[]>('/categorias');
      setCategorias(res.data);
    } catch (err) {
      console.error('Erro ao buscar categorias', err);
    }
  };

  const fetchLocacoes = async () => {
    try {
      const res = await api.get<Locacao[]>('/locacoes');
      setLocacoes(res.data);
    } catch (err) {
      console.error('Erro ao buscar locações', err);
    }
  };

  const getAvailabilityInfo = (veiculo: Veiculo) => {
    if (veiculo.status === 'DISPONIVEL') {
      return {
        text: 'Disponível agora',
        daysRemaining: 0,
        returnDate: null,
      };
    }

    const activeLocacao = locacoes.find(
      l => l.veiculo.id === veiculo.id && l.status === 'ATIVA'
    );

    if (!activeLocacao) {
      return {
        text: 'Situação desconhecida',
        daysRemaining: -1,
        returnDate: null,
      };
    }

    const returnDate = new Date(activeLocacao.dataDevolucaoPrevista);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    returnDate.setHours(0, 0, 0, 0);

    const daysRemaining = Math.ceil((returnDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const options: Intl.DateTimeFormatOptions = { day: '2-digit', month: '2-digit', year: 'numeric' };
    const formattedDate = returnDate.toLocaleDateString('pt-BR', options);

    if (daysRemaining <= 0) {
      return {
        text: 'Deveria estar disponível',
        daysRemaining: 0,
        returnDate: formattedDate,
      };
    }

    return {
      text: `Disponível em ${daysRemaining} dia${daysRemaining !== 1 ? 's' : ''}`,
      daysRemaining,
      returnDate: formattedDate,
    };
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

  const handleAddCategoria = (categoria: Categoria) => {
    setCategorias((prev) => [...prev, categoria]);
  };

  const handleChangeStatus = async (veiculoId: number, newStatus: BackendStatus) => {
    try {
      await api.put(`/veiculos/${veiculoId}`, { status: newStatus });
      setVeiculos((prev) =>
        prev.map(v => v.id === veiculoId ? { ...v, status: newStatus } : v)
      );
    } catch (err: any) {
      console.error('Erro ao alterar status do veículo', err);
      alert(err?.response?.data?.message || 'Erro ao alterar status');
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
              <th>Próxima Disponibilidade</th>
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
                  <select
                    value={veiculo.status}
                    onChange={(e) => handleChangeStatus(veiculo.id, e.target.value as BackendStatus)}
                    className={`status-select ${statusColor[veiculo.status]}`}
                    title="Clique para alterar o status"
                  >
                    <option value="DISPONIVEL">Disponível</option>
                    <option value="EM_MANUTENCAO">Em Manutenção</option>
                    <option value="INATIVO">Inativo</option>
                    <option value="VENDIDO">Vendido</option>
                  </select>
                </td>
                <td>
                  <div className="availability-cell">
                    <Calendar size={16} />
                    <div>
                      <div className="availability-text">{getAvailabilityInfo(veiculo).text}</div>
                      {getAvailabilityInfo(veiculo).returnDate && (
                        <div className="availability-date">{getAvailabilityInfo(veiculo).returnDate}</div>
                      )}
                    </div>
                  </div>
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
        {isNewModalOpen && (
          <VeiculoForm 
            key={`new-${categorias.length}`}
            categorias={categorias} 
            onSubmit={handleNewVeiculo}
            onAddCategoria={handleAddCategoria}
          />
        )}
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
            key={`edit-${selectedVeiculo.id}-${categorias.length}`}
            categorias={categorias}
            initialData={{
              placa: selectedVeiculo.placa,
              marca: selectedVeiculo.marca,
              modelo: selectedVeiculo.modelo,
              ano: selectedVeiculo.ano,
              categoriaId: selectedVeiculo.categoria?.id || ''
            }}
            onSubmit={handleEditVeiculo}
            onAddCategoria={handleAddCategoria}
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

function VeiculoForm({ initialData, categorias, onSubmit, onAddCategoria }: VeiculoFormProps) {
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
  const [showNewCategoriaForm, setShowNewCategoriaForm] = useState(false);
  const [newCategoriaData, setNewCategoriaData] = useState({ nome: '', tarifaDiaria: '' });
  const [localCategorias, setLocalCategorias] = useState(categorias);

  useEffect(() => {
    setLocalCategorias(categorias);
  }, [categorias]);

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

  const handleCreateCategoria = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newCategoriaData.nome.trim() || !newCategoriaData.tarifaDiaria) {
      alert('Preencha todos os campos da categoria');
      return;
    }

    try {
      const res = await api.post<Categoria>('/categorias', {
        nome: newCategoriaData.nome,
        tarifaDiaria: parseFloat(newCategoriaData.tarifaDiaria),
      });
      
      onAddCategoria?.(res.data);
      setFormData({ ...formData, categoriaId: res.data.id });
      setShowNewCategoriaForm(false);
      setNewCategoriaData({ nome: '', tarifaDiaria: '' });
    } catch (err: any) {
      console.error('Erro ao criar categoria', err);
      alert(err?.response?.data?.message || 'Erro ao criar categoria');
    }
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
        <div style={{ display: 'flex', gap: '8px', alignItems: 'flex-start' }}>
          <select
            value={formData.categoriaId}
            onChange={(e) => setFormData({ ...formData, categoriaId: Number(e.target.value) })}
            style={{ flex: 1 }}
          >
            <option value="">Selecione uma categoria</option>
            {localCategorias.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.nome}</option>
            ))}
          </select>
          <button
            type="button"
            onClick={() => setShowNewCategoriaForm(!showNewCategoriaForm)}
            className="btn-secondary"
            title="Adicionar nova categoria"
          >
            +
          </button>
        </div>
        {errors.categoriaId && <span className="error">{errors.categoriaId}</span>}
        
        {showNewCategoriaForm && (
          <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#f9f9f9', borderRadius: '6px', border: '1px solid #e0e0e0' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '13px', fontWeight: 600 }}>Nova Categoria</h4>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Nome *</label>
              <input
                type="text"
                value={newCategoriaData.nome}
                onChange={(e) => setNewCategoriaData({ ...newCategoriaData, nome: e.target.value })}
                placeholder="Ex: Sedan, SUV"
                style={{ fontSize: '13px', padding: '8px' }}
              />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '12px' }}>Tarifa Diária (R$) *</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={newCategoriaData.tarifaDiaria}
                onChange={(e) => setNewCategoriaData({ ...newCategoriaData, tarifaDiaria: e.target.value })}
                placeholder="Ex: 150.00"
                style={{ fontSize: '13px', padding: '8px' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                type="button"
                onClick={handleCreateCategoria}
                className="btn-primary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Criar
              </button>
              <button
                type="button"
                onClick={() => setShowNewCategoriaForm(false)}
                className="btn-secondary"
                style={{ flex: 1, padding: '8px', fontSize: '13px' }}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}
      </div>

      <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
        {initialData ? 'Atualizar' : 'Criar'} Veículo
      </button>
    </form>
  );
}

