/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Auth from './pages/Auth';
import Payment from './pages/Payment';
import Dashboard from './pages/Dashboard';
import Admin from './pages/Admin';

export default function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cours" element={<Courses />} />
            <Route path="/inscription" element={<Auth initialMode="signup" />} />
            <Route path="/connexion" element={<Auth initialMode="login" />} />
            <Route path="/paiement/:courseId" element={<Payment />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <footer className="bg-white border-t border-slate-100 py-12 mt-20">
          <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
            <div className="text-brand-blue font-bold text-xl uppercase tracking-tighter">Formaburo Haïti</div>
            <p className="text-slate-500 text-sm max-w-md mx-auto">
              La première plateforme d'apprentissage bureautique par paiement mobile en Haïti.
            </p>
            <div className="pt-8 text-[10px] text-slate-300 uppercase tracking-widest font-bold">
              © 2026 Formaburo Haïti. Tous droits réservés.
            </div>
          </div>
        </footer>
      </div>
    </Router>
  );
}
