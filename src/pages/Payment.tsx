import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../lib/firebase';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { onAuthStateChanged } from 'firebase/auth';
import { motion } from 'motion/react';
import { Smartphone, Info, SmartphoneIcon as PhoneIphone, CheckCircle2, ChevronRight } from 'lucide-react';

export default function Payment() {
  const { courseId } = useParams();
  const [course, setCourse] = useState<any>(null);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const [paymentData, setPaymentData] = useState({
    numero: '',
    methode: 'MonCash',
    codeTransaction: ''
  });

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      if (!u) navigate('/connexion');
      setUser(u);
    });
    return unsub;
  }, [navigate]);

  useEffect(() => {
    const fetchCourse = async () => {
      if (!courseId) return;
      const docSnap = await getDoc(doc(db, 'courses', courseId));
      if (docSnap.exists()) {
        setCourse(docSnap.data());
      }
      setLoading(false);
    };
    fetchCourse();
  }, [courseId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !course || !courseId) return;
    setSubmitting(true);

    try {
      await addDoc(collection(db, 'payments'), {
        userId: user.uid,
        userName: user.displayName,
        courseId: courseId,
        courseTitle: course.titre,
        montant: course.prix,
        methode: paymentData.methode,
        numero: paymentData.numero,
        codeTransaction: paymentData.codeTransaction,
        statut: 'pending',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSuccess(true);
      setTimeout(() => navigate('/dashboard'), 3000);
    } catch (e) {
      console.error(e);
      alert('Une erreur est survenue lors de la validation du paiement.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="p-20 text-center">Chargement...</div>;
  if (!course) return <div className="p-20 text-center">Cours non trouvé.</div>;

  if (success) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-6">
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto"
        >
          <CheckCircle2 size={48} />
        </motion.div>
        <h1 className="text-3xl font-bold">Paiement Envoyé !</h1>
        <p className="text-slate-600">
          Votre demande est en cours de traitement. Un administrateur validera votre paiement sous peu.
        </p>
        <button onClick={() => navigate('/dashboard')} className="btn-primary">
          Aller au tableau de bord
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 grid md:grid-cols-2 gap-12">
      {/* Summary */}
      <div className="space-y-8">
        <div className="space-y-4">
          <Link to="/cours" className="text-brand-blue flex items-center gap-1 text-sm font-medium hover:underline">
            <ChevronRight size={16} className="rotate-180" /> Retour aux cours
          </Link>
          <h1 className="text-3xl font-bold">Résumé de l'inscription</h1>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
          <div className="flex justify-between border-b border-slate-50 pb-4">
            <span className="text-slate-500">Cours</span>
            <span className="font-bold">{course.titre}</span>
          </div>
          <div className="flex justify-between text-xl pt-2">
            <span className="font-medium text-slate-700">Total à payer</span>
            <span className="font-extrabold text-brand-blue">{course.prix} HTG</span>
          </div>
        </div>

        <div className="bg-blue-50 p-6 rounded-2xl space-y-4 border border-blue-100">
          <div className="flex items-center gap-3 text-brand-blue font-bold">
            <Info size={20} />
            <h2>Instructions de paiement</h2>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            Veuillez envoyer le montant exact (<strong>{course.prix} HTG</strong>) via <strong>MonCash</strong> ou <strong>NatCash</strong> au numéro suivant :
          </p>
          <div className="bg-white p-4 rounded-xl text-center border border-blue-200">
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold mb-1">Numéro de réception</p>
            <p className="text-2xl font-black text-slate-900 tracking-wider">509 4683 5644</p>
          </div>
          <p className="text-xs text-slate-500 italic">
            Une fois le transfert effectué, remplissez le formulaire ci-contre avec le code de transaction reçu par SMS.
          </p>
        </div>
      </div>

      {/* Form */}
      <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm space-y-8">
        <div className="space-y-2">
          <h2 className="text-2xl font-bold">Confirmation du paiement</h2>
          <p className="text-slate-500 text-sm">Saisissez les détails de votre transaction.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <label className="text-sm font-bold flex items-center gap-2">
              Méthode de paiement
            </label>
            <div className="grid grid-cols-2 gap-4">
              {['MonCash', 'NatCash'].map(m => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setPaymentData({...paymentData, methode: m})}
                  className={`py-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${
                    paymentData.methode === m 
                      ? 'border-brand-blue bg-blue-50 text-brand-blue' 
                      : 'border-slate-100 hover:border-slate-200 text-slate-500'
                  }`}
                >
                  {m === 'MonCash' ? <Smartphone size={24} /> : <PhoneIphone size={24} />}
                  <span className="font-bold">{m}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold">Votre numéro de téléphone</label>
            <input 
              required
              type="tel" 
              placeholder="509 XXXX XXXX"
              className="w-full border-2 border-slate-100 rounded-xl py-3 px-4 focus:border-brand-blue outline-none transition-colors"
              value={paymentData.numero}
              onChange={e => setPaymentData({...paymentData, numero: e.target.value})}
            />
          </div>

          <div className="space-y-1">
            <label className="text-sm font-bold">Code de transaction</label>
            <input 
              required
              type="text" 
              placeholder="Ex: MC-XXXXXX"
              className="w-full border-2 border-slate-100 rounded-xl py-3 px-4 focus:border-brand-blue outline-none transition-colors"
              value={paymentData.codeTransaction}
              onChange={e => setPaymentData({...paymentData, codeTransaction: e.target.value})}
            />
          </div>

          <button 
            type="submit" 
            disabled={submitting}
            className="btn-primary w-full py-4 text-lg font-bold shadow-lg shadow-blue-200"
          >
            {submitting ? 'Validation...' : 'Valider mon inscription'}
          </button>
        </form>
      </div>
    </div>
  );
}
