import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  SlidersHorizontal,
  X,
  ShieldAlert,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredChartOfAccounts,
  saveStoredChartOfAccounts,
  subscribeToBccRateUpdates,
  ChartOfAccount,
  AccountNature,
} from '../../data/accountingMockData';

export const ChartOfAccounts: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrAccountant = user?.role === 'ADMIN' || user?.role === 'ACCOUNTANT';

  const [accounts, setAccounts] = useState<ChartOfAccount[]>(getStoredChartOfAccounts);

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates(() => {
      setAccounts(getStoredChartOfAccounts());
    });
    return unsubscribe;
  }, []);
  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFramework, setSelectedFramework] = useState<'SYSCOHADA_REVISED' | 'PCG_FRANCE'>('SYSCOHADA_REVISED');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire nouveau compte
  const [newAccountNumber, setNewAccountNumber] = useState('');
  const [newLabel, setNewLabel] = useState('');
  const [newClass, setNewClass] = useState<number>(4);
  const [newType, setNewType] = useState<AccountNature>('ASSET');
  const [newDescription, setNewDescription] = useState('');

  const classDescriptions: Record<number, string> = {
    1: 'Comptes de ressources durables (Capitaux propres & Emprunts)',
    2: 'Comptes d’actif immobilisé (Immobilisations & Développements)',
    3: 'Comptes de stocks (Marchandises & Approvisionnements POS)',
    4: 'Comptes de tiers (Clients, Fournisseurs, Personnel, État)',
    5: 'Comptes de trésorerie (Banques, Caisses, Mobile Money)',
    6: 'Comptes de charges des activités ordinaires (Achats, Loyers)',
    7: 'Comptes de produits des activités ordinaires (Ventes, Prestations)',
    8: 'Comptes des autres charges et autres produits (Hors activités ordinaires)',
  };

  const filteredAccounts = accounts.filter((account) => {
    const matchesSearch =
      account.accountNumber.includes(searchQuery) ||
      account.label.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesClass = selectedClass === 'ALL' || account.accountClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleCreateAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrAccountant) {
      alert("Permission refusée. Seul un Comptable ou l'Administrateur peut modifier le plan comptable.");
      return;
    }

    if (!newAccountNumber.trim() || !newLabel.trim()) {
      alert('Veuillez renseigner le numéro et l’intitulé du compte.');
      return;
    }

    if (accounts.some((a) => a.accountNumber === newAccountNumber.trim())) {
      alert(`Le compte ${newAccountNumber} existe déjà dans le plan comptable.`);
      return;
    }

    const created: ChartOfAccount = {
      id: Date.now(),
      accountNumber: newAccountNumber.trim(),
      label: newLabel.trim(),
      accountClass: newClass,
      accountType: newType,
      isActive: true,
      framework: selectedFramework,
      description: newDescription.trim() || undefined,
      currentDebit: 0,
      currentCredit: 0,
      balance: 0,
    };

    const updated = [...accounts, created].sort((a, b) =>
      a.accountNumber.localeCompare(b.accountNumber)
    );

    setAccounts(updated);
    saveStoredChartOfAccounts(updated);
    setIsModalOpen(false);

    // Reset
    setNewAccountNumber('');
    setNewLabel('');
    setNewDescription('');
    showNotice(`Compte ${created.accountNumber} - ${created.label} créé avec succès.`);
  };

  const handleToggleActive = (account: ChartOfAccount) => {
    if (!isAdminOrAccountant) return;

    // Règle comptable : les comptes ayant déjà des mouvements ne doivent pas être supprimés
    const updated = accounts.map((a) =>
      a.id === account.id ? { ...a, isActive: !a.isActive } : a
    );
    setAccounts(updated);
    saveStoredChartOfAccounts(updated);
    showNotice(
      `Compte ${account.accountNumber} ${account.isActive ? 'désactivé' : 'réactivé'}.`
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Architecture & Cadre Comptable
            </span>
            <span className="text-xs text-slate-400">• Référentiel {selectedFramework}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Plan Comptable Général & Référentiel SYSCOHADA
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Paramétrez et organisez les comptes de bilan et de gestion par classe et par nature.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <select
            value={selectedFramework}
            onChange={(e) => setSelectedFramework(e.target.value as any)}
            className="bg-slate-50 border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2"
          >
            <option value="SYSCOHADA_REVISED">Référentiel SYSCOHADA Révisé</option>
            <option value="PCG_FRANCE">Plan Comptable Général (PCG)</option>
          </select>

          {isAdminOrAccountant && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Nouveau Compte</span>
            </button>
          )}
        </div>
      </div>

      {/* Message notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Filtres par Classes (1 à 8) */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedClass('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedClass === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes les classes ({accounts.length})
        </button>

        {[1, 2, 3, 4, 5, 6, 7, 8].map((cls) => {
          const count = accounts.filter((a) => a.accountClass === cls).length;
          return (
            <button
              key={cls}
              onClick={() => setSelectedClass(cls)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedClass === cls
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              Classe {cls} ({count})
            </button>
          );
        })}
      </div>

      {/* Description de la classe active */}
      {selectedClass !== 'ALL' && (
        <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 flex items-center gap-2">
          <FolderTree className="w-4 h-4 text-blue-600 shrink-0" />
          <span>
            <strong>Classe {selectedClass} :</strong> {classDescriptions[selectedClass]}
          </span>
        </div>
      )}

      {/* Recherche */}
      <div className="flex justify-between items-center gap-3">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par numéro (ex: 411, 521) ou intitulé..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs focus:outline-hidden"
          />
        </div>

        <span className="text-xs text-slate-400 font-semibold">
          {filteredAccounts.length} compte(s) affiché(s)
        </span>
      </div>

      {/* Tableau du Plan Comptable */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[680px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">N° de Compte</th>
                <th className="py-3 px-4">Intitulé du Compte</th>
                <th className="py-3 px-4">Classe</th>
                <th className="py-3 px-4">Nature</th>
                <th className="py-3 px-4 text-right">Cumul Débit (FC)</th>
                <th className="py-3 px-4 text-right">Cumul Crédit (FC)</th>
                <th className="py-3 px-4 text-right">Solde Actuel (FC)</th>
                <th className="py-3 px-4">Statut</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAccounts.map((account) => {
                const isDebitSolde = (account.balance || 0) >= 0;
                return (
                  <tr
                    key={account.id}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      !account.isActive ? 'opacity-50 bg-slate-50/30' : ''
                    }`}
                  >
                    <td className="py-3 px-4 font-mono font-black text-slate-900 text-sm">
                      {account.accountNumber}
                    </td>

                    <td className="py-3 px-4 font-semibold text-slate-800">
                      <div>{account.label}</div>
                      {account.description && (
                        <div className="text-[10px] text-slate-400 font-normal">{account.description}</div>
                      )}
                    </td>

                    <td className="py-3 px-4 font-bold text-slate-600">
                      Classe {account.accountClass}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md text-[10px] font-bold ${
                          account.accountType === 'ASSET'
                            ? 'bg-blue-50 text-blue-700'
                            : account.accountType === 'LIABILITY'
                            ? 'bg-purple-50 text-purple-700'
                            : account.accountType === 'EXPENSE'
                            ? 'bg-rose-50 text-rose-700'
                            : account.accountType === 'REVENUE'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {account.accountType}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-700">
                      {Math.round(account.currentDebit || 0).toLocaleString('fr-FR')} FC
                    </td>

                    <td className="py-3 px-4 text-right font-bold text-slate-700">
                      {Math.round(account.currentCredit || 0).toLocaleString('fr-FR')} FC
                    </td>

                    <td className="py-3 px-4 text-right font-black">
                      <span className={isDebitSolde ? 'text-blue-700' : 'text-purple-700'}>
                        {Math.round(Math.abs(account.balance || 0)).toLocaleString('fr-FR')} FC{' '}
                        {isDebitSolde ? '(D)' : '(C)'}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          account.isActive
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {account.isActive ? 'ACTIF' : 'INACTIF'}
                      </span>
                    </td>

                    <td className="py-3 px-4 text-right">
                      {isAdminOrAccountant && (
                        <button
                          type="button"
                          onClick={() => handleToggleActive(account)}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold border border-slate-200 hover:bg-slate-100 text-slate-600 transition-colors"
                        >
                          {account.isActive ? 'Désactiver' : 'Activer'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Règle comptable de protection */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl text-xs text-slate-600 flex items-center gap-3">
        <ShieldAlert className="w-5 h-5 text-blue-600 shrink-0" />
        <span>
          <strong>Règle de conformité comptable :</strong> Les comptes ayant fait l'objet d'écritures
          comptables ne peuvent pas être supprimés physiquement afin de garantir l'intégrité de la
          piste d'audit et la balance historique. Seule la désactivation pour nouvelles écritures est permise.
        </span>
      </div>

      {/* ================= MODAL NOUVEAU COMPTE ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Nouveau Compte Comptable</h3>
                  <p className="text-xs text-slate-500">Ajout au plan {selectedFramework}</p>
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

            <form onSubmit={handleCreateAccount} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Numéro de Compte *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 411200"
                    value={newAccountNumber}
                    onChange={(e) => setNewAccountNumber(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Classe Comptable *</label>
                  <select
                    value={newClass}
                    onChange={(e) => setNewClass(parseInt(e.target.value))}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((c) => (
                      <option key={c} value={c}>
                        Classe {c}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Intitulé du Compte *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clients - Ventes Terminaux POS Province"
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Nature Comptable *</label>
                <select
                  value={newType}
                  onChange={(e) => setNewType(e.target.value as any)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="ASSET">ACTIF (Immobilisations, Stocks, Créances, Trésorerie)</option>
                  <option value="LIABILITY">PASSIF (Dettes fournisseurs, Emprunts, Dettes fiscales)</option>
                  <option value="EQUITY">CAPITAUX PROPRES (Capital, Réserves, Résultat)</option>
                  <option value="EXPENSE">CHARGE (Achats, Loyers, Services, Rémunérations)</option>
                  <option value="REVENUE">PRODUIT (Ventes matériel, Services, Prestations)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Description / Précisions</label>
                <textarea
                  rows={2}
                  placeholder="Usage recommandé du compte..."
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
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
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Créer le Compte
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
