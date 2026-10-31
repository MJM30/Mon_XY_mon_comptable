import React from 'react';
import { Building2, Plus, Mail, ShieldAlert } from 'lucide-react';

const SUPPLIERS = [
  { id: 1, name: 'Congo Carburant Express', email: 'contact@carburant.cd', cat: 'Charges d’énergie & groupe', totalDepenses: '5 400 $' },
  { id: 2, name: 'Imprimerie Centrale de la Gombe', email: 'imprimerie@gombe.cd', cat: 'Fournitures & imprimés légaux', totalDepenses: '2 150 $' },
  { id: 3, name: 'Vodacom Congo RDC Fibre', email: 'b2b@vodacom.cd', cat: 'Télécoms & IT', totalDepenses: '1 800 $' },
  { id: 4, name: 'Fournisseur Congo Tech Matériel Tech Pro', email: 'tech@materiel-pro.fr', cat: 'Équipements et TPE', totalDepenses: '6 890 $' },
];

export const Suppliers: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fichier Tiers Fournisseurs</h1>
          <p className="text-xs text-slate-500 mt-0.5">Fournisseurs référencés, contrats et cumul d'achats</p>
        </div>
        <button
          onClick={() => alert('Ajout d’un nouveau fournisseur')}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nouveau fournisseur</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUPPLIERS.map((s) => (
          <div key={s.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">{s.name}</h3>
              <span className="text-[10px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded font-semibold">
                {s.cat}
              </span>
            </div>
            <div className="text-xs text-slate-500 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{s.email}</span>
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Total Facturé / Réglé</span>
              <span className="font-extrabold text-slate-900">{s.totalDepenses}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
