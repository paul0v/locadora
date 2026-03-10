import { useEffect, useState } from 'react';
import { Search, Plus, Edit, Trash } from 'tabler-icons-react';
import { api } from '../services/api';
import Modal from '../components/Modal';
import ClienteForm, { ClienteFormData } from '../components/ClienteForm';
import './Clientes.css';

interface Cliente {
  id: number;
  nome: string;
  cpf: string;
  telefone: string;
  email: string;
  cnh: string;
}

export default function Clientes() {
  const [clientes, setClientes] = useState<Cliente[]>([
    { id: 1, nome: 'Ana Beatriz Silva', cpf: '123.456.789-00', telefone: '(11) 98765-4321', email: 'ana.beatriz@email.com', cnh: 'ABC12345' },
    { id: 2, nome: 'Carlos Eduardo Oliveira', cpf: '987.654.321-11', telefone: '(21) 97654-3210', email: 'carlos.oliver@email.com', cnh: 'XYZ67890' },
    { id: 3, nome: 'Juliana Santos', cpf: '456.789.123-22', telefone: '(31) 96543-2109', email: 'juju.santos@email.com', cnh: 'DEF45678' },
    { id: 4, nome: 'Ricardo Ferreira', cpf: '789.123.456-33', telefone: '(41) 95432-1098', email: 'ric.fer@email.com', cnh: 'GHI90123' },
  ]);
  const [search, setSearch] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<Cliente | null>(null);

  async function carregarClientes() {
    try {
      const response = await api.get('/clientes');
      setClientes(response.data);
    } catch (error) {
      console.log('Usando dados mock - API indisponível');
    }
  }

  useEffect(() => {
    carregarClientes();
  }, []);

  const filteredClientes = clientes.filter((c) =>
    c.nome.toLowerCase().includes(search.toLowerCase()) || c.cpf.includes(search)
  );

  const handleNewCliente = async (data: ClienteFormData) => {
    try {
      const response = await api.post('/clientes', data);
      setClientes([...clientes, response.data]);
      setIsNewModalOpen(false);
    } catch (error) {
      alert('Erro ao criar cliente');
    }
  };

  const handleEditCliente = async (data: ClienteFormData) => {
    if (!selectedCliente) return;
    try {
      await api.put(`/clientes/${selectedCliente.id}`, data);
      setClientes(
        clientes.map((c) =>
          c.id === selectedCliente.id
            ? { ...c, ...data }
            : c
        )
      );
      setIsEditModalOpen(false);
      setSelectedCliente(null);
    } catch (error) {
      alert('Erro ao atualizar cliente');
    }
  };

  const handleDeleteCliente = async () => {
    if (!selectedCliente) return;
    try {
      await api.delete(`/clientes/${selectedCliente.id}`);
      setClientes(clientes.filter((c) => c.id !== selectedCliente.id));
      setIsDeleteModalOpen(false);
      setSelectedCliente(null);
    } catch (error) {
      alert('Erro ao deletar cliente');
    }
  };

  const openEditModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (cliente: Cliente) => {
    setSelectedCliente(cliente);
    setIsDeleteModalOpen(true);
  };

  return (
    <div className="clientes-page">
      <div className="page-header">
        <h1>Clientes</h1>
        <p>Gerencie a base de clientes cadastrados</p>
      </div>

      <div className="page-actions">
        <div className="search-box">
          <Search size={20} />
          <input
            type="text"
            placeholder="Buscar por nome ou CPF..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button className="btn-primary" onClick={() => setIsNewModalOpen(true)}>
          <Plus size={18} />
          Novo Cliente
        </button>
      </div>

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Nome</th>
              <th>CPF</th>
              <th>Telefone</th>
              <th>Email</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {filteredClientes.map((cliente) => (
              <tr key={cliente.id}>
                <td>{cliente.nome}</td>
                <td>{cliente.cpf}</td>
                <td>{cliente.telefone}</td>
                <td>{cliente.email}</td>
                <td className="table-actions">
                  <button
                    className="btn-icon"
                    onClick={() => openEditModal(cliente)}
                    title="Editar"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    className="btn-icon delete"
                    onClick={() => openDeleteModal(cliente)}
                    title="Deletar"
                  >
                    <Trash size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Modal para novo cliente */}
      <Modal
        isOpen={isNewModalOpen}
        title="Novo Cliente"
        onClose={() => setIsNewModalOpen(false)}
        confirmText=""
        cancelText="Cancelar"
      >
        <ClienteForm onSubmit={handleNewCliente} />
      </Modal>

      {/* Modal para editar cliente */}
      <Modal
        isOpen={isEditModalOpen}
        title="Editar Cliente"
        onClose={() => {
          setIsEditModalOpen(false);
          setSelectedCliente(null);
        }}
        confirmText=""
        cancelText="Cancelar"
      >
        {selectedCliente && (
          <ClienteForm onSubmit={handleEditCliente} initialData={selectedCliente} />
        )}
      </Modal>

      {/* Modal para deletar cliente */}
      <Modal
        isOpen={isDeleteModalOpen}
        title="Deletar Cliente"
        onClose={() => {
          setIsDeleteModalOpen(false);
          setSelectedCliente(null);
        }}
        onConfirm={handleDeleteCliente}
        confirmText="Deletar"
        cancelText="Cancelar"
        isDangerous
      >
        <p>Tem certeza que deseja deletar o cliente <strong>{selectedCliente?.nome}</strong>?</p>
        <p style={{ color: '#666', fontSize: '14px' }}>Esta ação não pode ser desfeita.</p>
      </Modal>
    </div>
  );
}