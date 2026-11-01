import React, { useState, useMemo, useEffect } from 'react';
import {
  ShoppingCart,
  Search,
  Plus,
  Minus,
  Trash2,
  Printer,
  CheckCircle2,
  Banknote,
  Smartphone,
  CreditCard,
  Scissors,
  Utensils,
  Wine,
  Shirt,
  Monitor,
  Clock,
  UserCheck,
  Tag,
  Receipt,
  Building2,
  Sparkles,
  History,
  ChefHat,
  Calendar,
  MinusCircle,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  SECTOR_CATALOG_ITEMS,
  INITIAL_SECTOR_ACTIVE_ORDERS,
} from '../../data/multiTenantMockData';
import {
  createAccountingEntryFromPosReceipt,
  getStoredBccExchangeRate,
  getStoredEntries,
  subscribeToBccRateUpdates,
} from '../../data/accountingMockData';
import { SectorCatalogItem, SectorActiveOrderOrAppointment } from '../../types';

interface CartLine {
  item: SectorCatalogItem;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
  selectedStylist?: string;
  tableOrNotes?: string;
}

interface CompletedPosReceipt {
  id: string;
  timestamp: string;
  companyName: string;
  receiptHeader: string;
  receiptFooter: string;
  establishmentName: string;
  operatorName: string;
  operatorRole: string;
  clientName: string;
  tableOrStation: string;
  paymentMethod: string;
  paymentReference: string;
  subtotal: number;
  discountAmount: number;
  totalUsd: number;
  cashReceived?: number;
  changeReturned?: number;
  accountingEntryNumber?: string;
  totalCdf?: number;
  lines: CartLine[];
}

export const SectorPosTerminal: React.FC = () => {
  const {
    user,
    activeCompany,
    activeEstablishment,
    activeBranding,
    logAuditEvent,
  } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'TERMINAL' | 'ACTIVE_OPERATIONS' | 'DAILY_HISTORY'>('TERMINAL');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  // Taux officiel BCC en temps réel (1 USD = 2 261 FC)
  const [bccRate, setBccRate] = useState<number>(getStoredBccExchangeRate);

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
    });
    return unsubscribe;
  }, []);

  // Panier POS
  const [cart, setCart] = useState<CartLine[]>([]);
  const [clientName, setClientName] = useState('Client Comptoir (Kinshasa)');
  const [tableOrStation, setTableOrStation] = useState(() => {
    if (activeCompany.businessSector === 'SALON_COIFFURE') return 'Fauteuil #1 — Clarisse Mbuyi';
    if (activeCompany.businessSector === 'RESTAURANT') return 'Table 05 — Salle Climatisée';
    if (activeCompany.businessSector === 'BAR_TERRASSE') return 'Table Terrasse #08 — Serveur Trésor';
    if (activeCompany.businessSector === 'BOUTIQUE_MODE') return 'Vente Boutique Directe';
    return 'Showroom POS Gombe';
  });
  const [discountPercent, setDiscountPercent] = useState<number>(0);

  // Paiement
  const [paymentMethod, setPaymentMethod] = useState<
    'CASH_USD' | 'MPESA' | 'ORANGE_MONEY' | 'AIRTEL_MONEY' | 'ILLICOCASH' | 'VISA_MASTERCARD'
  >('CASH_USD');
  const [cashReceived, setCashReceived] = useState<string>('');
  const [customerPhone, setCustomerPhone] = useState<string>('+243 81 ');

  // Sélections rapides de variantes (Boutique Mode : taille / couleur)
  const [selectedSizeMap, setSelectedSizeMap] = useState<Record<number, string>>({});
  const [selectedColorMap, setSelectedColorMap] = useState<Record<number, string>>({});

  // Ticket imprimable affiché en modal après validation
  const [printedReceipt, setPrintedReceipt] = useState<CompletedPosReceipt | null>(null);

  // Historique des ventes du jour (isolé par entreprise)
  const [dailyReceipts, setDailyReceipts] = useState<CompletedPosReceipt[]>([
    {
      id: 'POS-2026-8841',
      timestamp: 'Aujourd’hui • 10:15',
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter: activeBranding.receiptFooterText || '',
      establishmentName: activeEstablishment.name,
      operatorName: 'Grâce Kalonji',
      operatorRole: 'CASHIER',
      clientName: 'M. Christian Mbuyi',
      tableOrStation: 'Caisse Principale #1',
      paymentMethod: 'Espèces Cash (USD)',
      paymentReference: 'CASH-USD-8841',
      subtotal: 120,
      discountAmount: 0,
      totalUsd: 120,
      cashReceived: 150,
      changeReturned: 30,
      lines: [],
    },
    {
      id: 'POS-2026-8842',
      timestamp: 'Aujourd’hui • 11:42',
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter: activeBranding.receiptFooterText || '',
      establishmentName: activeEstablishment.name,
      operatorName: 'Alain Tshisekedi',
      operatorRole: 'SELLER',
      clientName: 'Mme Solange Kanku',
      tableOrStation: 'Caisse Principale #1',
      paymentMethod: 'M-Pesa Vodacom RDC',
      paymentReference: 'MPESA-9941204',
      subtotal: 85,
      discountAmount: 5,
      totalUsd: 80,
      lines: [],
    },
  ]);

  // Commandes / RDV / Tables en cours pour l'entreprise active
  const [activeOrders, setActiveOrders] = useState<SectorActiveOrderOrAppointment[]>(INITIAL_SECTOR_ACTIVE_ORDERS);

  // Articles du catalogue filtrés pour l'entreprise active (ou secteur)
  const companyCatalog = useMemo(() => {
    const items = SECTOR_CATALOG_ITEMS.filter(
      (item) => item.companyId === activeCompany.id || item.sector === activeCompany.businessSector
    );
    return items.length > 0 ? items : SECTOR_CATALOG_ITEMS.filter((i) => i.companyId === 1);
  }, [activeCompany]);

  const categories = useMemo(() => {
    const cats = Array.from(new Set(companyCatalog.map((i) => i.category)));
    return ['ALL', ...cats];
  }, [companyCatalog]);

  const filteredCatalog = useMemo(() => {
    return companyCatalog.filter((item) => {
      const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
      const matchesSearch =
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.barcode && item.barcode.includes(searchQuery));
      return matchesCat && matchesSearch;
    });
  }, [companyCatalog, selectedCategory, searchQuery]);

  const companyActiveOrders = useMemo(() => {
    return activeOrders.filter(
      (o) => o.companyId === activeCompany.id || o.sector === activeCompany.businessSector
    );
  }, [activeOrders, activeCompany]);

  // Totaux du panier
  const subtotal = useMemo(() => {
    return cart.reduce((acc, line) => acc + line.item.unitPrice * line.quantity, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    return Number(((subtotal * discountPercent) / 100).toFixed(2));
  }, [subtotal, discountPercent]);

  const totalUsd = useMemo(() => {
    return Math.max(0, Number((subtotal - discountAmount).toFixed(2)));
  }, [subtotal, discountAmount]);

  const numericCashReceived = parseFloat(cashReceived) || 0;
  const changeReturned =
    paymentMethod === 'CASH_USD' && numericCashReceived > totalUsd
      ? Number((numericCashReceived - totalUsd).toFixed(2))
      : 0;

  const addToCart = (item: SectorCatalogItem) => {
    const chosenSize = selectedSizeMap[item.id] || item.sizes?.[0];
    const chosenColor = selectedColorMap[item.id] || item.colors?.[0];

    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (l) =>
          l.item.id === item.id &&
          l.selectedSize === chosenSize &&
          l.selectedColor === chosenColor
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      }
      return [
        ...prev,
        {
          item,
          quantity: 1,
          selectedSize: chosenSize,
          selectedColor: chosenColor,
          selectedStylist: item.stylistName,
        },
      ];
    });
  };

  const updateQuantity = (index: number, delta: number) => {
    setCart((prev) => {
      const updated = [...prev];
      const nextQty = updated[index].quantity + delta;
      if (nextQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = nextQty;
      return updated;
    });
  };

  const removeLine = (index: number) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCheckout = () => {
    if (cart.length === 0) {
      alert('Veuillez ajouter au moins un article ou service au panier avant d’encaisser.');
      return;
    }

    // Contrôle RBAC sur les remises : Vendeur / Caissier limité à 10% sans validation Gérant/Admin
    if (
      discountPercent > 10 &&
      user?.role !== 'ADMIN' &&
      user?.role !== 'SUPER_ADMIN' &&
      user?.role !== 'MANAGER'
    ) {
      alert(
        'Contrôle RBAC : En tant que Vendeur / Caissier, la remise maximale autorisée sans code Gérant est de 10%.'
      );
      return;
    }

    const methodLabels: Record<typeof paymentMethod, string> = {
      CASH_USD: 'Espèces Cash (USD $)',
      MPESA: 'M-Pesa (Vodacom RDC)',
      ORANGE_MONEY: 'Orange Money RDC',
      AIRTEL_MONEY: 'Airtel Money RDC',
      ILLICOCASH: 'IllicoCash (Rawbank)',
      VISA_MASTERCARD: 'Carte Bancaire (Visa / Mastercard)',
    };

    const receiptId = `POS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const bccRate = getStoredBccExchangeRate();
    const totalCdf = Math.round(totalUsd * bccRate);
    const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const payRef = `${paymentMethod}-${Math.floor(100000 + Math.random() * 900000)}`;

    // 1. Génération et transmission automatique de l'écriture comptable (en FC) + Reçu justificatif vers l'espace Comptable
    const createdAccountingEntry = createAccountingEntryFromPosReceipt({
      receiptId,
      timestamp: timeStr,
      dateIso: new Date().toISOString(),
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter:
        activeBranding.receiptFooterText ||
        'Merci de votre visite ! Conservez ce ticket comme justificatif.',
      establishmentName: activeEstablishment.name,
      operatorName: user?.name || 'Opérateur Caisse',
      operatorRole: user?.role || 'CASHIER',
      clientName,
      tableOrStation,
      paymentMethodCode: paymentMethod,
      paymentMethodLabel: methodLabels[paymentMethod],
      paymentReference: payRef,
      subtotalUsd: subtotal,
      discountAmountUsd: discountAmount,
      totalUsd,
      bccExchangeRate: bccRate,
      totalCdf,
      cashReceivedUsd: paymentMethod === 'CASH_USD' ? numericCashReceived || totalUsd : undefined,
      changeReturnedUsd: paymentMethod === 'CASH_USD' ? changeReturned : undefined,
      items: cart.map((l) => ({
        sku: l.item.sku,
        name: l.item.name,
        quantity: l.quantity,
        unitPriceUsd: l.item.unitPrice,
        totalUsd: Number((l.item.unitPrice * l.quantity).toFixed(2)),
      })),
    });

    const newReceipt: CompletedPosReceipt = {
      id: receiptId,
      timestamp: timeStr,
      companyName: activeCompany.tradeName,
      receiptHeader: activeBranding.receiptHeaderName,
      receiptFooter:
        activeBranding.receiptFooterText ||
        'Merci de votre visite ! Conservez ce ticket comme justificatif.',
      establishmentName: activeEstablishment.name,
      operatorName: user?.name || 'Opérateur Caisse',
      operatorRole: user?.role || 'CASHIER',
      clientName,
      tableOrStation,
      paymentMethod: methodLabels[paymentMethod],
      paymentReference: payRef,
      subtotal,
      discountAmount,
      totalUsd,
      cashReceived: paymentMethod === 'CASH_USD' ? numericCashReceived || totalUsd : undefined,
      changeReturned: paymentMethod === 'CASH_USD' ? changeReturned : undefined,
      accountingEntryNumber: createdAccountingEntry.entryNumber,
      totalCdf,
      lines: [...cart],
    };

    setDailyReceipts((prev) => [newReceipt, ...prev]);
    setPrintedReceipt(newReceipt);
    setCart([]);
    setDiscountPercent(0);
    setCashReceived('');

    logAuditEvent(
      'POS_SALE_COMPLETED',
      'Ventes POS & Caisse → Comptabilité',
      `Encaissement ${receiptId} de $${totalUsd.toFixed(2)} (${totalCdf.toLocaleString('fr-FR')} FC) transmis au Comptable sous l'écriture ${createdAccountingEntry.entryNumber} avec reçu justificatif joint (Validation auto programmée à 00h00).`
    );
  };

  const getSectorBadgeInfo = () => {
    switch (activeCompany.businessSector) {
      case 'SALON_COIFFURE':
        return {
          icon: <Scissors className="w-4 h-4" />,
          label: 'Mode Salon de Coiffure & Esthétique',
          stationPlaceholder: 'Fauteuil / Coiffeur assigné',
          ordersTabLabel: 'Rendez-vous & Fauteuils',
        };
      case 'RESTAURANT':
        return {
          icon: <Utensils className="w-4 h-4" />,
          label: 'Mode Restaurant, Tables & Cuisine',
          stationPlaceholder: 'Table / Serveur / À emporter',
          ordersTabLabel: 'Tables & Tickets Cuisine',
        };
      case 'BAR_TERRASSE':
        return {
          icon: <Wine className="w-4 h-4" />,
          label: 'Mode Bar Lounge & Terrasse',
          stationPlaceholder: 'Table Terrasse / Salon VIP / Serveur',
          ordersTabLabel: 'Additions & Tables Ouvertes',
        };
      case 'BOUTIQUE_MODE':
        return {
          icon: <Shirt className="w-4 h-4" />,
          label: 'Mode Boutique & Maison d’Habillement',
          stationPlaceholder: 'Cabine / Conseiller de vente',
          ordersTabLabel: 'Paniers Cabines & Retours',
        };
      default:
        return {
          icon: <Monitor className="w-4 h-4" />,
          label: 'Mode Distribution Terminaux POS & Équipements',
          stationPlaceholder: 'Guichet / Commercial',
          ordersTabLabel: 'Commandes Comptoir',
        };
    }
  };

  const sectorInfo = getSectorBadgeInfo();

  return (
    <div className="space-y-5">
      {/* Bannière White Label & Profil Métier */}
      <div
        className="rounded-2xl p-4 sm:p-5 text-white shadow-lg flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4"
        style={{
          background: `linear-gradient(135deg, ${activeBranding.primaryColor}, ${activeBranding.secondaryColor})`,
        }}
      >
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-white/20 backdrop-blur-xs">
              {sectorInfo.icon}
              <span>{sectorInfo.label}</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-400/20 text-emerald-100 border border-emerald-300/30">
              <Building2 className="w-3.5 h-3.5" />
              <span>{activeEstablishment.name}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            {activeBranding.workspaceName} — Ventes POS & Caisse
          </h1>
          <p className="text-xs text-white/80">
            Opérateur actif : <strong>{user?.name}</strong> (Rôle :{' '}
            <span className="underline font-bold">{user?.role}</span>) • Devise Caisse :{' '}
            <strong>Dollar Américain ($ USD)</strong> • Taux BCC Live :{' '}
            <strong className="text-emerald-200">1 $ = {bccRate.toLocaleString('fr-FR')} FC</strong>
          </p>
        </div>

        {/* Onglets du Terminal POS & Caisse */}
        <div className="flex flex-wrap items-center gap-2 bg-black/20 p-1.5 rounded-xl self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('TERMINAL')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'TERMINAL'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            <span>Caisse Tactile POS</span>
          </button>
          <button
            onClick={() => setActiveTab('ACTIVE_OPERATIONS')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'ACTIVE_OPERATIONS'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            {activeCompany.businessSector === 'RESTAURANT' ? (
              <ChefHat className="w-3.5 h-3.5" />
            ) : (
              <Calendar className="w-3.5 h-3.5" />
            )}
            <span>{sectorInfo.ordersTabLabel}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-amber-400 text-slate-950 font-extrabold">
              {companyActiveOrders.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('DAILY_HISTORY')}
            className={`px-3.5 py-2 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'DAILY_HISTORY'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-white/85 hover:bg-white/10'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Journal de Caisse ({dailyReceipts.length})</span>
          </button>
          <button
            onClick={() => navigate('/vendeur/depenses')}
            className="px-3.5 py-2 rounded-lg text-xs font-extrabold transition flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white shadow-sm border border-rose-400/40"
            title="Engager une dépense opérationnelle ou émettre un Bon de Sortie de Caisse"
          >
            <MinusCircle className="w-3.5 h-3.5" />
            <span>Engager une Dépense</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ONGLET 1 : TERMINAL DE VENTE POS & CAISSE TACTILE         */}
      {/* ========================================================= */}
      {activeTab === 'TERMINAL' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
          {/* Colonne Gauche (7 cols) : Catalogue Métier */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs space-y-4">
            {/* Barre de recherche + Filtres catégories */}
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Rechercher prestation, plat, boisson, vêtement, code-barres SKU..."
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Pilules de catégories */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                    selectedCategory === cat
                      ? 'text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                  style={
                    selectedCategory === cat
                      ? { backgroundColor: activeBranding.buttonColor }
                      : undefined
                  }
                >
                  {cat === 'ALL' ? 'Tous les articles & services' : cat}
                </button>
              ))}
            </div>

            {/* Grille Tactile des Articles / Prestations */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {filteredCatalog.map((item) => (
                <div
                  key={item.id}
                  className="border border-slate-200/90 hover:border-blue-400 rounded-2xl p-3.5 flex flex-col justify-between bg-slate-50/40 hover:bg-white transition group shadow-2xs"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-slate-200/70 text-slate-700">
                        {item.sku}
                      </span>
                      <span className="text-base font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-lg border border-emerald-200">
                        ${item.unitPrice.toFixed(2)}
                      </span>
                    </div>

                    <h3 className="text-xs sm:text-sm font-extrabold text-slate-900 leading-snug">
                      {item.name}
                    </h3>

                    <p className="text-[11px] font-semibold text-slate-500">{item.category}</p>

                    {/* Métadonnées spécifiques Salon de Coiffure */}
                    {item.sector === 'SALON_COIFFURE' && item.durationMinutes && (
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-pink-700 bg-pink-50 px-2.5 py-1 rounded-lg border border-pink-100">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Durée : {item.durationMinutes} min</span>
                        {item.stylistName && <span>• Coiffeur : {item.stylistName}</span>}
                      </div>
                    )}

                    {/* Métadonnées spécifiques Restaurant / Bar */}
                    {(item.sector === 'RESTAURANT' || item.sector === 'BAR_TERRASSE') && (
                      <div className="space-y-1">
                        {item.prepZone && (
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-amber-50 text-amber-800 border border-amber-200">
                            Zone : {item.prepZone}
                          </span>
                        )}
                        {item.ingredientsSummary && (
                          <p className="text-[10px] text-slate-500 italic">{item.ingredientsSummary}</p>
                        )}
                      </div>
                    )}

                    {/* Métadonnées spécifiques Boutique & Maison d'Habillement (Tailles & Couleurs) */}
                    {item.sector === 'BOUTIQUE_MODE' && (
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        {item.sizes && (
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">
                              Taille
                            </label>
                            <select
                              value={selectedSizeMap[item.id] || item.sizes[0]}
                              onChange={(e) =>
                                setSelectedSizeMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              className="w-full text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1"
                            >
                              {item.sizes.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                        {item.colors && (
                          <div>
                            <label className="block text-[9px] font-bold uppercase text-slate-400 mb-0.5">
                              Couleur
                            </label>
                            <select
                              value={selectedColorMap[item.id] || item.colors[0]}
                              onChange={(e) =>
                                setSelectedColorMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                              }
                              className="w-full text-[11px] font-bold bg-white border border-slate-200 rounded-lg px-2 py-1"
                            >
                              {item.colors.map((c) => (
                                <option key={c} value={c}>
                                  {c}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="pt-3 mt-3 border-t border-slate-200/60 flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500">
                      {item.isService ? 'Prestation de service' : `En stock : ${item.stockQuantity} u.`}
                    </span>
                    <button
                      type="button"
                      onClick={() => addToCart(item)}
                      className="px-3 py-1.5 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-xs hover:opacity-95 active:scale-95 transition"
                      style={{ backgroundColor: activeBranding.buttonColor }}
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Ajouter</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Colonne Droite (5 cols) : Panier, Remise & Encaissement Multi-Moyens */}
          <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-sm space-y-4 sticky top-20">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-600" />
                <div>
                  <h2 className="text-sm font-extrabold text-slate-900">Ticket & Encaissement POS</h2>
                  <p className="text-[11px] text-slate-500">{activeBranding.receiptHeaderName}</p>
                </div>
              </div>
              {cart.length > 0 && (
                <button
                  onClick={() => setCart([])}
                  className="text-[11px] font-bold text-rose-600 hover:underline"
                >
                  Vider le panier
                </button>
              )}
            </div>

            {/* Informations Client & Table / Fauteuil / Poste */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  Client(e)
                </label>
                <input
                  type="text"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
              <div>
                <label className="block text-[10px] font-bold uppercase text-slate-400 mb-1">
                  {sectorInfo.stationPlaceholder}
                </label>
                <input
                  type="text"
                  value={tableOrStation}
                  onChange={(e) => setTableOrStation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800"
                />
              </div>
            </div>

            {/* Lignes du panier */}
            <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 border border-slate-100 rounded-xl p-2 bg-slate-50/50">
              {cart.length === 0 ? (
                <div className="py-8 text-center text-xs text-slate-400 space-y-1">
                  <ShoppingCart className="w-7 h-7 mx-auto text-slate-300 stroke-1" />
                  <p className="font-semibold">Aucun article sélectionné</p>
                  <p className="text-[11px]">Cliquez sur un produit ou service à gauche pour l’ajouter.</p>
                </div>
              ) : (
                cart.map((line, idx) => (
                  <div key={idx} className="py-2.5 px-1 flex items-center justify-between gap-2 text-xs">
                    <div className="min-w-0 flex-1">
                      <p className="font-bold text-slate-800 truncate">{line.item.name}</p>
                      <div className="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-500">
                        <span>${line.item.unitPrice.toFixed(2)} / u.</span>
                        {line.selectedSize && (
                          <span className="px-1.5 py-0.2 bg-violet-50 text-violet-700 rounded font-bold">
                            Taille: {line.selectedSize}
                          </span>
                        )}
                        {line.selectedColor && (
                          <span className="px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded font-bold">
                            {line.selectedColor}
                          </span>
                        )}
                        {line.selectedStylist && (
                          <span className="px-1.5 py-0.2 bg-pink-50 text-pink-700 rounded font-bold">
                            {line.selectedStylist}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, -1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="w-6 text-center font-extrabold text-slate-900">{line.quantity}</span>
                      <button
                        type="button"
                        onClick={() => updateQuantity(idx, 1)}
                        className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center hover:bg-slate-100"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="text-right font-extrabold text-slate-900 w-16">
                      ${(line.item.unitPrice * line.quantity).toFixed(2)}
                    </div>

                    <button
                      type="button"
                      onClick={() => removeLine(idx)}
                      className="text-slate-400 hover:text-rose-600 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Remise & Totaux */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 space-y-2 text-xs">
              <div className="flex items-center justify-between text-slate-600">
                <span>Sous-total HT / Brut</span>
                <span className="font-bold">${subtotal.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between gap-2">
                <span className="flex items-center gap-1 text-slate-600">
                  <Tag className="w-3.5 h-3.5 text-blue-600" />
                  <span>Remise commerciale (%)</span>
                </span>
                <div className="flex items-center gap-1">
                  {[0, 5, 10].map((pct) => (
                    <button
                      key={pct}
                      type="button"
                      onClick={() => setDiscountPercent(pct)}
                      className={`px-2 py-0.5 rounded text-[11px] font-bold border ${
                        discountPercent === pct
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-white text-slate-700 border-slate-200'
                      }`}
                    >
                      {pct}%
                    </button>
                  ))}
                </div>
              </div>

              {discountAmount > 0 && (
                <div className="flex items-center justify-between text-emerald-700 font-semibold">
                  <span>Montant remise ({discountPercent}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-base font-extrabold text-slate-900">
                <div>
                  <span className="block">NET À PAYER (USD)</span>
                  <span className="block text-[10px] font-bold text-blue-700">
                    Écriture Comptable BCC (1 $ = {bccRate.toLocaleString('fr-FR')} FC)
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-xl text-emerald-700 block">${totalUsd.toFixed(2)}</span>
                  <span className="text-xs font-extrabold text-blue-700">
                    {Math.round(totalUsd * bccRate).toLocaleString('fr-FR')} FC
                  </span>
                </div>
              </div>
            </div>

            {/* Choix du Mode de Paiement */}
            <div className="space-y-2">
              <label className="block text-[10px] font-bold uppercase text-slate-400">
                Moyen d’encaissement (Cash USD, Mobile Money ou Carte)
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {[
                  { id: 'CASH_USD', label: 'Espèces ($)', icon: <Banknote className="w-3.5 h-3.5" /> },
                  { id: 'MPESA', label: 'M-Pesa', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'ORANGE_MONEY', label: 'Orange Money', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'AIRTEL_MONEY', label: 'Airtel Money', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'ILLICOCASH', label: 'IllicoCash', icon: <Smartphone className="w-3.5 h-3.5" /> },
                  { id: 'VISA_MASTERCARD', label: 'Visa / MC', icon: <CreditCard className="w-3.5 h-3.5" /> },
                ].map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as any)}
                    className={`p-2 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition ${
                      paymentMethod === m.id
                        ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {m.icon}
                    <span>{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Champ Montant Reçu & Rendu Monnaie (Si Espèces USD) */}
            {paymentMethod === 'CASH_USD' ? (
              <div className="grid grid-cols-2 gap-3 bg-emerald-50/70 p-3 rounded-xl border border-emerald-200">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-emerald-800 mb-1">
                    Espèces reçues ($ USD)
                  </label>
                  <input
                    type="number"
                    placeholder={totalUsd.toFixed(2)}
                    value={cashReceived}
                    onChange={(e) => setCashReceived(e.target.value)}
                    className="w-full px-3 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs font-extrabold text-slate-900"
                  />
                </div>
                <div className="flex flex-col justify-center">
                  <span className="text-[10px] font-bold uppercase text-emerald-800">
                    Monnaie à rendre
                  </span>
                  <span className="text-base font-extrabold text-emerald-700">
                    ${changeReturned.toFixed(2)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="bg-indigo-50/70 p-3 rounded-xl border border-indigo-200">
                <label className="block text-[10px] font-bold uppercase text-indigo-800 mb-1">
                  Numéro Mobile Money Client / Réf. TPE
                </label>
                <input
                  type="text"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3 py-1.5 bg-white border border-indigo-300 rounded-lg text-xs font-bold text-slate-900"
                />
              </div>
            )}

            {/* Bouton Valider & Imprimer Ticket */}
            <button
              type="button"
              onClick={handleCheckout}
              className="w-full py-3 rounded-xl text-white font-extrabold text-xs sm:text-sm shadow-md hover:opacity-95 transition flex items-center justify-center gap-2"
              style={{ backgroundColor: activeBranding.buttonColor }}
            >
              <Printer className="w-4 h-4" />
              <span>Valider l’Encaissement (${totalUsd.toFixed(2)}) & Imprimer Reçu</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ONGLET 2 : OPÉRATIONS EN COURS (RDV SALON / TABLES / CUISINE) */}
      {/* ========================================================= */}
      {activeTab === 'ACTIVE_OPERATIONS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                {sectorInfo.ordersTabLabel} — {activeCompany.tradeName}
              </h2>
              <p className="text-xs text-slate-500">
                Suivi en temps réel des clients en cours de service et transfert direct vers la caisse.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {companyActiveOrders.map((ord) => (
              <div
                key={ord.id}
                className="border border-slate-200 rounded-2xl p-4 space-y-3 bg-slate-50/40 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-extrabold px-2.5 py-0.5 rounded-md bg-slate-900 text-white">
                      {ord.reference}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                        ord.status === 'READY'
                          ? 'bg-emerald-100 text-emerald-800'
                          : ord.status === 'IN_PROGRESS'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {ord.status === 'READY'
                        ? 'Prêt à encaisser'
                        : ord.status === 'IN_PROGRESS'
                        ? 'En cours de service'
                        : 'En attente'}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm font-extrabold text-slate-900">{ord.clientName}</h3>
                    <p className="text-xs font-bold text-blue-700">{ord.tableOrStationName}</p>
                    <p className="text-[11px] text-slate-500">{ord.staffOrWaiterName}</p>
                  </div>

                  <p className="text-xs text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200/80">
                    {ord.itemsSummary}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between">
                  <div>
                    <span className="block text-[10px] text-slate-400 font-bold">{ord.timeLabel}</span>
                    <span className="text-base font-extrabold text-emerald-700">
                      ${ord.totalAmount.toFixed(2)}
                    </span>
                  </div>

                  <button
                    onClick={() => {
                      setClientName(ord.clientName);
                      setTableOrStation(ord.tableOrStationName);
                      setActiveOrders((prev) => prev.filter((o) => o.id !== ord.id));
                      setActiveTab('TERMINAL');
                      if (companyCatalog[0]) {
                        setCart([
                          {
                            item: {
                              ...companyCatalog[0],
                              name: `${ord.reference} — ${ord.itemsSummary}`,
                              unitPrice: ord.totalAmount,
                            },
                            quantity: 1,
                          },
                        ]);
                      }
                    }}
                    className="px-3 py-2 rounded-xl text-white text-xs font-bold shadow-xs"
                    style={{ backgroundColor: activeBranding.buttonColor }}
                  >
                    Basculer en Caisse
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ONGLET 3 : JOURNAL DE CAISSE DU JOUR (TRAÇABILITÉ OPÉRATEUR) */}
      {/* ========================================================= */}
      {activeTab === 'DAILY_HISTORY' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h2 className="text-base font-extrabold text-slate-900">
                Historique des Encaissements Caisse — {activeCompany.tradeName}
              </h2>
              <p className="text-xs text-slate-500">
                Différenciation stricte dans l’historique entre les opérations Vendeur (SELLER) et Caissier (CASHIER).
              </p>
            </div>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-3">N° Ticket</th>
                  <th className="py-3 px-3">Heure</th>
                  <th className="py-3 px-3">Client / Table</th>
                  <th className="py-3 px-3">Opérateur (Rôle)</th>
                  <th className="py-3 px-3">Mode de Règlement</th>
                  <th className="py-3 px-3 text-right">Montant USD (FC)</th>
                  <th className="py-3 px-3">Liaison Comptable</th>
                  <th className="py-3 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {dailyReceipts.map((rec) => {
                  const linkedEntry = getStoredEntries().find(
                    (e) => e.pieceRef === rec.id || e.entryNumber === rec.accountingEntryNumber
                  );
                  const isValidated = linkedEntry?.status === 'VALIDATED';
                  const cdfVal = Math.round(rec.totalUsd * bccRate);

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-blue-700">{rec.id}</td>
                      <td className="py-3 px-3 text-slate-600">{rec.timestamp}</td>
                      <td className="py-3 px-3">
                        <p className="font-bold text-slate-900">{rec.clientName}</p>
                        <p className="text-[10px] text-slate-400">{rec.tableOrStation}</p>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-slate-800">{rec.operatorName}</span>
                        <span className="ml-1.5 text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-bold">
                          {rec.operatorRole}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-semibold text-slate-700">{rec.paymentMethod}</td>
                      <td className="py-3 px-3 text-right">
                        <span className="font-extrabold text-emerald-700 block">
                          ${rec.totalUsd.toFixed(2)}
                        </span>
                        <span className="text-[10px] font-bold text-slate-500">
                          {cdfVal.toLocaleString('fr-FR')} FC
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        {isValidated ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Validé Journal ({linkedEntry?.entryNumber})</span>
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
                          onClick={() => setPrintedReceipt(rec)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] inline-flex items-center gap-1"
                        >
                          <Printer className="w-3 h-3" />
                          <span>Reçu / Justificatif</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL TICKET DE CAISSE WHITE LABEL                        */}
      {/* ========================================================= */}
      {printedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in zoom-in-95">
            <div className="text-center border-b border-dashed border-slate-300 pb-4 space-y-1">
              <div
                className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center text-white font-extrabold text-base shadow-sm"
                style={{ backgroundColor: activeBranding.primaryColor }}
              >
                {activeBranding.logoText || 'XY'}
              </div>
              <h3 className="font-extrabold text-sm text-slate-900 uppercase pt-1">
                {printedReceipt.receiptHeader}
              </h3>
              <p className="text-[11px] text-slate-500">{activeCompany.address}</p>
              <p className="text-[11px] text-slate-500">
                Tél : {activeCompany.phone} • {activeEstablishment.name}
              </p>
            </div>

            <div className="text-xs space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">Ticket N° :</span>
                <span className="font-mono font-bold text-slate-900">{printedReceipt.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heure :</span>
                <span className="font-semibold">{printedReceipt.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client :</span>
                <span className="font-bold text-slate-800">{printedReceipt.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Poste / Table :</span>
                <span className="font-semibold">{printedReceipt.tableOrStation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Opérateur :</span>
                <span className="font-semibold">
                  {printedReceipt.operatorName} ({printedReceipt.operatorRole})
                </span>
              </div>
            </div>

            {printedReceipt.lines.length > 0 && (
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-xs">
                {printedReceipt.lines.map((l, i) => (
                  <div key={i} className="flex justify-between gap-2">
                    <span className="text-slate-700">
                      {l.quantity}x {l.item.name}
                    </span>
                    <span className="font-bold text-slate-900">
                      ${(l.item.unitPrice * l.quantity).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1 text-xs border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between text-slate-600">
                <span>Sous-total :</span>
                <span>${printedReceipt.subtotal.toFixed(2)}</span>
              </div>
              {printedReceipt.discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700">
                  <span>Remise :</span>
                  <span>-${printedReceipt.discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-extrabold text-slate-900 pt-1">
                <span>TOTAL PAYÉ (USD) :</span>
                <span>${printedReceipt.totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-xs font-extrabold text-blue-700">
                <span>CONTRE-VALEUR COMPTABLE (FC) :</span>
                <span>
                  {(
                    printedReceipt.totalCdf ||
                    Math.round(printedReceipt.totalUsd * getStoredBccExchangeRate())
                  ).toLocaleString('fr-FR')}{' '}
                  FC
                </span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-600 pt-1">
                <span>Mode de règlement :</span>
                <span className="font-bold">{printedReceipt.paymentMethod}</span>
              </div>
              {printedReceipt.cashReceived !== undefined && (
                <div className="flex justify-between text-[11px] text-slate-600">
                  <span>Espèces reçues / Monnaie rendue :</span>
                  <span className="font-bold">
                    ${printedReceipt.cashReceived.toFixed(2)} / $
                    {(printedReceipt.changeReturned || 0).toFixed(2)}
                  </span>
                </div>
              )}
            </div>

            {/* Bandeau de transmission automatique au Comptable + Validation Auto 00h00 */}
            <div className="p-3 rounded-2xl bg-blue-50 border border-blue-200 text-[11px] text-blue-950 space-y-1">
              <div className="flex items-center justify-between font-extrabold text-blue-800">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Transmis au Comptable (Pièce Justificative)</span>
                </span>
                <span className="font-mono text-[10px] bg-white px-2 py-0.5 rounded border border-blue-200">
                  {printedReceipt.accountingEntryNumber || `ECR-${printedReceipt.id}`}
                </span>
              </div>
              <p className="text-[10px] text-slate-600 leading-relaxed">
                Ce reçu est joint comme pièce justificative à l'écriture comptable en Franc Congolais. En attente de validation par le Comptable en fin de journée (ou <strong>enregistrement automatique au Journal à 00h00</strong>).
              </p>
            </div>

            <p className="text-[11px] text-center text-slate-500 italic">
              {printedReceipt.receiptFooter}
            </p>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer 80mm</span>
              </button>
              <button
                onClick={() => setPrintedReceipt(null)}
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
