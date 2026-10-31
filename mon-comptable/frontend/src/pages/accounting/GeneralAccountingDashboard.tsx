import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Scale,
  FileText,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Lock,
  ArrowRight,
  Plus,
  ShieldCheck,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredChartOfAccounts,
  getStoredEntries,
  getStoredFiscalYears,
  getStoredPeriods,
  getStoredBccExchangeRate,
  subscribeToBccRateUpdates,
} from '../../data/accountingMockData';

export const GeneralAccountingDashboard: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(getStoredChartOfAccounts);
  const [entries, setEntries] = useState(getStoredEntries);
  const fiscalYears = getStoredFiscalYears();
  const periods = getStoredPeriods();
  const [bccRate, setBccRate] = useState(getStoredBccExchangeRate);

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
      setEntries(getStoredEntries());
      setAccounts(getStoredChartOfAccounts());
    });
    return unsubscribe;
  }, []);

  const currentYear = fiscalYears.find((fy) => fy.year === '2026') || fiscalYears[0];
  const activePeriod = periods.find((p) => !p.isClosed) || periods[9];

  // Calculs comptables stricts en Franc Congolais (FC / CDF)
  const totalDebits = entries
    .filter((e) => e.status === 'VALIDATED')
    .reduce((acc, e) => acc + e.totalDebit, 0);

  const totalCredits = entries
    .filter((e) => e.status === 'VALIDATED')
    .reduce((acc, e) => acc + e.totalCredit, 0);

  const isGloballyBalanced = Math.abs(totalDebits - totalCredits) < 1;
  const pendingPosEntries = entries.filter((e) => e.status === 'DRAFT');

  // Créances clients (Classe 411)
  const clientAccounts = accounts.filter((a) => a.accountNumber.startsWith('411'));
  const totalReceivables = clientAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  // Dettes fournisseurs (Classe 401)
  const supplierAccounts = accounts.filter((a) => a.accountNumber.startsWith('401'));
  const totalPayables = supplierAccounts.reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);

  // Trésorerie disponible (Classe 5)
  const treasuryAccounts = accounts.filter((a) => a.accountClass === 5);
  const totalTreasury = treasuryAccounts.reduce((acc, a) => acc + (a.balance || 0), 0);

  // Résultat provisoire (Produits Classe 7 - Charges Classe 6)
  const totalRevenues = accounts
    .filter((a) => a.accountClass === 7)
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);
  const totalExpenses = accounts
    .filter((a) => a.accountClass === 6)
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const netResult = totalRevenues - totalExpenses;

  const formatFc = (val: number) => `${Math.round(val).toLocaleString('fr-FR')} FC`;
  const formatUsdEq = (val: number) =>
    `≈ ${(val / bccRate).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} $`;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Comptabilité Générale • SYSCOHADA Révisé RDC
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Monnaie Légale : Franc Congolais (FC / CDF)
            </span>
            <span className="text-xs text-slate-400">• Exercice {currentYear?.year || '2026'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Tableau de Bord Comptable & Partie Double (en FC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Conformément à la loi comptable congolaise (SYSCOHADA RDC), toutes les écritures et livres légaux sont tenus en Franc Congolais (FC). Taux BCC appliqué : <strong>1 $ = {bccRate.toLocaleString('fr-FR')} FC</strong>.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/comptabilite/ecritures"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Saisir une Écriture (FC)</span>
          </Link>

          <Link
            to="/comptabilite/balance"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <Scale className="w-4 h-4" />
            <span>Balance Générale</span>
          </Link>
        </div>
      </div>

      {/* Alerte d'Équilibre Inviolable */}
      <div
        className={`p-4 rounded-2xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm ${
          isGloballyBalanced
            ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border-rose-200 text-rose-900'
        }`}
      >
        <div className="flex items-center gap-3">
          {isGloballyBalanced ? (
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
          ) : (
            <AlertTriangle className="w-6 h-6 text-rose-600 shrink-0" />
          )}
          <div>
            <span className="font-extrabold block">
              {isGloballyBalanced
                ? 'Principe de la partie double respecté en Franc Congolais : Total Débit (FC) = Total Crédit (FC)'
                : 'Attention critique : Déséquilibre comptable détecté !'}
            </span>
            <span className="text-xs opacity-90">
              Débits cumulés : <strong>{formatFc(totalDebits)}</strong> ({formatUsdEq(totalDebits)}) •
              Crédits cumulés : <strong>{formatFc(totalCredits)}</strong> ({formatUsdEq(totalCredits)})
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl font-black text-xs bg-white/80 shadow-2xs self-start sm:self-auto">
          Écart : {Math.round(totalDebits - totalCredits).toLocaleString('fr-FR')} FC
        </span>
      </div>

      {/* Bannière Liaison Directe Ventes POS & Caisse -> Comptable (avec Reçus & Auto 00h00) */}
      <div className="p-4 sm:p-5 rounded-2xl border-2 border-amber-300/80 bg-gradient-to-r from-amber-50/90 via-white to-blue-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-200 text-amber-950 uppercase">
              Liaison Temps Réel : Ventes POS & Caisse → Comptable
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-900 text-amber-300">
              Validation Auto Système à 00h00
            </span>
          </div>
          <p className="text-xs sm:text-sm font-black text-slate-900">
            {pendingPosEntries.length > 0
              ? `${pendingPosEntries.length} encaissement(s) POS & Caisse transmis avec reçu justificatif en attente de validation (${formatFc(
                  pendingPosEntries.reduce((acc, e) => acc + e.totalDebit, 0)
                )})`
              : 'Tous les encaissements POS & Caisse du jour ont été validés dans le Journal.'}
          </p>
          <p className="text-xs text-slate-600">
            Les reçus imprimés par le caissier ou vendeur sont joints comme pièces justificatives. Sans validation manuelle du Comptable en fin de journée, le système les enregistre automatiquement à <strong>00h00</strong>.
          </p>
        </div>

        <Link
          to="/comptabilite/ecritures"
          className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs flex items-center justify-center gap-2 shrink-0 shadow-xs transition"
        >
          <span>Vérifier Reçus & Valider ({pendingPosEntries.length})</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Cartes KPI Comptables en Franc Congolais */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Résultat Provisoire */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Résultat Net (FC)</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-emerald-600">
            +{formatFc(netResult)}
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            Contre-valeur : {formatUsdEq(netResult)}
          </div>
          <div className="text-[10px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>Prod: {formatFc(totalRevenues)}</span>
            <span>Char: {formatFc(totalExpenses)}</span>
          </div>
        </div>

        {/* KPI 2 : Créances Clients (411) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Créances Clients (411)</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatFc(totalReceivables)}
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            Contre-valeur : {formatUsdEq(totalReceivables)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>Factures à apurer</span>
            <Link to="/comptabilite/grand-livre" className="text-blue-600 font-bold hover:underline">
              Grand Livre →
            </Link>
          </div>
        </div>

        {/* KPI 3 : Dettes Fournisseurs (401) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Dettes Fournisseurs (401)</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-slate-900">
            {formatFc(totalPayables)}
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            Contre-valeur : {formatUsdEq(totalPayables)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>Approvisionnements POS</span>
            <span className="font-bold text-rose-600">Exigibles</span>
          </div>
        </div>

        {/* KPI 4 : Trésorerie Globale (Classe 5) */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Trésorerie Active (Cl. 5)</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="text-xl font-black text-purple-700">
            {formatFc(totalTreasury)}
          </div>
          <div className="text-[11px] font-bold text-slate-400">
            Contre-valeur : {formatUsdEq(totalTreasury)}
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>Rawbank, Caisse, Mobile Money</span>
            <Link to="/tresorerie" className="text-purple-600 font-bold hover:underline">
              Détail →
            </Link>
          </div>
        </div>
      </div>

      {/* Raccourcis Modules Comptables & État Périodes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Navigation rapide modules */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
                <BookOpen className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Modules de la Comptabilité Générale (Tenue en Franc Congolais - FC)
              </h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">{entries.length} écritures validées</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <Link
              to="/comptabilite/plan-comptable"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between transition-colors group"
            >
              <div>
                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 block">
                  Plan Comptable (SYSCOHADA RDC)
                </span>
                <span className="text-[11px] text-slate-400">
                  {accounts.length} comptes valorisés en FC (Classes 1 à 8)
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/comptabilite/journaux"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between transition-colors group"
            >
              <div>
                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 block">
                  Journaux Auxiliaires (en FC)
                </span>
                <span className="text-[11px] text-slate-400">
                  Ventes (VT), Achats (AC), Banque (BQ), Caisse (CA), OD
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/comptabilite/grand-livre"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between transition-colors group"
            >
              <div>
                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 block">
                  Grand Livre des Comptes (FC)
                </span>
                <span className="text-[11px] text-slate-400">
                  Consultation des mouvements et soldes progressifs en FC
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>

            <Link
              to="/comptabilite/etats-financiers"
              className="p-3.5 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between transition-colors group"
            >
              <div>
                <span className="font-extrabold text-slate-900 group-hover:text-blue-600 block">
                  Bilan & Compte de Résultat (FC)
                </span>
                <span className="text-[11px] text-slate-400">
                  Liasse fiscale DGI RDC et états de synthèse en FC
                </span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-0.5 transition-all" />
            </Link>
          </div>
        </div>

        {/* Périodes & Clôtures */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-sm text-slate-900">Exercice & Période</h3>
              <Link to="/comptabilite/cloture" className="text-xs font-bold text-blue-600 hover:underline">
                Gérer →
              </Link>
            </div>

            <div className="space-y-3 mt-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-200/60">
                <div>
                  <span className="font-bold text-slate-800 block">Exercice 2026 (CDF)</span>
                  <span className="text-[11px] text-slate-400">01/01/2026 au 31/12/2026</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                  OUVERT
                </span>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-blue-50/50 border border-blue-200/60">
                <div>
                  <span className="font-bold text-blue-900 block">{activePeriod?.name || 'Octobre 2026'}</span>
                  <span className="text-[11px] text-blue-600">Période courante de saisie en FC</span>
                </div>
                <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                  ACTIVE
                </span>
              </div>

              <div className="text-[11px] text-slate-500">
                Périodes 01 à 09 clôturées et verrouillées contre toute altération rétroactive.
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 text-[11px] text-amber-900 flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Toute réouverture de période nécessite l'approbation de l'Administrateur.</span>
          </div>
        </div>
      </div>

      {/* Dernières Écritures Comptables en Franc Congolais */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Dernières Écritures Comptabilisées en Franc Congolais (FC / CDF)
              </h3>
              <p className="text-[11px] text-slate-400">
                Conformité OHADA RDC : Montants enregistrés en monnaie nationale (FC) avec mention de la pièce d'origine
              </p>
            </div>
          </div>
          <Link to="/comptabilite/ecritures" className="text-xs font-bold text-blue-600 hover:underline">
            Saisir / Voir le journal général →
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">N° Écriture</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Journal</th>
                <th className="py-2.5 px-3">Libellé de l'opération</th>
                <th className="py-2.5 px-3">Pièce Réf.</th>
                <th className="py-2.5 px-3 text-right">Débit (FC / CDF)</th>
                <th className="py-2.5 px-3 text-right">Crédit (FC / CDF)</th>
                <th className="py-2.5 px-3">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.slice(0, 6).map((entry) => (
                <tr key={entry.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{entry.entryNumber}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-md bg-slate-100 font-extrabold text-[10px] text-slate-700">
                      {entry.journalCode}
                    </span>
                  </td>
                  <td className="py-3 px-3 font-medium text-slate-800">{entry.label}</td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {entry.pieceRef || '-'}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-blue-700">
                    {formatFc(entry.totalDebit)}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-purple-700">
                    {formatFc(entry.totalCredit)}
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
