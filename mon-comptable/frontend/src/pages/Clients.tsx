import React from 'react';
import { Users, Plus, Phone, Mail, Building2, CheckCircle2 } from 'lucide-react';

const CLIENTS = [
  { id: 1, name: 'ETS Congo Tech Distribution Gombe (SARL)', contact: 'Alain Tshisekedi', email: 'm.lefebvre@alpha-corp.fr', phone: '+33 6 12 34 56 78', taxId: 'SIREN 839 201 129', badge: 'Client Entreprise', totalFacture: '12 800 $', soldeDu: '4 800 $' },
  { id: 2, name: 'Dieudonné Kasongo', contact: 'Dieudonné Kasongo', email: 'jean.dupont@email.fr', phone: '+33 6 98 76 54 32', taxId: 'Particulier', badge: 'Fidélité Gold', totalFacture: '4 250 $', soldeDu: '1 850 $' },
  { id: 3, name: 'Chantal Mwamba', contact: 'Chantal Mwamba', email: 'sarah.martin@freelance.fr', phone: '+33 7 45 12 89 63', taxId: 'Indépendant', badge: 'Particulier Premium', totalFacture: '8 640 $', soldeDu: '0 $' },
  { id: 4, name: 'Supermarché Express Limete (SAS)', contact: 'Valérie Roux', email: 'contact@betagroup.com', phone: '+33 1 45 78 90 12', taxId: 'SIREN 910 442 811', badge: 'Client Mandaté', totalFacture: '19 400 $', soldeDu: '3 300 $' },
];

export const Clients: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">Fichier Tiers Clients</h1>
          <p className="text-xs text-slate-500 mt-0.5">Fiches certifiées, encours et créances restant dues</p>
        </div>
        <button
          onClick={() => alert('Création d’un nouveau client')}
          className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Nouveau client</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {CLIENTS.map((c) => (
          <div key={c.id} className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-1.5 py-0.2 rounded font-medium mt-1 inline-block">
                  {c.badge}
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-400">{c.taxId}</span>
            </div>

            <div className="text-xs text-slate-500 space-y-1">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-slate-400" />
                <span>{c.phone}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Total Facturé</span>
                <span className="font-bold text-slate-900">{c.totalFacture}</span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Reste à régler (Créance)</span>
                <span className={`font-extrabold ${c.soldeDu !== '0 $' ? 'text-rose-600' : 'text-emerald-600'}`}>
                  {c.soldeDu}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
