import React, { useState } from 'react';
import {
  Users,
  Plus,
  Search,
  Filter,
  Phone,
  Mail,
  MapPin,
  Building,
  Calendar,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  TrendingUp,
  LayoutGrid,
  List,
  ChevronRight,
  UserCheck,
  AlertCircle,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredProspects,
  saveStoredProspects,
  Prospect,
  ProspectStatus,
} from '../../data/posMockData';

const STATUS_CONFIG: Record<
  ProspectStatus,
  { label: string; bg: string; text: string; border: string }
> = {
  NEW: {
    label: 'Nouveau Lead',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  QUALIFIED: {
    label: 'Qualifié (Intérêt)',
    bg: 'bg-indigo-50',
    text: 'text-indigo-700',
    border: 'border-indigo-200',
  },
  PROPOSAL_SENT: {
    label: 'Devis Envoyé',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  NEGOTIATION: {
    label: 'En Négociation',
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
  },
  CONVERTED: {
    label: 'Gagné / Converti Client',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  LOST: {
    label: 'Perdu / Sans suite',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    border: 'border-rose-200',
  },
};

export const ProspectsCrm: React.FC = () => {
  const { user } = useAuth();
  const [prospects, setProspects] = useState<Prospect[]>(getStoredProspects);
  const [viewMode, setViewMode] = useState<'KANBAN' | 'TABLE'>('KANBAN');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire d'ajout
  const [newCompany, setNewCompany] = useState('');
  const [newContact, setNewContact] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newActivity, setNewActivity] = useState('Restaurant');
  const [newBudget, setNewBudget] = useState('2500');
  const [newNotes, setNewNotes] = useState('');

  const filteredProspects = prospects.filter((p) => {
    const matchesSearch =
      p.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.contactName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.city?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.businessType.toLowerCase().includes(searchQuery.toLowerCase());

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.status === statusFilter;
  });

  const handleUpdateStatus = (id: number, nextStatus: ProspectStatus) => {
    const updated = prospects.map((p) => (p.id === id ? { ...p, status: nextStatus } : p));
    setProspects(updated);
    saveStoredProspects(updated);
    showNotice(`Statut du prospect mis à jour : ${STATUS_CONFIG[nextStatus].label}`);
  };

  const handleConvertToClient = (prospect: Prospect) => {
    const updated = prospects.map((p) =>
      p.id === prospect.id ? { ...p, status: 'CONVERTED' as ProspectStatus } : p
    );
    setProspects(updated);
    saveStoredProspects(updated);

    showNotice(
      `🎉 Succès ! ${prospect.companyName} a été converti en Client officiel. Un compte client est désormais actif dans Mon Comptable.`
    );
  };

  const handleCreateProspect = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany.trim() || !newContact.trim() || !newPhone.trim()) {
      alert('Veuillez renseigner le nom de l’entreprise, le contact et le téléphone.');
      return;
    }

    const created: Prospect = {
      id: Date.now(),
      companyName: newCompany,
      contactName: newContact,
      phone: newPhone,
      email: newEmail || undefined,
      city: newCity || 'Paris',
      businessType: newActivity,
      status: 'NEW',
      estimatedBudget: parseFloat(newBudget) || 0,
      notes: newNotes,
      nextFollowUp: new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0],
      sellerId: user?.id || 5,
      sellerName: user?.name || 'Alain Tshisekedi',
      createdAt: new Date().toISOString(),
    };

    const updated = [created, ...prospects];
    setProspects(updated);
    saveStoredProspects(updated);
    setIsModalOpen(false);

    // Reset form
    setNewCompany('');
    setNewContact('');
    setNewPhone('');
    setNewEmail('');
    setNewNotes('');
    showNotice(`Nouveau prospect « ${created.companyName} » enregistré dans votre portefeuille.`);
  };

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const pipelineStages: ProspectStatus[] = [
    'NEW',
    'QUALIFIED',
    'PROPOSAL_SENT',
    'NEGOTIATION',
    'CONVERTED',
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              CRM Commercial • Pipeline POS
            </span>
            <span className="text-xs text-slate-400">• Vendeur : {user?.name || 'Alain Tshisekedi'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Gestion des Prospects & Leads Commerciaux
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Suivez le cycle de vie complet de vos prospects de la prise de contact jusqu'à la conversion en client.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('KANBAN')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'KANBAN' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('TABLE')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                viewMode === 'TABLE' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <List className="w-3.5 h-3.5" />
              <span>Tableau</span>
            </button>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Prospect</span>
          </button>
        </div>
      </div>

      {/* Bannière de notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Barre de recherche et filtre */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher prospect, contact, ville ou activité..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-semibold rounded-xl px-3 py-2 shadow-xs"
          >
            <option value="ALL">Tous les statuts</option>
            <option value="NEW">Nouveaux</option>
            <option value="QUALIFIED">Qualifiés</option>
            <option value="PROPOSAL_SENT">Devis envoyé</option>
            <option value="NEGOTIATION">En négociation</option>
            <option value="CONVERTED">Convertis</option>
            <option value="LOST">Perdus</option>
          </select>
        </div>
      </div>

      {/* ================= VUE KANBAN ================= */}
      {viewMode === 'KANBAN' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {pipelineStages.map((stage) => {
            const stageProspects = filteredProspects.filter((p) => p.status === stage);
            const totalStageBudget = stageProspects.reduce(
              (acc, p) => acc + (p.estimatedBudget || 0),
              0
            );

            return (
              <div
                key={stage}
                className="bg-slate-100/70 rounded-2xl p-3 border border-slate-200/80 flex flex-col min-w-[240px]"
              >
                {/* En-tête de colonne */}
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-200">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs text-slate-800">
                      {STATUS_CONFIG[stage].label}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                      {stageProspects.length}
                    </span>
                  </div>
                  <span className="text-[10px] font-black text-slate-500">
                    {totalStageBudget > 0 ? `${totalStageBudget} $` : ''}
                  </span>
                </div>

                {/* Cartes Prospects */}
                <div className="space-y-3 flex-1">
                  {stageProspects.map((prospect) => (
                    <div
                      key={prospect.id}
                      className="bg-white rounded-xl p-3.5 border border-slate-200 shadow-2xs hover:shadow-sm transition-all space-y-2.5"
                    >
                      <div>
                        <span className="text-[10px] font-bold text-blue-600 uppercase tracking-wider block">
                          {prospect.businessType}
                        </span>
                        <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                          {prospect.companyName}
                        </h4>
                        <p className="text-[11px] text-slate-500">{prospect.contactName}</p>
                      </div>

                      {/* Coordonnées */}
                      <div className="text-[11px] space-y-1 text-slate-600 bg-slate-50 p-2 rounded-lg">
                        <div className="flex items-center gap-1.5 truncate">
                          <Phone className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="truncate">{prospect.phone}</span>
                        </div>
                        {prospect.city && (
                          <div className="flex items-center gap-1.5 truncate">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{prospect.city}</span>
                          </div>
                        )}
                      </div>

                      {/* Budget & Note */}
                      <div className="flex items-center justify-between text-[11px] pt-1">
                        <span className="font-extrabold text-slate-900">
                          {prospect.estimatedBudget ? `${prospect.estimatedBudget} $ HT` : 'Budget N/C'}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {new Date(prospect.createdAt).toLocaleDateString('en-US')}
                        </span>
                      </div>

                      {/* Actions d'avancement rapide dans le pipeline */}
                      <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-[10px]">
                        {stage !== 'CONVERTED' ? (
                          <>
                            <button
                              type="button"
                              onClick={() => {
                                const currentIndex = pipelineStages.indexOf(stage);
                                if (currentIndex < pipelineStages.length - 1) {
                                  handleUpdateStatus(prospect.id, pipelineStages[currentIndex + 1]);
                                }
                              }}
                              className="text-blue-600 hover:text-blue-800 font-bold flex items-center gap-1"
                            >
                              <span>Avancer</span>
                              <ChevronRight className="w-3 h-3" />
                            </button>

                            <button
                              type="button"
                              onClick={() => handleConvertToClient(prospect)}
                              className="px-2 py-1 rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold flex items-center gap-1"
                            >
                              <UserCheck className="w-3 h-3" />
                              <span>Convertir</span>
                            </button>
                          </>
                        ) : (
                          <span className="text-emerald-600 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Client Actif</span>
                          </span>
                        )}
                      </div>
                    </div>
                  ))}

                  {stageProspects.length === 0 && (
                    <div className="p-4 text-center text-[11px] text-slate-400 border border-dashed border-slate-300 rounded-xl">
                      Aucun lead à cette étape
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* ================= VUE TABLEAU ================= */
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Entreprise & Contact</th>
                  <th className="py-3 px-4">Activité</th>
                  <th className="py-3 px-4">Contact Direct</th>
                  <th className="py-3 px-4">Budget Estimé</th>
                  <th className="py-3 px-4">Statut Pipeline</th>
                  <th className="py-3 px-4">Prochain Suivi</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredProspects.map((p) => {
                  const statusInfo = STATUS_CONFIG[p.status];
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4">
                        <div className="font-extrabold text-slate-900">{p.companyName}</div>
                        <div className="text-[11px] text-slate-500">{p.contactName}</div>
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">{p.businessType}</td>
                      <td className="py-3.5 px-4 text-slate-600">
                        <div>{p.phone}</div>
                        {p.email && <div className="text-[11px] text-slate-400">{p.email}</div>}
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {p.estimatedBudget
                          ? `${p.estimatedBudget.toLocaleString('en-US')} $ HT`
                          : 'Non défini'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold border ${statusInfo.bg} ${statusInfo.text} ${statusInfo.border}`}
                        >
                          {statusInfo.label}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-600">
                        {p.nextFollowUp || 'À planifier'}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {p.status !== 'CONVERTED' ? (
                          <button
                            type="button"
                            onClick={() => handleConvertToClient(p)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] transition-colors"
                          >
                            Convertir en Client
                          </button>
                        ) : (
                          <span className="text-emerald-600 font-bold text-[11px]">Client Converti</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL AJOUT PROSPECT ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Nouveau Prospect POS</h3>
                  <p className="text-xs text-slate-500">Ajouter une piste commerciale au CRM</p>
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

            <form onSubmit={handleCreateProspect} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de l'établissement / Société *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Brasserie Le Grand Duc"
                  value={newCompany}
                  onChange={(e) => setNewCompany(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Nom du Contact / Gérant *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Alexandre Martin"
                    value={newContact}
                    onChange={(e) => setNewContact(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Numéro de téléphone *</label>
                  <input
                    type="tel"
                    required
                    placeholder="Ex: +33 6 12 34 56 78"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Adresse E-mail</label>
                  <input
                    type="email"
                    placeholder="contact@commerce.fr"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ville</label>
                  <input
                    type="text"
                    placeholder="Paris, Kinshasa, Lyon..."
                    value={newCity}
                    onChange={(e) => setNewCity(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Secteur d'activité</label>
                  <select
                    value={newActivity}
                    onChange={(e) => setNewActivity(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  >
                    <option value="Restaurant & Bar">Restaurant & Bar</option>
                    <option value="Supermarché / Retail">Supermarché / Épicerie</option>
                    <option value="Pharmacie & Santé">Pharmacie</option>
                    <option value="Boutique Mode">Boutique Prêt-à-porter</option>
                    <option value="Hôtellerie">Hôtellerie</option>
                    <option value="Autre Commerce">Autre Commerce</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Budget Estimé ($ HT)</label>
                  <input
                    type="number"
                    value={newBudget}
                    onChange={(e) => setNewBudget(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Notes & Besoins exprimés</label>
                <textarea
                  rows={2}
                  placeholder="Ex: Intéressé par 2 caisses N95 tactiles avec tiroirs-caisses..."
                  value={newNotes}
                  onChange={(e) => setNewNotes(e.target.value)}
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
                  Enregistrer le Prospect
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
