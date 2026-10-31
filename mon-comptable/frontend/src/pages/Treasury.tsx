import React from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Wallet, CheckCircle2 } from 'lucide-react';

export const Treasury: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestion de la Trésorerie</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Formule comptable : <code>Solde Actuel = Solde Initial + Recettes Réelles - Dépenses Réelles</code>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Solde Global Consolidé</span>
            <Wallet className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-slate-900">94 310,00 $</div>
          <p className="text-[11px] text-slate-400 mt-1">Position nette bancaire et caisse à J+0</p>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Banque Principale (Rawbank Kinshasa USD)</span>
            <Landmark className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">81 200,00 $</div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1 block">Rapprochement bancaire OK</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-2">
            <span>Caisse physique centrale</span>
            <Wallet className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">13 110,00 $</div>
          <span className="text-[11px] text-slate-500 font-medium mt-1 block">Clôture journalière effectuée</span>
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <h2 className="text-sm font-bold text-slate-900">Synthèse des Flux de Trésorerie (Mars 2025)</h2>
        <div className="space-y-3 text-xs">
          <div className="flex justify-between p-3 rounded-lg bg-slate-50 border border-slate-100">
            <span className="font-semibold text-slate-700">Solde Initial au 01/03/2025</span>
            <span className="font-extrabold text-slate-900">27 840,00 $</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-emerald-50/50 border border-emerald-100 text-emerald-800">
            <span className="font-semibold flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-emerald-600" /> + Recettes & Règlements clients encaissés
            </span>
            <span className="font-extrabold">+148 920,00 $</span>
          </div>
          <div className="flex justify-between p-3 rounded-lg bg-rose-50/50 border border-rose-100 text-rose-800">
            <span className="font-semibold flex items-center gap-1.5">
              <ArrowDownRight className="w-4 h-4 text-rose-600" /> - Dépenses & Décaissements fournisseurs réglés
            </span>
            <span className="font-extrabold">-82 450,00 $</span>
          </div>
          <div className="flex justify-between p-4 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 font-bold text-sm">
            <span>Solde Final Actuel</span>
            <span className="text-base text-blue-800">94 310,00 $</span>
          </div>
        </div>
      </div>
    </div>
  );
};
