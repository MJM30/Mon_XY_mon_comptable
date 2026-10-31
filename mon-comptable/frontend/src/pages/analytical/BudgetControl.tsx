import React, { useState } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Plus,
  Filter,
  DollarSign,
  PieChart,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  AlertOctagon,
  Sparkles
} from 'lucide-react';
import {
  getStoredBudgets,
  saveStoredBudgets,
  getStoredCostCenters,
  getStoredAnalyticalSections,
} from '../../data/accountingMockData';
import { Budget, BudgetLine } from '../../types';

export const BudgetControl: React.FC = () => {
  const [budgets, setBudgets] = useState<Budget[]>(getStoredBudgets());
  const [selectedBudgetId, setSelectedBudgetId] = useState<number>(budgets[0]?.id || 1);
  const costCenters = getStoredCostCenters();
  const sections = getStoredAnalyticalSections();

  const [selectedCenterId, setSelectedCenterId] = useState<string>('ALL');
  const [showAddModal, setShowAddModal] = useState(false);

  // New budget line form state
  const [newCenterId, setNewCenterId] = useState<number>(costCenters[0]?.id || 1);
  const [newSectionId, setNewSectionId] = useState<number>(sections[0]?.id || 1);
  const [newAccountCode, setNewAccountCode] = useState<string>('601100');
  const [newBudgetedAmount, setNewBudgetedAmount] = useState<number>(10000);
  const [newPeriod, setNewPeriod] = useState<string>('ANNUEL');

  const currentBudget = budgets.find((b) => b.id === selectedBudgetId) || budgets[0];

  const filteredLines = (currentBudget?.lines || []).filter((line) => {
    if (selectedCenterId !== 'ALL' && line.costCenterId !== Number(selectedCenterId)) {
      return false;
    }
    return true;
  });

  const totalBudgeted = filteredLines.reduce((acc, l) => acc + l.budgetedAmount, 0);
  const totalActual = filteredLines.reduce((acc, l) => acc + l.actualAmount, 0);
  const totalVariance = totalBudgeted - totalActual;
  const globalConsumptionRate = totalBudgeted > 0 ? (totalActual / totalBudgeted) * 100 : 0;

  const handleAddBudgetLine = (e: React.FormEvent) => {
    e.preventDefault();
    const center = costCenters.find((c) => c.id === Number(newCenterId));
    const section = sections.find((s) => s.id === Number(newSectionId));

    const newLine: BudgetLine = {
      id: Date.now(),
      costCenterId: Number(newCenterId),
      costCenterName: center ? `${center.code} - ${center.name}` : undefined,
      analyticalSectionId: Number(newSectionId),
      analyticalSectionName: section ? `${section.code} - ${section.name}` : undefined,
      accountCode: newAccountCode,
      period: newPeriod,
      budgetedAmount: Number(newBudgetedAmount),
      actualAmount: 0,
      varianceAmount: Number(newBudgetedAmount),
      variancePercent: 0,
    };

    const updatedBudgets = budgets.map((b) => {
      if (b.id === currentBudget.id) {
        return {
          ...b,
          lines: [...b.lines, newLine],
        };
      }
      return b;
    });

    setBudgets(updatedBudgets);
    saveStoredBudgets(updatedBudgets);
    setShowAddModal(false);
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(val);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Contrôle de Gestion & Pilotage
            </span>
            <span className="text-xs text-slate-500 font-medium">Exercice 2026</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <DollarSign className="w-7 h-7 text-emerald-600" />
            Contrôle Budgétaire & Suivi des Écarts
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Mesurez l'engagement budgétaire prévisionnel vs réalisé par centre de coût et section analytique.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedBudgetId}
            onChange={(e) => setSelectedBudgetId(Number(e.target.value))}
            className="px-3.5 py-2 rounded-xl border border-slate-200 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            {budgets.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name} ({b.year})
              </option>
            ))}
          </select>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700 transition shadow-sm hover:shadow"
          >
            <Plus className="w-4 h-4" />
            Nouvelle Ligne Budgétaire
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Enveloppe Prévisionnelle</span>
            <Layers className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalBudgeted)}</div>
          <p className="text-xs text-slate-500 mt-1">Plafond budgétaire total validé</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Dépenses Réalisées</span>
            <TrendingUp className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900">{formatCurrency(totalActual)}</div>
          <p className="text-xs text-slate-500 mt-1">Montants imputés et engagés</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Écart Net Global</span>
            {totalVariance >= 0 ? (
              <ArrowUpRight className="w-4 h-4 text-emerald-600" />
            ) : (
              <ArrowDownRight className="w-4 h-4 text-rose-600" />
            )}
          </div>
          <div className={`text-2xl font-bold ${totalVariance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {totalVariance >= 0 ? '+' : ''}
            {formatCurrency(totalVariance)}
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {totalVariance >= 0 ? 'Disponible restant non consommé' : 'Dépassement global'}
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm">
          <div className="flex items-center justify-between text-slate-500 text-sm mb-2">
            <span>Taux de Consommation</span>
            <PieChart className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold ${
                globalConsumptionRate > 100
                  ? 'text-rose-600'
                  : globalConsumptionRate > 85
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {globalConsumptionRate.toFixed(1)}%
            </span>
            <span className="text-xs text-slate-400">du budget</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                globalConsumptionRate > 100
                  ? 'bg-rose-500'
                  : globalConsumptionRate > 85
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(globalConsumptionRate, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">Filtrer par centre :</span>
          <select
            value={selectedCenterId}
            onChange={(e) => setSelectedCenterId(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-slate-200 text-sm bg-slate-50 text-slate-700 font-medium hover:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <option value="ALL">Tous les Centres de Coûts</option>
            {costCenters.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} - {c.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Sous contrôle (&lt; 85%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span> Alerte (&gt;= 85%)
          </span>
          <span className="flex items-center gap-1.5 text-slate-600">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span> Dépassement (&gt; 100%)
          </span>
        </div>
      </div>

      {/* Budget Lines Table */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h2 className="text-base font-bold text-slate-900">Tableau de Bord des Lignes Budgétaires</h2>
            <p className="text-xs text-slate-500">
              Analyse détaillée par compte, section de destination et seuils d'alerte opérationnels
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg">
            {filteredLines.length} ligne(s)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
              <tr>
                <th className="px-6 py-3.5">Centre & Section</th>
                <th className="px-4 py-3.5">Compte</th>
                <th className="px-4 py-3.5 text-right">Budget Alloué</th>
                <th className="px-4 py-3.5 text-right">Réalisé Actuel</th>
                <th className="px-4 py-3.5 text-right">Écart Net</th>
                <th className="px-6 py-3.5 w-48 text-center">Consommation</th>
                <th className="px-4 py-3.5 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {filteredLines.map((line) => {
                const consumption = line.budgetedAmount > 0 ? (line.actualAmount / line.budgetedAmount) * 100 : 0;
                const variance = line.budgetedAmount - line.actualAmount;
                const isOverrun = consumption > 100;
                const isWarning = consumption >= 85 && !isOverrun;

                return (
                  <tr key={line.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">
                        {line.costCenterName || `Centre #${line.costCenterId}`}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Axe : {line.analyticalSectionName || `Section #${line.analyticalSectionId}`}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-mono text-xs px-2 py-1 bg-slate-100 rounded text-slate-700">
                        {line.accountCode}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-900">
                      {formatCurrency(line.budgetedAmount)}
                    </td>
                    <td className="px-4 py-4 text-right font-semibold text-slate-800">
                      {formatCurrency(line.actualAmount)}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <span className={`font-semibold ${variance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {variance >= 0 ? '+' : ''}
                        {formatCurrency(variance)}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="font-bold text-slate-700">{consumption.toFixed(1)}%</span>
                        <span className="text-[11px] text-slate-400">
                          {formatCurrency(line.actualAmount)} / {formatCurrency(line.budgetedAmount)}
                        </span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-300 ${
                            isOverrun ? 'bg-rose-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${Math.min(consumption, 100)}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      {isOverrun ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                          <AlertOctagon className="w-3.5 h-3.5" /> Dépassement
                        </span>
                      ) : isWarning ? (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                          <AlertTriangle className="w-3.5 h-3.5" /> Alerte 85%
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                          <CheckCircle className="w-3.5 h-3.5" /> Conforme
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Line Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center pb-4 border-b border-slate-100">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-600" />
                Nouvelle Ligne de Budget Prévisionnel
              </h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-semibold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddBudgetLine} className="space-y-4 mt-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Centre de Coûts</label>
                <select
                  value={newCenterId}
                  onChange={(e) => setNewCenterId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                >
                  {costCenters.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Section Analytique de Rattachement</label>
                <select
                  value={newSectionId}
                  onChange={(e) => setNewSectionId(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                >
                  {sections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.code} - {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Compte Comptable Rattaché</label>
                <input
                  type="text"
                  value={newAccountCode}
                  onChange={(e) => setNewAccountCode(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="ex: 601100, 613000..."
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Périodicité</label>
                  <select
                    value={newPeriod}
                    onChange={(e) => setNewPeriod(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="ANNUEL">Annuel (2026)</option>
                    <option value="SEMESTRIEL">Semestriel</option>
                    <option value="TRIMESTRIEL">Trimestriel</option>
                    <option value="MENSUEL">Mensuel</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Montant Budgété ($)</label>
                  <input
                    type="number"
                    step="100"
                    value={newBudgetedAmount}
                    onChange={(e) => setNewBudgetedAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold focus:ring-2 focus:ring-emerald-500/20"
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-sm font-semibold hover:bg-emerald-700"
                >
                  Ajouter au Budget
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
