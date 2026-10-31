import React, { useState } from 'react';
import {
  Download,
  Plus,
  Search,
  RotateCcw,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  UserCheck,
} from 'lucide-react';

const EXPENSES = [
  {
    ref: 'DEP-2025-0084',
    date: '14 Mars 2025',
    fournisseur: 'Congo Carburant Express',
    sousTitre: 'Carburant groupe & flotte',
    categorie: 'Charges d’énergie & groupe',
    montant: '-1 850,00 $',
    reglement: 'Rawbank Virement',
    reglementType: 'bank',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
  {
    ref: 'DEP-2025-0083',
    date: '13 Mars 2025',
    fournisseur: 'Imprimerie Centrale de la Gombe',
    sousTitre: 'Fournitures & imprimés légaux',
    categorie: 'Fournitures d’exploitation',
    montant: '-620,00 $',
    reglement: 'Airtel Money Business',
    reglementType: 'mobile',
    justificatif: 'Reçu provisoire',
    isConforme: false,
  },
  {
    ref: 'DEP-2025-0082',
    date: '12 Mars 2025',
    fournisseur: 'Vodacom Congo RDC',
    sousTitre: 'Fibre optique & forfaits flotte',
    categorie: 'Télécoms & IT',
    montant: '-450,00 $',
    reglement: 'M-Pesa Pro',
    reglementType: 'mobile',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
  {
    ref: 'DEP-2025-0081',
    date: '11 Mars 2025',
    fournisseur: 'Société Nationale d’Électricité (SNEL)',
    sousTitre: 'Moyenne tension Gombe',
    categorie: 'Électricité',
    montant: '-980,00 $',
    reglement: 'Rawbank Virement',
    reglementType: 'bank',
    justificatif: 'Bordereau bancaire',
    isConforme: true,
  },
  {
    ref: 'DEP-2025-0080',
    date: '10 Mars 2025',
    fournisseur: 'Kinshasa Sécurité & Gardiennage SARL',
    sousTitre: 'Prestation mensuelle gardiennage',
    categorie: 'Sécurité & Locaux',
    montant: '-1 200,00 $',
    reglement: 'Espèces Caisse centrale',
    reglementType: 'cash',
    justificatif: 'Facture normalisée DGI',
    isConforme: true,
  },
];

export const Expenses: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1">
          Comptabilité &gt; Dépenses &gt; <span className="text-slate-600">Kinshasa • Siège Gombe</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestion des Dépenses & Décaissements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Contrôle des achats, charges opérationnelles et justificatifs fiscaux en RDC / OHADA.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Export FEC / Dépenses</span>
            </button>
            <button
              onClick={() => alert('Ouverture du formulaire d’enregistrement d’une dépense')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Nouvelle dépense</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Total Dépenses du Mois</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">28 450 $</div>
          <div className="flex items-center gap-1 text-[11px] text-emerald-600 font-bold mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>88.9% dans le budget (32 000 $)</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Achats & Fournisseurs RDC</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">16 800 $</div>
          <div className="text-[11px] text-slate-500 font-medium mt-2">
            59% du volume • Kinshasa & provinces
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Exploitation & Salaires</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">8 950 $</div>
          <div className="text-[11px] text-slate-600 font-medium mt-2">
            +3.4% vs mois précédent
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <span className="text-xs text-slate-500 font-semibold">Frais Bancaires & Télécoms</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">2 700 $</div>
          <div className="text-[11px] text-slate-500 font-medium mt-2">
            Stable • Vodacom, Airtel, Rawbank
          </div>
        </div>
      </div>

      {/* Main Grid: Table Left, Fiscal & Validation Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filters & Table (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          {/* Filters Bar */}
          <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 flex-1 max-w-xs">
              <div className="relative w-full">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Rechercher référence, N°..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <select className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white">
                <option>Catégorie (Toutes)</option>
                <option>Charges d'énergie</option>
                <option>Fournitures</option>
                <option>Télécoms & IT</option>
              </select>
              <select className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white">
                <option>Statut (Tous)</option>
                <option>Validée</option>
                <option>En attente visa</option>
              </select>
              <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[700px]">
                <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Réf & Date</th>
                    <th className="px-4 py-3">Fournisseur</th>
                    <th className="px-4 py-3">Catégorie</th>
                    <th className="px-4 py-3 text-right">Montant ($)</th>
                    <th className="px-4 py-3">Règlement</th>
                    <th className="px-4 py-3">Justificatif DGI</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {EXPENSES.map((exp, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-blue-700 font-mono">{exp.ref}</div>
                        <div className="text-[11px] text-slate-400">{exp.date}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{exp.fournisseur}</div>
                        <div className="text-[10px] text-slate-400">{exp.sousTitre}</div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span className="text-[11px] font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          {exp.categorie}
                        </span>
                      </td>
                      <td className="px-4 py-3.5 text-right font-extrabold text-rose-600">
                        {exp.montant}
                      </td>
                      <td className="px-4 py-3.5 text-slate-600 font-medium">
                        {exp.reglement}
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                            exp.isConforme
                              ? 'bg-blue-50 text-blue-700 border-blue-100'
                              : 'bg-amber-50 text-amber-700 border-amber-200'
                          }`}
                        >
                          {exp.justificatif}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="p-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500 font-medium">
              <span>Affichage de 1 à 5 sur 84 décaissements</span>
              <span className="font-bold text-slate-800">Sous-total période : 5 100,00 $</span>
            </div>
          </div>
        </div>

        {/* Right Column: Fiscal Rules & Validation (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          {/* Contrôle Fiscal & DGI */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-blue-600" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Contrôle Fiscal & DGI
                </h3>
              </div>
              <span className="text-[10px] font-extrabold bg-blue-50 text-blue-700 px-2 py-0.5 rounded border border-blue-100">
                Actif
              </span>
            </div>
            <p className="text-[11px] text-slate-400">Conformité DGI RDC • OHADA</p>

            <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg text-xs space-y-1">
              <div className="font-bold text-blue-900">Règle des Retenues à la Source :</div>
              <p className="text-[11px] text-slate-600 leading-relaxed">
                Pour tout fournisseur de services sans NIF valide actif répertorié au registre DGI, appliquer impérativement l’<strong>IPR/Prestations de 14%</strong> en retenue à la source avant décaissement.
              </p>
            </div>

            <div className="border-t border-slate-100 pt-3 space-y-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Alertes justificatifs du dossier (2)</p>

              <div className="p-2.5 rounded-lg border border-amber-200 bg-amber-50/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">DEP-2025-0083</span>
                  <span className="text-[10px] font-bold text-amber-700">Reçu Provisoire</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Imprimerie Centrale : Facture définitive avec NIF A082914X manquante. Risque de rejet en charge déductible.
                </p>
                <button className="text-[11px] font-bold text-blue-600 hover:underline mt-1 block">
                  Relancer le fournisseur via WhatsApp →
                </button>
              </div>

              <div className="p-2.5 rounded-lg border border-emerald-200 bg-emerald-50/30 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800">Vodacom Congo (Fibre)</span>
                  <span className="text-[10px] font-bold text-emerald-700">TVA 16% Déductible</span>
                </div>
                <p className="text-[11px] text-slate-600 mt-1">
                  Facture électronique validée. Montant TVA récupérable : <strong>62,07 $</strong> prêt pour déclaration.
                </p>
              </div>
            </div>

            <button
              onClick={() => alert('Conseiller Fiscal IA activé')}
              className="w-full py-2 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Conseiller Comptable IA</span>
            </button>
          </div>

          {/* Circuit de Validation */}
          <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                Circuit de validation
              </h3>
              <UserCheck className="w-4 h-4 text-slate-400" />
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-xs">
                    PM
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Patrick Mukendi</div>
                    <div className="text-[10px] text-slate-400">Gérant • Plafond illimité</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                  1 en attente
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-xs">
                    MK
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Mireille Kabongo</div>
                    <div className="text-[10px] text-slate-400">Comptable senior • Visa</div>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  0 en attente
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
