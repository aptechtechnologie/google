import React from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { BookOpen, CheckCircle, Smartphone, Award, ArrowRight } from 'lucide-react';

export default function Home() {
  const popularCourses = [
    { title: 'Microsoft Excel', desc: 'Maîtrisez les tableaux et les formules.', price: '2500 HTG' },
    { title: 'Microsoft Word', desc: 'Créez des documents pro et des CV.', price: '2000 HTG' },
    { title: 'Introduction à l\'informatique', desc: 'Les bases essentielles pour débuter.', price: '1500 HTG' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center text-center px-4 overflow-hidden">
        <div className="absolute inset-0 bg-brand-blue/10 -z-10" />
        <div className="max-w-3xl space-y-8">
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight"
          >
            Apprenez la bureautique <span className="text-brand-blue">partout en Haïti</span>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-slate-600"
          >
            Formez-vous aux outils essentiels (Word, Excel, PowerPoint) avec des formateurs experts et obtenez votre certificat.
          </motion.p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex flex-col sm:flex-row gap-4 justify-center"
          >
            <Link to="/inscription" className="btn-primary text-lg px-8 py-4">
              Commencer maintenant
            </Link>
            <Link to="/cours" className="btn-secondary text-lg px-8 py-4">
              Voir les cours
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-4 grid md:grid-cols-3 gap-8">
        {[
          { icon: <CheckCircle className="text-green-500" />, title: 'Validation Rapide', desc: 'Paiement via MonCash/NatCash validé en moins de 24h.' },
          { icon: <Smartphone className="text-blue-500" />, title: 'Multi-plateforme', desc: 'Apprenez sur votre téléphone, tablette ou ordinateur.' },
          { icon: <Award className="text-amber-500" />, title: 'Certificat Inclus', desc: 'Recevez un certificat de réussite après chaque formation.' },
        ].map((feat, i) => (
          <motion.div 
            key={i}
            whileHover={{ y: -5 }}
            className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 space-y-4"
          >
            <div className="bg-slate-50 w-12 h-12 rounded-lg flex items-center justify-center">
              {feat.icon}
            </div>
            <h3 className="text-xl font-bold">{feat.title}</h3>
            <p className="text-slate-600">{feat.desc}</p>
          </motion.div>
        ))}
      </section>

      {/* Popular Courses */}
      <section className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="text-center space-y-4">
          <h2 className="text-3xl font-bold">Nos cours les plus populaires</h2>
          <p className="text-slate-600">Rejoignez des centaines d'étudiants déjà formés.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-8">
          {popularCourses.map((course, i) => (
            <div key={i} className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
              <div className="h-48 bg-brand-blue/5 flex items-center justify-center">
                <BookOpen size={48} className="text-brand-blue/20" />
              </div>
              <div className="p-6 space-y-4">
                <h3 className="text-xl font-bold">{course.title}</h3>
                <p className="text-slate-600 text-sm">{course.desc}</p>
                <div className="flex justify-between items-center pt-4">
                  <span className="font-bold text-brand-blue">{course.price}</span>
                  <Link to="/cours" className="text-sm font-medium flex items-center gap-1 hover:underline">
                    Détails <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center">
          <Link to="/cours" className="btn-secondary">Voir tous les cours</Link>
        </div>
      </section>
    </div>
  );
}
