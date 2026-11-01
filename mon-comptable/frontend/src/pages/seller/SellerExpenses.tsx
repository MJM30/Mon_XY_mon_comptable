import React, { useState, useEffect } from 'react';
import {
  MinusCircle,
  Plus,
  Printer,
  CheckCircle2,
  Clock,
  Receipt,
  Banknote,
  Smartphone,
  CreditCard,
  Coins,
  Building2,
  FileText,
  Search,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  createAccountingEntryFromSellerExpense,
  getStoredBccExchangeRate,
  getStoredEntries,
  subscribeToBccRateUpdates,
} from '../../data/accountingMockData';

export interface SellerExpenseCategory {
  code: string;
  label: string;
  accountId: number;
  accountNumber: string;
  accountLabel: string;
  hint: string;
}

export const SELLER_EXPENSE_CATEGORIES: SellerExpenseCategory[] = [
  {
    code: 'TRANSPORT_LIVRAISON',
    label: 'Transport, Course & Livraison Client',
    accountId: 23,
    accountNumber: '601100',
    accountLabel: 'Achats, approvisionnements & frais accessoires sur ventes',
    hint: 'Taxi course client, carburant livraison, expédition colis',
  },
  {
    code: 'CARBURANT_ENERGIE',
    label: 'Carburant Groupe Électrogène & Énergie (SNEL / Eau)',
    accountId: 25,
    accountNumber: '606100',
    accountLabel: 'Fournitures non stockables (Carburant, Électricité, Eau)',
    hint: 'Achat gasoil groupe électrogène, recharge prépayée CashPower SNEL',
  },
  {
    code: 'FOURNITURES_CAISSE',
    label: 'Fournitures de Caisse, Rouleaux Thermiques & Emballages',
    accountId: 25,
    accountNumber: '606100',
    accountLabel: 'Fournitures non stockables & consommables de caisse',
    hint: 'Rouleaux papier 80mm, sachets, emballages boutique/restaurant',
  },
  {
    code: 'REASSORT_URGENT',
    label: 'Réassortiment Urgent Marchandises / Ingrédients / Produits',
    accountId: 23,
    accountNumber: '601100',
    accountLabel: 'Achats de marchandises, matières et consommables métier',
    hint: 'Achat direct comptoir pour honorer une commande client',
  },
  {
    code: 'ENTRETIEN_MAINTENANCE',
    label: 'Petit Entretien, Nettoyage & Dépannage Point de Vente',
    accountId: 24,
    accountNumber: '613200',
    accountLabel: 'Charges locatives, entretien et maintenance des locaux',
    hint: 'Produits d’entretien, petite réparation urgente au point de vente',
  },
  {
    code: 'COMMUNICATION_INTERNET',
    label: 'Crédit Communication, Forfait Internet & Frais Mobile Money',
    accountId: 26,
    accountNumber: '631100',
    accountLabel: "Frais de télécommunication, Internet et commissions Mobile Money",
    hint: 'Unités appel prospect, recharge data terminal POS',
  },
];

export interface SellerExpenseRecord {
  voucherId: string;
  timestamp: string;
  dateIso: string;
  companyName: string;
  receiptHeader: string;
  receiptFooter: string;
  establishmentName: string;
  operatorName: string;
  operatorRole: string;
  beneficiaryOrSupplier: string;
  stationOrPurpose: string;
  categoryCode: string;
  categoryLabel: string;
  accountNumber: string;
  accountLabel: string;
  description: string;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  paymentReference: string;
  amountUsd: number;
  bccExchangeRate: number;
  amountCdf: number;
  accountingEntryNumber: string;
}

const SELLER_EXPENSES_STORAGE_KEY = 'monxy_seller_expenses_v1';

export const getStoredSellerExpenses = (
  companyName = 'Mon X.Y mon comptable',
  establishmentName = 'Point de vente Principal',
  receiptHeader = 'BON DE SORTIE DE CAISSE'
): SellerExpenseRecord[] => {
  const saved = localStorage.getItem(SELLER_EXPENSES_STORAGE_KEY);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      // fallback
    }
  }
  const rate = getStoredBccExchangeRate();
  return [
    {
      voucherId: 'DEP-POS-4012',
      timestamp: 'Aujourd’hui • 09:40',
      dateIso: new Date().toISOString(),
      companyName,
      receiptHeader,
      receiptFooter: 'Bon de sortie de caisse transmis automatiquement à la Comptabilité.',
      establishmentName,
      operatorName: 'Alain Tshisekedi',
      operatorRole: 'SELLER',
      beneficiaryOrSupplier: 'Station TotalEnergies Gombe',
      stationOrPurpose: 'Groupe électrogène Point de vente',
      categoryCode: 'CARBURANT_ENERGIE',
      categoryLabel: 'Carburant Groupe Électrogène & Énergie (SNEL / Eau)',
      accountNumber: '606100',
      accountLabel: 'Fournitures non stockables (Carburant, Électricité, Eau)',
      description: 'Achat 20L gasoil pour continuité électrique caisse & showroom',
      paymentMethodCode: 'CASH_USD',
      paymentMethodLabel: 'Espèces Caisse ($ USD)',
      paymentReference: 'BON-CAISSE-4012',
      amountUsd: 35,
      bccExchangeRate: rate,
      amountCdf: Math.round(35 * rate),
      accountingEntryNumber: 'ECR-DEP-4012',
    },
    {
      voucherId: 'DEP-POS-4015',
      timestamp: 'Aujourd’hui • 11:10',
      dateIso: new Date().toISOString(),
      companyName,
      receiptHeader,
      receiptFooter: 'Bon de sortie de caisse transmis automatiquement à la Comptabilité.',
      establishmentName,
      operatorName: 'Alain Tshisekedi',
      operatorRole: 'SELLER',
      beneficiaryOrSupplier: 'Papeterie & Consommables Kinshasa',
      stationOrPurpose: 'Caisse Principale #1',
      categoryCode: 'FOURNITURES_CAISSE',
      categoryLabel: 'Fournitures de Caisse, Rouleaux Thermiques & Emballages',
      accountNumber: '606100',
      accountLabel: 'Fournitures non stockables & consommables de caisse',
      description: 'Achat carton de 20 rouleaux thermiques 80mm pour imprimante reçus',
      paymentMethodCode: 'MPESA',
      paymentMethodLabel: 'M-Pesa (Vodacom RDC)',
      paymentReference: 'MPESA-DEP-4015',
      amountUsd: 25,
      bccExchangeRate: rate,
      amountCdf: Math.round(25 * rate),
      accountingEntryNumber: 'ECR-DEP-4015',
    },
  ];
};

export const saveStoredSellerExpenses = (list: SellerExpenseRecord[]) => {
  localStorage.setItem(SELLER_EXPENSES_STORAGE_KEY, JSON.stringify(list));
};

export const SellerExpenses: React.FC = () => {
  const {
    user,
    activeCompany,
    activeEstablishment,
    activeBranding,
    logAuditEvent,
  } = useAuth();

  const [bccRate, setBccRate] = useState<number>(getStoredBccExchangeRate);
  const [expenses, setExpenses] = useState<SellerExpenseRecord[]>(() =>
    getStoredSellerExpenses(
      activeCompany.tradeName,
      activeEstablishment.name,
      activeBranding.receiptHeaderName
    )
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [printedVoucher, setPrintedVoucher] = useState<SellerExpenseRecord | null>(null);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Formulaire d'engagement de dépense
  const [selectedCategoryCode, setSelectedCategoryCode] = useState<string>(
    SELLER_EXPENSE_CATEGORIES[0].code
  );
  const [amountUsd, setAmountUsd] = useState<string>('');
  const [beneficiary, setBeneficiary] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [stationOrPurpose, setStationOrPurpose] = useState<string>(
    activeEstablishment.name || 'Caisse Point de Vente'
  );
  const [paymentMethod, setPaymentMethod] = useState<
    'CASH_USD' | 'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'ILLICOCASH' | 'VISA_MASTERCARD'
  >('CASH_USD');
  const [externalPieceRef, setExternalPieceRef] = useState<string>('');

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
    });
    return unsubscribe;
  }, []);

  const selectedCategory =
    SELLER_EXPENSE_CATEGORIES.find((c) => c.code === selectedCategoryCode) ||
    SELLER_EXPENSE_CATEGORIES[0];

  const numericUsd = parseFloat(amountUsd) || 0;
  const computedCdf = Math.round(numericUsd * bccRate);

  const handleEngageExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (numericUsd <= 0) {
      alert('Veuillez saisir un montant de dépense valide supérieur à 0 $.');
      return;
    }
    if (!beneficiary.trim() || !description.trim()) {
      alert('Veuillez renseigner le bénéficiaire/fournisseur ainsi que le motif de la dépense.');
      return;
    }

    const methodLabels: Record<typeof paymentMethod, string> = {
      CASH_USD: 'Espèces Caisse ($ USD)',
      MPESA: 'M-Pesa (Vodacom RDC)',
      ORANGE_MONEY: 'Orange Money RDC',
      AIRTEL_MONEY: 'Airtel Money RDC',
      ILLICOCASH: 'IllicoCash (Rawbank)',
      VISA_MASTERCARD: 'Carte Bancaire (Visa / Mastercard)',
    };

    const voucherId = `DEP-POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const payRef =
      externalPieceRef.trim() || `${paymentMethod}-DEP-${Math.floor(10000 + Math.random() * 90000)}`;

    // 1. Générer et transmettre automatiquement l'écriture comptable en Franc Congolais (FC) + Bon de Sortie justificatif au Comptable
    const createdEntry = createAccountingEntryFromSellerExpense({
      voucherId,
      timestamp: `Aujourd’hui • ${timeStr}`,
      dateIso: new Date().toISOString(),
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter:
        'Bon de sortie de caisse & justificatif de dépense transmis à la Comptabilité.',
      establishmentName: activeEstablishment.name,
      operatorName: user?.name || 'Alain Tshisekedi',
      operatorRole: user?.role || 'SELLER',
      beneficiaryOrSupplier: beneficiary.trim(),
      stationOrPurpose: stationOrPurpose.trim() || activeEstablishment.name,
      expenseCategoryCode: selectedCategory.code,
      expenseCategoryLabel: selectedCategory.label,
      expenseAccountId: selectedCategory.accountId,
      expenseAccountNumber: selectedCategory.accountNumber,
      expenseAccountLabel: selectedCategory.accountLabel,
      description: description.trim(),
      paymentMethodCode: paymentMethod,
      paymentMethodLabel: methodLabels[paymentMethod],
      paymentReference: payRef,
      amountUsd: numericUsd,
      bccExchangeRate: bccRate,
    });

    const newRecord: SellerExpenseRecord = {
      voucherId,
      timestamp: `Aujourd’hui • ${timeStr}`,
      dateIso: new Date().toISOString(),
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter:
        'Bon de sortie de caisse & justificatif de dépense transmis à la Comptabilité.',
      establishmentName: activeEstablishment.name,
      operatorName: user?.name || 'Alain Tshisekedi',
      operatorRole: user?.role || 'SELLER',
      beneficiaryOrSupplier: beneficiary.trim(),
      stationOrPurpose: stationOrPurpose.trim() || activeEstablishment.name,
      categoryCode: selectedCategory.code,
      categoryLabel: selectedCategory.label,
      accountNumber: selectedCategory.accountNumber,
      accountLabel: selectedCategory.accountLabel,
      description: description.trim(),
      paymentMethodCode: paymentMethod,
      paymentMethodLabel: methodLabels[paymentMethod],
      paymentReference: payRef,
      amountUsd: numericUsd,
      bccExchangeRate: bccRate,
      amountCdf: computedCdf,
      accountingEntryNumber: createdEntry.entryNumber,
    };

    const updated = [newRecord, ...expenses];
    setExpenses(updated);
    saveStoredSellerExpenses(updated);
    setPrintedVoucher(newRecord);

    // Reset form
    setAmountUsd('');
    setBeneficiary('');
    setDescription('');
    setExternalPieceRef('');

    setFeedbackNotice(
      `✅ Dépense ${voucherId} de $${numericUsd.toFixed(2)} (${computedCdf.toLocaleString(
        'fr-FR'
      )} FC) engagée avec succès ! Écriture comptable ${
        createdEntry.entryNumber
      } transmise au Comptable avec son Bon de Sortie justificatif (validation auto à 00h00).`
    );
    setTimeout(() => setFeedbackNotice(null), 8000);

    logAuditEvent(
      'ACCOUNTING_ENTRY_CREATED',
      'Dépenses Vendeur & Sorties de Caisse → Comptabilité',
      `Engagement de dépense ${voucherId} par ${user?.name} (${user?.role}) : $${numericUsd.toFixed(
        2
      )} (${computedCdf.toLocaleString('fr-FR')} FC) au profit de ${newRecord.beneficiaryOrSupplier} — Écriture ${
        createdEntry.entryNumber
      } transmise au Comptable.`
    );
  };

  const filteredExpenses = expenses.filter(
    (e) =>
      e.voucherId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.beneficiaryOrSupplier.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalEngagedUsd = expenses.reduce((acc, e) => acc + e.amountUsd, 0);
  const totalEngagedCdf = Math.round(totalEngagedUsd * bccRate);

  return (
    <div className="space-y-6">
      {/* En-tête Dépenses Vendeur & Sorties de Caisse */}
      <div
        className="rounded-3xl p-5 sm:p-6 text-white shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, ${activeBranding.primaryColor}, ${activeBranding.secondaryColor})`,
        }}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs uppercase tracking-wider">
              <MinusCircle className="w-3.5 h-3.5" />
              <span>Espace Vendeur & Caisse • Engagement de Dépenses</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-400/25 text-amber-100 border border-amber-300/40">
              <Clock className="w-3.5 h-3.5" />
              <span>Transmission Comptable Directe & Auto-Validation 00h00</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight">
            Engager une Dépense & Bon de Sortie de Caisse
          </h1>
          <p className="text-xs text-white/85 max-w-2xl">
            En plus des ventes, le Vendeur (<strong>{user?.name}</strong>) peut engager des dépenses opérationnelles (carburant, transport, fournitures, réassortiment). Chaque dépense génère un <strong>Bon de Sortie imprimable</strong> transmis comme pièce justificative au <strong>Comptable</strong> en Franc Congolais (<strong>1 $ = {bccRate.toLocaleString('fr-FR')} FC</strong>).
          </p>
        </div>

        <div className="bg-black/25 backdrop-blur-xs border border-white/15 rounded-2xl p-3.5 text-right shrink-0">
          <span className="text-[10px] uppercase font-extrabold text-white/75 block">
            Cumul Dépenses Engagées (Jour)
          </span>
          <span className="text-xl font-black text-amber-300 block">
            ${totalEngagedUsd.toFixed(2)} USD
          </span>
          <span className="text-xs font-bold text-white/90">
            ≈ {totalEngagedCdf.toLocaleString('fr-FR')} FC (Taux BCC Live)
          </span>
        </div>
      </div>

      {feedbackNotice && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs sm:text-sm font-bold flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackNotice}</span>
        </div>
      )}

      {/* Grille principale : Formulaire d'engagement à gauche (5 cols) + Historique des dépenses à droite (7 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE : FORMULAIRE D'ENGAGEMENT DE DÉPENSE */}
        <form
          onSubmit={handleEngageExpense}
          className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4"
        >
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <MinusCircle className="w-4 h-4" />
              </div>
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Nouvelle Dépense / Sortie de Caisse
                </h2>
                <p className="text-[11px] text-slate-500">
                  Imputation SYSCOHADA automatique en Franc Congolais (FC)
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              1 $ = {bccRate.toLocaleString('fr-FR')} FC
            </span>
          </div>

          <div className="space-y-3 text-xs">
            {/* Nature / Catégorie de la dépense */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Nature de la Dépense (Compte de Charge SYSCOHADA) *
              </label>
              <select
                value={selectedCategoryCode}
                onChange={(e) => setSelectedCategoryCode(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {SELLER_EXPENSE_CATEGORIES.map((cat) => (
                  <option key={cat.code} value={cat.code}>
                    [{cat.accountNumber}] {cat.label}
                  </option>
                ))}
              </select>
              <p className="text-[10px] text-slate-400 mt-1">{selectedCategory.hint}</p>
            </div>

            {/* Montant USD + Conversion Temps Réel BCC en FC */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl bg-rose-50/60 border border-rose-200/80">
              <div>
                <label className="block text-[10px] font-extrabold uppercase text-rose-900 mb-1">
                  Montant Décaissé ($ USD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.1"
                  required
                  placeholder="Ex: 25.00"
                  value={amountUsd}
                  onChange={(e) => setAmountUsd(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-rose-300 rounded-xl text-sm font-black text-slate-900 focus:outline-none focus:ring-2 focus:ring-rose-500"
                />
              </div>
              <div className="flex flex-col justify-center">
                <span className="text-[10px] font-extrabold uppercase text-blue-900">
                  Écriture Comptable (FC / CDF)
                </span>
                <span className="text-base font-black text-blue-700 mt-0.5">
                  {computedCdf.toLocaleString('fr-FR')} FC
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  Au taux BCC Live : {bccRate.toLocaleString('fr-FR')} FC/$
                </span>
              </div>
            </div>

            {/* Bénéficiaire / Fournisseur */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Bénéficiaire / Fournisseur *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Station TotalEnergies, Transporteur Moto, SNEL..."
                value={beneficiary}
                onChange={(e) => setBeneficiary(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
              />
            </div>

            {/* Motif détaillé */}
            <div>
              <label className="block font-bold text-slate-700 mb-1">
                Motif précis de la dépense *
              </label>
              <textarea
                rows={2}
                required
                placeholder="Ex: Achat 15L carburant pour le groupe électrogène du point de vente..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
              />
            </div>

            {/* Poste / Point de vente & Réf facture externe */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Point de vente / Poste concerné
                </label>
                <input
                  type="text"
                  value={stationOrPurpose}
                  onChange={(e) => setStationOrPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  N° Facture / Reçu Fournisseur (Optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: REC-8821"
                  value={externalPieceRef}
                  onChange={(e) => setExternalPieceRef(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-mono text-slate-800"
                />
              </div>
            </div>

            {/* Moyen de décaissement */}
            <div className="space-y-1.5">
              <label className="block text-[10px] font-bold uppercase text-slate-400">
                Moyen de Décaissement utilisé
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'CASH_USD', label: 'Espèces Caisse ($)', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { id: 'MPESA', label: 'M-Pesa', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'AIRTEL_MONEY', label: 'Airtel Money', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'ILLICOCASH', label: 'IllicoCash', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'VISA_MASTERCARD', label: 'Carte Visa/MC', icon: <CreditCard className="w-3.5 h-3.5" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2 rounded-xl border text-[11px] font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === m.id
                        ? 'bg-rose-600 text-white border-rose-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs sm:text-sm shadow-md transition flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            <span>
              Engager la Dépense (${numericUsd.toFixed(2)}) & Imprimer Bon de Sortie
            </span>
          </button>
        </form>

        {/* COLONNE DROITE : HISTORIQUE DES DÉPENSES ENGAGÉES PAR LE VENDEUR */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-extrabold text-slate-900">
                Journal des Dépenses Engagées & Bons de Sortie ({filteredExpenses.length})
              </h3>
              <p className="text-xs text-slate-500">
                Chaque dépense est transmise au Comptable avec son Bon de Sortie justificatif (validation manuelle ou auto à 00h00).
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher N° bon, bénéficiaire..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs"
              />
            </div>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[660px] text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[10px] font-extrabold uppercase text-slate-400">
                  <th className="py-2.5 px-3">N° Bon & Heure</th>
                  <th className="py-2.5 px-3">Bénéficiaire & Motif</th>
                  <th className="py-2.5 px-3">Imputation</th>
                  <th className="py-2.5 px-3 text-right">Montant USD / FC</th>
                  <th className="py-2.5 px-3">Statut Comptable</th>
                  <th className="py-2.5 px-3 text-right">Pièce</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredExpenses.map((exp) => {
                  const linkedEntry = getStoredEntries().find(
                    (e) =>
                      e.pieceRef === exp.voucherId || e.entryNumber === exp.accountingEntryNumber
                  );
                  const isValidated = linkedEntry?.status === 'VALIDATED';
                  const liveCdf = Math.round(exp.amountUsd * bccRate);

                  return (
                    <tr key={exp.voucherId} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3">
                        <span className="font-mono font-black text-rose-700 block">
                          {exp.voucherId}
                        </span>
                        <span className="text-[10px] text-slate-400">{exp.timestamp}</span>
                      </td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{exp.beneficiaryOrSupplier}</p>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{exp.description}</p>
                        <span className="text-[10px] text-slate-400 font-semibold">
                          Par : {exp.operatorName} ({exp.paymentMethodLabel})
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded bg-slate-100 font-mono font-bold text-[10px] text-slate-800">
                          Compte {exp.accountNumber}
                        </span>
                        <span className="block text-[10px] text-slate-500 mt-0.5 truncate max-w-[140px]">
                          {exp.categoryLabel}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-black text-rose-600 block">
                          -${exp.amountUsd.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-extrabold text-blue-700">
                          {liveCdf.toLocaleString('fr-FR')} FC
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isValidated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Validé ({exp.accountingEntryNumber})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                            <Clock className="w-3 h-3" />
                            <span>Transmis Comptable (Auto 00h00)</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          type="button"
                          onClick={() => setPrintedVoucher(exp)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Bon de Sortie</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* MODAL BON DE SORTIE DE CAISSE IMPRIMABLE (PIÈCE JUSTIFICATIVE VENDEUR -> COMPTABLE) */}
      {printedVoucher && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-rose-50 text-rose-600">
                  <Receipt className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Bon de Sortie de Caisse / Justificatif Dépense
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Pièce justificative transmise au Comptable
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPrintedVoucher(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-800 uppercase">
                BON DE SORTIE DE CAISSE — DÉPENSE OPÉRATIONNELLE
              </span>
              <h4 className="font-extrabold text-xs text-slate-900 uppercase pt-1">
                {printedVoucher.receiptHeader}
              </h4>
              <p className="text-[11px] text-slate-500">
                {printedVoucher.companyName} • {printedVoucher.establishmentName}
              </p>
            </div>

            <div className="text-xs space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Bon de Sortie :</span>
                <span className="font-mono font-black text-rose-700">
                  {printedVoucher.voucherId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Date & Heure :</span>
                <span className="font-semibold">{printedVoucher.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Engagé par :</span>
                <span className="font-bold text-slate-800">
                  {printedVoucher.operatorName} ({printedVoucher.operatorRole})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Bénéficiaire / Fournisseur :</span>
                <span className="font-bold text-slate-900">
                  {printedVoucher.beneficiaryOrSupplier}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Compte SYSCOHADA :</span>
                <span className="font-mono font-bold text-blue-700">
                  {printedVoucher.accountNumber} — {printedVoucher.categoryLabel}
                </span>
              </div>
              <div className="pt-1">
                <span className="text-slate-500 block">Motif détaillé :</span>
                <p className="font-semibold text-slate-800 bg-slate-50 p-2 rounded-lg border border-slate-200/70 mt-0.5">
                  {printedVoucher.description}
                </p>
              </div>
            </div>

            <div className="space-y-1.5 text-xs bg-rose-50/60 p-3 rounded-2xl border border-rose-200/80">
              <div className="flex justify-between text-slate-800 font-extrabold text-sm">
                <span>MONTANT DÉCAISSÉ (USD) :</span>
                <span className="text-rose-700">-${printedVoucher.amountUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600">
                <span>Taux officiel BCC appliqué :</span>
                <span>1 $ = {bccRate.toLocaleString('fr-FR')} FC</span>
              </div>
              <div className="flex justify-between text-xs font-black text-blue-800 pt-1 border-t border-rose-200">
                <span>CONTRE-VALEUR COMPTABLE (FC / CDF) :</span>
                <span>{Math.round(printedVoucher.amountUsd * bccRate).toLocaleString('fr-FR')} FC</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-0.5">
                <span>Moyen de décaissement :</span>
                <span className="font-bold">{printedVoucher.paymentMethodLabel}</span>
              </div>
            </div>

            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-1">
              <div className="flex items-center justify-between font-extrabold text-blue-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transmis au Comptable (Pièce Justificative)</span>
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200">
                  {printedVoucher.accountingEntryNumber}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Ce Bon de Sortie est joint à l'écriture comptable en Franc Congolais. En attente de validation par le Comptable en fin de journée (ou <strong>enregistrement automatique au Journal à 00h00</strong>).
              </p>
            </div>

            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer Bon 80mm</span>
              </button>
              <button
                onClick={() => setPrintedVoucher(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
