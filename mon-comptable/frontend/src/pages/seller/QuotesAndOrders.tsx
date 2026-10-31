import React, { useState } from 'react';
import {
  FileText,
  ShoppingCart,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Truck,
  ArrowRight,
  Upload,
  Eye,
  FileCheck,
  Building,
  CreditCard,
  DollarSign,
  X,
  Package,
  Calendar,
  Receipt,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredQuotes,
  saveStoredQuotes,
  getStoredOrders,
  saveStoredOrders,
  getStoredPosProducts,
  getStoredProspects,
  Quote,
  Order,
  PaymentItem,
  QuoteItem,
} from '../../data/posMockData';

export const QuotesAndOrders: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'QUOTES' | 'ORDERS'>('ORDERS');
  const [quotes, setQuotes] = useState<Quote[]>(getStoredQuotes);
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [products] = useState(getStoredPosProducts);
  const [prospects] = useState(getStoredProspects);

  const [searchQuery, setSearchQuery] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Modal Nouveau Devis
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [quoteTargetProspect, setQuoteTargetProspect] = useState<string>('');
  const [selectedVariantId, setSelectedVariantId] = useState<number>(101);
  const [variantQuantity, setVariantQuantity] = useState<number>(1);
  const [quoteNotes, setQuoteNotes] = useState<string>('');

  // Modal Déclaration de Paiement par le Vendeur
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [selectedOrderForPayment, setSelectedOrderForPayment] = useState<Order | null>(null);
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<
    'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'CHECK'
  >('BANK_TRANSFER');
  const [paymentRef, setPaymentRef] = useState<string>('');
  const [paymentReceiptUrl, setPaymentReceiptUrl] = useState<string>('');
  const [paymentNotes, setPaymentNotes] = useState<string>('');

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 5000);
  };

  // Convertir un devis en commande ferme
  const handleConvertQuoteToOrder = (quote: Quote) => {
    const newOrder: Order = {
      id: Date.now(),
      orderNumber: `CMD-POS-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sellerId: user?.id || 5,
      sellerName: user?.name || 'Alain Tshisekedi',
      clientId: quote.prospectId || 1,
      clientName: quote.prospectName || 'Client Entreprise',
      quoteId: quote.id,
      processingStatus: 'CONFIRMED',
      paymentStatus: 'UNPAID',
      totalAmount: quote.totalTtc,
      paidAmount: 0.0,
      remainingAmount: quote.totalTtc,
      shippingAddress: 'Adresse renseignée lors de la confirmation',
      deliveryDate: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
      createdAt: new Date().toISOString(),
      items: quote.items.map((item) => ({
        id: Date.now() + Math.random(),
        posVariantId: item.posVariantId,
        variantTitle: item.variantTitle,
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPriceHt,
        totalPrice: item.totalHt,
      })),
      payments: [],
    };

    // Marquer devis comme accepté
    const updatedQuotes = quotes.map((q) =>
      q.id === quote.id ? { ...q, status: 'ACCEPTED' as const } : q
    );
    const updatedOrders = [newOrder, ...orders];

    setQuotes(updatedQuotes);
    setOrders(updatedOrders);
    saveStoredQuotes(updatedQuotes);
    saveStoredOrders(updatedOrders);

    showNotice(
      `🎉 Le devis ${quote.quoteNumber} a été validé et transformé en Commande ${newOrder.orderNumber} !`
    );
    setActiveTab('ORDERS');
  };

  // Ouvrir la modale pour déclarer un paiement sur une commande
  const handleOpenPaymentDeclaration = (order: Order) => {
    setSelectedOrderForPayment(order);
    const remaining = order.totalAmount - order.paidAmount;
    setPaymentAmount(remaining.toString());
    setPaymentRef(`VIR-REF-${Math.floor(100000 + Math.random() * 900000)}`);
    setPaymentReceiptUrl('https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80');
    setPaymentNotes('Virement reçu du client avec bordereau joint.');
    setIsPaymentModalOpen(true);
  };

  // Soumettre la déclaration de paiement (Statut PENDING pour validation finance)
  const handleSubmitPaymentDeclaration = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForPayment) return;

    const parsedAmount = parseFloat(paymentAmount);
    if (!parsedAmount || parsedAmount <= 0) {
      alert('Veuillez entrer un montant valide supérieur à 0.');
      return;
    }

    const newPayment: PaymentItem = {
      id: Date.now(),
      orderId: selectedOrderForPayment.id,
      orderNumber: selectedOrderForPayment.orderNumber,
      clientName: selectedOrderForPayment.clientName,
      sellerId: user?.id || 5,
      sellerName: user?.name || 'Alain Tshisekedi',
      amount: parsedAmount,
      paymentMethod,
      reference: paymentRef,
      paymentDate: new Date().toISOString(),
      receiptUrl: paymentReceiptUrl,
      verificationStatus: 'PENDING', // En attente du contrôleur financier !
      notes: paymentNotes,
    };

    const updatedOrders = orders.map((ord) => {
      if (ord.id === selectedOrderForPayment.id) {
        const currentPayments = ord.payments || [];
        return {
          ...ord,
          payments: [newPayment, ...currentPayments],
        };
      }
      return ord;
    });

    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
    setIsPaymentModalOpen(false);

    showNotice(
      `✅ Paiement de ${parsedAmount} $ déclaré avec justificatif ! Transmis à l’Espace Contrôle Financier pour vérification et validation comptable.`
    );
  };

  // Création d'un devis
  const handleCreateQuote = (e: React.FormEvent) => {
    e.preventDefault();
    const prospect = prospects.find((p) => p.id.toString() === quoteTargetProspect);
    const allVariants = products.flatMap((p) => p.variants);
    const variant = allVariants.find((v) => v.id === selectedVariantId);

    if (!prospect || !variant) {
      alert('Veuillez sélectionner un prospect et un terminal.');
      return;
    }

    const subtotal = variant.salePrice * variantQuantity;
    const vat = subtotal * 0.2;
    const total = subtotal + vat;

    const newQuote: Quote = {
      id: Date.now(),
      quoteNumber: `DEV-2026-${Math.floor(1000 + Math.random() * 9000)}`,
      sellerId: user?.id || 5,
      sellerName: user?.name || 'Alain Tshisekedi',
      prospectId: prospect.id,
      prospectName: prospect.companyName,
      validUntil: new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0],
      subtotalHt: subtotal,
      vatRate: 20.0,
      vatAmount: vat,
      totalTtc: total,
      status: 'SENT',
      notes: quoteNotes || `Offre comprenant ${variantQuantity}x ${variant.title}`,
      createdAt: new Date().toISOString(),
      items: [
        {
          id: Date.now(),
          posVariantId: variant.id,
          variantTitle: variant.title,
          description: `Terminal POS professionnel - ${variant.cpu}`,
          quantity: variantQuantity,
          unitPriceHt: variant.salePrice,
          vatRate: 20.0,
          totalHt: subtotal,
        },
      ],
    };

    const updatedQuotes = [newQuote, ...quotes];
    setQuotes(updatedQuotes);
    saveStoredQuotes(updatedQuotes);
    setIsQuoteModalOpen(false);
    showNotice(`Devis ${newQuote.quoteNumber} généré avec succès pour ${prospect.companyName}.`);
  };

  const filteredOrders = orders.filter((o) =>
    o.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    o.clientName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredQuotes = quotes.filter((q) =>
    q.quoteNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    q.prospectName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Cycle Ventes & Facturation POS
            </span>
            <span className="text-xs text-slate-400">• Vendeur : {user?.name || 'Alain Tshisekedi'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Devis, Commandes & Déclaration des Paiements
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Générez des devis, suivez les commandes de terminaux et transmettez les preuves de paiement à la comptabilité.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsQuoteModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Devis POS</span>
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

      {/* Onglets Devis vs Commandes */}
      <div className="flex items-center justify-between border-b border-slate-200">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('ORDERS')}
            className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'ORDERS'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Commandes & Ventes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('QUOTES')}
            className={`pb-3 text-sm font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
              activeTab === 'QUOTES'
                ? 'border-blue-600 text-blue-600'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Devis Commerciaux ({quotes.length})</span>
          </button>
        </div>

        <div className="relative w-64 pb-2">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher numéro, client..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          />
        </div>
      </div>

      {/* ================= ONGLET COMMANDES ================= */}
      {activeTab === 'ORDERS' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredOrders.map((order) => {
              const remaining = order.totalAmount - order.paidAmount;
              const pendingPayments =
                order.payments?.filter((p) => p.verificationStatus === 'PENDING') || [];
              const confirmedPayments =
                order.payments?.filter((p) => p.verificationStatus === 'CONFIRMED') || [];

              return (
                <div
                  key={order.id}
                  className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-4 hover:shadow-md transition-all"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-black text-sm">
                        <Package className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-black text-sm text-slate-900">{order.orderNumber}</span>
                          <span className="text-[10px] text-slate-400">
                            • Créée le {new Date(order.createdAt).toLocaleDateString('en-US')}
                          </span>
                        </div>
                        <div className="text-xs font-bold text-slate-700 flex items-center gap-1.5 mt-0.5">
                          <Building className="w-3.5 h-3.5 text-slate-400" />
                          <span>{order.clientName}</span>
                          {order.clientPhone && (
                            <span className="text-slate-400 font-normal">({order.clientPhone})</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Statuts Traitement & Paiement */}
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          order.processingStatus === 'DELIVERED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.processingStatus === 'PREPARING'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        Livraison: {order.processingStatus}
                      </span>

                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                          remaining <= 0
                            ? 'bg-emerald-100 text-emerald-800'
                            : order.paidAmount > 0
                            ? 'bg-indigo-100 text-indigo-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {remaining <= 0
                          ? 'SOLDE RÉGLÉ'
                          : order.paidAmount > 0
                          ? 'ACOMPTE VERSÉ'
                          : 'NON PAYÉ'}
                      </span>
                    </div>
                  </div>

                  {/* Détails Matériels de la commande */}
                  <div className="bg-slate-50/70 rounded-xl p-3 border border-slate-100 space-y-1.5 text-xs">
                    <span className="text-[10px] font-extrabold uppercase text-slate-400">
                      Équipements commandés :
                    </span>
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between font-medium text-slate-700">
                        <span>
                          {item.quantity}x {item.variantTitle || item.description}
                        </span>
                        <span className="font-bold text-slate-900">
                          {item.totalPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} $ HT
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Résumé Financier et Paiements en attente */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-xs">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70">
                      <span className="text-[10px] text-slate-500 font-bold block uppercase">
                        Montant Total TTC
                      </span>
                      <span className="text-base font-black text-slate-900">
                        {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200/70">
                      <span className="text-[10px] text-emerald-700 font-bold block uppercase">
                        Paiements Confirmés
                      </span>
                      <span className="text-base font-black text-emerald-800">
                        {order.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                      </span>
                    </div>

                    <div
                      className={`p-3 rounded-xl border ${
                        remaining > 0
                          ? 'bg-rose-50 border-rose-200/70 text-rose-900'
                          : 'bg-slate-50 border-slate-200/70 text-slate-700'
                      }`}
                    >
                      <span className="text-[10px] font-bold block uppercase opacity-80">
                        Solde Restant Dû
                      </span>
                      <span className="text-base font-black">
                        {remaining > 0
                          ? `${remaining.toLocaleString('en-US', { minimumFractionDigits: 2 })} $`
                          : '0.00 $ (Soldé)'}
                      </span>
                    </div>
                  </div>

                  {/* Alertes Paiements en cours de vérification financière */}
                  {pendingPayments.length > 0 && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                        <span>
                          <strong>{pendingPayments.length} paiement(s) déclaré(s)</strong> en cours de
                          vérification par le service financier (Montant:{' '}
                          {pendingPayments.reduce((acc, p) => acc + p.amount, 0)} $).
                        </span>
                      </div>
                      <span className="text-[11px] font-bold text-amber-700">Contrôle en attente</span>
                    </div>
                  )}

                  {/* Actions de la commande */}
                  <div className="pt-2 flex flex-wrap items-center justify-end gap-2 border-t border-slate-100">
                    {remaining > 0 && (
                      <button
                        type="button"
                        onClick={() => handleOpenPaymentDeclaration(order)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                        <span>Déclarer un Paiement avec Justificatif</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ================= ONGLET DEVIS ================= */}
      {activeTab === 'QUOTES' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Réf. Devis</th>
                  <th className="py-3 px-4">Prospect / Client</th>
                  <th className="py-3 px-4">Équipements</th>
                  <th className="py-3 px-4">Montant TTC</th>
                  <th className="py-3 px-4">Validité</th>
                  <th className="py-3 px-4">Statut</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredQuotes.map((q) => (
                  <tr key={q.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-black text-slate-900">{q.quoteNumber}</td>
                    <td className="py-3.5 px-4 font-bold text-slate-800">{q.prospectName}</td>
                    <td className="py-3.5 px-4 text-slate-600">
                      {q.items.map((i) => `${i.quantity}x ${i.variantTitle}`).join(', ')}
                    </td>
                    <td className="py-3.5 px-4 font-black text-slate-900">
                      {q.totalTtc.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>
                    <td className="py-3.5 px-4 text-slate-500">{q.validUntil}</td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                          q.status === 'ACCEPTED'
                            ? 'bg-emerald-100 text-emerald-800'
                            : q.status === 'SENT'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {q.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {q.status !== 'ACCEPTED' ? (
                        <button
                          type="button"
                          onClick={() => handleConvertQuoteToOrder(q)}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-[11px] transition-colors"
                        >
                          Valider en Commande
                        </button>
                      ) : (
                        <span className="text-emerald-600 font-bold text-[11px]">Converti</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= MODAL DÉCLARATION PAIEMENT ================= */}
      {isPaymentModalOpen && selectedOrderForPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center font-bold">
                  <CreditCard className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Déclarer un Règlement</h3>
                  <p className="text-xs text-slate-500">
                    Commande {selectedOrderForPayment.orderNumber} • {selectedOrderForPayment.clientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmitPaymentDeclaration} className="p-6 space-y-4 text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 text-[11px]">
                <strong>Règle de conformité :</strong> Tout paiement déclaré par un commercial est placé
                sous statut « En attente de vérification ». Le service financier vérifiera la preuve avant
                crédit définitif dans la comptabilité.
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Montant perçu ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={paymentAmount}
                    onChange={(e) => setPaymentAmount(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-black text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Mode de règlement *</label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value as any)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  >
                    <option value="BANK_TRANSFER">Virement bancaire</option>
                    <option value="MOBILE_MONEY">Mobile Money (M-Pesa / Orange)</option>
                    <option value="CARD">Carte bancaire (TPE)</option>
                    <option value="CASH">Espèces</option>
                    <option value="CHECK">Chèque de banque</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Référence de la transaction / N° Bordereau *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: VIR-BNP-883902"
                  value={paymentRef}
                  onChange={(e) => setPaymentRef(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  URL / Justificatif de paiement (Reçu, Bordereau, Capture) *
                </label>
                <input
                  type="text"
                  required
                  value={paymentReceiptUrl}
                  onChange={(e) => setPaymentReceiptUrl(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Commentaires vendeur</label>
                <textarea
                  rows={2}
                  value={paymentNotes}
                  onChange={(e) => setPaymentNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsPaymentModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold shadow-xs transition-colors"
                >
                  Transmettre pour Vérification
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= MODAL NOUVEAU DEVIS ================= */}
      {isQuoteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Émettre un Devis POS</h3>
                  <p className="text-xs text-slate-500">Générer une proposition commerciale chiffrée</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsQuoteModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateQuote} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Destinataire (Prospect du CRM) *</label>
                <select
                  required
                  value={quoteTargetProspect}
                  onChange={(e) => setQuoteTargetProspect(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  <option value="">Sélectionnez un prospect...</option>
                  {prospects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.companyName} ({p.contactName})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Équipement POS & Configuration *</label>
                <select
                  value={selectedVariantId}
                  onChange={(e) => setSelectedVariantId(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-800 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                >
                  {products.flatMap((prod) =>
                    prod.variants.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.title} — {v.salePrice} $ HT
                      </option>
                    ))
                  )}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Quantité d'unités</label>
                <input
                  type="number"
                  min="1"
                  value={variantQuantity}
                  onChange={(e) => setVariantQuantity(parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold text-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Conditions & Notes de l'offre</label>
                <textarea
                  rows={2}
                  placeholder="Garantie 2 ans incluse, formation offerte..."
                  value={quoteNotes}
                  onChange={(e) => setQuoteNotes(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsQuoteModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-xs transition-colors"
                >
                  Générer le Devis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
