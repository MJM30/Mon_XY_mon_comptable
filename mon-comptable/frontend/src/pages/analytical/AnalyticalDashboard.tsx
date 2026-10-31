import React from 'react';
import {
  PieChart,
  TrendingUp,
  Target,
  Layers,
  ArrowRight,
  ShieldCheck,
  Building,
  DollarSign,
  BarChart3,
  CheckCircle2,
  AlertCircle,
  Percent,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredCostCenters,
  getStoredAnalyticalSections,
  getStoredBudgets,
  getStoredAllocationRules,
} from '../../data/accountingMockData';

export const AnalyticalDashboard: React.FC = () => {
  const { user } = useAuth();
  const centers = getStoredCostCenters();
  const sections = getStoredAnalyticalSections();
  const budgets = getStoredBudgets();
  const rules = getStoredAllocationRules();

  const currentBudget = budgets[0];

  const totalCenterExpenses = centers.reduce((acc, c) => acc + (c.totalExpenses || 0), 0);
  const totalSectionRevenue = sections.reduce((acc, s) => acc + (s.revenue || 0), 0);
  const totalSectionDirectCost = sections.reduce((acc, s) => acc + (s.directCost || 0), 0);
  const totalSectionIndirectCost = sections.reduce((acc, s) => acc + (s.indirectCost || 0), 0);
  const totalSectionMargin = sections.reduce((acc, s) => acc + (s.margin || 0), 0);

  const budgetPlanned = currentBudget?.totalPlanned || 46500;
  const budgetRealized = currentBudget?.totalRealized || 35800;
  const budgetConsumptionRate = Math.min(100, Math.round((budgetRealized / budgetPlanned) * 100));

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Contrôle de Gestion & Comptabilité Analytique
            </span>
            <span className="text-xs text-slate-400">• Vision par Centres de Coûts & Activités</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Tableau de Bord Analytique & Rentabilité
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Comprenez la structure de vos coûts directs et indirects, la rentabilité par activité et suivez l'exécution budgétaire.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/analytique/budgets"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Target className="w-4 h-4" />
            <span>Contrôle Budgétaire</span>
          </Link>
        </div>
      </div>

      {/* Cartes KPI Analytiques */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : Marge Nette Analytique */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Marge Analytique Globale</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-emerald-600">
            +{totalSectionMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>CA Activités : {totalSectionRevenue.toLocaleString('en-US')} $</span>
            <span className="font-bold text-emerald-700">
              {((totalSectionMargin / totalSectionRevenue) * 100).toFixed(1)}% marge
            </span>
          </div>
        </div>

        {/* KPI 2 : Coûts Directs Matériel POS */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Coûts Directs Affectés</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {totalSectionDirectCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>Achats et composants traçables</span>
            <span className="text-blue-600 font-bold">Imputation 100%</span>
          </div>
        </div>

        {/* KPI 3 : Charges Indirectes Réparties */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Charges Indirectes Réparties</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Building className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-purple-700">
            {totalSectionIndirectCost.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>{rules.length} clés actives (Loyers, Énergie)</span>
            <Link to="/analytique/repartition" className="text-purple-600 font-bold hover:underline">
              Clés →
            </Link>
          </div>
        </div>

        {/* KPI 4 : Consommation Budgétaire */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400">Budget Global Consommé</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Target className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {budgetConsumptionRate} %
          </div>
          <div className="text-[11px] text-slate-500 flex justify-between border-t border-slate-100 pt-1">
            <span>{budgetRealized.toLocaleString('en-US')} $ / {budgetPlanned.toLocaleString('en-US')} $</span>
            <span className="font-bold text-emerald-600">Sous contrôle</span>
          </div>
        </div>
      </div>

      {/* Ventilation par Centres de Coûts & Activités */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dépenses par Centre de Coûts */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Charges par Centres de Coûts Responsables
              </h3>
              <p className="text-xs text-slate-400">Ventilation de l'ensemble des dépenses par pôle</p>
            </div>
            <Link to="/analytique/centres-couts" className="text-xs font-bold text-indigo-600 hover:underline">
              Voir tous ({centers.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {centers.map((c) => {
              const pctOfTotal = totalCenterExpenses > 0 ? ((c.totalExpenses || 0) / totalCenterExpenses) * 100 : 0;
              const budgetUsage = c.allocatedBudget ? ((c.totalExpenses || 0) / c.allocatedBudget) * 100 : 0;

              return (
                <div key={c.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-800">
                      {c.name} ({c.code})
                    </span>
                    <span className="text-slate-900 font-black">
                      {(c.totalExpenses || 0).toLocaleString('en-US')} $ ({pctOfTotal.toFixed(1)}%)
                    </span>
                  </div>

                  {/* Barre d'utilisation budget centre */}
                  <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full"
                      style={{ width: `${Math.min(100, budgetUsage)}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-[10px] text-slate-400">
                    <span>Responsable : {c.managerName || 'Non assigné'}</span>
                    <span>Budget alloué : {(c.allocatedBudget || 0).toLocaleString('en-US')} $</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Rentabilité par Section Métier */}
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Rentabilité par Activité Commerciale
              </h3>
              <p className="text-xs text-slate-400">Contribution nette aux marges de l'entreprise</p>
            </div>
            <Link to="/analytique/rentabilite" className="text-xs font-bold text-indigo-600 hover:underline">
              Rapport complet →
            </Link>
          </div>

          <div className="space-y-3">
            {sections.map((s) => {
              const totalCost = (s.directCost || 0) + (s.indirectCost || 0);
              const marginPct = s.revenue ? (((s.margin || 0) / s.revenue) * 100).toFixed(1) : '0';

              return (
                <div key={s.id} className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-2 text-xs">
                  <div className="flex justify-between items-center font-bold">
                    <span className="text-slate-900 text-sm font-black">{s.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-black text-[10px]">
                      +{marginPct}% Marge
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 border-t border-slate-200/60">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Chiffre d'Affaires</span>
                      <span className="font-bold text-slate-900">{(s.revenue || 0).toLocaleString('en-US')} $</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Coût Total</span>
                      <span className="font-bold text-slate-700">{totalCost.toLocaleString('en-US')} $</span>
                    </div>

                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold block">Marge Nette</span>
                      <span className="font-black text-emerald-600">+{(s.margin || 0).toLocaleString('en-US')} $</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
