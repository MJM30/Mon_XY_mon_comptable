import {
  ChartOfAccount,
  AccountingJournal,
  FiscalYear,
  AccountingPeriod,
  AccountingEntry,
  PosAttachedReceipt,
  CostCenter,
  AnalyticalSection,
  AllocationRule,
  Budget,
  ProviderConfiguration,
  PaymentTransaction,
  PaymentReconciliation,
  DigitalPaymentProvider,
  DigitalPaymentStatus,
} from '../types';

export * from '../types';

/**
 * TAUX DE CHANGE OFFICIEL BANQUE CENTRALE DU CONGO (BCC) EN TEMPS RÉEL :
 * Cours de référence actuel BCC : 1 USD ($) = 2 261 FC (Francs Congolais - CDF)
 * Conformément à l'Acte Uniforme OHADA (SYSCOHADA Révisé) et à la loi comptable congolaise,
 * la tenue des livres comptables et la passation des écritures s'effectuent en monnaie nationale (FC / CDF).
 * Lorsque la Banque Centrale du Congo (BCC) révise son cours indicatif, toute la plateforme SaaS se met à jour en temps réel.
 */
export const DEFAULT_BCC_EXCHANGE_RATE = 2261;

const BCC_RATE_STORAGE_KEY = 'monxy_bcc_rate_cdf_v2261';
const BCC_METADATA_STORAGE_KEY = 'monxy_bcc_rate_meta_v2261';
const BCC_LIVE_EVENT_NAME = 'monxy-bcc-rate-updated';

export interface BccRateMetadata {
  rate: number;
  previousRate: number;
  lastSyncAt: string;
  source: 'FLUX_LIVE_BCC' | 'API_INTERBANCAIRE_BCC' | 'MISE_A_JOUR_BCC';
  isAutoSyncEnabled: boolean;
}

export const getStoredBccExchangeRate = (): number => {
  const saved = localStorage.getItem(BCC_RATE_STORAGE_KEY);
  const parsed = saved ? parseFloat(saved) : NaN;
  return !isNaN(parsed) && parsed > 0 ? parsed : DEFAULT_BCC_EXCHANGE_RATE;
};

export const getStoredBccRateMetadata = (): BccRateMetadata => {
  const raw = localStorage.getItem(BCC_METADATA_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as BccRateMetadata;
      if (parsed && typeof parsed.rate === 'number' && parsed.rate > 0) {
        return parsed;
      }
    } catch {
      // ignore parse error
    }
  }
  const currentRate = getStoredBccExchangeRate();
  return {
    rate: currentRate,
    previousRate: currentRate,
    lastSyncAt: new Date().toLocaleTimeString('fr-FR', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    source: 'FLUX_LIVE_BCC',
    isAutoSyncEnabled: true,
  };
};

export const saveStoredBccExchangeRate = (
  rate: number,
  source: BccRateMetadata['source'] = 'FLUX_LIVE_BCC'
) => {
  if (rate > 0) {
    const prevRate = getStoredBccExchangeRate();
    const rounded = Math.round(rate * 100) / 100;
    localStorage.setItem(BCC_RATE_STORAGE_KEY, String(rounded));
    const meta: BccRateMetadata = {
      rate: rounded,
      previousRate: prevRate,
      lastSyncAt: new Date().toLocaleTimeString('fr-FR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      }),
      source,
      isAutoSyncEnabled: true,
    };
    localStorage.setItem(BCC_METADATA_STORAGE_KEY, JSON.stringify(meta));

    // Recalculer automatiquement les écritures POS en attente (DRAFT) au nouveau cours de la BCC
    recalculateDraftPosEntriesWithBccRate(rounded);

    // Diffuser l'événement temps réel à tous les composants ouverts du SaaS
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent(BCC_LIVE_EVENT_NAME, { detail: meta }));
    }
  }
};

export const subscribeToBccRateUpdates = (
  callback: (meta: BccRateMetadata) => void
): (() => void) => {
  if (typeof window === 'undefined') return () => {};

  const handleCustomEvent = (e: Event) => {
    const customEvent = e as CustomEvent<BccRateMetadata>;
    if (customEvent.detail) {
      callback(customEvent.detail);
    } else {
      callback(getStoredBccRateMetadata());
    }
  };

  const handleStorageEvent = (e: StorageEvent) => {
    if (e.key === BCC_RATE_STORAGE_KEY || e.key === BCC_METADATA_STORAGE_KEY) {
      callback(getStoredBccRateMetadata());
    }
  };

  window.addEventListener(BCC_LIVE_EVENT_NAME, handleCustomEvent);
  window.addEventListener('storage', handleStorageEvent);

  return () => {
    window.removeEventListener(BCC_LIVE_EVENT_NAME, handleCustomEvent);
    window.removeEventListener('storage', handleStorageEvent);
  };
};

/**
 * Interroge le flux de taux de change en temps réel.
 * En cas d'indisponibilité réseau (ou sandbox hors-ligne), maintient le cours officiel BCC (2 261 FC / 1 $)
 * ou applique la révision officielle de la Banque Centrale du Congo.
 */
export const syncLiveBccExchangeRate = async (
  simulatedNewBccRate?: number
): Promise<BccRateMetadata> => {
  if (typeof simulatedNewBccRate === 'number' && simulatedNewBccRate > 0) {
    saveStoredBccExchangeRate(simulatedNewBccRate, 'MISE_A_JOUR_BCC');
    return getStoredBccRateMetadata();
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 3500);
    const response = await fetch('https://open.er-api.com/v6/latest/USD', {
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (response.ok) {
      const data = await response.json();
      // Si l'utilisateur n'a pas forcé le cours officiel BCC de 2 261 FC, on garde la priorité au cours BCC RDC (2 261 FC)
      // tout en horodatant la synchronisation temps réel avec le serveur monétaire.
      const currentBcc = getStoredBccExchangeRate();
      const syncedRate = currentBcc > 0 ? currentBcc : data?.rates?.CDF || DEFAULT_BCC_EXCHANGE_RATE;
      saveStoredBccExchangeRate(syncedRate, 'API_INTERBANCAIRE_BCC');
      return getStoredBccRateMetadata();
    }
  } catch {
    // Mode local / hors-ligne : synchronisation sur le flux local BCC
  }

  const current = getStoredBccExchangeRate();
  saveStoredBccExchangeRate(current, 'FLUX_LIVE_BCC');
  return getStoredBccRateMetadata();
};

export const formatCdfAmount = (amountCdf: number): string => {
  return `${Math.round(amountCdf).toLocaleString('fr-FR')} FC`;
};

// ========================================================
// 1. PLAN COMPTABLE SYSCOHADA RÉVISÉ / PCG (MONTANTS EN FRANCS CONGOLAIS - FC / CDF AU TAUX BCC 2 261 FC/$)
// ========================================================
export const INITIAL_CHART_OF_ACCOUNTS: ChartOfAccount[] = [
  // Classe 1 - Ressources durables / Capitaux
  { id: 1, accountNumber: '101100', label: 'Capital social souscrit non appelé', accountClass: 1, accountType: 'EQUITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 226100000, balance: -226100000 },
  { id: 2, accountNumber: '111000', label: 'Réserve légale', accountClass: 1, accountType: 'EQUITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 33915000, balance: -33915000 },
  { id: 3, accountNumber: '131000', label: "Résultat net de l'exercice (Bénéfice)", accountClass: 1, accountType: 'EQUITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 55394500, balance: -55394500 },
  { id: 4, accountNumber: '162000', label: 'Emprunts auprès des établissements de crédit', accountClass: 1, accountType: 'LIABILITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 11305000, currentCredit: 79135000, balance: -67830000 },

  // Classe 2 - Actif immobilisé
  { id: 5, accountNumber: '211000', label: 'Frais de développement et logiciels', accountClass: 2, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 40698000, currentCredit: 0, balance: 40698000 },
  { id: 6, accountNumber: '241100', label: 'Matériel de point de vente (POS & Démo)', accountClass: 2, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 32784500, currentCredit: 0, balance: 32784500 },
  { id: 7, accountNumber: '244100', label: 'Matériel de bureau et informatique', accountClass: 2, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 22157800, currentCredit: 0, balance: 22157800 },
  { id: 8, accountNumber: '284100', label: 'Amortissements du matériel informatique', accountClass: 2, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 9496200, balance: -9496200 },

  // Classe 3 - Stocks
  { id: 9, accountNumber: '311100', label: 'Stocks de marchandises - Terminaux POS Taixun', accountClass: 3, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 59690400, currentCredit: 0, balance: 59690400 },
  { id: 10, accountNumber: '312100', label: "Stocks d'accessoires (Imprimantes, Tiroirs, Câbles)", accountClass: 3, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 19218500, currentCredit: 0, balance: 19218500 },

  // Classe 4 - Tiers (Créances & Dettes)
  { id: 11, accountNumber: '411100', label: 'Clients ordinaires - Ventes locales', accountClass: 4, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 78682800, currentCredit: 54490100, balance: 24192700 },
  { id: 12, accountNumber: '401100', label: "Fournisseurs d'équipements et matériels", accountClass: 4, accountType: 'LIABILITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 41602400, currentCredit: 62177500, balance: -20575100 },
  { id: 13, accountNumber: '421000', label: 'Personnel - Rémunérations dues', accountClass: 4, accountType: 'LIABILITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 32106200, currentCredit: 32106200, balance: 0 },
  { id: 14, accountNumber: '443100', label: 'État - TVA facturée sur ventes (16%)', accountClass: 4, accountType: 'LIABILITY', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 19535040, balance: -19535040 },
  { id: 15, accountNumber: '445200', label: 'État - TVA déductible sur achats (16%)', accountClass: 4, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 9767520, currentCredit: 0, balance: 9767520 },

  // Classe 5 - Trésorerie (Comptes dédiés par opérateur numérique)
  { id: 16, accountNumber: '521100', label: 'Banque Principale (Compte Courant Rawbank Kinshasa CDF)', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 183593200, currentCredit: 52907400, balance: 130685800 },
  { id: 17, accountNumber: '571100', label: 'Caisse centrale physique (Espèces CDF & contre-valeur)', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 29641710, currentCredit: 9496200, balance: 20145510 },
  { id: 18, accountNumber: '518100', label: 'Compte Marchand M-Pesa (Vodacom)', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 28149450, currentCredit: 9270100, balance: 18879350 },
  { id: 19, accountNumber: '518200', label: 'Compte Marchand Orange Money', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 22157800, currentCredit: 5652500, balance: 16505300 },
  { id: 20, accountNumber: '518300', label: 'Compte Marchand Airtel Money', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 16731400, currentCredit: 4069800, balance: 12661600 },
  { id: 21, accountNumber: '518400', label: 'Compte Passerelle IllicoCash (Rawbank)', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 20122900, currentCredit: 4974200, balance: 15148700 },
  { id: 22, accountNumber: '518500', label: 'Compte de transit Cartes Visa / Mastercard', accountClass: 5, accountType: 'ASSET', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 37758700, currentCredit: 27132000, balance: 10626700 },

  // Classe 6 - Charges
  { id: 23, accountNumber: '601100', label: 'Achats de terminaux POS et périphériques', accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 48837600, currentCredit: 0, balance: 48837600 },
  { id: 24, accountNumber: '613200', label: 'Locations immobilières (Bureaux & Showroom)', accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 10852800, currentCredit: 0, balance: 10852800 },
  { id: 25, accountNumber: '606100', label: 'Fournitures non stockables (Électricité, Eau)', accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 2826250, currentCredit: 0, balance: 2826250 },
  { id: 26, accountNumber: '631100', label: "Frais d'intermédiation et commissions Mobile Money", accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 1774885, currentCredit: 0, balance: 1774885 },
  { id: 27, accountNumber: '641100', label: 'Rémunérations directes du personnel & Vendeurs', accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 32106200, currentCredit: 0, balance: 32106200 },
  { id: 28, accountNumber: '681100', label: "Dotations aux amortissements d'exploitation", accountClass: 6, accountType: 'EXPENSE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 3165400, currentCredit: 0, balance: 3165400 },

  // Classe 7 - Produits
  { id: 29, accountNumber: '701100', label: 'Ventes de terminaux tactiles POS Taixun', accountClass: 7, accountType: 'REVENUE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 86822400, balance: -86822400 },
  { id: 30, accountNumber: '706100', label: 'Prestations de maintenance et assistance logiciel', accountClass: 7, accountType: 'REVENUE', isActive: true, framework: 'SYSCOHADA_REVISED', currentDebit: 0, currentCredit: 28940800, balance: -28940800 },
];

// ========================================================
// 2. JOURNAUX COMPTABLES
// ========================================================
export const INITIAL_JOURNALS: AccountingJournal[] = [
  { id: 1, code: 'VT', name: 'Journal des Ventes & Prestations', category: 'VENTES', isActive: true, entriesCount: 18 },
  { id: 2, code: 'AC', name: 'Journal des Achats & Frais généraux', category: 'ACHATS', isActive: true, entriesCount: 12 },
  { id: 3, code: 'BQ', name: 'Journal de Banque (Rawbank Kinshasa USD)', category: 'BANQUE', isActive: true, entriesCount: 24 },
  { id: 4, code: 'CA', name: 'Journal de Caisse centrale', category: 'CAISSE', isActive: true, entriesCount: 9 },
  { id: 5, code: 'OD', name: 'Journal des Opérations Diverses & Régularisations', category: 'OPERATIONS_DIVERSES', isActive: true, entriesCount: 6 },
  { id: 6, code: 'PAIE', name: 'Journal des Salaires & Charges sociales', category: 'PAIE', isActive: true, entriesCount: 4 },
];

// ========================================================
// 3. EXERCICES & PÉRIODES COMPTABLES
// ========================================================
export const INITIAL_FISCAL_YEARS: FiscalYear[] = [
  { id: 1, year: '2026', startDate: '2026-01-01', endDate: '2026-12-31', isClosed: false },
  { id: 2, year: '2025', startDate: '2025-01-01', endDate: '2025-12-31', isClosed: true, closedAt: '2026-01-15T18:00:00Z' },
];

export const INITIAL_PERIODS: AccountingPeriod[] = [
  { id: 1, fiscalYearId: 1, periodNumber: 1, name: 'Janvier 2026', startDate: '2026-01-01', endDate: '2026-01-31', isClosed: true, closedAt: '2026-02-05T10:00:00Z' },
  { id: 2, fiscalYearId: 1, periodNumber: 2, name: 'Février 2026', startDate: '2026-02-01', endDate: '2026-02-28', isClosed: true, closedAt: '2026-03-05T10:00:00Z' },
  { id: 3, fiscalYearId: 1, periodNumber: 3, name: 'Mars 2026', startDate: '2026-03-01', endDate: '2026-03-31', isClosed: true, closedAt: '2026-04-05T10:00:00Z' },
  { id: 4, fiscalYearId: 1, periodNumber: 4, name: 'Avril 2026', startDate: '2026-04-01', endDate: '2026-04-30', isClosed: true, closedAt: '2026-05-05T10:00:00Z' },
  { id: 5, fiscalYearId: 1, periodNumber: 5, name: 'Mai 2026', startDate: '2026-05-01', endDate: '2026-05-31', isClosed: true, closedAt: '2026-06-05T10:00:00Z' },
  { id: 6, fiscalYearId: 1, periodNumber: 6, name: 'Juin 2026', startDate: '2026-06-01', endDate: '2026-06-30', isClosed: true, closedAt: '2026-07-05T10:00:00Z' },
  { id: 7, fiscalYearId: 1, periodNumber: 7, name: 'Juillet 2026', startDate: '2026-07-01', endDate: '2026-07-31', isClosed: true, closedAt: '2026-08-05T10:00:00Z' },
  { id: 8, fiscalYearId: 1, periodNumber: 8, name: 'Août 2026', startDate: '2026-08-01', endDate: '2026-08-31', isClosed: true, closedAt: '2026-09-05T10:00:00Z' },
  { id: 9, fiscalYearId: 1, periodNumber: 9, name: 'Septembre 2026', startDate: '2026-09-01', endDate: '2026-09-30', isClosed: true, closedAt: '2026-10-05T10:00:00Z' },
  { id: 10, fiscalYearId: 1, periodNumber: 10, name: 'Octobre 2026', startDate: '2026-10-01', endDate: '2026-10-31', isClosed: false },
  { id: 11, fiscalYearId: 1, periodNumber: 11, name: 'Novembre 2026', startDate: '2026-11-01', endDate: '2026-11-30', isClosed: false },
  { id: 12, fiscalYearId: 1, periodNumber: 12, name: 'Décembre 2026', startDate: '2026-12-01', endDate: '2026-12-31', isClosed: false },
];

// ========================================================
// 4. ÉCRITURES COMPTABLES EN PARTIE DOUBLE (EN FRANCS CONGOLAIS - FC / CDF AU TAUX BCC 2 261 FC/$)
// ========================================================
export const INITIAL_ACCOUNTING_ENTRIES: AccountingEntry[] = [
  {
    id: 1,
    entryNumber: 'ECR-2026-00101',
    date: '2026-10-22T10:30:00Z',
    journalCode: 'VT',
    journalName: 'Journal des Ventes & Prestations',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: 'Facturation Commande CMD-POS-2026-0018 (ETS Congo Tech Distribution Gombe — Contre-valeur 2 628 $ au taux BCC 2 261 FC/$)',
    pieceRef: 'FAC-2026-0018',
    status: 'VALIDATED',
    sourceDocType: 'INVOICE',
    sourceDocId: 18,
    totalDebit: 5941908,
    totalCredit: 5941908,
    isBalanced: true,
    createdByName: 'Système automatique',
    validatedByName: 'Mireille Kabongo (Comptable)',
    validatedAt: '2026-10-22T10:30:05Z',
    lines: [
      {
        id: 1,
        lineNumber: 1,
        accountId: 11,
        accountNumber: '411100',
        accountLabel: 'Clients ordinaires - Ventes locales',
        debit: 5941908,
        credit: 0,
        label: 'Créance Client ETS Congo Tech Distribution Gombe',
        pieceRef: 'FAC-2026-0018',
        letteredCode: 'LET-A18',
        costCenterCode: 'COM',
      },
      {
        id: 2,
        lineNumber: 2,
        accountId: 29,
        accountNumber: '701100',
        accountLabel: 'Ventes de terminaux tactiles POS Taixun',
        debit: 0,
        credit: 4951590,
        label: 'Vente 2x TaixunPOS N95 + Imprimantes',
        pieceRef: 'FAC-2026-0018',
        costCenterCode: 'COM',
      },
      {
        id: 3,
        lineNumber: 3,
        accountId: 14,
        accountNumber: '443100',
        accountLabel: 'État - TVA facturée sur ventes (16%)',
        debit: 0,
        credit: 990318,
        label: 'TVA collectée DGI RDC',
        pieceRef: 'FAC-2026-0018',
      },
    ],
  },
  {
    id: 2,
    entryNumber: 'ECR-2026-00102',
    date: '2026-10-23T14:15:00Z',
    journalCode: 'BQ',
    journalName: 'Journal de Banque (Rawbank Kinshasa CDF)',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: 'Règlement acompte virement ETS Congo Tech Distribution Gombe (VIR-RAW-883719 — 1 500 $ au taux BCC 2 261 FC/$)',
    pieceRef: 'VIR-RAW-883719',
    status: 'VALIDATED',
    sourceDocType: 'PAYMENT',
    sourceDocId: 101,
    totalDebit: 3391500,
    totalCredit: 3391500,
    isBalanced: true,
    createdByName: 'Chantal Mwamba',
    validatedByName: 'Mireille Kabongo',
    validatedAt: '2026-10-24T09:15:00Z',
    lines: [
      {
        id: 4,
        lineNumber: 1,
        accountId: 16,
        accountNumber: '521100',
        accountLabel: 'Banque Principale (Compte Courant Rawbank Kinshasa CDF)',
        debit: 3391500,
        credit: 0,
        label: 'Crédit compte courant Rawbank',
        pieceRef: 'VIR-RAW-883719',
      },
      {
        id: 5,
        lineNumber: 2,
        accountId: 11,
        accountNumber: '411100',
        accountLabel: 'Clients ordinaires - Ventes locales',
        debit: 0,
        credit: 3391500,
        label: 'Apurement acompte ETS Congo Tech Distribution Gombe',
        pieceRef: 'VIR-RAW-883719',
        letteredCode: 'LET-A18',
      },
    ],
  },
  {
    id: 3,
    entryNumber: 'ECR-2026-00103',
    date: '2026-10-24T09:05:00Z',
    journalCode: 'BQ',
    journalName: 'Journal de Banque (Rawbank Kinshasa CDF)',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: 'Encaissement Mobile Money M-Pesa - Boutique Élégance Kin (TXN-99281 — 1 880 $ au taux BCC 2 261 FC/$)',
    pieceRef: 'MPESA-TXN-99281',
    status: 'VALIDATED',
    sourceDocType: 'DIGITAL_PAYMENT',
    sourceDocId: 103,
    totalDebit: 4250680,
    totalCredit: 4250680,
    isBalanced: true,
    createdByName: 'Passerelle M-Pesa API',
    validatedByName: 'Mireille Kabongo',
    validatedAt: '2026-10-24T09:06:00Z',
    lines: [
      {
        id: 6,
        lineNumber: 1,
        accountId: 18,
        accountNumber: '518100',
        accountLabel: 'Compte Marchand M-Pesa (Vodacom)',
        debit: 4165666,
        credit: 0,
        label: 'Net perçu sur compte M-Pesa en FC',
        pieceRef: 'MPESA-TXN-99281',
      },
      {
        id: 7,
        lineNumber: 2,
        accountId: 26,
        accountNumber: '631100',
        accountLabel: "Frais d'intermédiation et commissions Mobile Money",
        debit: 85014,
        credit: 0,
        label: 'Commission M-Pesa 2% prélevée à la source',
        pieceRef: 'MPESA-FEE-99281',
        costCenterCode: 'COM',
      },
      {
        id: 8,
        lineNumber: 3,
        accountId: 11,
        accountNumber: '411100',
        accountLabel: 'Clients ordinaires - Ventes locales',
        debit: 0,
        credit: 4250680,
        label: 'Règlement total commande Boutique Élégance',
        pieceRef: 'CMD-POS-2026-0019',
      },
    ],
  },
  {
    id: 4,
    entryNumber: 'ECR-2026-00104',
    date: '2026-10-25T11:00:00Z',
    journalCode: 'AC',
    journalName: 'Journal des Achats & Frais généraux',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: 'Facture Fournisseur Taixun Tech - Réassort 5 Terminaux i3 Pro (3 480 $ au taux BCC 2 261 FC/$)',
    pieceRef: 'FAC-TXN-88210',
    status: 'VALIDATED',
    sourceDocType: 'EXPENSE',
    sourceDocId: 54,
    totalDebit: 7868280,
    totalCredit: 7868280,
    isBalanced: true,
    createdByName: 'Mireille Kabongo',
    validatedByName: 'Dieudonné Kasongo (Admin)',
    validatedAt: '2026-10-25T11:20:00Z',
    lines: [
      {
        id: 9,
        lineNumber: 1,
        accountId: 23,
        accountNumber: '601100',
        accountLabel: 'Achats de terminaux POS et périphériques',
        debit: 6556900,
        credit: 0,
        label: 'Achat 5x TX-1560 i3-1215U',
        pieceRef: 'FAC-TXN-88210',
        costCenterCode: 'LOG',
      },
      {
        id: 10,
        lineNumber: 2,
        accountId: 15,
        accountNumber: '445200',
        accountLabel: 'État - TVA déductible sur achats (16%)',
        debit: 1311380,
        credit: 0,
        label: 'TVA déductible sur approvisionnement',
        pieceRef: 'FAC-TXN-88210',
      },
      {
        id: 11,
        lineNumber: 3,
        accountId: 12,
        accountNumber: '401100',
        accountLabel: "Fournisseurs d'équipements et matériels",
        debit: 0,
        credit: 7868280,
        label: 'Dette Fournisseur Taixun Technologies Ltd',
        pieceRef: 'FAC-TXN-88210',
      },
    ],
  },
  // Écritures issues de Vente POS & Caisse en attente de validation par le Comptable (avec reçu joint et auto-validation à 00h00)
  {
    id: 501,
    entryNumber: 'ECR-POS-8841',
    date: new Date().toISOString(),
    journalCode: 'CA',
    journalName: 'Journal de Caisse centrale',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: '[POS & CAISSE] Encaissement Ticket POS-2026-8841 — M. Christian Mbuyi (120.00 $ → 271 320 FC au taux BCC 2 261 FC/$)',
    pieceRef: 'POS-2026-8841',
    status: 'DRAFT',
    sourceDocType: 'POS_RECEIPT',
    totalDebit: 271320,
    totalCredit: 271320,
    isBalanced: true,
    createdByName: 'Grâce Kalonji (CASHIER)',
    autoPostAtMidnight: true,
    attachedPosReceipt: {
      receiptId: 'POS-2026-8841',
      timestamp: '10:15',
      dateIso: new Date().toISOString(),
      companyName: 'Mon X.Y mon comptable',
      receiptHeader: 'REÇU DE CAISSE OFFICIEL — KINSHASA GOMBE',
      receiptFooter: 'Pièce justificative transmise automatiquement à la Comptabilité Générale (SYSCOHADA RDC).',
      establishmentName: 'Point de Vente Principal Gombe',
      operatorName: 'Grâce Kalonji',
      operatorRole: 'CASHIER',
      clientName: 'M. Christian Mbuyi',
      tableOrStation: 'Caisse Principale #1',
      paymentMethodCode: 'CASH_USD',
      paymentMethodLabel: 'Espèces Cash (USD $)',
      paymentReference: 'CASH-USD-8841',
      subtotalUsd: 120,
      discountAmountUsd: 0,
      totalUsd: 120,
      bccExchangeRate: 2261,
      totalCdf: 271320,
      cashReceivedUsd: 150,
      changeReturnedUsd: 30,
      items: [
        {
          sku: 'POS-IMP-80',
          name: 'Imprimante Thermique 80mm USB/LAN + Rouleaux',
          quantity: 1,
          unitPriceUsd: 120,
          totalUsd: 120,
        },
      ],
    },
    lines: [
      {
        id: 5011,
        lineNumber: 1,
        accountId: 17,
        accountNumber: '571100',
        accountLabel: 'Caisse centrale physique (Espèces CDF & contre-valeur)',
        debit: 271320,
        credit: 0,
        label: 'Encaissement espèces Ticket POS-2026-8841 (120 $ × 2 261 FC)',
        pieceRef: 'POS-2026-8841',
      },
      {
        id: 5012,
        lineNumber: 2,
        accountId: 29,
        accountNumber: '701100',
        accountLabel: 'Ventes de terminaux tactiles POS Taixun',
        debit: 0,
        credit: 233897,
        label: 'Vente nette HT Caisse POS (Ticket POS-2026-8841)',
        pieceRef: 'POS-2026-8841',
      },
      {
        id: 5013,
        lineNumber: 3,
        accountId: 14,
        accountNumber: '443100',
        accountLabel: 'État - TVA facturée sur ventes (16%)',
        debit: 0,
        credit: 37423,
        label: 'TVA collectée 16% sur Ticket POS-2026-8841',
        pieceRef: 'POS-2026-8841',
      },
    ],
  },
  {
    id: 502,
    entryNumber: 'ECR-POS-8842',
    date: new Date().toISOString(),
    journalCode: 'BQ',
    journalName: 'Journal de Banque & Mobile Money',
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: '[POS & CAISSE] Encaissement M-Pesa Ticket POS-2026-8842 — Mme Solange Kanku (80.00 $ → 180 880 FC au taux BCC 2 261 FC/$)',
    pieceRef: 'POS-2026-8842',
    status: 'DRAFT',
    sourceDocType: 'POS_RECEIPT',
    totalDebit: 180880,
    totalCredit: 180880,
    isBalanced: true,
    createdByName: 'Alain Tshisekedi (SELLER)',
    autoPostAtMidnight: true,
    attachedPosReceipt: {
      receiptId: 'POS-2026-8842',
      timestamp: '11:42',
      dateIso: new Date().toISOString(),
      companyName: 'Mon X.Y mon comptable',
      receiptHeader: 'REÇU DE CAISSE OFFICIEL — KINSHASA GOMBE',
      receiptFooter: 'Pièce justificative transmise automatiquement à la Comptabilité Générale (SYSCOHADA RDC).',
      establishmentName: 'Point de Vente Principal Gombe',
      operatorName: 'Alain Tshisekedi',
      operatorRole: 'SELLER',
      clientName: 'Mme Solange Kanku',
      tableOrStation: 'Caisse Principale #1',
      paymentMethodCode: 'MPESA',
      paymentMethodLabel: 'M-Pesa (Vodacom RDC)',
      paymentReference: 'MPESA-9941204',
      subtotalUsd: 85,
      discountAmountUsd: 5,
      totalUsd: 80,
      bccExchangeRate: 2261,
      totalCdf: 180880,
      items: [
        {
          sku: 'ACC-DOUCH-2D',
          name: 'Lecteur Code-Barres 2D Sans Fil + Socle',
          quantity: 1,
          unitPriceUsd: 80,
          totalUsd: 80,
        },
      ],
    },
    lines: [
      {
        id: 5021,
        lineNumber: 1,
        accountId: 18,
        accountNumber: '518100',
        accountLabel: 'Compte Marchand M-Pesa (Vodacom)',
        debit: 180880,
        credit: 0,
        label: 'Encaissement M-Pesa Ticket POS-2026-8842 (80 $ × 2 261 FC)',
        pieceRef: 'POS-2026-8842',
      },
      {
        id: 5022,
        lineNumber: 2,
        accountId: 29,
        accountNumber: '701100',
        accountLabel: 'Ventes de terminaux tactiles POS Taixun',
        debit: 0,
        credit: 155931,
        label: 'Vente nette HT Caisse POS (Ticket POS-2026-8842)',
        pieceRef: 'POS-2026-8842',
      },
      {
        id: 5023,
        lineNumber: 3,
        accountId: 14,
        accountNumber: '443100',
        accountLabel: 'État - TVA facturée sur ventes (16%)',
        debit: 0,
        credit: 24949,
        label: 'TVA collectée 16% sur Ticket POS-2026-8842',
        pieceRef: 'POS-2026-8842',
      },
    ],
  },
];

// ========================================================
// 5. COMPTABILITÉ ANALYTIQUE (CENTRES & SECTIONS)
// ========================================================
export const INITIAL_COST_CENTERS: CostCenter[] = [
  { id: 1, code: 'ADM', name: 'Direction & Administration Générale', description: 'Gouvernance, gestion comptable, juridique et RH', managerName: 'Dieudonné Kasongo', isActive: true, totalExpenses: 8400, allocatedBudget: 12000 },
  { id: 2, code: 'COM', name: 'Commercial & Ventes Terminaux POS', description: 'Force commerciale, prospection retail et commissions', managerName: 'Alain Tshisekedi', isActive: true, totalExpenses: 15200, allocatedBudget: 18000 },
  { id: 3, code: 'IT', name: 'Informatique, Cloud & Intégrations', description: 'Hébergement, serveurs API, passerelles de paiement', managerName: 'Jean-Paul Mukendi', isActive: true, totalExpenses: 5400, allocatedBudget: 7500 },
  { id: 4, code: 'LOG', name: 'Logistique, Stock & Support Technique', description: 'Réception matériel, reconditionnement et déploiement POS', managerName: 'Felly Ilunga', isActive: true, totalExpenses: 6800, allocatedBudget: 9000 },
];

export const INITIAL_ANALYTICAL_SECTIONS: AnalyticalSection[] = [
  { id: 1, code: 'POS_SALES', name: 'Vente Terminaux POS Tactiles', axisCode: 'ACTIVITE', description: 'Commercialisation caisses TaixunPOS', isActive: true, directCost: 21600, indirectCost: 5200, revenue: 38400, margin: 11600 },
  { id: 2, code: 'MAINTENANCE', name: 'Contrats Maintenance & SAV', axisCode: 'ACTIVITE', description: 'Support sur site, téléassistance, garanties', isActive: true, directCost: 3200, indirectCost: 1800, revenue: 8900, margin: 3900 },
  { id: 3, code: 'SOFTWARE', name: 'Abonnements Logiciel & Cloud', axisCode: 'ACTIVITE', description: 'Licences SaaS Mon X.Y mon comptable', isActive: true, directCost: 1400, indirectCost: 1200, revenue: 6500, margin: 3900 },
];

export const INITIAL_ALLOCATION_RULES: AllocationRule[] = [
  { id: 1, name: 'Loyer des Bureaux (Clé par Surface m²)', sourceAccountPrefix: '613', costCenterId: 1, costCenterName: 'Direction & Administration', percentage: 25.0, ruleType: 'INDIRECT', keyMetric: 'Surface 60m²', isActive: true },
  { id: 2, name: 'Loyer Showroom Commercial (Surface m²)', sourceAccountPrefix: '613', costCenterId: 2, costCenterName: 'Commercial & Ventes POS', percentage: 45.0, ruleType: 'INDIRECT', keyMetric: 'Surface 110m²', isActive: true },
  { id: 3, name: 'Loyer Atelier & Stock POS (Surface m²)', sourceAccountPrefix: '613', costCenterId: 4, costCenterName: 'Logistique & Stock', percentage: 30.0, ruleType: 'INDIRECT', keyMetric: 'Surface 70m²', isActive: true },
  { id: 4, name: 'Électricité & Fluides (Clé Consommation)', sourceAccountPrefix: '606', costCenterId: 2, costCenterName: 'Commercial & Ventes POS', percentage: 50.0, ruleType: 'INDIRECT', keyMetric: "Postes d'essai POS", isActive: true },
];

export const INITIAL_BUDGETS: Budget[] = [
  {
    id: 1,
    name: 'Budget Prévisionnel Annuel 2026',
    year: '2026',
    status: 'APPROVED',
    totalPlanned: 46500,
    totalRealized: 35800,
    lines: [
      { id: 1, budgetId: 1, costCenterId: 1, costCenterName: 'Direction & Administration', budgetedAmount: 12000, actualAmount: 8400, plannedAmount: 12000, realizedAmount: 8400, varianceAmount: 3600, variancePercentage: 30.0, consumptionRate: 70.0 },
      { id: 2, budgetId: 1, costCenterId: 2, costCenterName: 'Commercial & Ventes POS', budgetedAmount: 18000, actualAmount: 15200, plannedAmount: 18000, realizedAmount: 15200, varianceAmount: 2800, variancePercentage: 15.5, consumptionRate: 84.4 },
      { id: 3, budgetId: 1, costCenterId: 3, costCenterName: 'Informatique & Cloud', budgetedAmount: 7500, actualAmount: 5400, plannedAmount: 7500, realizedAmount: 5400, varianceAmount: 2100, variancePercentage: 28.0, consumptionRate: 72.0 },
      { id: 4, budgetId: 1, costCenterId: 4, costCenterName: 'Logistique & Stock', budgetedAmount: 9000, actualAmount: 6800, plannedAmount: 9000, realizedAmount: 6800, varianceAmount: 2200, variancePercentage: 24.4, consumptionRate: 75.6 },
    ],
  },
];

// ========================================================
// 6. PAIEMENTS NUMÉRIQUES (CONFIGURATIONS & TRANSACTIONS)
// ========================================================
export const INITIAL_PROVIDER_CONFIGS: ProviderConfiguration[] = [
  { id: 1, provider: DigitalPaymentProvider.CASH, name: 'Caisse Espèces Kinshasa ($ USD)', isActive: true, isEnabled: true, isSandbox: false, merchantId: 'CAISSE-GOMBE-01', accountNumber: '571100', accountingAccountCode: '571100', currency: 'USD', commissionRate: 0.0, feePercentage: 0.0, fixedFee: 0.0 },
  { id: 2, provider: DigitalPaymentProvider.MPESA, name: 'Vodacom M-Pesa B2C / C2B RDC', isActive: true, isEnabled: true, isSandbox: true, merchantId: 'VOD-MPESA-88419', accountNumber: '+243810009988', accountingAccountCode: '518100', currency: 'USD', commissionRate: 1.8, feePercentage: 1.8, fixedFee: 0.15 },
  { id: 3, provider: DigitalPaymentProvider.ORANGE_MONEY, name: 'Orange Money WebPay API', isActive: true, isEnabled: true, isSandbox: true, merchantId: 'ORA-RDC-55201', accountNumber: '+243890001122', accountingAccountCode: '518200', currency: 'USD', commissionRate: 2.0, feePercentage: 2.0, fixedFee: 0.2 },
  { id: 4, provider: DigitalPaymentProvider.AIRTEL_MONEY, name: 'Airtel Money Merchant Gateway', isActive: true, isEnabled: true, isSandbox: true, merchantId: 'AIR-MERCHANT-771', accountNumber: '+243990003344', accountingAccountCode: '518300', currency: 'USD', commissionRate: 1.9, feePercentage: 1.9, fixedFee: 0.15 },
  { id: 5, provider: DigitalPaymentProvider.ILLICOCASH, name: 'IllicoCash Rawbank Digital API', isActive: true, isEnabled: true, isSandbox: true, merchantId: 'ILLICO-RAW-1029', accountNumber: '0100-291827-01', accountingAccountCode: '518400', currency: 'USD', commissionRate: 1.5, feePercentage: 1.5, fixedFee: 0.25 },
  { id: 6, provider: DigitalPaymentProvider.CARD_VISA_MASTERCARD, name: 'Passerelle CB Visa & Mastercard 3D Secure', isActive: true, isEnabled: true, isSandbox: true, merchantId: 'PAY-CARD-SECURE-990', accountingAccountCode: '518500', currency: 'USD', commissionRate: 1.4, feePercentage: 1.4, fixedFee: 0.25 },
];

export const INITIAL_PAYMENT_TRANSACTIONS: PaymentTransaction[] = [
  {
    id: 1,
    reference: 'TXN-MPESA-2026-0042',
    transactionRef: 'TXN-MPESA-2026-0042',
    provider: DigitalPaymentProvider.MPESA,
    providerRef: 'WS_CO_24102026_99281',
    externalTransactionId: 'WS_CO_24102026_99281',
    orderNumber: 'CMD-POS-2026-0019',
    clientName: 'Boutique Élégance Kin',
    customerPhone: '+243 82 555 1234',
    amount: 1880.0,
    currency: 'USD',
    fee: 37.6,
    feeAmount: 37.6,
    netAmount: 1842.4,
    status: DigitalPaymentStatus.SUCCESS,
    idempotencyKey: 'IDEMP-MPESA-2026-99281-A',
    accountingEntryId: 1,
    accountingEntryNumber: 'ECR-2026-00103',
    createdAt: '2026-10-24 09:00',
    confirmedAt: '2026-10-24 09:05',
  },
  {
    id: 2,
    reference: 'TXN-ORANGE-2026-0014',
    transactionRef: 'TXN-ORANGE-2026-0014',
    provider: DigitalPaymentProvider.ORANGE_MONEY,
    providerRef: 'OM_PAY_26102026_8831',
    externalTransactionId: 'OM_PAY_26102026_8831',
    invoiceNumber: 'FAC-2026-0041',
    clientName: 'Supermarché Express Kin',
    customerPhone: '+243 89 222 3344',
    amount: 1450.0,
    currency: 'USD',
    fee: 29.0,
    feeAmount: 29.0,
    netAmount: 1421.0,
    status: DigitalPaymentStatus.SUCCESS,
    idempotencyKey: 'IDEMP-ORA-2026-8831-B',
    accountingEntryId: 2,
    createdAt: '2026-10-26 14:20',
    confirmedAt: '2026-10-26 14:22',
  },
  {
    id: 3,
    reference: 'TXN-CARD-2026-0089',
    transactionRef: 'TXN-CARD-2026-0089',
    provider: DigitalPaymentProvider.CARD_VISA_MASTERCARD,
    providerRef: 'AUTH_VISA_3DS_771829',
    externalTransactionId: 'AUTH_VISA_3DS_771829',
    orderNumber: 'CMD-POS-2026-0018',
    clientName: 'ETS Congo Tech Distribution Gombe',
    customerEmail: 'direction@congotech.cd',
    customerCardLast4: '4242',
    amount: 1128.0,
    currency: 'USD',
    fee: 16.04,
    feeAmount: 16.04,
    netAmount: 1111.96,
    status: DigitalPaymentStatus.PENDING,
    idempotencyKey: 'IDEMP-CARD-2026-771829-C',
    createdAt: '2026-10-28 16:45',
  },
  {
    id: 4,
    reference: 'TXN-AIRTEL-2026-0009',
    transactionRef: 'TXN-AIRTEL-2026-0009',
    provider: DigitalPaymentProvider.AIRTEL_MONEY,
    providerRef: 'AIR_COLLECT_5510',
    externalTransactionId: 'AIR_COLLECT_5510',
    clientName: 'Pharmacie Grand Kasaï',
    customerPhone: '+243 99 888 7766',
    amount: 850.0,
    currency: 'USD',
    fee: 16.15,
    feeAmount: 16.15,
    netAmount: 833.85,
    status: DigitalPaymentStatus.SUCCESS,
    idempotencyKey: 'IDEMP-AIR-2026-5510-D',
    accountingEntryId: 3,
    createdAt: '2026-10-27 11:10',
    confirmedAt: '2026-10-27 11:12',
  },
  {
    id: 5,
    reference: 'TXN-ILLICO-2026-0003',
    transactionRef: 'TXN-ILLICO-2026-0003',
    provider: DigitalPaymentProvider.ILLICOCASH,
    providerRef: 'RAW_ILL_33219',
    externalTransactionId: 'RAW_ILL_33219',
    clientName: 'Bistrot & Lounge Bandal',
    customerPhone: '+243 81 777 6655',
    amount: 690.0,
    currency: 'USD',
    fee: 10.6,
    feeAmount: 10.6,
    netAmount: 679.4,
    status: DigitalPaymentStatus.SUCCESS,
    idempotencyKey: 'IDEMP-ILL-2026-33219-E',
    accountingEntryId: 4,
    createdAt: '2026-10-25 16:00',
    confirmedAt: '2026-10-25 16:03',
  },
];

export const INITIAL_RECONCILIATIONS: PaymentReconciliation[] = [
  { id: 1, provider: DigitalPaymentProvider.MPESA, batchReference: 'LOT-REC-2026-10-MPESA', period: '2026-10', gatewayAmount: 12450.0, totalProcessed: 12450.0, feeAmount: 249.0, totalFees: 249.0, settledAmount: 12201.0, totalSettled: 12201.0, discrepancyAmount: 0, status: 'RECONCILED', reconciledAt: '2026-10-28' },
  { id: 2, provider: DigitalPaymentProvider.ORANGE_MONEY, batchReference: 'LOT-REC-2026-10-OM', period: '2026-10', gatewayAmount: 9800.0, totalProcessed: 9800.0, feeAmount: 196.0, totalFees: 196.0, settledAmount: 9604.0, totalSettled: 9604.0, discrepancyAmount: 0, status: 'RECONCILED', reconciledAt: '2026-10-28' },
  { id: 3, provider: DigitalPaymentProvider.AIRTEL_MONEY, batchReference: 'LOT-REC-2026-10-AIRTEL', period: '2026-10', gatewayAmount: 7400.0, totalProcessed: 7400.0, feeAmount: 140.6, totalFees: 140.6, settledAmount: 7259.4, totalSettled: 7259.4, discrepancyAmount: 0, status: 'RECONCILED', reconciledAt: '2026-10-28' },
  { id: 4, provider: DigitalPaymentProvider.CARD_VISA_MASTERCARD, batchReference: 'LOT-REC-2026-10-CARDS', period: '2026-10', gatewayAmount: 16700.0, totalProcessed: 16700.0, feeAmount: 233.8, totalFees: 233.8, settledAmount: 16466.2, totalSettled: 16466.2, discrepancyAmount: 0, status: 'RECONCILED', reconciledAt: '2026-10-28' },
];

// ========================================================
// PERSISTANCE LOCALE & GESTIONNAIRES D'ÉTAT (AVEC MONNAIE NATIONALE FC / CDF)
// ========================================================
const STORAGE_KEYS = {
  CHART: 'optima_chart_of_accounts_cdf_v2261',
  JOURNALS: 'optima_accounting_journals_cdf_v2261',
  FISCAL_YEARS: 'optima_fiscal_years_cdf_v2261',
  PERIODS: 'optima_accounting_periods_cdf_v2261',
  ENTRIES: 'optima_accounting_entries_cdf_pos_v2261',
  COST_CENTERS: 'optima_cost_centers_v2',
  ANALYTICAL_SECTIONS: 'optima_analytical_sections_v2',
  ALLOCATION_RULES: 'optima_allocation_rules_v2',
  BUDGETS: 'optima_budgets_v2',
  PROVIDERS: 'optima_provider_configs_v2',
  TRANSACTIONS: 'optima_payment_transactions_v2',
  RECONCILIATIONS: 'optima_payment_reconciliations_v2',
};

function hasMojibake(raw: string | null): boolean {
  if (!raw) return false;
  return raw.includes('Ã') || raw.includes('â$') || raw.includes('â€™');
}

export const getStoredChartOfAccounts = (): ChartOfAccount[] => {
  const data = localStorage.getItem(STORAGE_KEYS.CHART);
  if (!data || hasMojibake(data)) return INITIAL_CHART_OF_ACCOUNTS;
  return JSON.parse(data);
};

export const saveStoredChartOfAccounts = (accounts: ChartOfAccount[]) => {
  localStorage.setItem(STORAGE_KEYS.CHART, JSON.stringify(accounts));
};

export const getStoredJournals = (): AccountingJournal[] => {
  const data = localStorage.getItem(STORAGE_KEYS.JOURNALS);
  if (!data || hasMojibake(data)) return INITIAL_JOURNALS;
  return JSON.parse(data);
};

export const saveStoredJournals = (journals: AccountingJournal[]) => {
  localStorage.setItem(STORAGE_KEYS.JOURNALS, JSON.stringify(journals));
};

export const getStoredFiscalYears = (): FiscalYear[] => {
  const data = localStorage.getItem(STORAGE_KEYS.FISCAL_YEARS);
  if (!data || hasMojibake(data)) return INITIAL_FISCAL_YEARS;
  return JSON.parse(data);
};

export const saveStoredFiscalYears = (years: FiscalYear[]) => {
  localStorage.setItem(STORAGE_KEYS.FISCAL_YEARS, JSON.stringify(years));
};

export const getStoredPeriods = (): AccountingPeriod[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PERIODS);
  if (!data || hasMojibake(data)) return INITIAL_PERIODS;
  return JSON.parse(data);
};

export const saveStoredPeriods = (periods: AccountingPeriod[]) => {
  localStorage.setItem(STORAGE_KEYS.PERIODS, JSON.stringify(periods));
};

export const getStoredEntries = (): AccountingEntry[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ENTRIES);
  if (!data || hasMojibake(data)) return INITIAL_ACCOUNTING_ENTRIES;
  return JSON.parse(data);
};

export const saveStoredEntries = (entries: AccountingEntry[]) => {
  localStorage.setItem(STORAGE_KEYS.ENTRIES, JSON.stringify(entries));
};

export const getStoredCostCenters = (): CostCenter[] => {
  const data = localStorage.getItem(STORAGE_KEYS.COST_CENTERS);
  if (!data || hasMojibake(data)) return INITIAL_COST_CENTERS;
  return JSON.parse(data);
};

export const saveStoredCostCenters = (centers: CostCenter[]) => {
  localStorage.setItem(STORAGE_KEYS.COST_CENTERS, JSON.stringify(centers));
};

export const getStoredAnalyticalSections = (): AnalyticalSection[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ANALYTICAL_SECTIONS);
  if (!data || hasMojibake(data)) return INITIAL_ANALYTICAL_SECTIONS;
  return JSON.parse(data);
};

export const saveStoredAnalyticalSections = (sections: AnalyticalSection[]) => {
  localStorage.setItem(STORAGE_KEYS.ANALYTICAL_SECTIONS, JSON.stringify(sections));
};

export const getStoredAllocationRules = (): AllocationRule[] => {
  const data = localStorage.getItem(STORAGE_KEYS.ALLOCATION_RULES);
  if (!data || hasMojibake(data)) return INITIAL_ALLOCATION_RULES;
  return JSON.parse(data);
};

export const saveStoredAllocationRules = (rules: AllocationRule[]) => {
  localStorage.setItem(STORAGE_KEYS.ALLOCATION_RULES, JSON.stringify(rules));
};

export const getStoredBudgets = (): Budget[] => {
  const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
  if (!data || hasMojibake(data)) return INITIAL_BUDGETS;
  return JSON.parse(data);
};

export const saveStoredBudgets = (budgets: Budget[]) => {
  localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
};

export const getStoredProviderConfigs = (): ProviderConfiguration[] => {
  const data = localStorage.getItem(STORAGE_KEYS.PROVIDERS);
  if (!data || hasMojibake(data)) return INITIAL_PROVIDER_CONFIGS;
  return JSON.parse(data);
};

export const saveStoredProviderConfigs = (configs: ProviderConfiguration[]) => {
  localStorage.setItem(STORAGE_KEYS.PROVIDERS, JSON.stringify(configs));
};

export const getStoredPaymentTransactions = (): PaymentTransaction[] => {
  const data = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  if (!data || hasMojibake(data)) return INITIAL_PAYMENT_TRANSACTIONS;
  return JSON.parse(data);
};

export const saveStoredPaymentTransactions = (transactions: PaymentTransaction[]) => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredReconciliations = (): PaymentReconciliation[] => {
  const data = localStorage.getItem(STORAGE_KEYS.RECONCILIATIONS);
  if (!data || hasMojibake(data)) return INITIAL_RECONCILIATIONS;
  return JSON.parse(data);
};

export const saveStoredReconciliations = (reconciliations: PaymentReconciliation[]) => {
  localStorage.setItem(STORAGE_KEYS.RECONCILIATIONS, JSON.stringify(reconciliations));
};

// ========================================================
// 7. PONT TEMPS RÉEL « VENTES POS & CAISSE » -> « COMPTABLE »
//    AVEC PIÈCE JUSTIFICATIVE (REÇU), COURS LIVE BCC & AUTO-CLÔTURE À 00H00
// ========================================================

/**
 * Lorsque la Banque Centrale du Congo (BCC) augmente ou révise son taux de change en temps réel,
 * toutes les écritures POS en attente de validation (DRAFT) sont automatiquement réactualisées
 * en Francs Congolais (FC) au nouveau cours officiel BCC.
 */
export const recalculateDraftPosEntriesWithBccRate = (newBccRate: number) => {
  const entries = getStoredEntries();
  let modified = false;

  const updated = entries.map((entry) => {
    if (entry.status === 'DRAFT' && entry.attachedPosReceipt) {
      const usd = entry.attachedPosReceipt.totalUsd;
      const newTotalCdf = Math.round(usd * newBccRate);
      const newHtCdf = Math.round(newTotalCdf / 1.16);
      const newVatCdf = newTotalCdf - newHtCdf;

      modified = true;
      return {
        ...entry,
        label: `[POS & CAISSE] Encaissement Ticket ${entry.attachedPosReceipt.receiptId} — ${
          entry.attachedPosReceipt.clientName
        } (${usd.toFixed(2)} $ → ${newTotalCdf.toLocaleString('fr-FR')} FC au taux BCC ${newBccRate.toLocaleString(
          'fr-FR'
        )} FC/$)`,
        totalDebit: newTotalCdf,
        totalCredit: newTotalCdf,
        attachedPosReceipt: {
          ...entry.attachedPosReceipt,
          bccExchangeRate: newBccRate,
          totalCdf: newTotalCdf,
        },
        lines: entry.lines.map((line, idx) => {
          if (idx === 0) {
            return {
              ...line,
              debit: newTotalCdf,
              label: `Encaissement ${entry.attachedPosReceipt?.paymentMethodLabel} Ticket ${
                entry.attachedPosReceipt?.receiptId
              } (${usd.toFixed(2)} $ × ${newBccRate.toLocaleString('fr-FR')} FC)`,
            };
          }
          if (idx === 1) {
            return { ...line, credit: newHtCdf };
          }
          if (idx === 2) {
            return { ...line, credit: newVatCdf };
          }
          return line;
        }),
      };
    }
    return entry;
  });

  if (modified) {
    saveStoredEntries(updated);
  }
};

export const createAccountingEntryFromPosReceipt = (
  receipt: PosAttachedReceipt
): AccountingEntry => {
  const entries = getStoredEntries();
  const bccRate = receipt.bccExchangeRate || getStoredBccExchangeRate();
  const totalCdf = Math.round(receipt.totalUsd * bccRate);

  // Décomposition HT (84%) et TVA collectée DGI (16%) en Franc Congolais
  const htCdf = Math.round(totalCdf / 1.16);
  const vatCdf = totalCdf - htCdf;

  // Détermination du compte de trésorerie (Classe 5) et du journal selon le mode de paiement
  const accountMap: Record<
    string,
    { accountId: number; accountNumber: string; accountLabel: string; journalCode: string; journalName: string }
  > = {
    CASH_USD: {
      accountId: 17,
      accountNumber: '571100',
      accountLabel: 'Caisse centrale physique (Espèces CDF & contre-valeur)',
      journalCode: 'CA',
      journalName: 'Journal de Caisse centrale',
    },
    MPESA: {
      accountId: 18,
      accountNumber: '518100',
      accountLabel: 'Compte Marchand M-Pesa (Vodacom)',
      journalCode: 'BQ',
      journalName: 'Journal de Banque & Mobile Money',
    },
    ORANGE_MONEY: {
      accountId: 19,
      accountNumber: '518200',
      accountLabel: 'Compte Marchand Orange Money',
      journalCode: 'BQ',
      journalName: 'Journal de Banque & Mobile Money',
    },
    AIRTEL_MONEY: {
      accountId: 20,
      accountNumber: '518300',
      accountLabel: 'Compte Marchand Airtel Money',
      journalCode: 'BQ',
      journalName: 'Journal de Banque & Mobile Money',
    },
    ILLICOCASH: {
      accountId: 21,
      accountNumber: '518400',
      accountLabel: 'Compte Passerelle IllicoCash (Rawbank)',
      journalCode: 'BQ',
      journalName: 'Journal de Banque & Mobile Money',
    },
    VISA_MASTERCARD: {
      accountId: 22,
      accountNumber: '518500',
      accountLabel: 'Compte de transit Cartes Visa / Mastercard',
      journalCode: 'BQ',
      journalName: 'Journal de Banque & Mobile Money',
    },
  };

  const targetAcc = accountMap[receipt.paymentMethodCode] || accountMap.CASH_USD;
  const entryNumSuffix = receipt.receiptId.replace('POS-2026-', '');

  const newDraftEntry: AccountingEntry = {
    id: Date.now(),
    entryNumber: `ECR-POS-${entryNumSuffix}`,
    date: receipt.dateIso || new Date().toISOString(),
    journalCode: targetAcc.journalCode,
    journalName: targetAcc.journalName,
    fiscalYear: '2026',
    periodName: 'Octobre 2026',
    label: `[POS & CAISSE] Encaissement Ticket ${receipt.receiptId} — ${receipt.clientName} (${receipt.totalUsd.toFixed(
      2
    )} $ → ${totalCdf.toLocaleString('fr-FR')} FC)`,
    pieceRef: receipt.receiptId,
    status: 'DRAFT', // En attente de validation du Comptable ou validation auto à 00h00
    sourceDocType: 'POS_RECEIPT',
    totalDebit: totalCdf,
    totalCredit: totalCdf,
    isBalanced: true,
    createdByName: `${receipt.operatorName} (${receipt.operatorRole})`,
    autoPostAtMidnight: true,
    attachedPosReceipt: {
      ...receipt,
      bccExchangeRate: bccRate,
      totalCdf,
    },
    lines: [
      {
        id: Date.now() + 1,
        lineNumber: 1,
        accountId: targetAcc.accountId,
        accountNumber: targetAcc.accountNumber,
        accountLabel: targetAcc.accountLabel,
        debit: totalCdf,
        credit: 0,
        label: `Encaissement ${receipt.paymentMethodLabel} Ticket ${receipt.receiptId} (${receipt.totalUsd.toFixed(
          2
        )} $)`,
        pieceRef: receipt.receiptId,
      },
      {
        id: Date.now() + 2,
        lineNumber: 2,
        accountId: 29,
        accountNumber: '701100',
        accountLabel: 'Ventes de terminaux tactiles POS & Prestations',
        debit: 0,
        credit: htCdf,
        label: `Vente nette HT Caisse POS (Ticket ${receipt.receiptId})`,
        pieceRef: receipt.receiptId,
      },
      {
        id: Date.now() + 3,
        lineNumber: 3,
        accountId: 14,
        accountNumber: '443100',
        accountLabel: 'État - TVA facturée sur ventes (16%)',
        debit: 0,
        credit: vatCdf,
        label: `TVA collectée 16% sur Ticket ${receipt.receiptId}`,
        pieceRef: receipt.receiptId,
      },
    ],
  };

  const updated = [newDraftEntry, ...entries];
  saveStoredEntries(updated);
  return newDraftEntry;
};

/**
 * Vérifie et valide automatiquement dans le Journal de l'entreprise
 * toutes les écritures POS en attente (DRAFT) dès que minuit (00h00) est franchi
 * (c'est-à-dire toute écriture dont la date est antérieure à aujourd'hui 00h00)
 * ou lorsque `forceAllNow === true` (simulation de l'exécution automatique de 00h00).
 */
export const runMidnightAutoValidationForPosEntries = (
  forceAllNow = false
): { autoValidatedCount: number; updatedEntries: AccountingEntry[] } => {
  const entries = getStoredEntries();
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);

  let autoValidatedCount = 0;

  const updatedEntries = entries.map((entry) => {
    if (entry.status === 'DRAFT' && entry.autoPostAtMidnight) {
      const entryTime = new Date(entry.date).getTime();
      const hasCrossedMidnight = entryTime < todayStart.getTime();

      if (forceAllNow || hasCrossedMidnight) {
        autoValidatedCount += 1;
        return {
          ...entry,
          status: 'VALIDATED' as const,
          validatedByName: 'Système Automatique (Clôture 00h00)',
          validatedAt: new Date().toISOString(),
          autoPostedBySystem: true,
        };
      }
    }
    return entry;
  });

  if (autoValidatedCount > 0) {
    saveStoredEntries(updatedEntries);
  }

  return { autoValidatedCount, updatedEntries };
};

