import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AuthGate from './components/AuthGate';
import CustomerApp from './components/CustomerApp';
import BusinessApp from './components/BusinessApp';
import AdminApp from './components/AdminApp';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AuthGate />} />
        <Route path="/customer/*" element={<CustomerApp />} />
        <Route path="/business/*" element={<BusinessApp />} />
        <Route path="/admin/*" element={<AdminApp />} />
      </Routes>
    </Router>
  );
}

export default App;
