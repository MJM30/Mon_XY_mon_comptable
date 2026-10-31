import React, { useState } from 'react';
import {
  Download,
  Lock,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  Sparkles,
  ArrowUpRight,
  ArrowDownRight,
  Scale,
  Building2,
  ShieldCheck,
  ChevronRight,
  FileSpreadsheet,
} from 'lucide-react';

interface JournalEntry {
  ref: string;
  date: string;
  time: string;
  flux: 'ENTRANT' | 'SORTANT' | 'VIREMENT INT.';
  tiers: string;
  location: string;
  nif?: string;
  libelle: string;
  piece: string;
  compteOhada: string;
  compteNom: string;
}

const JOURNAL_ENTRIES: JournalEntry[] = [
  {
    ref: 'TRX-2025-0842',
    date: '14/03/2025',
    time: '16:10',
    flux: 'ENTRANT',
    tiers: 'Katanga Mining Services SARL',
    location: 'Kolwezi (Lualaba)',
    nif: 'A0821943X',
    libelle: 'Solde prestation audit technique site',
    piece: 'Facture FAC-2025-089',
    compteOhada: '411000',
    compteNom: 'Clients ordinaires',
  },
  {
    ref: 'TRX-2025-0841',
    date: '14/03/2025',
    time: '14:15',
    flux: 'SORTANT',
    tiers: 'Congo Carburant Express',
    location: 'Lubumbashi (Haut-Katanga)',
    libelle: 'Carburant gasoil pour groupes générateurs Gombe',
    piece: 'Dépense DEP-2025-084',
    compteOhada: '606100',
    compteNom: 'Fournitures non stockées (Énergie)',
  },
  {
    ref: 'TRX-2025-0840',
    date: '14/03/2025',
    time: '11:45',
    flux: 'ENTRANT',
    tiers: 'Dieudonné Tshisekedi & Associés',
    location: 'Kinshasa - Gombe',
    libelle: 'Encaissement Honoraires de conseil fiscal',
    piece: 'Facture FAC-2025-092',
    compteOhada: '411000',
    compteNom: 'Clients',
  },
  {
    ref: 'TRX-2025-0839',
    date: '13/03/2025',
    time: '17:20',
    flux: 'VIREMENT INT.',
    tiers: 'Caisse Centrale ➔ Rawbank USD',
    location: 'Agence Rawbank Victoire (Kinshasa)',
    libelle: 'Dépôt d’espèces physiques en coffre bancaire',
    piece: 'Bordereau #BR-94021',
    compteOhada: '585000',
    compteNom: 'Virements internes OHADA',
  },
  {
    ref: 'TRX-2025-0838',
    date: '13/03/2025',
    time: '15:30',
    flux: 'SORTANT',
    tiers: 'SNEL (Sté Nationale d’Électricité)',
    location: 'Kinshasa - Limete Industriel',
    libelle: 'Facture moyenne tension usine Limete',
    piece: 'SNEL-2025-MT-0418',
    compteOhada: '605100',
    compteNom: 'Électricité industrielle',
  },
  {
    ref: 'TRX-2025-0837',
    date: '12/03/2025',
    time: '09:15',
    flux: 'ENTRANT',
    tiers: 'Supermarché Express Limete BTP SARL',
    location: 'Kinshasa - Limete',
    libelle: 'Acompte projet voirie urbaine tranche 1',
    piece: 'Facture FAC-2025-087',
    compteOhada: '411000',
    compteNom: 'Clients ordinaires',
  },
];

export const Transactions: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'all' | 'entrants' | 'sortants' | 'virements' | 'rapprocher'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedAccount, setSelectedAccount] = useState('all');

  const filteredEntries = JOURNAL_ENTRIES.filter((e) => {
    if (activeTab === 'entrants' && e.flux !== 'ENTRANT') return false;
    if (activeTab === 'sortants' && e.flux !== 'SORTANT') return false;
    if (activeTab === 'virements' && e.flux !== 'VIREMENT INT.') return false;
    if (searchTerm) {
      const match =
        e.ref.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.tiers.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.libelle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        e.compteOhada.includes(searchTerm);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header (Exactement conforme à l'image 1) */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5 uppercase">
          <span>COMPTABILITÉ & FINANCE</span>
          <span>&gt;</span>
          <span className="text-blue-700 font-bold">GRAND LIVRE & JOURNAL GÉNÉRAL</span>
          <span>&gt;</span>
          <span className="text-slate-600">EXERCICE 2025</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Journal Général des Écritures
              </h1>
              <span className="bg-blue-50 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                SYSCOHADA Révisé (RDC)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Audit en temps réel des transactions multidevises • Taux indicatif BCC : <strong>1 USD = 2 850,00 CDF</strong>
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Exporter FEC / Audit (CSV)</span>
            </button>
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
              <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
              <span>Grand Livre (Excel/PDF)</span>
            </button>
            <button
              onClick={() => alert('Clôture journalière effectuée avec génération des empreintes SHA-256.')}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Clôture Journalière</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards (Exactement comme dans la capture) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Volume Total Transigé</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            71 300,00 <span className="text-xs font-normal text-slate-400">$ USD</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">= 203 205 000,00 CDF</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            <span>60 opérations</span>
            <span>Période : Mars 2025</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Flux Entrants (Crédits)</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-emerald-600 mt-1">
            +42 850,00 <span className="text-xs font-normal text-slate-400">$ USD</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">= 122 122 500,00 CDF</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            <span className="text-emerald-700 font-bold">28 encaissements</span>
            <span className="text-emerald-600 font-bold">+14.2% vs M-1</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Flux Sortants (Débits)</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowDownRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-rose-600 mt-1">
            -28 450,00 <span className="text-xs font-normal text-slate-400">$ USD</span>
          </div>
          <p className="text-[11px] text-slate-400 font-mono mt-0.5">= 81 082 500,00 CDF</p>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-2 pt-2 border-t border-slate-100">
            <span className="text-rose-700 font-bold">32 décaissements</span>
            <span className="text-slate-500">-3.8% d'économies</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Rapprochement Bancaire</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            98.2% <span className="text-xs font-normal text-slate-400">59 / 60 lettrées</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-indigo-600 h-full rounded-full" style={{ width: '98.2%' }} />
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium mt-2 pt-2 border-t border-slate-100">
            <span className="text-indigo-700 font-bold">✓ Audit OHADA</span>
            <span className="text-slate-400">Écart : 0,00 $</span>
          </div>
        </div>
      </div>

      {/* Middle Status Bars : Partie Double Conforme & Soldes par compte */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Partie Double Conforme (5 cols) */}
        <div className="lg:col-span-5 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <Scale className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-sm">Partie Double Conforme</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-extrabold px-1.5 py-0.2 rounded border border-emerald-100">
                ÉQUILIBRÉ
              </span>
            </div>
            <p className="text-xs text-slate-600">
              Total Débits = Total Crédits • Écart de balance : <strong className="text-emerald-700">0,00 $ USD (0 CDF)</strong>
            </p>
            <div className="text-[10px] text-blue-700 font-bold">
              AUDIT DGI KINSHASA : <strong>Certifié SYSCOHADA</strong>
            </div>
          </div>
        </div>

        {/* Solde disponible par compte (7 cols) */}
        <div className="lg:col-span-7 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="flex items-center justify-between text-xs pb-1 border-b border-slate-100">
            <span className="font-bold text-slate-700 uppercase tracking-wide text-[10px]">
              Solde disponible par compte (Clôture provisoire)
            </span>
            <button className="text-blue-600 font-bold hover:underline text-[11px]">Voir relevés →</button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Rawbank USD</span>
              <div className="font-bold text-slate-900">34 120,50 $</div>
              <span className="text-[9px] text-blue-700 font-semibold block">Actif • #40101</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Equity BCDC</span>
              <div className="font-bold text-slate-900">18 450,00 $</div>
              <span className="text-[9px] text-blue-700 font-semibold block">Actif • #40206</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">M-Pesa Vodacom</span>
              <div className="font-bold text-slate-900">6 840,00 $</div>
              <span className="text-[9px] text-emerald-700 font-semibold block">API Live RDC</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-400 block">Caisse Gombe</span>
              <div className="font-bold text-slate-900">4 180,00 $</div>
              <span className="text-[9px] text-amber-700 font-semibold block">Espèces physiques</span>
            </div>
          </div>
        </div>
      </div>

      {/* Filters Toolbar & Tabs */}
      <div className="space-y-3">
        <div className="bg-white p-3 rounded-xl border border-slate-200/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 flex-1 max-w-sm">
            <div className="relative w-full">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Rechercher par référence, libellé, NIF, tiers, compte OHADA..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 text-xs rounded-lg pl-8 pr-12 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <span className="absolute right-2.5 top-1/2 -translate-y-1/2 bg-white text-slate-400 border border-slate-200 text-[10px] px-1 py-0.2 rounded font-mono">
                ⌘K
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <select
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
              className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white"
            >
              <option value="all">Tous les comptes</option>
              <option value="rawbank">Rawbank USD (#40101)</option>
              <option value="bcdc">Equity BCDC (#40206)</option>
              <option value="mpesa">M-Pesa Vodacom Live</option>
              <option value="caisse">Caisse centrale Gombe</option>
            </select>

            <select className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-slate-700 bg-white">
              <option>Mars 2025</option>
              <option>Février 2025</option>
              <option>Janvier 2025</option>
            </select>

            <button className="p-1.5 border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
              <SlidersHorizontal className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Tab Badges */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg border transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Toutes les écritures (60)
          </button>
          <button
            onClick={() => setActiveTab('entrants')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'entrants'
                ? 'bg-emerald-600 border-emerald-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Entrants / Crédits (28)
          </button>
          <button
            onClick={() => setActiveTab('sortants')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'sortants'
                ? 'bg-rose-600 border-rose-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            Sortants / Débits (32)
          </button>
          <button
            onClick={() => setActiveTab('virements')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'virements'
                ? 'bg-indigo-600 border-indigo-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-indigo-500" />
            Virements internes (4)
          </button>
          <button
            onClick={() => setActiveTab('rapprocher')}
            className={`px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1.5 ${
              activeTab === 'rapprocher'
                ? 'bg-amber-600 border-amber-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            À rapprocher (1)
          </button>
        </div>
      </div>

      {/* Main Table Journal */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-4 py-3 w-8">
                  <input type="checkbox" className="rounded border-slate-300" />
                </th>
                <th className="px-4 py-3">RÉFÉRENCE & DATE</th>
                <th className="px-4 py-3 text-center">FLUX</th>
                <th className="px-5 py-3">TIERS & EMPLACEMENT</th>
                <th className="px-5 py-3">LIBELLÉ & JUSTIFICATIF</th>
                <th className="px-5 py-3">COMPTE OHADA</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredEntries.map((entry, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3.5">
                    <input type="checkbox" className="rounded border-slate-300" />
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-blue-700 font-mono">{entry.ref}</div>
                    <div className="text-[11px] text-slate-400">{entry.date} {entry.time}</div>
                  </td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        entry.flux === 'ENTRANT'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : entry.flux === 'SORTANT'
                          ? 'bg-rose-50 text-rose-700 border-rose-200'
                          : 'bg-indigo-50 text-indigo-700 border-indigo-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          entry.flux === 'ENTRANT'
                            ? 'bg-emerald-500'
                            : entry.flux === 'SORTANT'
                            ? 'bg-rose-500'
                            : 'bg-indigo-500'
                        }`}
                      />
                      {entry.flux}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{entry.tiers}</div>
                    <div className="text-[11px] text-slate-400">
                      📍 {entry.location} {entry.nif ? `• NIF ${entry.nif}` : ''}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-semibold text-slate-800">{entry.libelle}</div>
                    <div className="text-[11px] text-blue-600 font-medium hover:underline cursor-pointer">
                      📄 {entry.piece}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-bold text-slate-900">{entry.compteOhada}</div>
                    <div className="text-[11px] text-slate-400">{entry.compteNom}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Table Summary Footer */}
        <div className="p-4 bg-slate-50/60 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">TOTAL DÉBITS PÉRIODE :</span>
              <span className="text-rose-600 font-extrabold">28 450,00 $ USD</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">TOTAL CRÉDITS PÉRIODE :</span>
              <span className="text-emerald-600 font-extrabold">42 850,00 $ USD</span>
            </div>
            <div>
              <span className="text-slate-400 block text-[10px] uppercase">Solde Net de Trésorerie :</span>
              <span className="text-blue-700 font-extrabold">+14 400,00 $ USD (~41 040 000 CDF)</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-emerald-700 bg-emerald-50 text-[11px] font-bold px-2.5 py-1 rounded-full border border-emerald-200 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              Contrôle d'intégrité OHADA validé
            </span>
          </div>
        </div>
      </div>

      {/* Bottom Legal Notice & AI Assistant Bar */}
      <div className="p-4 bg-white rounded-xl border border-slate-200/80 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-slate-900">
              Journal des Opérations & Grand Livre conforme à la loi RDC N° 004/2001
            </h4>
            <p className="text-[11px] text-slate-500">
              Dernière synchronisation des écritures : Aujourd'hui à 16:12 par <strong>Patrick Mukendi</strong> • Signature numérique SHA-256 active.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 text-[11px] text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            DGI RDC Connecté
          </span>
          <button
            onClick={() => alert('Conseiller Comptable IA : Toutes les imputations sont conformes au plan SYSCOHADA.')}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Conseiller Comptable IA</span>
          </button>
        </div>
      </div>
    </div>
  );
};
