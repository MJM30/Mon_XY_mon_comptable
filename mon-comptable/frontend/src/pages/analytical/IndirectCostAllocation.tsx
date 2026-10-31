import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Plus,
  Trash2,
  Percent,
  CheckCircle2,
  AlertTriangle,
  Building,
  Layers,
  ArrowRight,
  ShieldCheck,
  X,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredAllocationRules,
  saveStoredAllocationRules,
  getStoredCostCenters,
  AllocationRule,
} from '../../data/accountingMockData';

export const IndirectCostAllocation: React.FC = () => {
  const { user } = useAuth();
  const isAdminOrController =
    user?.role === 'ADMIN' || user?.role === 'CONTROLLER' || user?.role === 'ACCOUNTANT';

  const centers = getStoredCostCenters();
  const [rules, setRules] = useState<AllocationRule[]>(getStoredAllocationRules);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Formulaire nouvelle règle
  const [ruleName, setRuleName] = useState('');
  const [accountPrefix, setAccountPrefix] = useState('613');
  const [targetCenterId, setTargetCenterId] = useState<number>(centers[0]?.id || 1);
  const [rulePercentage, setRulePercentage] = useState('25.0');
  const [metricKey, setMetricKey] = useState('SUPERFICIE_M2');

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAdminOrController) return;

    const center = centers.find((c) => c.id === targetCenterId);
    if (!ruleName.trim() || !center) return;

    const created: AllocationRule = {
      id: Date.now(),
      name: ruleName.trim(),
      sourceAccountPrefix: accountPrefix.trim(),
      costCenterId: center.id,
      costCenterName: center.name,
      percentage: parseFloat(rulePercentage) || 0,
      ruleType: 'INDIRECT',
      keyMetric: metricKey,
      isActive: true,
    };

    const updated = [...rules, created];
    setRules(updated);
    saveStoredAllocationRules(updated);
    setIsModalOpen(false);

    setRuleName('');
    showNotice(`Clé de répartition « ${created.name} » enregistrée.`);
  };

  const handleDeleteRule = (id: number) => {
    if (!isAdminOrController) return;
    const updated = rules.filter((r) => r.id !== id);
    setRules(updated);
    saveStoredAllocationRules(updated);
    showNotice('Clé de répartition supprimée.');
  };

  // Groupement des clés par compte source (ex: 613 pour vérifier 100%)
  const sumLoyerPct = rules
    .filter((r) => r.sourceAccountPrefix === '613')
    .reduce((acc, r) => acc + r.percentage, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-100 text-indigo-700 uppercase tracking-wider">
              Clés de Déversement & Imputation
            </span>
            <span className="text-xs text-slate-400">• Somme des quotes-parts = 100%</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Répartition des Charges Indirectes
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Configurez les clés objectives (superficie m², effectifs, unités d'œuvre) pour répartir les frais généraux entre les centres de coûts.
          </p>
        </div>

        {isAdminOrController && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Clé de Répartition</span>
          </button>
        )}
      </div>

      {/* Message notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Exemple de Contrôle d'Intégrité Clé 613 Loyers */}
      <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-indigo-950">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <div>
            <span className="font-extrabold block">
              Contrôle d'Intégrité : Répartition du Compte 613 (Loyers & Showroom)
            </span>
            <span className="text-[11px] text-indigo-800">
              Quotes-parts affectées aux centres bénéficiaires : ADM (25%) + COM (45%) + LOG (30%)
            </span>
          </div>
        </div>

        <span className="px-3 py-1 rounded-xl bg-white font-black text-xs text-indigo-900 shadow-2xs">
          Total Clé : {sumLoyerPct} % {sumLoyerPct === 100 ? '(Complet)' : '(Incomplet)'}
        </span>
      </div>

      {/* Tableau des Clés de Répartition */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Libellé de la Clé</th>
                <th className="py-3 px-4">Racine Compte Source</th>
                <th className="py-3 px-4">Centre Bénéficiaire</th>
                <th className="py-3 px-4">Critère Objectif (Métrique)</th>
                <th className="py-3 px-4 text-right">Quote-part (%)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {rules.map((rule) => (
                <tr key={rule.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3.5 px-4 font-extrabold text-slate-900">{rule.name}</td>

                  <td className="py-3.5 px-4 font-mono font-bold text-indigo-600">
                    Compte {rule.sourceAccountPrefix}*
                  </td>

                  <td className="py-3.5 px-4 font-semibold text-slate-800">
                    {rule.costCenterName}
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-0.5 rounded-md bg-slate-100 text-slate-700 font-bold text-[10px]">
                      {rule.keyMetric || 'Pourcentage fixe'}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right font-black text-slate-900 text-sm">
                    {rule.percentage.toFixed(1)} %
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    {isAdminOrController && (
                      <button
                        type="button"
                        onClick={() => handleDeleteRule(rule.id)}
                        className="p-1 rounded hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ================= MODAL AJOUT CLÉ ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white rounded-3xl max-w-md w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
                  <SlidersHorizontal className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">Nouvelle Clé de Répartition</h3>
                  <p className="text-xs text-slate-500">Imputation indirecte vers un centre de coûts</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200 flex items-center justify-center text-slate-400"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateRule} className="p-6 space-y-4 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nom de la Clé *</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Clé Loyer Bureau Technique"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Préfixe Compte Source *</label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: 613, 606"
                    value={accountPrefix}
                    onChange={(e) => setAccountPrefix(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-mono font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 block mb-1">Pourcentage affecté (%) *</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    required
                    value={rulePercentage}
                    onChange={(e) => setRulePercentage(e.target.value)}
                    className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-black focus:ring-2 focus:ring-indigo-500 focus:outline-hidden text-right"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Centre Bénéficiaire *</label>
                <select
                  value={targetCenterId}
                  onChange={(e) => setTargetCenterId(parseInt(e.target.value))}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                >
                  {centers.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.code} - {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Unité d'Œuvre / Métrique</label>
                <input
                  type="text"
                  placeholder="Ex: Surface 45m², Effectif 4 personnes, KWh consommés"
                  value={metricKey}
                  onChange={(e) => setMetricKey(e.target.value)}
                  className="w-full px-3.5 py-2 border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:outline-hidden"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold shadow-xs transition-colors"
                >
                  Créer la Règle
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
