import { useState } from 'react';
import { Download, Calendar } from 'tabler-icons-react';
import {
  BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts';
import './Relatorios.css';

const monthlyRevenueData = [
  { month: 'Jan', revenue: 4500 },
  { month: 'Fev', revenue: 5200 },
  { month: 'Mar', revenue: 3800 },
  { month: 'Abr', revenue: 6000 },
  { month: 'Mai', revenue: 5800 },
  { month: 'Jun', revenue: 7200 },
];

const categoryData = [
  { name: 'Sedan', value: 45 },
  { name: 'SUV', value: 30 },
  { name: 'Luxo', value: 15 },
  { name: 'Econômico', value: 10 },
];

const COLORS = ['#3b82f6', '#a855f7', '#f59e0b', '#10b981'];

export default function Relatorios() {
  const [dateFrom, setDateFrom] = useState('2026-01-01');
  const [dateTo, setDateTo] = useState('2026-06-30');

  const exportToExcel = () => {
    // Cria um CSV que Excel consegue abrir
    const headers = ['Mês', 'Receita (R$)'];
    const rows = monthlyRevenueData.map(d => [d.month, d.revenue.toFixed(2)]);
    
    const categoryHeaders = ['Categoria', 'Locações'];
    const categoryRows = categoryData.map(d => [d.name, d.value]);

    // Cria conteúdo CSV
    let csvContent = 'Receita Mensal\n';
    csvContent += headers.join(',') + '\n';
    rows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });
    
    csvContent += '\n\nLocações por Categoria\n';
    csvContent += categoryHeaders.join(',') + '\n';
    categoryRows.forEach(row => {
      csvContent += row.join(',') + '\n';
    });

    // Cria blob e download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `relatorio_locadora_${dateFrom}_${dateTo}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = () => {
    // Cria um documento PDF através de um iframe com HTML
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório Locadora</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          h1 { color: #1e3a8a; border-bottom: 2px solid #2563eb; padding-bottom: 10px; }
          h2 { color: #3b82f6; margin-top: 20px; }
          table { width: 100%; border-collapse: collapse; margin: 10px 0; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background: #f0f9ff; color: #1e40af; }
          .summary { background: #f0f9ff; padding: 15px; border-radius: 6px; margin: 10px 0; }
          .summary p { margin: 5px 0; font-size: 14px; }
          .footer { margin-top: 30px; font-size: 12px; color: #666; border-top: 1px solid #ddd; padding-top: 10px; }
        </style>
      </head>
      <body>
        <h1>📊 Relatório de Locações da Locadora</h1>
        <div class="summary">
          <p><strong>Período:</strong> ${dateFrom} a ${dateTo}</p>
          <p><strong>Data de Geração:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>

        <h2>Receita Mensal</h2>
        <table>
          <tr>
            <th>Mês</th>
            <th>Receita (R$)</th>
          </tr>
          ${monthlyRevenueData.map(d => `<tr><td>${d.month}</td><td>R$ ${d.revenue.toFixed(2)}</td></tr>`).join('')}
        </table>

        <h2>Locações por Categoria</h2>
        <table>
          <tr>
            <th>Categoria</th>
            <th>Quantidade de Locações</th>
          </tr>
          ${categoryData.map(d => `<tr><td>${d.name}</td><td>${d.value}</td></tr>`).join('')}
        </table>

        <div class="summary">
          <p><strong>Total de Receita:</strong> R$ ${monthlyRevenueData.reduce((sum, d) => sum + d.revenue, 0).toFixed(2)}</p>
          <p><strong>Total de Locações:</strong> ${categoryData.reduce((sum, d) => sum + d.value, 0)}</p>
        </div>

        <div class="footer">
          <p>Este é um relatório automático gerado pelo sistema de locação.</p>
        </div>
      </body>
      </html>
    `;

    const printWindow = window.open('', '', 'height=600,width=800');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      printWindow.print();
      setTimeout(() => printWindow.close(), 1000);
    }
  };

  return (
    <div className="relatorios-page">
      <div className="page-header">
        <h1>Relatórios</h1>
        <p>Analise o desempenho da sua locadora</p>
      </div>

      <div className="filters-section">
        <div className="date-filters">
          <div className="filter-group">
            <label><Calendar size={16} /> De</label>
            <input 
              type="date" 
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="filter-group">
            <label><Calendar size={16} /> Até</label>
            <input 
              type="date" 
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
        </div>
        <button className="btn-filter">🔽 Filtrar Resultados</button>
      </div>

      <div className="charts-grid">
        <div className="chart-card">
          <h3>Receita Mensal (R$)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyRevenueData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="month" stroke="#999" />
              <YAxis stroke="#999" />
              <Tooltip />
              <Bar dataKey="revenue" fill="#3b82f6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h3>Locações por Categoria</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={80}
                outerRadius={120}
                paddingAngle={2}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="export-section">
        <h3>Exportar Relatórios</h3>
        <div className="export-buttons">
          <button className="btn-export" onClick={exportToPDF}>
            <Download size={18} />
            Gerar PDF
          </button>
          <button className="btn-export" onClick={exportToExcel}>
            <Download size={18} />
            Exportar Excel
          </button>
        </div>
      </div>
    </div>
  );
}
