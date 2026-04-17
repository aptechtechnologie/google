import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, getDocs, updateDoc, doc, orderBy, serverTimestamp, setDoc, getDoc, addDoc } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { Shield, Check, X, Search, RefreshCw, Plus, Trash2 } from 'lucide-react';

export default function Admin() {
  const [payments, setPayments] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [view, setView] = useState<'payments' | 'courses' | 'users'>('payments');
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();

  const [newCourse, setNewCourse] = useState({
    titre: '',
    description: '',
    prix: 0,
    category: 'Bureautique'
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async u => {
      if (!u) {
        navigate('/connexion');
        return;
      }
      
      const userRef = doc(db, 'users', u.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists() && userSnap.data().role === 'admin') {
        setIsAdmin(true);
        fetchData();
      } else if (u.email === 'belizairefrantzly152@gmail.com') {
        // Fallback for bootstrapped admin
        setIsAdmin(true);
        fetchData();
      } else {
        navigate('/dashboard');
      }
    });
    return unsub;
  }, [navigate]);

  const fetchData = async () => {
    setRefreshing(true);
    try {
      const pSnap = await getDocs(query(collection(db, 'payments'), orderBy('createdAt', 'desc')));
      setPayments(pSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const uSnap = await getDocs(collection(db, 'users'));
      setUsers(uSnap.docs.map(d => ({ id: d.id, ...d.data() })));

      const cSnap = await getDocs(collection(db, 'courses'));
      setCourses(cSnap.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdatePayment = async (paymentId: string, status: 'validated' | 'refused') => {
    try {
      await updateDoc(doc(db, 'payments', paymentId), {
        statut: status,
        updatedAt: serverTimestamp()
      });
      setPayments(payments.map(p => p.id === paymentId ? { ...p, statut: status } : p));
    } catch (e) {
      alert('Erreur: ' + e);
    }
  };

  const handleAddCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'courses'), newCourse);
      setNewCourse({ titre: '', description: '', prix: 0, category: 'Bureautique' });
      fetchData();
    } catch (e) {
      alert(e);
    }
  };

  if (loading) return <div className="p-20 text-center">Vérification des accès administrateur...</div>;
  if (!isAdmin) return null;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-brand-blue p-2 rounded-lg text-white">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold">Espace Administrateur</h1>
            <p className="text-sm text-slate-500">Gestion de la plateforme Formaburo</p>
          </div>
        </div>
        <button 
          onClick={fetchData} 
          disabled={refreshing}
          className="flex items-center gap-2 text-slate-500 hover:text-brand-blue font-medium transition-colors"
        >
          <RefreshCw size={18} className={refreshing ? 'animate-spin' : ''} /> Actualiser
        </button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200">
        {[
          { id: 'payments', label: 'Paiements', count: payments.filter(p => p.statut === 'pending').length },
          { id: 'courses', label: 'Cours', count: courses.length },
          { id: 'users', label: 'Utilisateurs', count: users.length }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setView(tab.id as any)}
            className={`px-6 py-4 font-bold text-sm flex items-center gap-2 border-b-2 transition-all ${
              view === tab.id 
                ? 'border-brand-blue text-brand-blue' 
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="bg-brand-blue text-white text-[10px] px-1.5 py-0.5 rounded-full">{tab.count}</span>
            )}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
        {view === 'payments' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Utilisateur</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Cours</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Détails</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Statut</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-bold text-sm">{p.userName || 'Utilisateur'}</div>
                      <div className="text-[10px] text-slate-500">{p.numero}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium">{p.courseTitle}</div>
                      <div className="text-[10px] text-slate-500">{p.montant} HTG</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-xs font-mono bg-slate-100 px-2 py-1 rounded inline-block">{p.codeTransaction}</div>
                      <div className="text-[10px] text-slate-400 mt-1">{p.methode}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        p.statut === 'validated' ? 'bg-green-100 text-green-700' :
                        p.statut === 'refused' ? 'bg-red-100 text-red-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {p.statut === 'validated' ? 'Validé' : p.statut === 'refused' ? 'Refusé' : 'En attente'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-2">
                        {p.statut === 'pending' && (
                          <>
                            <button 
                              onClick={() => handleUpdatePayment(p.id, 'validated')}
                              className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors"
                              title="Valider"
                            >
                              <Check size={18} />
                            </button>
                            <button 
                              onClick={() => handleUpdatePayment(p.id, 'refused')}
                              className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                              title="Refuser"
                            >
                              <X size={18} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">Aucun paiement enregistré.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}

        {view === 'courses' && (
          <div className="p-8 space-y-8">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Add Course Form */}
              <div className="bg-slate-50 p-6 rounded-2xl space-y-4">
                <h3 className="font-bold flex items-center gap-2"><Plus size={18} /> Ajouter un cours</h3>
                <form onSubmit={handleAddCourse} className="space-y-4">
                  <input 
                    required type="text" placeholder="Titre du cours" 
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                    value={newCourse.titre}
                    onChange={e => setNewCourse({...newCourse, titre: e.target.value})}
                  />
                  <textarea 
                    required placeholder="Description" rows={3}
                    className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                    value={newCourse.description}
                    onChange={e => setNewCourse({...newCourse, description: e.target.value})}
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input 
                      required type="number" placeholder="Prix (HTG)" 
                      className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                      value={newCourse.prix}
                      onChange={e => setNewCourse({...newCourse, prix: Number(e.target.value)})}
                    />
                    <select 
                      className="bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm"
                      value={newCourse.category}
                      onChange={e => setNewCourse({...newCourse, category: e.target.value})}
                    >
                      <option>Bureautique</option>
                      <option>Informatique</option>
                      <option>Carrière</option>
                    </select>
                  </div>
                  <button type="submit" className="btn-primary w-full py-2">Enregistrer le cours</button>
                </form>
              </div>

              {/* Course List */}
              <div className="space-y-4">
                <h3 className="font-bold uppercase text-xs text-slate-400 ml-1 tracking-widest">Liste des cours actuel</h3>
                <div className="space-y-3">
                  {courses.map(c => (
                    <div key={c.id} className="bg-white p-4 rounded-xl border border-slate-100 flex justify-between items-center group">
                      <div>
                        <div className="font-bold text-sm">{c.titre}</div>
                        <div className="text-[10px] text-brand-blue font-bold">{c.prix} HTG</div>
                      </div>
                      <div className="text-[10px] bg-slate-50 px-2 py-1 rounded font-medium text-slate-500">{c.category}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {view === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-100">
                <tr>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Nom</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Email</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400">Téléphone</th>
                  <th className="px-6 py-4 text-xs font-black uppercase text-slate-400 text-center">Rôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 text-sm font-bold">{u.nom}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{u.email}</td>
                    <td className="px-6 py-4 text-sm font-medium text-slate-600">{u.phone}</td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                        u.role === 'admin' ? 'bg-purple-100 text-purple-700' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {u.role}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
