import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogOut, BookOpen, User, Shield, Menu, X } from 'lucide-react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';

export default function Navbar() {
  const [user, setUser] = useState<any>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      setUser(u);
      if (u) {
        const docRef = doc(db, 'users', u.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      } else {
        setUserData(null);
      }
    });
    return unsubscribe;
  }, []);

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2 text-brand-blue font-bold text-xl">
              <BookOpen className="w-8 h-8" />
              <span>Formaburo Haïti</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link to="/cours" className="text-slate-600 hover:text-brand-blue font-medium">Cours</Link>
            {user ? (
              <>
                <Link to="/dashboard" className="text-slate-600 hover:text-brand-blue font-medium flex items-center gap-1">
                  <User size={18} /> Dashboard
                </Link>
                {userData?.role === 'admin' && (
                  <Link to="/admin" className="text-slate-600 hover:text-brand-blue font-medium flex items-center gap-1">
                    <Shield size={18} /> Admin
                  </Link>
                )}
                <button onClick={handleLogout} className="text-slate-600 hover:text-red-600 font-medium flex items-center gap-1">
                  <LogOut size={18} /> Déconnexion
                </button>
              </>
            ) : (
              <>
                <Link to="/connexion" className="text-slate-600 hover:text-brand-blue font-medium">Connexion</Link>
                <Link to="/inscription" className="btn-primary">S'inscrire</Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-slate-600 hover:text-brand-blue p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-slate-100 py-4 px-4 space-y-4">
          <Link to="/cours" className="block text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Cours</Link>
          {user ? (
            <>
              <Link to="/dashboard" className="block text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
              {userData?.role === 'admin' && (
                <Link to="/admin" className="block text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Admin</Link>
              )}
              <button onClick={handleLogout} className="block w-full text-left text-red-600 font-medium py-2">Déconnexion</button>
            </>
          ) : (
            <>
              <Link to="/connexion" className="block text-slate-600 font-medium py-2" onClick={() => setIsMenuOpen(false)}>Connexion</Link>
              <Link to="/inscription" className="block btn-primary text-center" onClick={() => setIsMenuOpen(false)}>S'inscrire</Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
}
