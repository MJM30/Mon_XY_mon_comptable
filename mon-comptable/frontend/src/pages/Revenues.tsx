import React, { useState } from 'react';
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  Landmark,
  Smartphone,
  CreditCard,
  Wallet,
  X,
  FileCheck,
} from 'lucide-react';

interface RevenueItem {
  ref: string;
  date: string;
  client: string;
  clientSub: string;
  category: string;
  amount: string;
  paymentMethod: string;
  paymentType: 'bank' | 'mobile' | 'card' | 'cash';
  justificatif: string;
  isConforme: boolean;
}

const INITIAL_REVENUES: RevenueItem[] = [
  {
    ref: 'REC-2025-0089',
    date: '14 Mars 2025',
    client: 'ETS Congo Tech Distribution Gombe (SARL)',
    clientSub: 'Virement facture FAC-2025-092',
    category: 'Vente Prestation B2B',
    amount: '+4 800,00 $',
    paymentMethod: 'Virement Bancaire (BNP)',
    paymentType: 'bank',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
  {
    ref: 'REC-2025-0088',
    date: '12 Mars 2025',
    client: 'Chantal Mwamba',
    clientSub: 'Acompte forfait mensuel',
    category: 'Abonnements & Récurrent',
    amount: '+650,00 $',
    paymentMethod: 'Prélèvement SEPA',
    paymentType: 'bank',
    justificatif: 'Bordereau bancaire',
    isConforme: true,
  },
  {
    ref: 'REC-2025-0087',
    date: '10 Mars 2025',
    client: 'Dieudonné Kasongo',
    clientSub: 'Consultation diagnostic comptoir',
    category: 'Prestations Immédiates',
    amount: '+1 850,00 $',
    paymentMethod: 'Carte Bancaire (TPE)',
    paymentType: 'card',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
  {
    ref: 'REC-2025-0086',
    date: '08 Mars 2025',
    client: 'Supermarché Express Limete (SAS)',
    clientSub: 'Règlement 1er acompte 50%',
    category: 'Déploiement ERP & Conseil',
    amount: '+3 300,00 $',
    paymentMethod: 'Rawbank Virement',
    paymentType: 'bank',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
  {
    ref: 'REC-2025-0085',
    date: '07 Mars 2025',
    client: 'Passage Comptoir (Paul M.)',
    clientSub: 'Règlement direct guichet accueil',
    category: 'Vente Fournitures & Licences',
    amount: '+240,00 $',
    paymentMethod: 'Espèces Caisse centrale',
    paymentType: 'cash',
    justificatif: 'Ticket de caisse certifié',
    isConforme: true,
  },
  {
    ref: 'REC-2025-0084',
    date: '05 Mars 2025',
    client: 'Pharmacie Grand Kasaï Gombe',
    clientSub: 'Audit organisationnel',
    category: 'Vente Prestation B2B',
    amount: '+1 440,00 $',
    paymentMethod: 'Airtel Money Business',
    paymentType: 'mobile',
    justificatif: 'Reçu électronique DGI',
    isConforme: true,
  },
];

export const Revenues: React.FC = () => {
  const [revenues, setRevenues] = useState<RevenueItem[]>(INITIAL_REVENUES);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [showDrawer, setShowDrawer] = useState(false);

  // Formulaire nouvelle recette
  const [newClient, setNewClient] = useState('ETS Congo Tech Distribution Gombe (SARL)');
  const [newAmount, setNewAmount] = useState('1200');
  const [newCategory, setNewCategory] = useState('Vente Prestation B2B');
  const [newPaymentMethod, setNewPaymentMethod] = useState('Virement Bancaire (BNP)');
  const [newDescription, setNewDescription] = useState('Prestation de conseil et accompagnement fiscal');

  const handleAddRevenue = (e: React.FormEvent) => {
    e.preventDefault();
    const nextRef = `REC-2025-00${90 + revenues.length - 6}`;
    const newItem: RevenueItem = {
      ref: nextRef,
      date: '15 Mars 2025',
      client: newClient,
      clientSub: newDescription,
      category: newCategory,
      amount: `+${Number(newAmount).toLocaleString()} $`,
      paymentMethod: newPaymentMethod,
      paymentType: newPaymentMethod.includes('Virement') ? 'bank' : newPaymentMethod.includes('Carte') ? 'card' : newPaymentMethod.includes('Espèces') ? 'cash' : 'mobile',
      justificatif: 'Facture normalisée DGI',
      isConforme: true,
    };
    setRevenues([newItem, ...revenues]);
    setShowDrawer(false);
    alert(`Recette ${nextRef} (${newAmount} $) enregistrée avec succès dans le journal de trésorerie !`);
  };

  const filteredRevenues = revenues.filter((rev) => {
    const matchesSearch =
      rev.client.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
      rev.clientSub.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === 'all' || rev.category.toLowerCase().includes(categoryFilter.toLowerCase());
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header (Calqué sur la capture Dépenses & Décaissements) */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1">
          Comptabilité &gt; Recettes &gt; <span className="text-slate-600">Kinshasa / Paris • Siège Central</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestion des Recettes & Encaissements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Contrôle des flux entrants, encaissements comptant, règlements de factures et conformité fiscale DGI.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export FEC / Recettes</span>
            </button>
            <button
              onClick={() => setShowDrawer(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nouvelle recette</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards (Exactement la même architecture SaaS que la capture Dépenses) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Recettes du Mois</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">148 920 $</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>+10.3% au-dessus de l'objectif (135 000 $)</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Encaissements Facturés (B2B)</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Landmark className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">104 200 $</div>
          <div className="text-[11px] text-slate-500 font-medium mt-2">
            70% du volume • Virements vérifiés
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Ventes Comptoir & Particuliers</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">32 450 $</div>
          <div className="text-[11px] text-emerald-600 font-medium mt-2">
            +8.1% vs mois précédent • Guichet
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Paiements Mobiles & Caisse</span>
            <div className="w-7 h-7 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">12 270 $</div>
          <div className="text-[11px] text-slate-500 font-medium mt-2">
            M-Pesa, Airtel & Espèces caisse
          </div>
        </div>
      </div>

      {/* Main Grid: Filters + Table (8 cols), Fiscal & Validation Right Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher référence, client, N°..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white"
              >
                <option value="all">Catégorie (Toutes)</option>
                <option value="B2B">Vente Prestation B2B</option>
                <option value="Abonnements">Abonnements & Récurrent</option>
                <option value="Immédiates">Prestations Immédiates</option>
                <option value="Conseil">Déploiement ERP & Conseil</option>
              </select>

              <select className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white">
                <option>Règlement (Tous)</option>
                <option>Virement Bancaire</option>
                <option>Carte Bancaire</option>
                <option>Mobile Money</option>
                <option>Espèces Caisse</option>
              </select>

              <button
                onClick={() => { setSearchTerm(''); setCategoryFilter('all'); }}
                className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50"
                title="Réinitialiser"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Réf & Date</th>
                    <th className="px-4 py-3">Client / Tiers</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3 text-right">Montant Encaissé</th>
                    <th className="px-4 py-3">Règlement</th>
                    <th className="px-4 py-3">Justificatif DGI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredRevenues.map((rev, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-blue-700 font-mono">{rev.ref}</div>
                        <div className="text-[11px] text-slate-400">{rev.date}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{rev.client}</div>
                        <div className="text-[10px] text-slate-400">{rev.clientSub}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {rev.category}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-emerald-600">
                        {rev.amount}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {rev.paymentMethod}
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border bg-blue-50 text-blue-700 border-blue-100">
                          {rev.justificatif}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Affichage de 1 à {filteredRevenues.length} sur 148 encaissements</span>
              <span className="font-bold text-slate-800">
                Sous-total période : 12 280,00 $
              </span>
            </div>
          </div>
        </div>

        {/* Right Column: Fiscal Rules & Cashier Circuit (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Contrôle Fiscal & DGI Recettes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Contrôle Fiscal & DGI (Ventes)
                </h3>
              </div>
              <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                Conforme
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Factur-X • Registre DGI & TVA collectée</p>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
              <div className="font-bold text-blue-900">Règle de traçabilité des encaissements :</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Tout encaissement supérieur à <strong>1 000 $ / $</strong> perçu au comptoir doit obligatoirement être rattaché à une facture émise avec mention du NIF/SIREN ou bordereau de remise bancaire.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Alertes Rapprochement & Lettrage (2)</p>

              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">REC-2025-0089 (Alpha SARL)</span>
                  <span className="text-[10px] font-bold text-emerald-700">Rapprochement 100%</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Virement de <strong>4 800,00 $</strong> pointé sur le relevé BNP Paribas. Facture FAC-2025-092 soldée.
                </p>
              </div>

              <div className="p-2.5 rounded-lg border border-blue-200 bg-blue-50/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">REC-2025-0088 (Chantal Mwamba)</span>
                  <span className="text-[10px] font-bold text-blue-700">Lettrage Auto</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Acompte de <strong>650,00 $</strong> lettré automatiquement avec le compte client #41102.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Conseiller Recettes & Chiffre d’Affaires IA activé !')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conseiller Recettes IA</span>
            </button>
          </div>

          {/* Circuit d'imputation & Caisse */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Circuit d'imputation & Caisse
              </h3>
              <FileCheck className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    MK
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Mireille Kabongo</div>
                    <div className="text-[10px] text-slate-400">Comptable senior • Visa encaissement</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  À jour
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    AL
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Audrey L.</div>
                    <div className="text-[10px] text-slate-400">Accueil & Caisse centrale (13 110 $)</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                  Clôturé
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Modal "Nouvelle recette" */}
      {showDrawer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in">
          <div className="w-full max-w-lg bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <form onSubmit={handleAddRevenue} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enregistrer une recette</h3>
                  <p className="text-xs text-slate-400">Encaissement direct, virement ou règlement comptoir</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Client ou Tiers payeur</label>
                <select
                  value={newClient}
                  onChange={(e) => setNewClient(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                >
                  <option>ETS Congo Tech Distribution Gombe (SARL)</option>
                  <option>Dieudonné Kasongo (Particulier Gold)</option>
                  <option>Chantal Mwamba (Freelance)</option>
                  <option>Supermarché Express Limete (SAS)</option>
                  <option>Client de passage / Comptoir</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant TTC ($)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-bold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Catégorie de recette</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                  >
                    <option>Vente Prestation B2B</option>
                    <option>Abonnements & Récurrent</option>
                    <option>Prestations Immédiates</option>
                    <option>Déploiement ERP & Conseil</option>
                    <option>Vente Fournitures & Licences</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Mode de règlement / Encaissement</label>
                <select
                  value={newPaymentMethod}
                  onChange={(e) => setNewPaymentMethod(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                >
                  <option>Virement Bancaire (BNP)</option>
                  <option>Carte Bancaire (TPE)</option>
                  <option>Airtel Money Business</option>
                  <option>M-Pesa Pro</option>
                  <option>Espèces Caisse centrale</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Description / Motif de l'encaissement</label>
                <input
                  type="text"
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-emerald-900">Rapprochement bancaire instantané :</span>
                <p className="text-[11px] text-emerald-800">
                  Cette écriture sera immédiatement intégrée dans le calcul du chiffre d'affaires et augmentera le solde de trésorerie disponible de <strong>+{newAmount} $</strong>.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowDrawer(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Valider et Encaisser
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
