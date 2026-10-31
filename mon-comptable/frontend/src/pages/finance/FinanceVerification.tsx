import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  FileText,
  Search,
  Filter,
  CreditCard,
  Building,
  DollarSign,
  AlertTriangle,
  ExternalLink,
  X,
  TrendingUp,
  Receipt,
  UserCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredOrders,
  saveStoredOrders,
  Order,
  PaymentItem,
  PaymentVerificationStatus,
} from '../../data/posMockData';

export const FinanceVerification: React.FC = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>(getStoredOrders);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | PaymentVerificationStatus>('PENDING');
  const [selectedPayment, setSelectedPayment] = useState<{
    order: Order;
    payment: PaymentItem;
  } | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Extraire tous les paiements de toutes les commandes
  const allPayments = orders.flatMap((order) =>
    (order.payments || []).map((payment) => ({
      order,
      payment,
    }))
  );

  const filteredPayments = allPayments.filter(({ order, payment }) => {
    const matchesSearch =
      order.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (payment.reference && payment.reference.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (payment.sellerName && payment.sellerName.toLowerCase().includes(searchQuery.toLowerCase()));

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && payment.verificationStatus === statusFilter;
  });

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 5000);
  };

  // Validation d'un paiement par le contrôleur financier
  const handleConfirmPayment = (targetOrder: Order, targetPayment: PaymentItem) => {
    const updatedOrders = orders.map((order) => {
      if (order.id === targetOrder.id) {
        const updatedPayments = (order.payments || []).map((p) => {
          if (p.id === targetPayment.id) {
            return {
              ...p,
              verificationStatus: 'CONFIRMED' as PaymentVerificationStatus,
              verifiedById: user?.id || 6,
              verifiedByName: user?.name || 'Sophie Finance',
              verifiedAt: new Date().toISOString(),
            };
          }
          return p;
        });

        // Recalculer le montant payé confirmé pour la commande
        const newPaidAmount = updatedPayments
          .filter((p) => p.verificationStatus === 'CONFIRMED')
          .reduce((acc, p) => acc + p.amount, 0);

        const newRemaining = order.totalAmount - newPaidAmount;
        const newPaymentStatus =
          newRemaining <= 0 ? 'PAID' : newPaidAmount > 0 ? 'PARTIALLY_PAID' : 'UNPAID';

        return {
          ...order,
          paidAmount: newPaidAmount,
          remainingAmount: Math.max(0, newRemaining),
          paymentStatus: newPaymentStatus as any,
          payments: updatedPayments,
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
    setSelectedPayment(null);
    showNotice(
      `✅ Paiement de ${targetPayment.amount.toLocaleString(
        'en-US'
      )} $ validé avec succès ! Commande ${targetOrder.orderNumber} créditée. L'écriture de trésorerie est réconciliée.`
    );
  };

  // Rejet d'un paiement avec motif
  const handleRejectPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPayment) return;
    if (!rejectionReason.trim()) {
      alert('Veuillez indiquer un motif de rejet clair pour le vendeur.');
      return;
    }

    const { order: targetOrder, payment: targetPayment } = selectedPayment;

    const updatedOrders = orders.map((order) => {
      if (order.id === targetOrder.id) {
        const updatedPayments = (order.payments || []).map((p) => {
          if (p.id === targetPayment.id) {
            return {
              ...p,
              verificationStatus: 'REJECTED' as PaymentVerificationStatus,
              rejectionReason: rejectionReason,
              verifiedById: user?.id || 6,
              verifiedByName: user?.name || 'Sophie Finance',
              verifiedAt: new Date().toISOString(),
            };
          }
          return p;
        });

        // Recalculer le montant payé sans ce paiement rejeté
        const newPaidAmount = updatedPayments
          .filter((p) => p.verificationStatus === 'CONFIRMED')
          .reduce((acc, p) => acc + p.amount, 0);

        return {
          ...order,
          paidAmount: newPaidAmount,
          remainingAmount: order.totalAmount - newPaidAmount,
          payments: updatedPayments,
        };
      }
      return order;
    });

    setOrders(updatedOrders);
    saveStoredOrders(updatedOrders);
    setIsRejectModalOpen(false);
    setSelectedPayment(null);
    setRejectionReason('');
    showNotice(`❌ Paiement rejeté pour le motif : « ${rejectionReason} ». Le vendeur a été notifié.`);
  };

  const pendingCount = allPayments.filter(
    (p) => p.payment.verificationStatus === 'PENDING'
  ).length;
  const confirmedCount = allPayments.filter(
    (p) => p.payment.verificationStatus === 'CONFIRMED'
  ).length;
  const totalVerifiedSum = allPayments
    .filter((p) => p.payment.verificationStatus === 'CONFIRMED')
    .reduce((acc, p) => acc + p.payment.amount, 0);

  return (
    <div className="space-y-6">
      {/* En-tête Espace Financier */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
              Espace Contrôle Financier & Trésorerie
            </span>
            <span className="text-xs text-slate-400">• Opérateur : {user?.name || 'Sophie Finance'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Vérification des Règlements & Rapprochement Bancaire
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Examinez les justificatifs transmis par les vendeurs et validez les encaissements avant impact définitif sur les créances clients.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-purple-600" />
            <span>Rapprochement sans double comptabilisation</span>
          </div>
        </div>
      </div>

      {/* Bannière de notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Cartes KPI Finance */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-extrabold text-amber-600 uppercase tracking-wider block flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-500" />
            <span>En attente de vérification</span>
          </span>
          <div className="text-3xl font-black text-slate-900">{pendingCount} règlements</div>
          <p className="text-[11px] text-slate-500">Nécessite le contrôle du bordereau / virement</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-extrabold text-emerald-600 uppercase tracking-wider block flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            <span>Paiements validés & réconciliés</span>
          </span>
          <div className="text-3xl font-black text-slate-900">{confirmedCount} règlements</div>
          <p className="text-[11px] text-slate-500">Crédités sur les créances clients</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-extrabold text-blue-600 uppercase tracking-wider block flex items-center gap-1.5">
            <DollarSign className="w-4 h-4 text-blue-500" />
            <span>Total Encaissé Confirmé</span>
          </span>
          <div className="text-3xl font-black text-slate-900">
            {totalVerifiedSum.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <p className="text-[11px] text-slate-500">Alimente la trésorerie Mon Comptable</p>
        </div>
      </div>

      {/* Filtres & Recherche */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° commande, client, référence..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-purple-500 text-slate-800 shadow-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setStatusFilter('PENDING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'PENDING'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            À vérifier ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter('CONFIRMED')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'CONFIRMED'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Confirmés ({confirmedCount})
          </button>
          <button
            onClick={() => setStatusFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              statusFilter === 'ALL'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tous les flux
          </button>
        </div>
      </div>

      {/* Tableau des règlements */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Commande & Client</th>
                <th className="py-3 px-4">Vendeur émetteur</th>
                <th className="py-3 px-4">Mode & Réf.</th>
                <th className="py-3 px-4">Montant Déclaré</th>
                <th className="py-3 px-4">Preuve de paiement</th>
                <th className="py-3 px-4">Statut Contrôle</th>
                <th className="py-3 px-4 text-right">Actions Finance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map(({ order, payment }) => {
                const isPending = payment.verificationStatus === 'PENDING';
                const isConfirmed = payment.verificationStatus === 'CONFIRMED';
                const isRejected = payment.verificationStatus === 'REJECTED';

                return (
                  <tr key={payment.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-black text-slate-900">{order.orderNumber}</div>
                      <div className="text-[11px] text-slate-600">{order.clientName}</div>
                    </td>

                    <td className="py-3.5 px-4 font-semibold text-slate-700">
                      {payment.sellerName || order.sellerName || 'Alain Tshisekedi'}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="font-bold text-slate-800 block">{payment.paymentMethod}</span>
                      <span className="text-[10px] text-slate-400">{payment.reference || 'N/A'}</span>
                    </td>

                    <td className="py-3.5 px-4 font-black text-base text-slate-900">
                      {payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-3.5 px-4">
                      {payment.receiptUrl ? (
                        <button
                          type="button"
                          onClick={() => setSelectedPayment({ order, payment })}
                          className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 hover:bg-blue-100 text-[11px] font-bold flex items-center gap-1"
                        >
                          <Eye className="w-3 h-3" />
                          <span>Voir le Reçu</span>
                        </button>
                      ) : (
                        <span className="text-slate-400 italic text-[11px]">Aucun justificatif</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4">
                      {isPending && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800 flex items-center gap-1 w-fit">
                          <Clock className="w-3 h-3 animate-spin" />
                          <span>EN ATTENTE</span>
                        </span>
                      )}
                      {isConfirmed && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1 w-fit">
                          <CheckCircle2 className="w-3 h-3" />
                          <span>CONFIRMÉ</span>
                        </span>
                      )}
                      {isRejected && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800 flex items-center gap-1 w-fit">
                          <XCircle className="w-3 h-3" />
                          <span>REJETÉ</span>
                        </span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      {isPending ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleConfirmPayment(order, payment)}
                            className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-2xs flex items-center gap-1 transition-colors"
                          >
                            <CheckCircle2 className="w-3 h-3" />
                            <span>Confirmer</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setSelectedPayment({ order, payment });
                              setIsRejectModalOpen(true);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-[11px] transition-colors"
                          >
                            Rejeter
                          </button>
                        </div>
                      ) : (
                        <div className="text-[10px] text-slate-400">
                          {isConfirmed
                            ? `Validé par ${payment.verifiedByName || 'Sophie Finance'}`
                            : `Motif : ${payment.rejectionReason || 'Non spécifié'}`}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}

              {filteredPayments.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Aucun paiement trouvé dans cette catégorie.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL INSPECTION JUSTIFICATIF ================= */}
      {selectedPayment && !isRejectModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
                  <Receipt className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">
                    Inspection du Justificatif de Règlement
                  </h3>
                  <p className="text-xs text-slate-500">
                    Commande {selectedPayment.order.orderNumber} • Client :{' '}
                    {selectedPayment.order.clientName}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedPayment(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              {/* Informations Clés */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Montant</span>
                  <span className="text-base font-black text-slate-900">
                    {selectedPayment.payment.amount} $
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Mode</span>
                  <span className="font-bold text-slate-800">
                    {selectedPayment.payment.paymentMethod}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Référence</span>
                  <span className="font-bold text-slate-800">
                    {selectedPayment.payment.reference || 'N/A'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Vendeur</span>
                  <span className="font-bold text-slate-800">
                    {selectedPayment.payment.sellerName || 'Alain Tshisekedi'}
                  </span>
                </div>
              </div>

              {/* Justificatif / Reçu visuel */}
              <div>
                <label className="font-extrabold text-slate-700 uppercase tracking-wider text-[11px] block mb-2">
                  Preuve de virement / Reçu scanné :
                </label>
                <div className="h-64 rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 relative group">
                  <img
                    src={selectedPayment.payment.receiptUrl}
                    alt="Preuve de paiement"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-slate-900/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <a
                      href={selectedPayment.payment.receiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-4 py-2 rounded-xl bg-white text-slate-900 font-bold text-xs flex items-center gap-2 shadow-md"
                    >
                      <ExternalLink className="w-4 h-4" />
                      <span>Ouvrir en plein écran</span>
                    </a>
                  </div>
                </div>
              </div>

              {selectedPayment.payment.notes && (
                <div className="p-3 bg-slate-50 rounded-xl text-slate-600">
                  <strong>Notes du vendeur :</strong> {selectedPayment.payment.notes}
                </div>
              )}
            </div>

            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setIsRejectModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs transition-colors"
              >
                Rejeter avec motif
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedPayment(null)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
                >
                  Fermer
                </button>
                {selectedPayment.payment.verificationStatus === 'PENDING' && (
                  <button
                    type="button"
                    onClick={() =>
                      handleConfirmPayment(selectedPayment.order, selectedPayment.payment)
                    }
                    className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs transition-colors"
                  >
                    Valider le Paiement
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= MODAL REJET PAIEMENT ================= */}
      {isRejectModalOpen && selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl p-6 space-y-4 animate-scale-in">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">Rejeter ce Paiement</h3>
                <p className="text-xs text-slate-500">
                  Montant : {selectedPayment.payment.amount} $ • Réf :{' '}
                  {selectedPayment.payment.reference}
                </p>
              </div>
            </div>

            <form onSubmit={handleRejectPayment} className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">
                  Motif du rejet (Obligatoire pour information du vendeur) :
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Ex: Virement non constaté sur le compte BNP, bordereau illisible, montant différent..."
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-rose-500 focus:outline-hidden"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsRejectModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold shadow-xs transition-colors"
                >
                  Confirmer le Rejet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
