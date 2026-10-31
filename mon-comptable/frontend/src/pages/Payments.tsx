import React, { useState } from 'react';
import {
  Download,
  Plus,
  Search,
  SlidersHorizontal,
  CheckCircle2,
  ArrowDownLeft,
  ArrowUpRight,
  Wallet,
  Smartphone,
  ShieldCheck,
  RefreshCw,
  Sparkles,
  CreditCard,
  Building2,
  X,
} from 'lucide-react';

interface PaymentRecord {
  id: string;
  date: string;
  time: string;
  type: 'ENCAISSEMENT' | 'DECAISSEMENT';
  tiers: string;
  tiersSub: string;
  location: string;
  piece: string;
  pieceSub: string;
  amount: string;
  amountCdf: string;
  isPositive: boolean;
  canal: string;
  canalDetail: string;
  canalIcon: 'mpesa' | 'rawbank' | 'bcdc' | 'orange' | 'cash';
}

const PAYMENTS_DATA: PaymentRecord[] = [
  {
    id: 'PAY-2025-0310',
    date: '15/03/2025',
    time: '16:10',
    type: 'ENCAISSEMENT',
    tiers: 'Boutique Élégance Kinshasa',
    tiersSub: 'Commerce de Détail • Caisse POS',
    location: 'Kinshasa - Gombe',
    piece: 'FAC-2025-095',
    pieceSub: 'Règlement comptant caisse',
    amount: '+450,00 $',
    amountCdf: 'CDF 1 282 500',
    isPositive: true,
    canal: 'Espèces / Cash',
    canalDetail: 'Caisse Principale Kinshasa (571100)',
    canalIcon: 'cash',
  },
  {
    id: 'PAY-2025-0309',
    date: '14/03/2025',
    time: '15:42',
    type: 'ENCAISSEMENT',
    tiers: 'Dieudonné Tshisekedi',
    tiersSub: 'Client Particulier',
    location: 'Kinshasa - Gombe',
    piece: 'FAC-2025-092',
    pieceSub: 'Solde complet',
    amount: '+1 850,00 $',
    amountCdf: 'CDF 5 272 500',
    isPositive: true,
    canal: 'M-Pesa',
    canalDetail: 'Vodacom Congo',
    canalIcon: 'mpesa',
  },
  {
    id: 'PAY-2025-0308',
    date: '14/03/2025',
    time: '14:15',
    type: 'DECAISSEMENT',
    tiers: 'Congo Carburant Express',
    tiersSub: 'Fournisseur Hydrocarbures',
    location: 'Lubumbashi',
    piece: 'DEP-2025-084',
    pieceSub: 'Plein flotte logistique',
    amount: '-1 850,00 $',
    amountCdf: 'CDF 5 272 500',
    isPositive: false,
    canal: 'Rawbank',
    canalDetail: 'Virement Swift Pro',
    canalIcon: 'rawbank',
  },
  {
    id: 'PAY-2025-0307',
    date: '14/03/2025',
    time: '11:30',
    type: 'ENCAISSEMENT',
    tiers: 'Entreprise Katanga Mining Services',
    tiersSub: 'Grand Compte B2B',
    location: 'Kolwezi',
    piece: 'FAC-2025-089',
    pieceSub: 'Acompte contrat 40%',
    amount: '+4 200,00 $',
    amountCdf: 'CDF 11 970 000',
    isPositive: true,
    canal: 'Rawbank',
    canalDetail: 'Virement Swift',
    canalIcon: 'rawbank',
  },
  {
    id: 'PAY-2025-0306',
    date: '13/03/2025',
    time: '16:50',
    type: 'ENCAISSEMENT',
    tiers: 'Société Congo Telecom & Tech',
    tiersSub: 'Client Entreprise',
    location: 'Kinshasa - Limete',
    piece: 'FAC-2025-081',
    pieceSub: 'Prestation trimestrielle',
    amount: '+8 500,00 $',
    amountCdf: 'CDF 24 225 000',
    isPositive: true,
    canal: 'Equity BCDC',
    canalDetail: 'Virement RTGS',
    canalIcon: 'bcdc',
  },
  {
    id: 'PAY-2025-0305',
    date: '13/03/2025',
    time: '10:20',
    type: 'DECAISSEMENT',
    tiers: 'Vodacom Congo RDC',
    tiersSub: 'Télécom • Lignes Fibre Pro',
    location: 'Kinshasa',
    piece: 'DEP-2025-082',
    pieceSub: 'Abonnement Data Mars',
    amount: '-450,00 $',
    amountCdf: 'CDF 1 282 500',
    isPositive: false,
    canal: 'Orange Money',
    canalDetail: 'Passerelle Marchande',
    canalIcon: 'orange',
  },
];

export const Payments: React.FC = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>(PAYMENTS_DATA);
  const [activeTab, setActiveTab] = useState<'all' | 'encaissements' | 'decaissements'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [showManualModal, setShowManualModal] = useState(false);

  // Formulaire d'enregistrement de paiement manuel
  const [manualType, setManualType] = useState<'ENCAISSEMENT' | 'DECAISSEMENT'>('ENCAISSEMENT');
  const [manualTiers, setManualTiers] = useState('Dieudonné Tshisekedi');
  const [manualPiece, setManualPiece] = useState('FAC-2025-092');
  const [manualAmount, setManualAmount] = useState('1850');
  const [manualCanal, setManualCanal] = useState('M-Pesa');

  const handleSaveManualPayment = (e: React.FormEvent) => {
    e.preventDefault();
    const nextId = `PAY-2025-0${310 + payments.length - 5}`;
    const amountNum = Number(manualAmount);
    const amountCdf = `CDF ${(amountNum * 2850).toLocaleString()}`;
    const newRecord: PaymentRecord = {
      id: nextId,
      date: '15/03/2025',
      time: '14:20',
      type: manualType,
      tiers: manualTiers,
      tiersSub: manualType === 'ENCAISSEMENT' ? 'Client Enregistré' : 'Fournisseur Référencé',
      location: 'Kinshasa - Gombe',
      piece: manualPiece,
      pieceSub: 'Paiement direct validé',
      amount: manualType === 'ENCAISSEMENT' ? `+${amountNum.toLocaleString()},00 $` : `-${amountNum.toLocaleString()},00 $`,
      amountCdf,
      isPositive: manualType === 'ENCAISSEMENT',
      canal: manualCanal,
      canalDetail:
        manualCanal.includes('Espèces')
          ? 'Caisse Principale Kinshasa (571100)'
          : manualCanal.includes('M-Pesa')
          ? 'Vodacom Congo'
          : manualCanal.includes('Rawbank')
          ? 'Virement Swift'
          : manualCanal.includes('Orange')
          ? 'Orange Money RDC'
          : 'Equity RTGS',
      canalIcon:
        manualCanal.includes('Espèces')
          ? 'cash'
          : manualCanal.includes('M-Pesa')
          ? 'mpesa'
          : manualCanal.includes('Rawbank')
          ? 'rawbank'
          : manualCanal.includes('Orange')
          ? 'orange'
          : 'bcdc',
    };
    setPayments([newRecord, ...payments]);
    setShowManualModal(false);
    alert(`Règlement ${nextId} de ${manualAmount} $ enregistré avec succès !`);
  };

  const filteredPayments = payments.filter((p) => {
    if (activeTab === 'encaissements' && p.type !== 'ENCAISSEMENT') return false;
    if (activeTab === 'decaissements' && p.type !== 'DECAISSEMENT') return false;
    if (searchTerm) {
      const match =
        p.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.tiers.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.piece.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.canal.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header (Exactement conforme à l'image 2) */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1 flex items-center gap-1.5">
          <span>Comptabilité</span>
          <span>&gt;</span>
          <span className="text-blue-700 font-bold">Paiements</span>
          <span className="text-slate-500 font-medium">Kinshasa (UTC+1)</span>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Règlement & Historique des Paiements
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Suivi des encaissements clients, décaissements fournisseurs et passerelles Mobile Money (RDC)
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => alert('Rapprochement bancaire automatique lancé : 98.2% des écritures pointées.')}
              className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs"
            >
              <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
              <span>Rapprochement bancaire auto</span>
            </button>

            <button
              onClick={() => setShowManualModal(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Enregistrer un paiement manuel</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 KPI Cards (Conformes à l'image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Paiements Reçus</span>
            <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <ArrowDownLeft className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            42 850,00 <span className="text-xs font-normal text-blue-600 font-bold">$ USD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700">38 transactions</span>
            <span className="text-emerald-600 font-bold">+18.4% vs M-1</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Total Décaissements Émis</span>
            <div className="w-7 h-7 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center">
              <ArrowUpRight className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            28 450,00 <span className="text-xs font-normal text-rose-600 font-bold">$ USD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
            <span className="font-bold text-slate-700">22 transactions</span>
            <span className="text-slate-500">Budget maîtrisé</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Solde Net d'Exploitation</span>
            <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-blue-700 mt-1">
            +14 400,00 <span className="text-xs font-normal text-slate-600 font-bold">$ USD</span>
          </div>
          <div className="flex items-center justify-between text-[11px] font-medium mt-3 pt-2 border-t border-slate-100">
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">Cash-flow positif</span>
            <span className="text-slate-400 font-mono">CDF ~41 040 000</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Taux de succès Passerelles</span>
            <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold text-slate-900 mt-1">
            99.2% <span className="text-xs font-normal text-slate-400">Mobile Money</span>
          </div>
          <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium mt-3 pt-2 border-t border-slate-100">
            <span className="text-slate-700">Kinshasa • Lubumbashi</span>
            <span className="text-emerald-600 font-bold flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Actif
            </span>
          </div>
        </div>
      </div>

      {/* Gateway Status Banner (Exactement conforme à l'image 2) */}
      <div className="bg-gradient-to-r from-blue-50/70 via-indigo-50/50 to-slate-50 p-3.5 rounded-xl border border-blue-100/80 shadow-2xs flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
            ⚡
          </div>
          <div>
            <span className="font-bold text-slate-900 block">État des passerelles télécoms & bancaires RDC</span>
            <span className="text-[11px] text-slate-500">Temps réel • Switch monétique national & APIs directes</span>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-slate-700">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>M-Pesa API</span>
            <span className="text-[10px] text-slate-400 font-mono">18ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" />
            <span>Airtel Money Switch</span>
            <span className="text-[10px] text-slate-400 font-mono">24ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Orange Money Core</span>
            <span className="text-[10px] text-slate-400 font-mono">32ms</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span>Rawbank • Equity BCDC</span>
            <span className="text-[10px] text-emerald-700 font-bold">Connecté</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto text-xs font-semibold">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              activeTab === 'all'
                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tous les paiements (60)
          </button>
          <button
            onClick={() => setActiveTab('encaissements')}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              activeTab === 'encaissements'
                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Encaissements Clients (38)
          </button>
          <button
            onClick={() => setActiveTab('decaissements')}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              activeTab === 'decaissements'
                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            Décaissements Fournisseurs (22)
          </button>
        </div>

        {/* Search & Export */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Filtrer ID, tiers, facture..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-white border border-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-500 w-52"
            />
          </div>

          <button className="p-1.5 bg-white border border-slate-200 rounded-lg text-slate-500 hover:bg-slate-50">
            <SlidersHorizontal className="w-3.5 h-3.5" />
          </button>

          <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-1.5 rounded-lg shadow-2xs">
            <Download className="w-3.5 h-3.5" />
            <span>Export FEC/CSV</span>
          </button>
        </div>
      </div>

      {/* Main Table Paiements */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">ID TRANS. & DATE</th>
                <th className="px-4 py-3">TYPE FLUX</th>
                <th className="px-5 py-3">TIERS CONCERNÉ (RDC)</th>
                <th className="px-5 py-3">PIÈCE ASSOCIÉE</th>
                <th className="px-4 py-3 text-right">MONTANT ($ USD)</th>
                <th className="px-5 py-3">CANAL & OPÉRATEUR</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredPayments.map((item, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-blue-700 font-mono">{item.id}</div>
                    <div className="text-[11px] text-slate-400">{item.date} {item.time}</div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                        item.type === 'ENCAISSEMENT'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-rose-50 text-rose-700 border-rose-200'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          item.type === 'ENCAISSEMENT' ? 'bg-blue-600' : 'bg-rose-600'
                        }`}
                      />
                      {item.type === 'ENCAISSEMENT' ? 'Encaissement Client' : 'Règlement Fournisseur'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-slate-900">{item.tiers}</div>
                    <div className="text-[11px] text-slate-400">
                      {item.tiersSub} • 📍 {item.location}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-blue-600 hover:underline cursor-pointer">
                      {item.piece}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      {item.pieceSub}
                    </div>
                  </td>
                  <td className="px-4 py-3.5 text-right">
                    <div
                      className={`font-extrabold text-sm ${
                        item.isPositive ? 'text-emerald-600' : 'text-rose-600'
                      }`}
                    >
                      {item.amount}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {item.amountCdf}
                    </div>
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-6 h-6 rounded-md flex items-center justify-center font-bold text-white text-[10px] ${
                          item.canalIcon === 'cash'
                            ? 'bg-emerald-600'
                            : item.canalIcon === 'mpesa'
                            ? 'bg-rose-600'
                            : item.canalIcon === 'rawbank'
                            ? 'bg-blue-700'
                            : item.canalIcon === 'bcdc'
                            ? 'bg-indigo-700'
                            : 'bg-amber-500'
                        }`}
                      >
                        {item.canalIcon === 'cash' ? '$' : item.canalIcon === 'mpesa' ? 'V' : item.canalIcon === 'rawbank' ? 'R' : item.canalIcon === 'bcdc' ? 'E' : 'O'}
                      </div>
                      <div>
                        <div className="font-bold text-slate-800">{item.canal}</div>
                        <div className="text-[10px] text-slate-400">{item.canalDetail}</div>
                      </div>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination & Footer note */}
        <div className="p-4 bg-slate-50/50 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-slate-500 font-medium">
          <div>
            <span>Affichage de <strong>1 à 5 sur 60</strong> paiements enregistrés</span>
            <span className="text-slate-400 ml-2">• Taux de change d'imputation : 1 USD = 2 850 CDF</span>
          </div>

          <div className="flex items-center gap-1">
            <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-400">Précédent</button>
            <button className="px-2.5 py-1 bg-blue-600 text-white rounded font-bold">1</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100">2</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100">3</button>
            <span className="px-1 text-slate-400">...</span>
            <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100">12</button>
            <button className="px-2.5 py-1 border border-slate-200 rounded text-slate-600 hover:bg-slate-100">Suivant</button>
          </div>
        </div>
      </div>

      {/* 3 Bottom Security & Compliance Cards (Conformes à l'image 2) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Conformité DGI & Reçus Sécurisés</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Chaque transaction Mobile Money dispose de son empreinte cryptographique conforme à la loi des finances RDC pour déductibilité TVA.
          </p>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <RefreshCw className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Double Affichage Bimonétaire</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Tenue légale du grand livre en USD et contre-valeur automatique en Franc Congolais (CDF) selon le cours officiel journalier BCC.
          </p>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs space-y-2">
          <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-xs font-bold text-slate-900">Rapprochement Intelligent IA</h3>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            96% des flux reçus via M-Pesa, Airtel et Rawbank sont automatiquement associés à leurs factures de vente sous 12 secondes.
          </p>
        </div>
      </div>

      {/* Floating Assistant IA Button (Exactement comme dans la capture) */}
      <div className="fixed bottom-6 right-8 z-40">
        <button
          onClick={() => alert('Conseiller Comptable IA : Rapprochement en direct activé sur 60 règlements.')}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-xs px-4 py-3 rounded-full shadow-xl hover:shadow-2xl transition-all"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Conseiller Comptable IA</span>
        </button>
      </div>

      {/* Modal / Drawer Enregistrer un paiement manuel */}
      {showManualModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in">
          <div className="w-full max-w-full sm:max-w-md bg-white h-full shadow-2xl p-4 sm:p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <form onSubmit={handleSaveManualPayment} className="space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enregistrer un paiement manuel</h3>
                  <p className="text-xs text-slate-400">Règlement direct ou déblocage virement</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Type de flux</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setManualType('ENCAISSEMENT')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      manualType === 'ENCAISSEMENT'
                        ? 'bg-blue-50 border-blue-600 text-blue-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Encaissement Client
                  </button>
                  <button
                    type="button"
                    onClick={() => setManualType('DECAISSEMENT')}
                    className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                      manualType === 'DECAISSEMENT'
                        ? 'bg-rose-50 border-rose-600 text-rose-700 shadow-2xs'
                        : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Règlement Fournisseur
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Tiers concerné</label>
                <input
                  type="text"
                  required
                  value={manualTiers}
                  onChange={(e) => setManualTiers(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold text-slate-800"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Pièce associée (Facture ou Dépense)</label>
                <input
                  type="text"
                  required
                  value={manualPiece}
                  onChange={(e) => setManualPiece(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-mono font-bold text-blue-700"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Montant ($ USD)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={manualAmount}
                    onChange={(e) => setManualAmount(e.target.value)}
                    className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-extrabold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Équivalent Franc Congolais</label>
                  <input
                    type="text"
                    disabled
                    value={`CDF ${(Number(manualAmount) * 2850).toLocaleString()}`}
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2.5 text-xs font-mono text-slate-500 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Canal & Opérateur</label>
                <select
                  value={manualCanal}
                  onChange={(e) => setManualCanal(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold"
                >
                  <option>M-Pesa (Vodacom Congo)</option>
                  <option>Rawbank (Virement Swift)</option>
                  <option>Equity BCDC (RTGS)</option>
                  <option>Orange Money RDC</option>
                  <option>Airtel Money Business</option>
                  <option>Caisse centrale Espèces</option>
                </select>
              </div>

              <div className="p-3 bg-blue-50 border border-blue-100 rounded-lg text-xs space-y-1">
                <span className="font-bold text-blue-900">Lettrage automatique garanti :</span>
                <p className="text-[11px] text-blue-800">
                  L'écriture mettra à jour instantanément le solde de la pièce {manualPiece} et la trésorerie disponible.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
                >
                  Valider le règlement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
