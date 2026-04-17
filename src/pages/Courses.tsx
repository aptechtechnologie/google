import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, addDoc, query } from 'firebase/firestore';
import { BookOpen, Search, Filter, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';

export default function Courses() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchCourses = async () => {
    try {
      const q = query(collection(db, 'courses'));
      const querySnapshot = await getDocs(q);
      const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      if (docs.length === 0) {
        // Seed some data if empty
        const defaultCourses = [
          { titre: 'Introduction à l\'informatique', description: 'Apprenez les bases du système d\'exploitation, de la gestion des fichiers et du matériel informatique.', prix: 1500, category: 'Informatique' },
          { titre: 'Microsoft Word', description: 'Créez des documents professionnels, des lettres types et des CV percutants.', prix: 2000, category: 'Bureautique' },
          { titre: 'Microsoft Excel', description: 'Maîtrisez les calculs, les tableaux croisés dynamiques et l\'analyse de données.', prix: 2500, category: 'Bureautique' },
          { titre: 'Microsoft PowerPoint', description: 'Concevez des présentations multimédias captivantes pour vos réunions.', prix: 2000, category: 'Bureautique' },
          { titre: 'Internet et navigation', description: 'Utilisez les moteurs de recherche, gérez vos courriels et restez en sécurité en ligne.', prix: 1000, category: 'Informatique' },
          { titre: 'Création de CV', description: 'Atelier spécialisé pour optimiser votre profil professionnel et trouver un emploi.', prix: 500, category: 'Carrière' },
        ];
        
        for (const c of defaultCourses) {
          await addDoc(collection(db, 'courses'), c);
        }
        fetchCourses();
      } else {
        setCourses(docs);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(c => 
    c.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 space-y-10">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold">Nos Formations</h1>
          <p className="text-slate-600">Choisissez le cours qui propulsera votre carrière.</p>
        </div>
        
        {/* Search and Filter */}
        <div className="flex gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Rechercher un cours..." 
              className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-blue/20 w-full sm:w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="p-2 border border-slate-200 rounded-lg text-slate-600 hover:bg-slate-50">
            <Filter size={20} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map(n => (
            <div key={n} className="h-80 bg-slate-100 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-8">
          {filteredCourses.map((course, i) => (
            <motion.div 
              key={course.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 flex flex-col hover:shadow-md transition-shadow"
            >
              <div className="h-40 bg-brand-blue/5 flex items-center justify-center">
                <BookOpen size={40} className="text-brand-blue/20" />
              </div>
              <div className="p-6 flex-1 flex flex-col space-y-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-brand-blue uppercase tracking-wider">{course.category}</span>
                  <h3 className="text-xl font-bold">{course.titre}</h3>
                </div>
                <p className="text-slate-600 text-sm line-clamp-2">{course.description}</p>
                <div className="mt-auto pt-4 flex justify-between items-center">
                  <span className="text-lg font-extrabold text-slate-900">{course.prix} HTG</span>
                  <Link to={`/paiement/${course.id}`} className="btn-primary py-2 px-4 text-sm flex items-center gap-2">
                    S'inscrire <ArrowRight size={14} />
                  </Link>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {!loading && filteredCourses.length === 0 && (
        <div className="text-center py-20 italic text-slate-500">
          Aucun cours ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
}
