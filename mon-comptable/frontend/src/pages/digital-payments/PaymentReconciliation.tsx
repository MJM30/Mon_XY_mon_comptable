import React, { useState } from 'react';
import {
  Scale,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRightLeft,
  Download,
  Calendar,
  Layers,
  Sparkles,
  Smartphone,
  CreditCard,
  Building2,
  DollarSign
} from 'lucide-react';
import {
  getStoredReconciliations,
  saveStoredReconciliations,
  getStoredEntries,
  saveStoredEntries,
} from '../../data/accountingMockData';
import { DigitalPaymentProvider, PaymentReconciliation } from '../../types';

export const PaymentReconciliationPage: React.FC = () => {
  const [reconciliations, setReconciliations] = useState<PaymentReconciliation[]>(getStoredReconciliations());
  const [isReconciling, setIsReconciling] = useState<boolean>(false);
  const [filterProvider, setFilterProvider] = useState<string>('ALL');

  const filteredReconciliations = reconciliations.filter((r) => {
    if (filterProvider !== 'ALL' && r.provider !== filterProvider) return false;
    return true;
  });

  const totalGatewayAmount = filteredReconciliations.reduce((acc, r) => acc + r.gatewayAmount, 0);
  const totalSettledAmount = filteredReconciliations.reduce((acc, r) => acc + r.settledAmount, 0);
  const totalFees = filteredReconciliations.reduce((acc, r) => acc + r.feeAmount, 0);
  const totalDiscrepancy = filteredReconciliations.reduce((acc, r) => acc + Math.abs(r.discrepancyAmount), 0);

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
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-red-50 text-red-700 border border-red-200">
            <Smartphone className="w-3 h-3" /> M-Pesa
          </span>
        );
      case DigitalPaymentProvider.ORANGE_MONEY:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-orange-50 text-orange-700 border border-orange-200">
            <Smartphone className="w-3 h-3" /> Orange Money
          </span>
        );
      case DigitalPaymentProvider.AIRTEL_MONEY:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-rose-50 text-rose-700 border border-rose-200">
            <Smartphone className="w-3 h-3" /> Airtel Money
          </span>
        );
      case DigitalPaymentProvider.ILLICOCASH:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            <Smartphone className="w-3 h-3" /> IllicoCash
          </span>
        );
      case DigitalPaymentProvider.CARD_VISA_MASTERCARD:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
            <CreditCard className="w-3 h-3" /> Visa / Mastercard
          </span>
        );
    }
  };

  const handleLaunchAutoReconciliation = () => {
    setIsReconciling(true);
    setTimeout(() => {
      const updated = reconciliations.map((r) => {
        if (r.status === 'PENDING') {
          return {
            ...r,
            status: 'RECONCILED' as const,
            reconciledAt: new Date().toLocaleDateString('en-US'),
          };
        }
        return r;
      });
      setReconciliations(updated);
      saveStoredReconciliations(updated);
      setIsReconciling(false);
      alert('Rapprochement automatisé terminé avec succès ! Tous les lots conformes ont été lettrés.');
    }, 1500);
  };

  const handleTransferToBank = (rec: PaymentReconciliation) => {
    // Generate transfer entry from 518xxx to 521100 (Bank)
    const existingEntries = getStoredEntries();
    const newEntryId = existingEntries.length > 0 ? Math.max(...existingEntries.map((e) => e.id)) + 1 : 1;
    const entryNumber = `ECR-2026-${String(newEntryId).padStart(5, '0')}`;
    const nowStr = new Date().toISOString().split('T')[0];

    const bankTransferEntry = {
      id: newEntryId,
      entryNumber,
      journalId: 3, // BQ
      journalCode: 'BQ',
      periodId: 10,
      date: nowStr,
      reference: `VIR-${rec.batchReference}`,
      label: `Virement de dégagement trésorerie ${rec.provider} vers compte bancaire`,
      status: 'VALIDATED' as const,
      totalDebit: rec.settledAmount,
      totalCredit: rec.settledAmount,
      createdAt: new Date().toISOString(),
      lines: [
        {
          id: 1,
          accountId: 521,
          accountCode: '521100',
          accountLabel: 'Banque Commerciale Principale',
          label: `Réception fonds ${rec.batchReference}`,
          debit: rec.settledAmount,
          credit: 0,
        },
        {
          id: 2,
          accountId: 518,
          accountCode: '518100',
          accountLabel: `Transit Opérateur ${rec.provider}`,
          label: `Solde compte de transit ${rec.batchReference}`,
          debit: 0,
          credit: rec.settledAmount,
        },
      ],
    };

    saveStoredEntries([...existingEntries, bankTransferEntry]);
    alert(`Virement de ${formatCurrency(rec.settledAmount)} comptabilisé (Écriture #${newEntryId} - Journal BQ).`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Audit & Lettrage de Trésorerie
            </span>
            <span className="text-xs text-slate-500 font-medium">Contrôle des Virements de Dégagement</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-7 h-7 text-indigo-600" />
            Rapprochement Bancaire & Passerelles Numériques
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Rapprochez les flux enregistrés chez les opérateurs (M-Pesa, Orange, Airtel, IllicoCash, CB) avec les relevés bancaires réels.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLaunchAutoReconciliation}
            disabled={isReconciling}
            className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition shadow-sm hover:shadow"
          >
            <Sparkles className="w-4 h-4" />
            {isReconciling ? 'Rapprochement en cours...' : 'Lancer le Rapprochement Automatique'}
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Volume Opérateurs Déclaré</span>
            <Smartphone className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalGatewayAmount)}</div>
          <p className="text-xs text-slate-500 mt-1">Total des bordereaux opérateurs</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Fonds Virés en Banque</span>
            <Building2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-emerald-600">{formatCurrency(totalSettledAmount)}</div>
          <p className="text-xs text-slate-500 mt-1">Crédités sur compte 521100</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Commissions Prélevées</span>
            <DollarSign className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-bold text-amber-600">{formatCurrency(totalFees)}</div>
          <p className="text-xs text-slate-500 mt-1">Vérifiées conformes aux grilles</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Écarts Non Rapprochés</span>
            <AlertTriangle className={`w-4 h-4 ${totalDiscrepancy === 0 ? 'text-emerald-500' : 'text-rose-600'}`} />
          </div>
          <div className={`text-2xl font-bold ${totalDiscrepancy === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(totalDiscrepancy)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalDiscrepancy === 0 ? 'Aucun écart détecté (100% lettré)' : 'Écarts nécessitant justification'}
          </p>
        </div>
      </div>

      {/* Filter and Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Bordereaux de Règlement & Lettrage</h2>
            <p className="text-xs text-slate-500">
              Concordance entre débits sur les comptes de transit (518xxx) et crédits bancaires (521100)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700 bg-white focus:outline-none"
            >
              <option value="ALL">Tous les Opérateurs</option>
              <option value={DigitalPaymentProvider.MPESA}>M-Pesa</option>
              <option value={DigitalPaymentProvider.ORANGE_MONEY}>Orange Money</option>
              <option value={DigitalPaymentProvider.AIRTEL_MONEY}>Airtel Money</option>
              <option value={DigitalPaymentProvider.ILLICOCASH}>IllicoCash</option>
              <option value={DigitalPaymentProvider.CARD_VISA_MASTERCARD}>Visa / Mastercard</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Bordereau / Période</th>
                <th className="px-4 py-3.5">Opérateur</th>
                <th className="px-4 py-3.5 text-right">Collecté Opérateur</th>
                <th className="px-4 py-3.5 text-right">Commissions</th>
                <th className="px-4 py-3.5 text-right">Viré en Banque</th>
                <th className="px-4 py-3.5 text-right">Écart</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredReconciliations.map((rec) => (
                <tr key={rec.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-mono text-xs font-bold text-slate-900">{rec.batchReference}</div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{rec.period}</div>
                  </td>
                  <td className="px-4 py-4">{getProviderBadge(rec.provider)}</td>
                  <td className="px-4 py-4 text-right font-bold text-slate-900">
                    {formatCurrency(rec.gatewayAmount)}
                  </td>
                  <td className="px-4 py-4 text-right text-xs text-amber-700">
                    -{formatCurrency(rec.feeAmount)}
                  </td>
                  <td className="px-4 py-4 text-right font-bold text-emerald-700">
                    {formatCurrency(rec.settledAmount)}
                  </td>
                  <td className="px-4 py-4 text-right">
                    <span
                      className={`text-xs font-semibold ${
                        rec.discrepancyAmount === 0 ? 'text-slate-400' : 'text-rose-600'
                      }`}
                    >
                      {formatCurrency(rec.discrepancyAmount)}
                    </span>
                  </td>
                  <td className="px-4 py-4 text-center">
                    {rec.status === 'RECONCILED' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Lettré
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                        <Clock className="w-3.5 h-3.5" /> En cours
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleTransferToBank(rec)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-indigo-50 hover:text-indigo-700 text-slate-700 rounded-lg text-xs font-semibold transition"
                    >
                      <ArrowRightLeft className="w-3.5 h-3.5" />
                      Virement 518→521
                    </button>
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
