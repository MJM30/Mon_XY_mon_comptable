import React, { useState } from 'react';
import {
  Layers,
  Search,
  Plus,
  DollarSign,
  TrendingUp,
  Percent,
  CheckCircle2,
  X,
  Target,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredAnalyticalSections,
  saveStoredAnalyticalSections,
  AnalyticalSection,
} from '../../data/accountingMockData';

export const AnalyticalSections: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrController =
    user?.role === 'ADMIN' || user?.role === 'CONTROLLER' || user?.role === 'ACCOUNTANT';

  const [sections, setSections] = useState<AnalyticalSection[]>(getStoredAnalyticalSections);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire nouvelle section
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newAxis, setNewAxis] = useState('ACTIVITE');
  const [newDescription, setNewDescription] = useState('');

  const filteredSections = sections.filter(
    (s) =>
      s.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleCreateSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrController) return;

    if (!newCode.trim() || !newName.trim()) {
      alert('Veuillez renseigner le code et l’intitulé de la section.');
      return;
    }

    const created: AnalyticalSection = {
      id: Date.now(),
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      axisCode: newAxis,
      description: newDescription.trim() || undefined,
      directCost: 0,
      indirectCost: 0,
      revenue: 0,
      margin: 0,
      isActive: true,
    };

    const updated = [...sections, created];
    setSections(updated);
    saveStoredAnalyticalSections(updated);
    setIsModalOpen(false);

    setNewCode('');
    setNewName('');
    setNewDescription('');
    showNotice(`Section analytique ${created.code} - ${created.name} ajoutée.`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Axes Analytiques & Lignes de Produits
            </span>
            <span className="text-xs text-slate-400">• Ventilation des Produits & Charges</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Sections Analytiques & Activités Métier
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ventilez les ventes de caisses POS, prestations de maintenance et développements pour mesurer leur rentabilité propre.
          </p>
        </div>

        {isAdminOrController && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Section Analytique</span>
          </button>
        )}
      </div>

      {/* Message notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Tableau des Sections */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Code Section</th>
                <th className="py-3 px-4">Intitulé de l'Activité</th>
                <th className="py-3 px-4">Axe</th>
                <th className="py-3 px-4 text-right">Chiffre d'Affaires</th>
                <th className="py-3 px-4 text-right">Coûts Directs</th>
                <th className="py-3 px-4 text-right">Charges Indirectes</th>
                <th className="py-3 px-4 text-right">Marge Nette ($)</th>
                <th className="py-3 px-4 text-right">Taux de Marge</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredSections.map((sec) => {
                const totalCost = (sec.directCost || 0) + (sec.indirectCost || 0);
                const marginRate = sec.revenue ? (((sec.margin || 0) / sec.revenue) * 100).toFixed(1) : '0';

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-black text-indigo-700 text-xs">
                      {sec.code}
                    </td>

                    <td className="py-3 px-4 font-extrabold text-slate-900">
                      <div>{sec.name}</div>
                      {sec.description && (
                        <div className="text-[10px] text-slate-400 font-normal">{sec.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 font-bold text-[10px] text-slate-700">
                        {sec.axisCode}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-black text-slate-900">
                      {(sec.revenue || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-slate-700">
                      {(sec.directCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-3 px-4 text-right font-medium text-purple-700">
                      {(sec.indirectCost || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-3 px-4 text-right font-black text-emerald-600">
                      +{(sec.margin || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-3 px-4 text-right font-black text-emerald-700">
                      {marginRate} %
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL AJOUT SECTION ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Nouvelle Section Analytique</h3>
                  <p className="text-xs text-slate-500">Ajout d'une ligne d'activité ou projet métier</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSection} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Code Section *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: FORMATION, AUDIT"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Axe Analytique *</label>
                  <select
                    value={newAxis}
                    onChange={(e) => setNewAxis(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  >
                    <option value="ACTIVITE">ACTIVITÉ MÉTIER</option>
                    <option value="PROJET">PROJET CLIENT</option>
                    <option value="ZONE_GEO">ZONE GÉOGRAPHIQUE</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de l'Activité *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Déploiement Caisses & Formation Caissiers"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Objectif et périmètre de l'activité..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors"
                >
                  Créer la Section
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
