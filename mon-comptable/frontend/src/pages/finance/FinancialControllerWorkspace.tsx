import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  FileSearch,
  AlertTriangle,
  CheckCircle2,
  TrendingUp,
  TrendingDown,
  Scale,
  PieChart,
  Lock,
  Eye,
  PlusCircle,
  BookOpen,
  DollarSign,
  Building2,
  Check,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { INITIAL_CONTROLLER_ANOMALIES } from '../../data/multiTenantMockData';
import {
  getStoredBccExchangeRate,
  subscribeToBccRateUpdates,
} from '../../data/accountingMockData';
import { ControllerAnomalyReport } from '../../types';
import { useNavigate } from 'react-router-dom';

interface VerifiedEntrySample {
  id: number;
  entryNumber: string;
  date: string;
  journalCode: string;
  label: string;
  debitAccount: string;
  creditAccount: string;
  amountUsd: number;
  createdByName: string;
  validatedByName: string;
  status: 'VALIDATED';
  hasJustificatifDgi: boolean;
}

const SAMPLE_VALIDATED_ENTRIES: VerifiedEntrySample[] = [
  {
    id: 1,
    entryNumber: 'VT-2026-0089',
    date: '2026-10-30',
    journalCode: 'VT (Ventes)',
    label: 'Vente équipements & prestations — Client Gombe',
    debitAccount: '411100 (Clients)',
    creditAccount: '701100 (Ventes de marchandises)',
    amountUsd: 2450,
    createdByName: 'Mireille Kabongo (Comptable)',
    validatedByName: 'Mireille Kabongo (Comptable)',
    status: 'VALIDATED',
    hasJustificatifDgi: true,
  },
  {
    id: 2,
    entryNumber: 'AC-2026-0042',
    date: '2026-10-29',
    journalCode: 'AC (Achats)',
    label: 'Frais de dédouanement & transport corridor Matadi-Kinshasa',
    debitAccount: '611000 (Transports sur achats)',
    creditAccount: '401100 (Fournisseurs)',
    amountUsd: 850,
    createdByName: 'Mireille Kabongo (Comptable)',
    validatedByName: 'Mireille Kabongo (Comptable)',
    status: 'VALIDATED',
    hasJustificatifDgi: false,
  },
  {
    id: 3,
    entryNumber: 'CA-2026-0114',
    date: '2026-10-30',
    journalCode: 'CA (Caisse USD)',
    label: 'Encaissements espèces journaliers Caisse Principale',
    debitAccount: '571100 (Caisse Siège USD)',
    creditAccount: '701100 (Ventes & Prestations)',
    amountUsd: 1380,
    createdByName: 'Mireille Kabongo (Comptable)',
    validatedByName: 'Mireille Kabongo (Comptable)',
    status: 'VALIDATED',
    hasJustificatifDgi: true,
  },
  {
    id: 4,
    entryNumber: 'BQ-2026-0077',
    date: '2026-10-28',
    journalCode: 'BQ (Banque & Mobile Money)',
    label: 'Reversement marchand M-Pesa & IllicoCash vers Rawbank USD',
    debitAccount: '521100 (Rawbank USD)',
    creditAccount: '518100 (Portefeuilles Mobile Money)',
    amountUsd: 3920,
    createdByName: 'Mireille Kabongo (Comptable)',
    validatedByName: 'Mireille Kabongo (Comptable)',
    status: 'VALIDATED',
    hasJustificatifDgi: true,
  },
];

export const FinancialControllerWorkspace: React.FC = () => {
  const { user, activeCompany, activeBranding, logAuditEvent } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<
    'OVERVIEW' | 'ENTRIES_AUDIT' | 'BUDGET_VARIANCES' | 'ANOMALIES'
  >('OVERVIEW');

  const [anomalies, setAnomalies] = useState<ControllerAnomalyReport[]>(INITIAL_CONTROLLER_ANOMALIES);
  const [bccRate, setBccRate] = useState<number>(getStoredBccExchangeRate);

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
    });
    return unsubscribe;
  }, []);
  const [showAnomalyModal, setShowAnomalyModal] = useState(false);
  const [selectedEntryNumber, setSelectedEntryNumber] = useState('AC-2026-0042');
  const [anomalyCategory, setAnomalyCategory] = useState<ControllerAnomalyReport['category']>('PIECE_MANQUANTE');
  const [anomalySeverity, setAnomalySeverity] = useState<ControllerAnomalyReport['severity']>('MEDIUM');
  const [anomalyDesc, setAnomalyDesc] = useState('');

  const netMargin = activeCompany.stats.monthlyRevenue - activeCompany.stats.monthlyExpenses;
  const marginRatio =
    activeCompany.stats.monthlyRevenue > 0
      ? ((netMargin / activeCompany.stats.monthlyRevenue) * 100).toFixed(1)
      : '0.0';

  const handleCreateAnomaly = (e: React.FormEvent) => {
    e.preventDefault();
    if (!anomalyDesc.trim()) return;

    const newReport: ControllerAnomalyReport = {
      id: Date.now(),
      companyId: activeCompany.id,
      entryNumber: selectedEntryNumber,
      reportedBy: `${user?.name || 'Contrôleur'} (${user?.role})`,
      reportedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
      severity: anomalySeverity,
      category: anomalyCategory,
      description: anomalyDesc,
      status: 'OPEN',
    };

    setAnomalies((prev) => [newReport, ...prev]);
    setShowAnomalyModal(false);
    setAnomalyDesc('');

    logAuditEvent(
      'ANOMALY_REPORTED',
      'Contrôle Financier',
      `Signalement d'anomalie sur l'écriture ${selectedEntryNumber} (${anomalyCategory}) par ${user?.name}.`,
      anomalySeverity === 'HIGH' ? 'CRITICAL' : 'WARNING'
    );
  };

  return (
    <div className="space-y-6">
      {/* En-tête Contrôle Financier */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-purple-50 text-purple-800 border border-purple-200">
              <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
              <span>Espace Exclusif : Contrôle Financier & Audit Interne</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              <Lock className="w-3 h-3" />
              <span>Écritures Comptables Validées en Lecture Seule Stricte</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Contrôle Financier — {activeCompany.tradeName}
          </h1>
          <p className="text-xs text-slate-500">
            Supervision des flux financiers, audit des écritures SYSCOHADA, contrôle budgétaire et signalement d’anomalies sans altération des écritures validées.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setShowAnomalyModal(true)}
            className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Signaler une Anomalie / Demander Correction</span>
          </button>
          <button
            onClick={() => navigate('/finance/verification')}
            className="px-3.5 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Vérification des Paiements</span>
          </button>
        </div>
      </div>

      {/* KPIs Financiers de l'Entreprise Active */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Recettes Mensuelles (USD)</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${activeCompany.stats.monthlyRevenue.toLocaleString()}
          </p>
          <p className="text-[11px] text-emerald-600 font-semibold mt-1">
            +12.4% vs budget prévisionnel
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Charges & Dépenses (USD)</span>
            <TrendingDown className="w-4 h-4 text-rose-600" />
          </div>
          <p className="text-2xl font-extrabold text-slate-900 mt-2">
            ${activeCompany.stats.monthlyExpenses.toLocaleString()}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Taux de consommation budget : 84%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Marge Nette d’Exploitation</span>
            <PieChart className="w-4 h-4 text-purple-600" />
          </div>
          <p className="text-2xl font-extrabold text-emerald-700 mt-2">
            ${netMargin.toLocaleString()}
          </p>
          <p className="text-[11px] text-purple-700 font-bold mt-1">
            Rentabilité nette : {marginRatio}%
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 uppercase">
            <span>Anomalies Ouvertes</span>
            <AlertTriangle className="w-4 h-4 text-amber-600" />
          </div>
          <p className="text-2xl font-extrabold text-amber-600 mt-2">
            {anomalies.filter((a) => a.status !== 'RESOLVED').length}
          </p>
          <p className="text-[11px] text-slate-500 font-semibold mt-1">
            Demandes transmises au Comptable
          </p>
        </div>
      </div>

      {/* Onglets de Contrôle */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 pb-3">
        {[
          { id: 'OVERVIEW', label: 'Synthèse & États de Contrôle', icon: <Scale className="w-4 h-4" /> },
          {
            id: 'ENTRIES_AUDIT',
            label: 'Audit des Écritures Validées (Lecture Seule)',
            icon: <BookOpen className="w-4 h-4" />,
          },
          {
            id: 'BUDGET_VARIANCES',
            label: 'Contrôle Budgétaire & Écarts',
            icon: <PieChart className="w-4 h-4" />,
          },
          {
            id: 'ANOMALIES',
            label: `Registre des Anomalies (${anomalies.length})`,
            icon: <AlertTriangle className="w-4 h-4" />,
          },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${
              activeTab === tab.id
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* TAB 1: SYNTHÈSE & ACCÈS RAPIDES DE CONSULTATION */}
      {activeTab === 'OVERVIEW' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <FileSearch className="w-4 h-4 text-purple-600" />
              <span>Contrôle de Conformité Comptable (SYSCOHADA Révisé)</span>
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Conformément à la séparation des pouvoirs, le Contrôleur Financier audite le Grand Livre, la Balance Générale et les États Financiers en lecture seule. Il ne peut ni modifier ni supprimer une écriture validée par le Comptable.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => navigate('/comptabilite/grand-livre')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 text-left transition"
              >
                <p className="text-xs font-extrabold text-slate-900">Consulter le Grand Livre</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Lecture seule • Détail des mouvements</p>
              </button>
              <button
                onClick={() => navigate('/comptabilite/balance')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 text-left transition"
              >
                <p className="text-xs font-extrabold text-slate-900">Consulter la Balance 6 Col.</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Équilibre Débit / Crédit vérifié</p>
              </button>
              <button
                onClick={() => navigate('/comptabilite/etats-financiers')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 text-left transition"
              >
                <p className="text-xs font-extrabold text-slate-900">Bilan & Compte de Résultat</p>
                <p className="text-[11px] text-slate-500 mt-0.5">États financiers officiels en FC (CDF)</p>
              </button>
              <button
                onClick={() => navigate('/analytique/rentabilite')}
                className="p-3.5 rounded-xl border border-slate-200 hover:border-purple-400 bg-slate-50/50 text-left transition"
              >
                <p className="text-xs font-extrabold text-slate-900">Rentabilité Analytique</p>
                <p className="text-[11px] text-slate-500 mt-0.5">Marges par service, plat ou produit</p>
              </button>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
            <h3 className="text-sm font-extrabold text-slate-900 flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              <span>Trésorerie & Rapprochement des Paiements</span>
            </h3>
            <div className="space-y-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Solde Consolidé Caisse & Banques</p>
                  <p className="text-[11px] text-slate-500">Espèces USD + Rawbank + Mobile Money</p>
                </div>
                <span className="text-base font-extrabold text-emerald-700">
                  ${activeCompany.stats.cashBalance.toLocaleString()}
                </span>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">Opérations Quotidiennes Auditées</p>
                  <p className="text-[11px] text-slate-500">Tickets POS, Factures & Reçus Caisse</p>
                </div>
                <span className="text-base font-extrabold text-blue-700">
                  {activeCompany.stats.dailyTransactionsCount} opérations / jour
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: AUDIT DES ÉCRITURES VALIDÉES (LECTURE SEULE STRICTE) */}
      {activeTab === 'ENTRIES_AUDIT' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Inspection des Écritures Comptables Validées (Mode Lecture Seule)
              </h3>
              <p className="text-xs text-slate-500">
                Les boutons d’édition et de suppression sont verrouillés pour le Contrôleur Financier. Utilisez « Signaler une anomalie » pour demander une écriture de régularisation au Comptable.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-3">N° Pièce</th>
                  <th className="py-3 px-3">Date & Journal</th>
                  <th className="py-3 px-3">Libellé de l’Écriture</th>
                  <th className="py-3 px-3">Comptes (Débit / Crédit)</th>
                  <th className="py-3 px-3 text-right">Montant Légal (FC / CDF)</th>
                  <th className="py-3 px-3">Pièce DGI</th>
                  <th className="py-3 px-3 text-right">Contrôle</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {SAMPLE_VALIDATED_ENTRIES.map((entry) => (
                  <tr key={entry.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono font-bold text-purple-700">
                      {entry.entryNumber}
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-bold text-slate-800">{entry.date}</p>
                      <p className="text-[10px] text-slate-500">{entry.journalCode}</p>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-semibold text-slate-900">{entry.label}</p>
                      <p className="text-[10px] text-slate-400">Validé par : {entry.validatedByName}</p>
                    </td>
                    <td className="py-3 px-3 text-[11px]">
                      <p className="text-slate-700">D: {entry.debitAccount}</p>
                      <p className="text-slate-500">C: {entry.creditAccount}</p>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <p className="font-extrabold text-slate-900">
                        {Math.round(entry.amountUsd * bccRate).toLocaleString('fr-FR')} FC
                      </p>
                      <p className="text-[10px] text-slate-400 font-semibold">
                        (Pièce : ${entry.amountUsd.toLocaleString()} • BCC : {bccRate.toLocaleString('fr-FR')} FC)
                      </p>
                    </td>
                    <td className="py-3 px-3">
                      {entry.hasJustificatifDgi ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <Check className="w-3 h-3" /> Conforme
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          <AlertTriangle className="w-3 h-3" /> Manquant
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedEntryNumber(entry.entryNumber);
                          setShowAnomalyModal(true);
                        }}
                        className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-[11px]"
                      >
                        Signaler anomalie
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: CONTRÔLE BUDGÉTAIRE & ÉCARTS */}
      {activeTab === 'BUDGET_VARIANCES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Suivi des Budgets, Écarts et Rentabilité par Centre de Coûts
              </h3>
              <p className="text-xs text-slate-500">
                Comparaison entre les budgets prévisionnels alloués et les charges réelles constatées en USD ($).
              </p>
            </div>
            <button
              onClick={() => navigate('/analytique/budgets')}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-bold"
            >
              Ouvrir le Module Budgétaire Complet
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                center: 'Exploitation Principale & Ventes',
                budget: 8500,
                actual: 7920,
                status: 'FAVORABLE',
              },
              {
                center: 'Logistique, Approvisionnement & Stocks',
                budget: 4200,
                actual: 4580,
                status: 'DEPASSEMENT',
              },
              {
                center: 'Administration, Énergie & Sécurité',
                budget: 2500,
                actual: 2100,
                status: 'FAVORABLE',
              },
            ].map((b, i) => {
              const variance = b.budget - b.actual;
              return (
                <div key={i} className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-2">
                  <p className="text-xs font-extrabold text-slate-900">{b.center}</p>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Budget alloué :</span>
                    <span className="font-bold">${b.budget.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Réalisé réel :</span>
                    <span className="font-bold">${b.actual.toLocaleString()}</span>
                  </div>
                  <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-xs">
                    <span className="font-bold">Écart budgétaire :</span>
                    <span
                      className={`font-extrabold px-2 py-0.5 rounded ${
                        variance >= 0
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {variance >= 0 ? `+$${variance}` : `-$${Math.abs(variance)}`}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: REGISTRE DES ANOMALIES & DEMANDES DE CORRECTION */}
      {activeTab === 'ANOMALIES' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Demandes de Correction & Anomalies Signalées au Comptable
              </h3>
              <p className="text-xs text-slate-500">
                Traçabilité complète des observations du Contrôleur Financier.
              </p>
            </div>
            <button
              onClick={() => setShowAnomalyModal(true)}
              className="px-3 py-1.5 rounded-xl bg-amber-600 text-white text-xs font-bold flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Nouveau Signalement</span>
            </button>
          </div>

          <div className="space-y-3">
            {anomalies.map((anom) => (
              <div
                key={anom.id}
                className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-extrabold px-2 py-0.5 rounded bg-purple-100 text-purple-900">
                      Pièce : {anom.entryNumber}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                      {anom.category}
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Signalé le {anom.reportedAt} par {anom.reportedBy}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 font-medium">{anom.description}</p>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase ${
                      anom.status === 'RESOLVED'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {anom.status === 'RESOLVED' ? 'Corrigé par Comptable' : 'En attente Comptable'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Signalement d'Anomalie */}
      {showAnomalyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateAnomaly}
            className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Signaler une Anomalie / Demander une Régularisation
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowAnomalyModal(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">N° Écriture ou Pièce</label>
                <input
                  type="text"
                  value={selectedEntryNumber}
                  onChange={(e) => setSelectedEntryNumber(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono font-bold"
                  required
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">Catégorie d’anomalie</label>
                <select
                  value={anomalyCategory}
                  onChange={(e) => setAnomalyCategory(e.target.value as any)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                >
                  <option value="PIECE_MANQUANTE">Pièce justificative DGI manquante</option>
                  <option value="ECART_MONTANT">Écart de montant / rapprochement</option>
                  <option value="IMPUTATION_COMPTE">Erreur d’imputation de compte</option>
                  <option value="DEPASSEMENT_BUDGET">Dépassement budgétaire non autorisé</option>
                </select>
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">Niveau de criticité</label>
              <div className="flex gap-2">
                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((sev) => (
                  <button
                    key={sev}
                    type="button"
                    onClick={() => setAnomalySeverity(sev)}
                    className={`flex-1 py-1.5 rounded-xl font-bold border ${
                      anomalySeverity === sev
                        ? 'bg-purple-600 text-white border-purple-600'
                        : 'bg-slate-50 text-slate-600 border-slate-200'
                    }`}
                  >
                    {sev === 'LOW' ? 'Mineure' : sev === 'MEDIUM' ? 'Moyenne' : 'Haute / Critique'}
                  </button>
                ))}
              </div>
            </div>

            <div className="text-xs">
              <label className="block font-bold text-slate-600 mb-1">
                Instructions de correction pour le Comptable
              </label>
              <textarea
                rows={3}
                value={anomalyDesc}
                onChange={(e) => setAnomalyDesc(e.target.value)}
                placeholder="Décrivez l'écart constaté ou la pièce justificative attendue..."
                className="w-full p-3 border border-slate-200 rounded-xl"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAnomalyModal(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold"
              >
                Envoyer au Comptable & Journaliser
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
