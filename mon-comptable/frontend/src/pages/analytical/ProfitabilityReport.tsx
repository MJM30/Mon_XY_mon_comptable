import React, { useState } from 'react';
import {
  TrendingUp,
  Download,
  DollarSign,
  PieChart,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredAnalyticalSections } from '../../data/accountingMockData';

export const ProfitabilityReport: React.FC = () => {
  const { user } = useAuth();
  const sections = getStoredAnalyticalSections();

  const totalCA = sections.reduce((acc, s) => acc + (s.revenue || 0), 0);
  const totalDirectCosts = sections.reduce((acc, s) => acc + (s.directCost || 0), 0);
  const totalIndirectCosts = sections.reduce((acc, s) => acc + (s.indirectCost || 0), 0);
  const totalMargin = sections.reduce((acc, s) => acc + (s.margin || 0), 0);
  const averageMarginRate = totalCA > 0 ? ((totalMargin / totalCA) * 100).toFixed(1) : '0';

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Analyse de Rentabilité Métier
            </span>
            <span className="text-xs text-slate-400">• Coûts de Revient Complets</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Rapport de Rentabilité & Marges Analytiques
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Distinguez les charges directes et indirectes affectées à chaque ligne de produits pour piloter la rentabilité réelle.
          </p>
        </div>

        <button
          onClick={() => alert('Export du rapport de rentabilité en PDF / Excel.')}
          className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
        >
          <Download className="w-4 h-4" />
          <span>Exporter Rapport (PDF)</span>
        </button>
      </div>

      {/* Cartes Synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Total Chiffre d'Affaires</span>
          <div className="text-2xl font-black text-slate-900">
            {totalCA.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <span className="text-[11px] text-slate-500">{sections.length} activités actives</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Coûts Directs Totaux</span>
          <div className="text-2xl font-black text-blue-700">
            {totalDirectCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <span className="text-[11px] text-slate-500">Matériel & consommables</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Charges Indirectes</span>
          <div className="text-2xl font-black text-purple-700">
            {totalIndirectCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <span className="text-[11px] text-slate-500">Frais généraux ventilés</span>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Taux de Marge Moyen</span>
          <div className="text-2xl font-black text-emerald-600">{averageMarginRate} %</div>
          <span className="text-[11px] text-emerald-700 font-bold">Rentabilité globale positive</span>
        </div>
      </div>

      {/* Tableau détaillé de Rentabilité par Activité */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Ligne d'Activité / Projet</th>
                <th className="py-3 px-4 text-right">Chiffre d'Affaires ($)</th>
                <th className="py-3 px-4 text-right">Coût Direct ($)</th>
                <th className="py-3 px-4 text-right">Marge sur Coût Direct</th>
                <th className="py-3 px-4 text-right">Quote-part Indirecte ($)</th>
                <th className="py-3 px-4 text-right">Résultat Net Analytique ($)</th>
                <th className="py-3 px-4 text-right">Rentabilité Nette</th>
                <th className="py-3 px-4 text-center">Diagnostic</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {sections.map((sec) => {
                const ca = sec.revenue || 0;
                const direct = sec.directCost || 0;
                const indirect = sec.indirectCost || 0;
                const mcd = ca - direct;
                const mcdRate = ca > 0 ? ((mcd / ca) * 100).toFixed(1) : '0';
                const netMargin = sec.margin || 0;
                const netRate = ca > 0 ? ((netMargin / ca) * 100).toFixed(1) : '0';
                const isProfitable = netMargin > 0;

                return (
                  <tr key={sec.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-4 px-4">
                      <span className="font-mono text-[10px] text-indigo-600 font-bold block">
                        {sec.code}
                      </span>
                      <span className="font-extrabold text-slate-900">{sec.name}</span>
                    </td>

                    <td className="py-4 px-4 text-right font-black text-slate-900">
                      {ca.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-slate-700">
                      {direct.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-blue-700">
                      {mcd.toLocaleString('en-US', { minimumFractionDigits: 2 })} $ ({mcdRate}%)
                    </td>

                    <td className="py-4 px-4 text-right font-bold text-purple-700">
                      {indirect.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>

                    <td className="py-4 px-4 text-right font-black text-sm">
                      <span className={isProfitable ? 'text-emerald-600' : 'text-rose-600'}>
                        {isProfitable ? '+' : ''}
                        {netMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                      </span>
                    </td>

                    <td className="py-4 px-4 text-right font-black">
                      <span className={isProfitable ? 'text-emerald-700' : 'text-rose-700'}>
                        {netRate} %
                      </span>
                    </td>

                    <td className="py-4 px-4 text-center">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          isProfitable
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {isProfitable ? 'TRÈS RENTABLE' : 'DÉFICITAIRE'}
                      </span>
                    </td>
                  </tr>
                );
              })}

              {/* Ligne Totale */}
              <tr className="bg-slate-50 font-black text-xs text-slate-900">
                <td className="py-3 px-4 uppercase text-[11px]">Totaux Consolidés :</td>
                <td className="py-3 px-4 text-right">
                  {totalCA.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                </td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {totalDirectCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                </td>
                <td className="py-3 px-4 text-right text-blue-800">
                  {(totalCA - totalDirectCosts).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                  })}{' '}
                  $
                </td>
                <td className="py-3 px-4 text-right text-purple-700">
                  {totalIndirectCosts.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                </td>
                <td className="py-3 px-4 text-right text-emerald-600 text-sm">
                  +{totalMargin.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                </td>
                <td className="py-3 px-4 text-right text-emerald-700">{averageMarginRate} %</td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
