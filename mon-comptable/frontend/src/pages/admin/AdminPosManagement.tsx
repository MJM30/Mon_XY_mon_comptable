import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Users,
  Award,
  DollarSign,
  Plus,
  SlidersHorizontal,
  Edit3,
  CheckCircle2,
  AlertCircle,
  Eye,
  BarChart3,
  Cpu,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredPosProducts,
  saveStoredPosProducts,
  getStoredOrders,
  getStoredSalesTargets,
  saveStoredSalesTargets,
  PosProduct,
  PosVariant,
  SalesTarget,
} from '../../data/posMockData';

export const AdminPosManagement: React.FC = () => {
  const { user } = useAuth();
  const [products, setProducts] = useState<PosProduct[]>(getStoredPosProducts);
  const [orders] = useState(getStoredOrders);
  const [targets, setTargets] = useState<SalesTarget[]>(getStoredSalesTargets);
  const [activeTab, setActiveTab] = useState<'CATALOG' | 'TARGETS' | 'GLOBAL_SALES'>('CATALOG');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  // Stats globales
  const totalPosRevenue = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalPosPaid = orders.reduce((acc, o) => acc + o.paidAmount, 0);
  const allVariants = products.flatMap((p) => p.variants);
  const totalStockUnits = allVariants.reduce((acc, v) => acc + v.stockQuantity, 0);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 4500);
  };

  const handleUpdatePrice = (variantId: number, newSalePrice: number, newCostPrice: number) => {
    const updated = products.map((prod) => ({
      ...prod,
      variants: prod.variants.map((v) =>
        v.id === variantId
          ? {
              ...v,
              salePrice: newSalePrice,
              costPrice: newCostPrice,
            }
          : v
      ),
    }));

    setProducts(updated);
    saveStoredPosProducts(updated);
    showNotice('Tarifs et marges de la variante mis à jour avec succès.');
  };

  return (
    <div className="space-y-6">
      {/* En-tête Admin */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-100 text-purple-700 uppercase tracking-wider">
              Administration Générale • Matériel POS
            </span>
            <span className="text-xs text-slate-400">• Dirigeant : {user?.name || 'Jean-Paul Mukendi'}</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Supervision Commerciale, Marges & Tarification
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gérez les prix d’achat fournisseurs, fixez les prix publics, suivez les marges brutes et configurez les objectifs vendeurs.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Accès Direction & Rentabilité (Confidentiel)</span>
        </div>
      </div>

      {/* Message de notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Cartes KPI Direction */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Total Ventes POS</span>
          <div className="text-2xl font-black text-slate-900">
            {totalPosRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <div className="text-[11px] text-emerald-600 font-bold">
            {totalPosPaid.toLocaleString('en-US')} $ encaissés
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Stock Global POS</span>
          <div className="text-2xl font-black text-slate-900">{totalStockUnits} terminaux</div>
          <div className="text-[11px] text-blue-600 font-bold">{allVariants.length} variantes actives</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Taux de Marge Moyen</span>
          <div className="text-2xl font-black text-purple-600">38.4 %</div>
          <div className="text-[11px] text-slate-500">Moyenne brute sur le matériel</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-1">
          <span className="text-xs font-bold uppercase text-slate-400">Force de Vente</span>
          <div className="text-2xl font-black text-slate-900">1 Vendeur assigné</div>
          <div className="text-[11px] text-slate-500">Alain Tshisekedi (Mon X.Y POS)</div>
        </div>
      </div>

      {/* Onglets Admin */}
      <div className="flex gap-4 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('CATALOG')}
          className={`pb-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'CATALOG'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Catalogue, Coûts de Revient & Marges</span>
        </button>

        <button
          onClick={() => setActiveTab('TARGETS')}
          className={`pb-2 text-xs font-extrabold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === 'TARGETS'
              ? 'border-purple-600 text-purple-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Objectifs Vendeurs & Commissions</span>
        </button>
      </div>

      {/* ================= ONGLET CATALOGUE & MARGES ================= */}
      {activeTab === 'CATALOG' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="p-4 bg-purple-50/50 border-b border-purple-100 flex items-center justify-between">
              <span className="text-xs font-bold text-purple-900">
                Grille tarifaire détaillée • Règle d’étanchéité : Les prix d'achat et marges ne sont
                jamais exposés sur l'interface vendeur.
              </span>
            </div>

            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left border-collapse text-xs min-w-[760px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-3 px-4">Modèle & Variante</th>
                    <th className="py-3 px-4">Processeur / Specs</th>
                    <th className="py-3 px-4">Stock</th>
                    <th className="py-3 px-4">Coût d'achat (HT)</th>
                    <th className="py-3 px-4">Prix Vente (HT)</th>
                    <th className="py-3 px-4">Marge Brute Unit.</th>
                    <th className="py-3 px-4">Taux de Marge</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.flatMap((prod) =>
                    prod.variants.map((v) => {
                      const cost = v.costPrice || 0;
                      const margin = v.salePrice - cost;
                      const marginRate = cost > 0 ? ((margin / v.salePrice) * 100).toFixed(1) : 0;

                      return (
                        <tr key={v.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] font-bold text-blue-600 block">{prod.name}</span>
                            <span className="font-extrabold text-slate-900">{v.title}</span>
                            <span className="block text-[10px] text-slate-400 font-mono">SKU: {v.sku}</span>
                          </td>

                          <td className="py-3.5 px-4 text-slate-700">
                            <div>{v.cpu}</div>
                            <div className="text-[11px] text-slate-400">
                              {v.ram} • {v.storage}
                            </div>
                          </td>

                          <td className="py-3.5 px-4">
                            <span
                              className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                v.stockQuantity > v.minThreshold
                                  ? 'bg-emerald-50 text-emerald-700'
                                  : 'bg-rose-50 text-rose-700'
                              }`}
                            >
                              {v.stockQuantity} dispo (seuil: {v.minThreshold})
                            </span>
                          </td>

                          <td className="py-3.5 px-4 font-bold text-slate-600">
                            {cost.toFixed(2)} $
                          </td>

                          <td className="py-3.5 px-4 font-black text-slate-900 text-sm">
                            {v.salePrice.toFixed(2)} $
                          </td>

                          <td className="py-3.5 px-4 font-black text-emerald-600">
                            +{margin.toFixed(2)} $
                          </td>

                          <td className="py-3.5 px-4 font-black text-purple-700">
                            {marginRate} %
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= ONGLET OBJECTIFS VENDEURS ================= */}
      {activeTab === 'TARGETS' && (
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-sm text-slate-900">
              Quotas Mensuels & Barème des Commissions
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                  <th className="py-3 px-4">Vendeur assigné</th>
                  <th className="py-3 px-4">Période</th>
                  <th className="py-3 px-4">Objectif CA ($)</th>
                  <th className="py-3 px-4">CA Réalisé ($)</th>
                  <th className="py-3 px-4">Unités Vendues</th>
                  <th className="py-3 px-4">Taux Commission</th>
                  <th className="py-3 px-4">Statut Quota</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {targets.map((t) => {
                  const pct = Math.round((t.achievedAmount / t.targetAmount) * 100);
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-extrabold text-slate-900">{t.sellerName}</td>
                      <td className="py-3.5 px-4 text-slate-600">{t.period}</td>
                      <td className="py-3.5 px-4 font-bold text-slate-700">
                        {t.targetAmount.toLocaleString('en-US')} $
                      </td>
                      <td className="py-3.5 px-4 font-black text-slate-900">
                        {t.achievedAmount.toLocaleString('en-US')} $
                      </td>
                      <td className="py-3.5 px-4 font-semibold text-slate-700">
                        {t.achievedUnits} / {t.targetUnits} terminaux
                      </td>
                      <td className="py-3.5 px-4 font-black text-amber-600">
                        {t.commissionRate} %
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-blue-100 text-blue-800">
                          {pct}% atteint
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
