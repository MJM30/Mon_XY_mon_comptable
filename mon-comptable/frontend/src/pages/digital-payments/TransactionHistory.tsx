import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  RefreshCw,
  Search,
  Filter,
  Download,
  Eye,
  RotateCcw,
  AlertTriangle,
  Receipt,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  getStoredPaymentTransactions,
  saveStoredPaymentTransactions,
  getStoredEntries,
  saveStoredEntries,
} from '../../data/accountingMockData';
import { DigitalPaymentProvider, DigitalPaymentStatus, PaymentTransaction } from '../../types';

export const TransactionHistory: React.FC = () => {
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getStoredPaymentTransactions());
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [selectedTxn, setSelectedTxn] = useState<PaymentTransaction | null>(null);
  const [showDetailModal, setShowDetailModal] = useState<boolean>(false);
  const [showRefundModal, setShowRefundModal] = useState<boolean>(false);
  const [refundReason, setRefundReason] = useState<string>('Demande client / Annulation de commande');

  const filteredTransactions = transactions.filter((t) => {
    if (selectedProvider !== 'ALL' && t.provider !== selectedProvider) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      const matchRef = t.reference.toLowerCase().includes(term);
      const matchExt = t.externalTransactionId?.toLowerCase().includes(term);
      const matchPhone = t.customerPhone?.toLowerCase().includes(term);
      const matchCard = t.customerCardLast4?.toLowerCase().includes(term);
      return matchRef || matchExt || matchPhone || matchCard;
    }
    return true;
  });

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  const getProviderBadge = (provider: DigitalPaymentProvider) => {
    switch (provider) {
      case DigitalPaymentProvider.MPESA:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Smartphone className="w-3 h-3" /> M-Pesa
          </span>
        );
      case DigitalPaymentProvider.ORANGE_MONEY:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Smartphone className="w-3 h-3" /> Orange Money
          </span>
        );
      case DigitalPaymentProvider.AIRTEL_MONEY:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Smartphone className="w-3 h-3" /> Airtel Money
          </span>
        );
      case DigitalPaymentProvider.ILLICOCASH:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Smartphone className="w-3 h-3" /> IllicoCash
          </span>
        );
      case DigitalPaymentProvider.CARD_VISA_MASTERCARD:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CreditCard className="w-3 h-3" /> Visa / Mastercard
          </span>
        );
    }
  };

  const getStatusBadge = (status: DigitalPaymentStatus) => {
    switch (status) {
      case DigitalPaymentStatus.SUCCESS:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Succès
          </span>
        );
      case DigitalPaymentStatus.PENDING:
      case DigitalPaymentStatus.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> En cours
          </span>
        );
      case DigitalPaymentStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Échoué
          </span>
        );
      case DigitalPaymentStatus.REFUNDED:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RefreshCw className="w-3.5 h-3.5" /> Remboursé
          </span>
        );
    }
  };

  const handleOpenRefund = (txn: PaymentTransaction) => {
    setSelectedTxn(txn);
    setShowRefundModal(true);
  };

  const handleConfirmRefund = () => {
    if (!selectedTxn) return;

    // 1. Mark transaction as refunded
    const updated = transactions.map((t) =>
      t.id === selectedTxn.id ? { ...t, status: DigitalPaymentStatus.REFUNDED } : t
    );
    setTransactions(updated);
    saveStoredPaymentTransactions(updated);

    // 2. Generate double-entry contrepassation (extourne) in general accounting
    const existingEntries = getStoredEntries();
    const newEntryId = existingEntries.length > 0 ? Math.max(...existingEntries.map((e) => e.id)) + 1 : 1;
    const entryNumber = `ECR-2026-${String(newEntryId).padStart(5, '0')}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const refundEntry = {
      id: newEntryId,
      entryNumber,
      journalId: 3,
      journalCode: 'BQ',
      periodId: 10,
      date: nowStr,
      reference: `RMB-${selectedTxn.reference}`,
      label: `Extourne/Remboursement ${selectedTxn.reference} - ${refundReason}`,
      status: 'VALIDATED' as const,
      totalDebit: selectedTxn.amount,
      totalCredit: selectedTxn.amount,
      createdAt: new Date().toISOString(),
      lines: [
        {
          id: 1,
          accountId: 411,
          accountCode: '411100',
          accountLabel: 'Clients',
          label: `Annulation encaissement ${selectedTxn.reference}`,
          debit: selectedTxn.amount,
          credit: 0,
        },
        {
          id: 2,
          accountId: 518,
          accountCode: '518100',
          accountLabel: 'Transit Opérateur',
          label: `Rétrocession montant net`,
          debit: 0,
          credit: selectedTxn.netAmount,
        },
        {
          id: 3,
          accountId: 627,
          accountCode: '627800',
          accountLabel: 'Commissions bancaires remboursées',
          label: `Annulation frais opérateur`,
          debit: 0,
          credit: selectedTxn.fee,
        },
      ],
    };

    saveStoredEntries([...existingEntries, refundEntry]);
    setShowRefundModal(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
              Grand Livre des Encaissements Électroniques
            </span>
            <span className="text-xs text-slate-500 font-medium">SYSCOHADA & PCG Audit Trail</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-7 h-7 text-blue-600" />
            Historique & Traçabilité des Transactions
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Piste d'audit inviolable de chaque règlement avec liaison directe vers l'écriture comptable en partie double.
          </p>
        </div>

        <button
          onClick={() => {
            alert('Export CSV de l’historique des transactions généré avec succès !');
          }}
          className="flex items-center gap-2 px-4 py-2.5 bg-slate-900 text-white rounded-xl text-sm font-semibold hover:bg-slate-800 transition shadow-sm"
        >
          <Download className="w-4 h-4" />
          Exporter en CSV / Excel
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3 flex-1 min-w-[280px]">
          <div className="relative w-full max-w-md">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par référence, n° téléphone, ID externe..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedProvider}
              onChange={(e) => setSelectedProvider(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">Tous les Opérateurs</option>
              <option value={DigitalPaymentProvider.MPESA}>M-Pesa</option>
              <option value={DigitalPaymentProvider.ORANGE_MONEY}>Orange Money</option>
              <option value={DigitalPaymentProvider.AIRTEL_MONEY}>Airtel Money</option>
              <option value={DigitalPaymentProvider.ILLICOCASH}>IllicoCash</option>
              <option value={DigitalPaymentProvider.CARD_VISA_MASTERCARD}>Visa / Mastercard</option>
            </select>
          </div>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
          >
            <option value="ALL">Tous les Statuts</option>
            <option value={DigitalPaymentStatus.SUCCESS}>Succès</option>
            <option value={DigitalPaymentStatus.PENDING}>En cours</option>
            <option value={DigitalPaymentStatus.FAILED}>Échoué</option>
            <option value={DigitalPaymentStatus.REFUNDED}>Remboursé</option>
          </select>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-sm text-slate-600 min-w-[780px]">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Date & Référence</th>
                <th className="px-4 py-3.5">Opérateur</th>
                <th className="px-4 py-3.5">Client / Payer</th>
                <th className="px-4 py-3.5 text-right">Montant Brut</th>
                <th className="px-4 py-3.5 text-right">Frais Opérateur</th>
                <th className="px-4 py-3.5 text-right">Net Reçu</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-center">Écriture</th>
                <th className="px-6 py-3.5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-bold text-slate-900">{tx.reference}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tx.createdAt}</div>
                  </td>
                  <td className="px-4 py-4">{getProviderBadge(tx.provider)}</td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-semibold text-slate-800">
                      {tx.customerPhone || (tx.customerCardLast4 ? `CB **** ${tx.customerCardLast4}` : 'Comptoir')}
                    </div>
                    {tx.externalTransactionId && (
                      <div className="text-[10px] font-mono text-slate-400">ID: {tx.externalTransactionId}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-amber-700">
                    -{formatCurrency(tx.fee)}
                  </td>
                  <td className="px-4 py-4 text-right font-semibold text-blue-700">
                    {formatCurrency(tx.netAmount)}
                  </td>
                  <td className="px-4 py-4 text-center">{getStatusBadge(tx.status)}</td>
                  <td className="px-4 py-4 text-center">
                    {tx.accountingEntryId ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        ECR #{tx.accountingEntryId}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedTxn(tx);
                          setShowDetailModal(true);
                        }}
                        className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-500 hover:text-slate-800 transition"
                        title="Détails de la transaction"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      {tx.status === DigitalPaymentStatus.SUCCESS && (
                        <button
                          onClick={() => handleOpenRefund(tx)}
                          className="p-1.5 hover:bg-rose-50 rounded-lg text-rose-500 hover:text-rose-700 transition"
                          title="Rembourser et extourner l'écriture"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Details Modal */}
      {showDetailModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Layers className="w-5 h-5 text-blue-600" />
                Détail de la Transaction & Audit Trail
              </h3>
              <button
                onClick={() => setShowDetailModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl space-y-1.5 font-mono">
                <div className="flex justify-between">
                  <span className="text-slate-500">Référence Interne :</span>
                  <span className="font-bold text-slate-900">{selectedTxn.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">ID Passerelle Opérateur :</span>
                  <span className="text-slate-800">{selectedTxn.externalTransactionId || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Clé d'Idempotence :</span>
                  <span className="text-slate-600 truncate max-w-[240px]">{selectedTxn.idempotencyKey}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Heure :</span>
                  <span className="text-slate-800">{selectedTxn.createdAt}</span>
                </div>
              </div>

              <div className="p-3 border border-slate-200 rounded-xl space-y-2">
                <div className="font-bold text-slate-800 uppercase tracking-wider text-[11px]">
                  Ventilation Financière
                </div>
                <div className="flex justify-between">
                  <span>Montant Total Encaissé :</span>
                  <span className="font-bold text-slate-900">{formatCurrency(selectedTxn.amount)}</span>
                </div>
                <div className="flex justify-between text-amber-700">
                  <span>Commission Passerelle Déduite :</span>
                  <span className="font-semibold">-{formatCurrency(selectedTxn.fee)}</span>
                </div>
                <div className="flex justify-between text-blue-700 font-bold pt-1 border-t border-slate-100">
                  <span>Montant Net en Trésorerie :</span>
                  <span>{formatCurrency(selectedTxn.netAmount)}</span>
                </div>
              </div>

              <div className="p-3 bg-blue-50/60 border border-blue-200 rounded-xl space-y-1">
                <div className="font-bold text-blue-900">Intégration Comptabilité Générale</div>
                <p className="text-blue-800">
                  Écriture générée automatiquement dans le Journal BQ (Banque & Trésorerie Électronique) sous le n°{' '}
                  <span className="font-mono font-bold">ECR #{selectedTxn.accountingEntryId}</span>.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowDetailModal(false)}
                className="px-4 py-2 bg-slate-900 text-white rounded-xl text-xs font-semibold hover:bg-slate-800"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Refund Modal */}
      {showRefundModal && selectedTxn && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Confirmer le Remboursement & Contrepassation
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Cette action va marquer la transaction comme <span className="font-bold text-rose-600">REMBOURSÉE</span>{' '}
              et émettre automatiquement une écriture d'extourne inverse équilibrée en partie double.
            </p>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Transaction :</span>
                <span className="font-mono font-bold text-slate-900">{selectedTxn.reference}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Montant :</span>
                <span className="font-bold text-slate-900">{formatCurrency(selectedTxn.amount)}</span>
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-xs font-semibold text-slate-700 mb-1">Motif de l'annulation</label>
              <input
                type="text"
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs"
                required
              />
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowRefundModal(false)}
                className="px-4 py-2 border border-slate-200 text-slate-600 text-xs font-semibold rounded-xl hover:bg-slate-50"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmRefund}
                className="px-4 py-2 bg-rose-600 text-white text-xs font-bold rounded-xl hover:bg-rose-700 shadow-sm"
              >
                Confirmer l'Extourne
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
