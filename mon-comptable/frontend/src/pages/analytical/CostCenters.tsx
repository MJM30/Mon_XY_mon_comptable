import React, { useState } from 'react';
import {
  Building,
  Plus,
  Search,
  UserCheck,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  X,
  Target,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredCostCenters,
  saveStoredCostCenters,
  CostCenter,
} from '../../data/accountingMockData';

export const CostCenters: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrController =
    user?.role === 'ADMIN' || user?.role === 'CONTROLLER' || user?.role === 'ACCOUNTANT';

  const [centers, setCenters] = useState<CostCenter[]>(getStoredCostCenters);
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire nouveau centre
  const [newCode, setNewCode] = useState('');
  const [newName, setNewName] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newManager, setNewManager] = useState('');
  const [newBudget, setNewBudget] = useState('10000');

  const filteredCenters = centers.filter(
    (c) =>
      c.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.managerName && c.managerName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleCreateCenter = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrController) return;

    if (!newCode.trim() || !newName.trim()) {
      alert('Veuillez renseigner le code et l’intitulé du centre de coûts.');
      return;
    }

    if (centers.some((c) => c.code.toUpperCase() === newCode.trim().toUpperCase())) {
      alert(`Le code centre ${newCode} existe déjà.`);
      return;
    }

    const created: CostCenter = {
      id: Date.now(),
      code: newCode.trim().toUpperCase(),
      name: newName.trim(),
      description: newDescription.trim() || undefined,
      managerName: newManager.trim() || undefined,
      allocatedBudget: parseFloat(newBudget) || 0,
      totalExpenses: 0,
      isActive: true,
    };

    const updated = [...centers, created];
    setCenters(updated);
    saveStoredCostCenters(updated);
    setIsModalOpen(false);

    setNewCode('');
    setNewName('');
    setNewDescription('');
    setNewManager('');
    showNotice(`Centre de coûts ${created.code} - ${created.name} créé avec succès.`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Architecture Analytique
            </span>
            <span className="text-xs text-slate-400">• Centres de Responsabilité</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Gestion des Centres de Coûts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Définissez les pôles de responsabilité pour regrouper les charges de l'entreprise et contrôler leurs budgets.
          </p>
        </div>

        {isAdminOrController && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Centre de Coûts</span>
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

      {/* Recherche */}
      <div className="relative w-full sm:w-96">
        <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Rechercher par code (ADM, COM, IT) ou responsable..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-indigo-500 text-slate-800 shadow-xs focus:outline-hidden"
        />
      </div>

      {/* Grille des Centres de Coûts */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {filteredCenters.map((center) => {
          const budgetUsage = center.allocatedBudget
            ? ((center.totalExpenses || 0) / center.allocatedBudget) * 100
            : 0;

          return (
            <div
              key={center.id}
              className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="font-mono font-black text-sm px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-700">
                    {center.code}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                    ACTIF
                  </span>
                </div>

                <h3 className="font-extrabold text-sm text-slate-900 mt-2">{center.name}</h3>
                <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                  {center.description || 'Pôle opérationnel de gestion des charges.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-100 text-xs">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <UserCheck className="w-4 h-4 text-slate-400 shrink-0" />
                  <span className="truncate">Responsable : {center.managerName || 'Non désigné'}</span>
                </div>

                <div className="space-y-1">
                  <div className="flex justify-between text-[11px] font-bold">
                    <span className="text-slate-500">Dépenses engagées</span>
                    <span className="text-slate-900">
                      {(center.totalExpenses || 0).toLocaleString('en-US')} $ /{' '}
                      {(center.allocatedBudget || 0).toLocaleString('en-US')} $
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        budgetUsage > 90
                          ? 'bg-rose-500'
                          : budgetUsage > 75
                          ? 'bg-amber-500'
                          : 'bg-indigo-600'
                      }`}
                      style={{ width: `${Math.min(100, budgetUsage)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODAL AJOUT CENTRE DE COÛTS ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <Building className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Nouveau Centre de Coûts</h3>
                  <p className="text-xs text-slate-500">Création d'un pôle de responsabilité analytique</p>
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

            <form onSubmit={handleCreateCenter} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Code Analytique *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: MKT, RH, DEV"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold uppercase focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Alloué ($) *</label>
                  <input
                    type="number"
                    required
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom du Centre *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Marketing Digital & Communication POS"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Responsable du Pôle</label>
                <input
                  type="text"
                  placeholder="Ex: Jean-Paul Mukendi"
                  value={newManager}
                  onChange={(e) => setNewManager(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Activités et périmètre de ce centre de coûts..."
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
                  Créer le Centre
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
