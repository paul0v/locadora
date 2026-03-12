import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { NotificationProvider, useNotification } from './context/NotificationContext';
import { NotificationContainer } from './components/Notification';
import { setErrorNotificationCallback } from './services/api';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Clientes from './pages/Clientes';
import Veiculos from './pages/Veiculos';
import Locacoes from './pages/Locacoes';
import Relatorios from './pages/Relatorios';
import './App.css';

function AppContent() {
  const { addNotification } = useNotification();

  // Setup error callback para o API
  useEffect(() => {
    setErrorNotificationCallback((notification) => {
      addNotification(notification);
    });
  }, [addNotification]);

  return (
    <>
      <NotificationContainer />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/clientes" element={<Clientes />} />
            <Route path="/veiculos" element={<Veiculos />} />
            <Route path="/locacoes" element={<Locacoes />} />
            <Route path="/relatorios" element={<Relatorios />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <NotificationProvider>
        <AppContent />
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
