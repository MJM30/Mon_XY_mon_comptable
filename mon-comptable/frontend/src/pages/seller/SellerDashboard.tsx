import React from 'react';
import {
  TrendingUp,
  Target,
  ShoppingCart,
  Users,
  Award,
  CreditCard,
  Plus,
  ArrowRight,
  Package,
  Clock,
  CheckCircle2,
  AlertCircle,
  Building,
  DollarSign,
  ChevronRight,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredOrders,
  getStoredProspects,
  getStoredQuotes,
  getStoredSalesTargets,
  getStoredCommissions,
} from '../../data/posMockData';

export const SellerDashboard: React.FC = () => {
  const { user } = useAuth();
  const orders = getStoredOrders();
  const prospects = getStoredProspects();
  const quotes = getStoredQuotes();
  const targets = getStoredSalesTargets();
  const commissions = getStoredCommissions();

  const currentTarget = targets[0] || {
    targetAmount: 15000,
    achievedAmount: 8228,
    targetUnits: 15,
    achievedUnits: 9,
    commissionRate: 5.0,
  };

  const totalSales = orders.reduce((acc, o) => acc + o.totalAmount, 0);
  const totalPaid = orders.reduce((acc, o) => acc + o.paidAmount, 0);
  const totalPending = totalSales - totalPaid;

  const pctAmount = Math.min(
    100,
    Math.round((currentTarget.achievedAmount / currentTarget.targetAmount) * 100)
  );
  const pctUnits = Math.min(
    100,
    Math.round((currentTarget.achievedUnits / currentTarget.targetUnits) * 100)
  );

  const activeProspects = prospects.filter(
    (p) => p.status !== 'CONVERTED' && p.status !== 'LOST'
  );

  const totalCommissionsEarned = commissions.reduce((acc, c) => acc + c.amount, 0);

  return (
    <div className="space-y-6">
      {/* En-tête Vendeur */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 p-6 sm:p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/30 text-emerald-300 text-xs font-extrabold uppercase tracking-wider">
              Portail Vendeur Actif
            </span>
            <span className="text-xs text-slate-300">• TaixunPOS & Caisses</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black">
            Bonjour, {user?.name || 'Alain Tshisekedi'} !
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
            Suivez vos objectifs de vente de terminaux de caisse, vos prospects qualifiés et déclarez vos encaissements clients.
          </p>
        </div>

        <div className="flex items-center gap-2 relative z-10 w-full sm:w-auto">
          <Link
            to="/vendeur/prospects"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouveau Prospect</span>
          </Link>

          <Link
            to="/vendeur/commandes"
            className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
          >
            <ShoppingCart className="w-4 h-4" />
            <span>Créer Devis / Vente</span>
          </Link>
        </div>
      </div>

      {/* Cartes KPI Commercial */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1 : CA Réalisé */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Chiffre d'Affaires POS
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currentTarget.achievedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Objectif: {currentTarget.targetAmount.toLocaleString('en-US')} $</span>
            <span className="font-extrabold text-blue-600">{pctAmount}% atteint</span>
          </div>
        </div>

        {/* KPI 2 : Terminaux vendus */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Caisses & Terminaux
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {currentTarget.achievedUnits} / {currentTarget.targetUnits} unités
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Quota mensuel</span>
            <span className="font-extrabold text-purple-600">{pctUnits}% du quota</span>
          </div>
        </div>

        {/* KPI 3 : Prospects CRM Actifs */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Prospects en Pipeline
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">
            {activeProspects.length} opportunités
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>En négociation / devis</span>
            <Link to="/vendeur/prospects" className="text-emerald-600 font-bold hover:underline">
              Voir le CRM →
            </Link>
          </div>
        </div>

        {/* KPI 4 : Commissions générées */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Commissions ({currentTarget.commissionRate}%)
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-black text-amber-600">
            {totalCommissionsEarned.toFixed(2)} $
          </div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-100">
            <span>Validées à l'encaissement</span>
            <span className="font-bold text-slate-700">{commissions.length} commandes</span>
          </div>
        </div>
      </div>

      {/* Progression Objectifs & Raccourcis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Progression Objectifs */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Target className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Atteinte des Objectifs Commerciaux (Mois en cours)
              </h3>
            </div>
            <span className="text-xs font-bold text-slate-400">Période : Octobre 2026</span>
          </div>

          {/* Barre CA */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Chiffre d'Affaires Réalisé</span>
              <span className="text-slate-900">
                {currentTarget.achievedAmount} $ / {currentTarget.targetAmount} $ ({pctAmount}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${pctAmount}%` }}
              />
            </div>
          </div>

          {/* Barre Volume unités */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs font-bold">
              <span className="text-slate-700">Volume Terminaux POS Vendus</span>
              <span className="text-slate-900">
                {currentTarget.achievedUnits} / {currentTarget.targetUnits} caisses ({pctUnits}%)
              </span>
            </div>
            <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full transition-all duration-500"
                style={{ width: `${pctUnits}%` }}
              />
            </div>
          </div>

          {/* Notice vendeur */}
          <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl text-[11px] text-slate-600 flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>
              Il vous reste <strong>{(currentTarget.targetAmount - currentTarget.achievedAmount).toFixed(0)} $</strong> pour décrocher la prime d'accélération trimestrielle.
            </span>
          </div>
        </div>

        {/* Accès Rapides */}
        <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900 mb-3">Raccourcis Commerciaux</h3>
            <div className="space-y-2">
              <Link
                to="/vendeur/catalogue"
                className="p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-blue-50/40 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-blue-600" />
                  <span>Consulter le Catalogue POS</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/vendeur/prospects"
                className="p-3 rounded-xl border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/40 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-600" />
                  <span>Pipeline Prospects & Leads</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>

              <Link
                to="/vendeur/commandes"
                className="p-3 rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/40 flex items-center justify-between text-xs font-bold text-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-600" />
                  <span>Déclarer un Règlement Client</span>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400" />
              </Link>
            </div>
          </div>

          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200/80 text-[11px] text-amber-900">
            <strong>Rappel procédure :</strong> Enregistrez les reçus et bordereaux de virement pour chaque acompte afin que la finance valide l’expédition du matériel.
          </div>
        </div>
      </div>

      {/* Dernières Commandes POS */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              <ShoppingCart className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Dernières Commandes de Caisses Enregistreuses
            </h3>
          </div>
          <Link to="/vendeur/commandes" className="text-xs font-bold text-blue-600 hover:underline">
            Voir toutes les commandes →
          </Link>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[640px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">N° Commande</th>
                <th className="py-2.5 px-3">Client</th>
                <th className="py-2.5 px-3">Total TTC</th>
                <th className="py-2.5 px-3">Paiement Reçu</th>
                <th className="py-2.5 px-3">Solde Dû</th>
                <th className="py-2.5 px-3">Statut Livraison</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.slice(0, 4).map((order) => {
                const remaining = order.totalAmount - order.paidAmount;
                return (
                  <tr key={order.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-3 font-black text-slate-900">{order.orderNumber}</td>
                    <td className="py-3 px-3 font-bold text-slate-800">{order.clientName}</td>
                    <td className="py-3 px-3 font-black text-slate-900">
                      {order.totalAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600">
                      {order.paidAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })} $
                    </td>
                    <td className="py-3 px-3 font-bold text-rose-600">
                      {remaining > 0 ? `${remaining.toFixed(2)} $` : 'Soldé'}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-50 text-blue-700">
                        {order.processingStatus}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
