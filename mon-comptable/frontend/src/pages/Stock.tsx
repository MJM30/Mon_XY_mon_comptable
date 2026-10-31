import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, ArrowUpRight, ArrowDownRight, CheckCircle2 } from 'lucide-react';

const PRODUCTS = [
  { id: 1, ref: 'PRD-001', name: 'Pack Maintenance & Support mensuel', cat: 'Services', pa: '250,00 $', pv: '450,00 $', qty: 18, min: 5, status: 'En stock' },
  { id: 2, ref: 'PRD-002', name: 'Licence Mon X.Y Cloud Pro (Annuelle)', cat: 'Logiciels', pa: '80,00 $', pv: '180,00 $', qty: 45, min: 10, status: 'En stock' },
  { id: 3, ref: 'PRD-003', name: 'Terminal TPE Électronique Fixe', cat: 'Matériel', pa: '320,00 $', pv: '550,00 $', qty: 3, min: 5, status: 'Alerte seuil' },
  { id: 4, ref: 'PRD-004', name: 'Câblage Blindé & Switch Réseau Pro', cat: 'Fournitures', pa: '15,00 $', pv: '35,00 $', qty: 85, min: 15, status: 'En stock' },
];

export const Stock: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Gestion des Stocks & Articles</h1>
          <p className="text-xs text-slate-500 mt-0.5">Valorisation, seuils d'alerte et inventaire traçable</p>
        </div>

        <button
          onClick={() => alert('Enregistrement d’un mouvement de stock (Entrée / Sortie / Inventaire)')}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nouveau mouvement</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Valorisation totale du stock</span>
          <div className="text-2xl font-extrabold text-blue-600 mt-1">38 400,00 $</div>
          <span className="text-[11px] text-slate-400 mt-1 block">Prix d'achat pondéré HT</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Articles sous seuil minimal</span>
          <div className="text-2xl font-extrabold text-amber-600 mt-1">1 référence</div>
          <span className="text-[11px] text-amber-700 font-bold mt-1 block">PRD-003 Terminal TPE (3 restants / seuil 5)</span>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Ruptures constatées</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">0 référence</div>
          <span className="text-[11px] text-emerald-700 font-bold mt-1 block">Aucune rupture de stock</span>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs min-w-[680px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">Réf</th>
                <th className="px-4 py-3">Désignation</th>
                <th className="px-4 py-3">Catégorie</th>
                <th className="px-4 py-3 text-right">Prix Achat HT</th>
                <th className="px-4 py-3 text-right">Prix Vente HT</th>
                <th className="px-4 py-3 text-center">Quantité</th>
                <th className="px-4 py-3 text-center">Seuil Min</th>
                <th className="px-5 py-3 text-center">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {PRODUCTS.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5 font-bold font-mono text-blue-700">{p.ref}</td>
                  <td className="px-4 py-3.5 font-bold text-slate-900">{p.name}</td>
                  <td className="px-4 py-3.5 text-slate-600">{p.cat}</td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-700">{p.pa}</td>
                  <td className="px-4 py-3.5 text-right font-bold text-slate-900">{p.pv}</td>
                  <td className="px-4 py-3.5 text-center font-extrabold text-slate-900">{p.qty}</td>
                  <td className="px-4 py-3.5 text-center text-slate-500">{p.min}</td>
                  <td className="px-5 py-3.5 text-center">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        p.status === 'Alerte seuil'
                          ? 'bg-amber-50 text-amber-700 border-amber-200 animate-pulse'
                          : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      }`}
                    >
                      {p.status}
                    </span>
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
