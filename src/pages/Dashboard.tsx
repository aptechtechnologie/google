import React, { useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { BookOpen, Clock, CheckCircle, XCircle, ExternalLink, Play } from 'lucide-react';

export default function Dashboard() {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, u => {
      if (!u) navigate('/connexion');
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    if (!user) return;
    const fetchMyPayments = async () => {
      try {
        const q = query(
          collection(db, 'payments'), 
          where('userId', '==', user.uid),
          orderBy('createdAt', 'desc')
        );
        const querySnapshot = await getDocs(q);
        setPayments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchMyPayments();
  }, [user]);

  if (loading) return <div className="p-20 text-center">Chargement de votre espace...</div>;

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-12">
      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold">Mon Tableau de Bord</h1>
        <p className="text-slate-600">Bienvenue, {user?.displayName}. Retrouvez ici vos formations et l'état de vos paiements.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Course Progress / Access */}
        <div className="lg:col-span-2 space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <BookOpen className="text-brand-blue" /> Mes Cours
          </h2>

          <div className="grid gap-6">
            {payments.filter(p => p.statut === 'validated').length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-4">
                <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto text-slate-300">
                  <Play size={32} />
                </div>
                <div className="space-y-2">
                  <p className="font-bold text-slate-900">Aucun cours actif pour le moment.</p>
                  <p className="text-slate-500 text-sm">Inscrivez-vous à une formation pour commencer votre apprentissage.</p>
                </div>
                <button onClick={() => navigate('/cours')} className="btn-secondary">Parcourir les cours</button>
              </div>
            ) : (
              payments.filter(p => p.statut === 'validated').map(p => (
                <div key={p.id} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-4">
                    <div className="bg-blue-50 p-3 rounded-xl text-brand-blue">
                      <BookOpen size={24} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">{p.courseTitle}</h3>
                      <p className="text-sm text-slate-500">Accès illimité aux vidéos et PDFs</p>
                    </div>
                  </div>
                  <button className="btn-primary flex items-center gap-2">
                    Accéder au cours <ExternalLink size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Payment History */}
        <div className="space-y-8">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Clock className="text-slate-400" /> Historique des paiements
          </h2>

          <div className="space-y-4">
            {payments.length === 0 ? (
              <p className="text-center py-10 text-slate-400 italic">Aucun historique.</p>
            ) : (
              payments.map(p => (
                <div key={p.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <span className="text-sm font-bold truncate max-w-[150px]">{p.courseTitle}</span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                      p.statut === 'validated' ? 'bg-green-100 text-green-700' :
                      p.statut === 'refused' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {p.statut === 'validated' ? 'Validé' : p.statut === 'refused' ? 'Refusé' : 'En attente'}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>{p.methode}</span>
                    <span className="font-mono">{p.codeTransaction}</span>
                  </div>
                  <div className="text-[10px] text-slate-400">
                    {p.createdAt?.toDate().toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
