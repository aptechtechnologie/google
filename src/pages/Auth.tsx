import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { auth, db } from '../lib/firebase';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, Phone, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function Auth({ initialMode = 'login' }: { initialMode?: 'login' | 'signup' }) {
  const [mode, setMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    nom: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'signup') {
        if (formData.password !== formData.confirmPassword) {
          throw new Error('Les mots de passe ne correspondent pas.');
        }
        if (formData.phone.length < 8) {
          throw new Error('Veuillez entrer un numéro de téléphone valide.');
        }

        const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
        await updateProfile(userCredential.user, { displayName: formData.nom });
        
        // Create user doc
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          nom: formData.nom,
          email: formData.email,
          phone: formData.phone,
          role: 'user',
          createdAt: serverTimestamp()
        });
      } else {
        await signInWithEmailAndPassword(auth, formData.email, formData.password);
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-4">
      <motion.div 
        layout
        className="auth-card space-y-8"
      >
        <div className="text-center space-y-2">
          <h2 className="text-3xl font-extrabold text-slate-900">
            {mode === 'login' ? 'Bon retour !' : 'Rejoignez-nous'}
          </h2>
          <p className="text-slate-600">
            {mode === 'login' ? 'Connectez-vous à votre espace étudiant' : 'Créez votre compte pour commencer'}
          </p>
        </div>

        {error && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-red-50 text-red-600 p-4 rounded-lg flex items-start gap-3 text-sm"
          >
            <AlertCircle className="shrink-0" size={18} />
            <p>{error}</p>
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {mode === 'signup' && (
              <>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-1"
                >
                  <label className="text-sm font-semibold ml-1">Nom complet</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="text" 
                      placeholder="Jean Dupont"
                      className="auth-input pl-10 border border-slate-200 rounded-lg py-2 w-full focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      value={formData.nom}
                      onChange={e => setFormData({...formData, nom: e.target.value})}
                    />
                  </div>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  className="space-y-1"
                >
                  <label className="text-sm font-semibold ml-1">Téléphone</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                    <input 
                      required
                      type="tel" 
                      placeholder="+509 XXXX-XXXX"
                      className="auth-input pl-10 border border-slate-200 rounded-lg py-2 w-full focus:ring-2 focus:ring-brand-blue/20 outline-none"
                      value={formData.phone}
                      onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                  </div>
                </motion.div>
              </>
            )}
          </AnimatePresence>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="email" 
                placeholder="email@exemple.com"
                className="auth-input pl-10 border border-slate-200 rounded-lg py-2 w-full focus:ring-2 focus:ring-brand-blue/20 outline-none"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-semibold ml-1">Mot de passe</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                required
                type="password" 
                placeholder="••••••••"
                className="auth-input pl-10 border border-slate-200 rounded-lg py-2 w-full focus:ring-2 focus:ring-brand-blue/20 outline-none"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
              />
            </div>
          </div>

          {mode === 'signup' && (
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-1"
            >
              <label className="text-sm font-semibold ml-1">Confirmer le mot de passe</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  required
                  type="password" 
                  placeholder="••••••••"
                  className="auth-input pl-10 border border-slate-200 rounded-lg py-2 w-full focus:ring-2 focus:ring-brand-blue/20 outline-none"
                  value={formData.confirmPassword}
                  onChange={e => setFormData({...formData, confirmPassword: e.target.value})}
                />
              </div>
            </motion.div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="btn-primary w-full py-3 mt-4 text-lg"
          >
            {loading ? 'Traitement...' : (mode === 'login' ? 'Se connecter' : 'Créer un compte')}
          </button>
        </form>

        <div className="text-center">
          <button 
            onClick={() => setMode(mode === 'login' ? 'signup' : 'login')}
            className="text-brand-blue hover:underline font-medium"
          >
            {mode === 'login' ? "Vous n'avez pas de compte ? S'inscrire" : "Déjà un compte ? Se connecter"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
