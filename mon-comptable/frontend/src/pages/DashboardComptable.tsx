import React, { useState } from 'react';
import {
  TrendingUp,
  PieChart,
  Wallet,
  AlertTriangle,
  Download,
  Plus,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

const CHART_DATA = [
  { month: 'Oct 24', ca: 88000, tresorerie: 45000 },
  { month: 'Nov 24', ca: 96000, tresorerie: 54000 },
  { month: 'Déc 24', ca: 112000, tresorerie: 72000 },
  { month: 'Jan 25', ca: 92000, tresorerie: 62000 },
  { month: 'Fév 25', ca: 124000, tresorerie: 84000 },
  { month: 'Mar 25', ca: 148920, tresorerie: 94310 },
];

const TRANSACTIONS = [
  {
    ref: 'FAC-2025-089',
    date: '14 Mars 2025',
    tiers: 'ETS Congo Tech Distribution Gombe',
    badge: 'Client',
    category: 'Vente Prestation',
    mode: 'Virement',
    amount: '+4 800,00 $',
    isPositive: true,
    status: 'Validée',
  },
  {
    ref: 'DEP-2025-112',
    date: '13 Mars 2025',
    tiers: 'Fournisseur Congo Tech Matériel',
    badge: 'Fournisseur',
    category: 'Équipements',
    mode: 'Carte Bancaire',
    amount: '-1 450,00 $',
    isPositive: false,
    status: 'Validée',
  },
  {
    ref: 'FAC-2025-088',
    date: '12 Mars 2025',
    tiers: 'Chantal Mwamba',
    badge: 'Particulier',
    category: 'Forfait Mensuel',
    mode: 'Prélèvement SEPA',
    amount: '+650,00 $',
    isPositive: true,
    status: 'Validée',
  },
  {
    ref: 'DEP-2025-111',
    date: '11 Mars 2025',
    tiers: 'Cloud Hosting SAS',
    badge: 'Fournisseur',
    category: 'Logiciels SaaS',
    mode: 'Carte Bancaire',
    amount: '-240,00 $',
    isPositive: false,
    status: 'Validée',
  },
];

export const DashboardComptable: React.FC = () => {
  const [filterTx, setFilterTx] = useState<'all' | 'recettes' | 'depenses'>('all');
  const [iaValidated, setIaValidated] = useState(false);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dashboard Comptable</h1>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Temps Réel
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Vue d'ensemble financière en temps réel • Exercice fiscal 2025
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <select className="bg-white border border-slate-200 text-xs font-semibold text-slate-700 rounded-lg px-3 py-2 shadow-2xs focus:outline-none focus:ring-2 focus:ring-blue-500/20">
            <option>Ce mois-ci (Mars 2025)</option>
            <option>Premier Trimestre 2025</option>
            <option>Exercice 2024</option>
          </select>

          <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-colors">
            <Download className="w-3.5 h-3.5" />
            <span>Exporter FEC / Excel</span>
          </button>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm transition-colors">
            <Plus className="w-3.5 h-3.5" />
            <span>Nouvelle opération</span>
          </button>
        </div>
      </div>

      {/* 4 KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Chiffre d'affaires HT */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Chiffre d'affaires HT</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">148 920 $</div>
          <div className="flex items-center gap-1.5 mt-2.5">
            <span className="text-emerald-700 bg-emerald-50 text-[11px] font-bold px-1.5 py-0.5 rounded flex items-center gap-0.5">
              <ArrowUpRight className="w-3 h-3" /> +14.2%
            </span>
            <span className="text-[11px] text-slate-400 font-medium">vs M-1 (130 400 $)</span>
          </div>
        </div>

        {/* Card 2: Résultat Net Estimé */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Résultat Net Estimé</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-slate-900 tracking-tight">66 470 $</span>
            <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.5 rounded border border-emerald-100">
              Marge 44.6%
            </span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-600 mt-3 pt-2 border-t border-slate-100">
            <span>RECETTES: <strong className="text-slate-900">148 920 $</strong></span>
            <span>DÉPENSES: <strong className="text-rose-600">82 450 $</strong></span>
          </div>
        </div>

        {/* Card 3: Trésorerie disponible */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Trésorerie disponible</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 tracking-tight">94 310 $</div>
          <p className="text-[11px] text-slate-400 mt-1">Solde global consolidé à J+0</p>
          <div className="space-y-1 mt-2 text-[11px] text-slate-600 font-medium">
            <div className="flex justify-between">
              <span>🏦 Banque Principale</span>
              <span className="font-bold text-slate-800">81 200 $</span>
            </div>
            <div className="flex justify-between">
              <span>🪙 Caisse physique</span>
              <span className="font-bold text-slate-800">13 110 $</span>
            </div>
          </div>
        </div>

        {/* Card 4: Créances & Engagements */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-shadow">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Créances & Engagements</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Créances clients</span>
              <div className="text-right">
                <span className="font-bold text-slate-900">24 800 $</span>
                <span className="block text-[10px] text-rose-600 font-semibold">4 200 $ en retard</span>
              </div>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Dettes fournisseurs</span>
              <span className="font-bold text-slate-800">11 650 $</span>
            </div>
            <div className="flex justify-between text-slate-500 pt-1 border-t border-slate-100">
              <span>Valeur stock actif</span>
              <span className="font-bold text-blue-600">38 400 $</span>
            </div>
            <div className="flex justify-between font-bold text-slate-700 pt-1">
              <span>BFR estimé :</span>
              <span>51 550 $</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Graphique CA & Trésorerie */}
        <div className="lg:col-span-2 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">
                Évolution du Chiffre d'Affaires & Flux de Trésorerie
              </h2>
              <p className="text-[11px] text-slate-400">
                Comparatif mensuel des encaissements facturés vs position de trésorerie nette
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded bg-blue-600" />
                <span className="text-slate-600">C.A. Mensuel</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-1 bg-indigo-600 rounded" />
                <span className="text-slate-600">Trésorerie</span>
              </div>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={CHART_DATA} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748B' }} tickFormatter={(val) => `${val / 1000}k$`} />
                <Tooltip
                  formatter={(value: any) => [`${Number(value).toLocaleString()} $`, '']}
                  contentStyle={{ backgroundColor: '#0F172A', color: '#FFF', borderRadius: '8px', fontSize: '12px' }}
                />
                <Bar dataKey="ca" fill="#2563EB" radius={[4, 4, 0, 0]} barSize={34} />
                <Line type="monotone" dataKey="tresorerie" stroke="#6366F1" strokeWidth={3} dot={{ r: 4 }} />
              </ComposedChart>
            </ResponsiveContainer>
          </div>

          <div className="flex items-center justify-between pt-4 mt-2 border-t border-slate-100 text-xs">
            <span className="text-slate-500">Objectif T1 prévisionnel atteint à <strong>108%</strong></span>
            <a href="#journal" className="font-bold text-blue-600 hover:text-blue-700">Voir le grand livre analytique →</a>
          </div>
        </div>

        {/* Répartition des Dépenses */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">Répartition des dépenses</h2>
              <span className="text-xs font-bold text-slate-700">82 450 $ Total</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Ventilation analytique par grand compte (Mars 2025)</p>

            <div className="space-y-3.5">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Salaires & Charges</span>
                  <span className="text-slate-900">34 629 $ (42%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '42%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Fournisseurs & Achats</span>
                  <span className="text-slate-900">23 086 $ (28%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-blue-500 h-full rounded-full" style={{ width: '28%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Loyer & Locaux</span>
                  <span className="text-slate-900">12 367 $ (15%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-500 h-full rounded-full" style={{ width: '15%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Services & Logiciels</span>
                  <span className="text-slate-900">8 245 $ (10%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-indigo-400 h-full rounded-full" style={{ width: '10%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-slate-700">Frais Divers & Banque</span>
                  <span className="text-slate-900">4 123 $ (5%)</span>
                </div>
                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div className="bg-slate-400 h-full rounded-full" style={{ width: '5%' }} />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-blue-50/60 border border-blue-100 rounded-lg text-xs text-blue-900 flex items-start gap-2">
            <Sparkles className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              <strong>Optimisation fiscale détectée :</strong> Charges externes conformes au budget prévisionnel.
            </p>
          </div>
        </div>
      </div>

      {/* Bottom Section: Transactions + Alertes + Assistant IA */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6" id="journal">
        {/* Dernières transactions comptables */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
          <div className="p-5 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Dernières transactions comptables</h2>
              <p className="text-[11px] text-slate-400">Journal général synchronisé avec les flux bancaires</p>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-xs font-semibold">
              <button
                onClick={() => setFilterTx('all')}
                className={`px-2.5 py-1 rounded-md ${filterTx === 'all' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                Toutes
              </button>
              <button
                onClick={() => setFilterTx('recettes')}
                className={`px-2.5 py-1 rounded-md ${filterTx === 'recettes' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                Recettes
              </button>
              <button
                onClick={() => setFilterTx('depenses')}
                className={`px-2.5 py-1 rounded-md ${filterTx === 'depenses' ? 'bg-white text-slate-900 shadow-2xs font-bold' : 'text-slate-500'}`}
              >
                Dépenses
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-5 py-3">Réf / Date</th>
                  <th className="px-4 py-3">Tiers</th>
                  <th className="px-4 py-3">Catégorie</th>
                  <th className="px-4 py-3">Mode</th>
                  <th className="px-4 py-3 text-right">Montant</th>
                  <th className="px-5 py-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {TRANSACTIONS.map((tx, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-800">{tx.ref}</div>
                      <div className="text-[11px] text-slate-400">{tx.date}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-slate-900">{tx.tiers}</div>
                      <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium">
                        {tx.badge}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600 font-medium">{tx.category}</td>
                    <td className="px-4 py-3.5 text-slate-500">{tx.mode}</td>
                    <td className={`px-4 py-3.5 text-right font-extrabold ${tx.isPositive ? 'text-emerald-600' : 'text-rose-600'}`}>
                      {tx.amount}
                    </td>
                    <td className="px-5 py-3.5 text-center">
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="p-3.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
            <span>Affichage de 4 sur 248 écritures</span>
            <a href="#factures" className="font-bold text-blue-600 hover:text-blue-700">Voir tout le journal →</a>
          </div>
        </div>

        {/* Factures à échéance & IA Box */}
        <div className="space-y-6">
          {/* Factures à échéance & Alertes */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-500" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Factures à échéance & Alertes
                </h2>
              </div>
              <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full border border-rose-100">
                2 Critiques
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-3">Relances à effectuer et paiements prioritaires sous 48h</p>

            <div className="space-y-2.5">
              <div className="p-3 rounded-lg border border-rose-100 bg-rose-50/30 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Dieudonné Kasongo (Client)</div>
                  <div className="text-[11px] text-rose-600 font-bold mt-0.5">Facture en retard de 5 jours</div>
                  <div className="text-[10px] text-slate-400 mt-1">Facture FAC-2025-072 • Échéance 09 Mars</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-900">1 850,00 $</div>
                  <button className="text-[11px] font-bold text-blue-600 hover:underline mt-1 block">
                    Relancer
                  </button>
                </div>
              </div>

              <div className="p-3 rounded-lg border border-amber-100 bg-amber-50/30 flex items-start justify-between">
                <div>
                  <div className="text-xs font-bold text-slate-900">Fournisseur Katanga Mining Logistics</div>
                  <div className="text-[11px] text-amber-700 font-bold mt-0.5">À payer dans 48 heures</div>
                  <div className="text-[10px] text-slate-400 mt-1">Réf BL-88492 • IBAN vérifié</div>
                </div>
                <div className="text-right">
                  <div className="text-xs font-extrabold text-slate-900">3 200,00 $</div>
                  <button className="text-[11px] font-bold text-emerald-600 hover:underline mt-1 block">
                    Régler
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Assistant IA Box */}
          <div className="bg-white p-5 rounded-xl border border-indigo-100 shadow-2xs bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Assistant IA Comptable</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                SUGGESTION
              </span>
            </div>

            {iaValidated ? (
              <div className="py-4 text-center text-xs text-emerald-700 font-bold flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Association validée et enregistrée au grand livre !
              </div>
            ) : (
              <>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Détection d'un écart de rapprochement de <strong>450,00 $</strong> sur le compte Société Générale. Le montant correspond exactement à l'avoir émis <strong>FAC-2025-085</strong>.
                </p>

                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => setIaValidated(true)}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2 rounded-lg shadow-2xs transition-colors"
                  >
                    ✓ Valider l'association
                  </button>
                  <button className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-2 rounded-lg">
                    Modifier
                  </button>
                  <button className="px-2 text-slate-400 hover:text-slate-600 text-xs">
                    Ignorer
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
