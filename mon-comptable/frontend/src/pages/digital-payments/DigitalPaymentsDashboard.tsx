import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  CheckCircle2,
  Clock,
  XCircle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  PlusCircle,
  ExternalLink,
  ShieldCheck,
  Zap,
  Filter,
  DollarSign,
  Banknote
} from 'lucide-react';
import {
  getStoredProviderConfigs,
  getStoredPaymentTransactions,
  getStoredReconciliations,
} from '../../data/accountingMockData';
import { DigitalPaymentProvider, DigitalPaymentStatus, PaymentTransaction } from '../../types';
import { DigitalCheckoutModal } from './DigitalCheckoutModal';

export const DigitalPaymentsDashboard: React.FC = () => {
  const [providers] = useState(getStoredProviderConfigs());
  const [transactions, setTransactions] = useState<PaymentTransaction[]>(getStoredPaymentTransactions());
  const reconciliations = getStoredReconciliations();

  const [selectedProvider, setSelectedProvider] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [showCheckoutModal, setShowCheckoutModal] = useState<boolean>(false);

  // Financial calculations
  const totalVolume = transactions
    .filter((t) => t.status === DigitalPaymentStatus.SUCCESS)
    .reduce((acc, t) => acc + t.amount, 0);

  const totalFees = transactions
    .filter((t) => t.status === DigitalPaymentStatus.SUCCESS)
    .reduce((acc, t) => acc + t.fee, 0);

  const totalNet = totalVolume - totalFees;
  const successCount = transactions.filter((t) => t.status === DigitalPaymentStatus.SUCCESS).length;
  const successRate = transactions.length > 0 ? (successCount / transactions.length) * 100 : 0;

  const filteredTransactions = transactions.filter((t) => {
    if (selectedProvider !== 'ALL' && t.provider !== selectedProvider) return false;
    if (selectedStatus !== 'ALL' && t.status !== selectedStatus) return false;
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
      case DigitalPaymentProvider.CASH:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
            <Banknote className="w-3 h-3 text-emerald-600" /> Caisse Espèces (Cash $)
          </span>
        );
      case DigitalPaymentProvider.MPESA:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Smartphone className="w-3 h-3" /> M-Pesa (Vodacom)
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
            <Smartphone className="w-3 h-3" /> IllicoCash (Rawbank)
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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5" /> Succès
          </span>
        );
      case DigitalPaymentStatus.PENDING:
      case DigitalPaymentStatus.PROCESSING:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
            <Clock className="w-3.5 h-3.5" /> En cours
          </span>
        );
      case DigitalPaymentStatus.FAILED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <XCircle className="w-3.5 h-3.5" /> Échoué
          </span>
        );
      case DigitalPaymentStatus.REFUNDED:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200">
            <RefreshCw className="w-3.5 h-3.5" /> Remboursé
          </span>
        );
    }
  };

  const handleTransactionCreated = (newTxn: PaymentTransaction) => {
    setTransactions((prev) => [newTxn, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 flex items-center gap-1">
              <Banknote className="w-3 h-3 text-emerald-600" /> Caisse Espèces + Multi-Passerelles RDC
            </span>
            <span className="text-xs text-slate-500 font-medium">Devise : Dollars ($ USD)</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Hub des Encaissements : Caisse Espèces & Mobile Money
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Supervision centralisée des encaissements en Espèces (Cash $), M-Pesa, Orange Money, Airtel, IllicoCash et Cartes Bancaires.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowCheckoutModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm hover:shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Encaisser un Client (Cash / Mobile)
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Volume Brut Encaissé</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalVolume)}</div>
          <p className="text-xs text-slate-500 mt-1">Total des règlements validés ($)</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Frais & Commissions Opérateurs</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalFees)}</div>
          <p className="text-xs text-slate-500 mt-1">
            0% sur Espèces • Compte 627800
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Net Entré en Trésorerie</span>
            <ShieldCheck className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-700">{formatCurrency(totalNet)}</div>
          <p className="text-xs text-slate-500 mt-1">Caisse 571100 & Comptes 518xxx</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Taux de Succès</span>
            <ArrowUpRight className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{successRate.toFixed(1)}%</span>
            <span className="text-xs text-slate-500 font-medium">({successCount}/{transactions.length})</span>
          </div>
          <p className="text-xs text-emerald-600 mt-1">Imputation immédiate en partie double</p>
        </div>
      </div>

      {/* Gateway Cards Grid */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
          <span>Comptes d'Encaissement & Passerelles RDC</span>
          <span className="text-xs font-normal text-slate-500">(Comptes de Caisse & Transit SYSCOHADA)</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
          {providers.map((p) => {
            const providerTxns = transactions.filter((t) => t.provider === p.provider && t.status === DigitalPaymentStatus.SUCCESS);
            const providerVol = providerTxns.reduce((acc, t) => acc + t.amount, 0);

            return (
              <div
                key={p.id}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm hover:border-blue-300 transition"
              >
                <div className="flex items-center justify-between mb-2">
                  {getProviderBadge(p.provider)}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      p.isActive ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'
                    }`}
                  />
                </div>
                <div className="mt-3">
                  <div className="text-xs text-slate-400 font-medium">Volume Collecté</div>
                  <div className="text-base font-bold text-slate-900">{formatCurrency(providerVol)}</div>
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 text-xs flex justify-between items-center text-slate-500">
                  <span className="font-mono text-[11px] bg-slate-50 px-1.5 py-0.5 rounded font-bold">
                    Cpt {p.accountingAccountCode}
                  </span>
                  <span className="font-medium text-slate-700">{p.commissionRate}% comm.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter and Transactions Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Journal des Règlements (Espèces & Numérique)</h2>
            <p className="text-xs text-slate-500">
              Traçabilité complète avec imputation directe dans les journaux CA (Caisse) et BQ (Banque)
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                value={selectedProvider}
                onChange={(e) => setSelectedProvider(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:outline-none"
              >
                <option value="ALL">Tous les Modes de Paiement</option>
                <option value={DigitalPaymentProvider.CASH}>💵 Espèces / Caisse Cash ($)</option>
                <option value={DigitalPaymentProvider.MPESA}>M-Pesa (Vodacom)</option>
                <option value={DigitalPaymentProvider.ORANGE_MONEY}>Orange Money</option>
                <option value={DigitalPaymentProvider.AIRTEL_MONEY}>Airtel Money</option>
                <option value={DigitalPaymentProvider.ILLICOCASH}>IllicoCash (Rawbank)</option>
                <option value={DigitalPaymentProvider.CARD_VISA_MASTERCARD}>Visa / Mastercard</option>
              </select>
            </div>

            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs bg-white font-medium text-slate-700 focus:outline-none"
            >
              <option value="ALL">Tous les Statuts</option>
              <option value={DigitalPaymentStatus.SUCCESS}>Succès</option>
              <option value={DigitalPaymentStatus.PENDING}>En attente</option>
              <option value={DigitalPaymentStatus.FAILED}>Échoué</option>
              <option value={DigitalPaymentStatus.REFUNDED}>Remboursé</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-sm text-slate-600 min-w-[760px]">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Référence / Date</th>
                <th className="px-4 py-3.5">Moyen de Règlement</th>
                <th className="px-4 py-3.5">Client / Payeur</th>
                <th className="px-4 py-3.5 text-right">Montant Brut ($)</th>
                <th className="px-4 py-3.5 text-right">Frais Opérateur</th>
                <th className="px-4 py-3.5 text-right">Net Reçu ($)</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-4 py-3.5 text-center">Écriture</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredTransactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-semibold text-slate-900">{tx.reference}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{tx.createdAt}</div>
                  </td>
                  <td className="px-4 py-4">{getProviderBadge(tx.provider)}</td>
                  <td className="px-4 py-4">
                    <div className="text-xs font-semibold text-slate-800">
                      {tx.customerPhone ? tx.customerPhone : tx.customerCardLast4 ? `CB **** ${tx.customerCardLast4}` : tx.clientName || 'Client Comptoir Kinshasa'}
                    </div>
                    {tx.externalTransactionId && (
                      <div className="text-[10px] font-mono text-slate-400">Ext: {tx.externalTransactionId}</div>
                    )}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(tx.amount)}
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-amber-700">
                    {tx.fee > 0 ? `-${formatCurrency(tx.fee)}` : '$0.00 (Cash)'}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-700">
                    {formatCurrency(tx.netAmount)}
                  </td>
                  <td className="px-4 py-4 text-center">{getStatusBadge(tx.status)}</td>
                  <td className="px-4 py-4 text-center">
                    {tx.accountingEntryId ? (
                      <span className="inline-flex items-center gap-1 font-mono text-xs text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
                        ECR #{tx.accountingEntryId}
                      </span>
                    ) : (
                      <span className="text-xs text-slate-400">-</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <DigitalCheckoutModal
          isOpen={showCheckoutModal}
          onClose={() => setShowCheckoutModal(false)}
          onSuccess={handleTransactionCreated}
          defaultAmount={540.0}
        />
      )}
    </div>
  );
};
