import React, { useState } from 'react';
import { ShieldCheck, UserCheck, AlertTriangle, CheckCircle2, XCircle, Key, History } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const SettingsAccreditation: React.FC = () => {
  const { user, switchRole } = useAuth();
  const [accreditedManagers, setAccreditedManagers] = useState<{ [key: string]: boolean }>({
    'patrick': false,
  });

  const toggleManagerAccreditation = (managerKey: string) => {
    if (user?.role !== 'ADMIN') {
      alert("Action refusée : Seul un Administrateur est habilité à accréditer ou révoquer les gérants.");
      return;
    }
    const current = accreditedManagers[managerKey];
    setAccreditedManagers({ ...accreditedManagers, [managerKey]: !current });
    alert(`Accréditation ${!current ? 'accordée' : 'révoquée'} pour Patrick Mukendi !`);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Paramètres, RBAC & Accréditations</h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Gouvernance des accès à l'Interface de Gestion et traçabilité des opérations sensibles
        </p>
      </div>

      {/* Règle de gouvernance & Accréditation Gérants */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-blue-600" />
          <h2 className="text-sm font-bold text-slate-900">
            Accréditation des Gérants pour l'Interface de Gestion
          </h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Conformément au cahier des charges : <em>« L'accès à l'Interface de Gestion n'est pas automatique : l'Administrateur accrédite les Gérants qui doivent y avoir accès. Un Gérant non accrédité conserve son tableau de bord et ses consultations habituelles sans les fonctions d'administration. »</em>
        </p>

        <div className="border border-slate-200 rounded-xl overflow-hidden mt-4">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-[10px] tracking-wider border-b border-slate-200">
              <tr>
                <th className="px-5 py-3">Gérant</th>
                <th className="px-4 py-3">Rôle</th>
                <th className="px-4 py-3">État Accréditation</th>
                <th className="px-5 py-3 text-right">Action Administrateur</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <tr className="hover:bg-slate-50/70">
                <td className="px-5 py-4">
                  <div className="font-bold text-slate-900">Patrick Mukendi</div>
                  <div className="text-[11px] text-slate-400">gerant@monxy.cd • Siège Gombe</div>
                </td>
                <td className="px-4 py-4">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    GÉRANT
                  </span>
                </td>
                <td className="px-4 py-4">
                  {accreditedManagers['patrick'] ? (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Accrédité (Accès Espace B débloqué)
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                      <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                      Non accrédité (Accès Espace B restreint)
                    </span>
                  )}
                </td>
                <td className="px-5 py-4 text-right">
                  {user?.role === 'ADMIN' ? (
                    <button
                      onClick={() => toggleManagerAccreditation('patrick')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                        accreditedManagers['patrick']
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-2xs'
                      }`}
                    >
                      {accreditedManagers['patrick'] ? 'Révoquer l’accréditation' : 'Accréditer ce Gérant'}
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400 italic">
                      Réservé à l'Administrateur
                    </span>
                  )}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Journal d'audit des opérations sensibles */}
      <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center gap-2">
          <History className="w-5 h-5 text-indigo-600" />
          <h2 className="text-sm font-bold text-slate-900">Journal d'Audit des Actions Sensibles (Sécurité)</h2>
        </div>

        <div className="space-y-2 text-xs">
          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">GRANT_ACCREDITATION</span>
              <p className="text-[11px] text-slate-500">
                Jean-Paul Mukendi (Admin) a validé les droits de pilotage pour Patrick Mukendi
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">14/03/2025 14:12 • IP 192.168.1.42</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">CREATE_INVOICE</span>
              <p className="text-[11px] text-slate-500">
                Émission de la facture FAC-2025-092 d'un montant de 4 800,00 $ TTC (ETS Congo Tech Distribution Gombe)
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">14/03/2025 11:45 • IP 192.168.1.18</span>
          </div>

          <div className="p-3 rounded-lg border border-slate-100 bg-slate-50 flex items-center justify-between">
            <div>
              <span className="font-bold text-slate-900">STOCK_ADJUSTMENT</span>
              <p className="text-[11px] text-slate-500">
                Ajustement d'inventaire sur Terminal TPE PRD-003 : Quantité 4 -&gt; 3 (Alerte seuil activée)
              </p>
            </div>
            <span className="text-[10px] text-slate-400 font-mono">13/03/2025 17:30 • IP 192.168.1.15</span>
          </div>
        </div>
      </div>
    </div>
  );
};
