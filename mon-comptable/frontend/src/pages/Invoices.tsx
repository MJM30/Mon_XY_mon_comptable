import React, { useState } from 'react';
import {
  Download,
  Plus,
  Search,
  FileText,
  Clock,
  AlertCircle,
  CheckCircle2,
  Sparkles,
  Eye,
  Trash2,
  X,
  Send,
} from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceRow {
  id: number;
  number: string;
  issueDate: string;
  dueDate: string;
  client: string;
  clientDetails: string;
  ht: string;
  tva: string;
  ttc: string;
  status: 'Envoyée' | 'En retard' | 'Payée' | 'Partielle' | 'Brouillon';
  paiements: string;
}

const INVOICES_DATA: InvoiceRow[] = [
  {
    id: 1,
    number: 'FAC-2025-092',
    issueDate: '14/03/2025',
    dueDate: '14/04/2025',
    client: 'ETS Congo Tech Distribution Gombe',
    clientDetails: 'SARL • SIREN 839 201 129',
    ht: '4 000,00 $',
    tva: '800,00 $',
    ttc: '4 800,00 $',
    status: 'Envoyée',
    paiements: '0,00 $ réglé',
  },
  {
    id: 2,
    number: 'FAC-2025-089',
    issueDate: '10/03/2025',
    dueDate: '10/04/2025',
    client: 'Dieudonné Kasongo',
    clientDetails: 'Particulier • Client régulier',
    ht: '1 541,67 $',
    tva: '308,33 $',
    ttc: '1 850,00 $',
    status: 'En retard',
    paiements: 'Relance J+4 active',
  },
  {
    id: 3,
    number: 'FAC-2025-088',
    issueDate: '08/03/2025',
    dueDate: '08/04/2025',
    client: 'Chantal Mwamba',
    clientDetails: 'Consultante Freelance',
    ht: '2 400,00 $',
    tva: '480,00 $',
    ttc: '2 880,00 $',
    status: 'Payée',
    paiements: '100% payé (Virement)',
  },
  {
    id: 4,
    number: 'FAC-2025-087',
    issueDate: '05/03/2025',
    dueDate: '05/04/2025',
    client: 'Supermarché Express Limete',
    clientDetails: 'SAS • SIREN 910 442 811',
    ht: '5 500,00 $',
    tva: '1 100,00 $',
    ttc: '6 600,00 $',
    status: 'Partielle',
    paiements: '3 300 $ / 6 600 $',
  },
  {
    id: 5,
    number: 'FAC-2025-086',
    issueDate: '01/03/2025',
    dueDate: '01/04/2025',
    client: 'Pharmacie Grand Kasaï Gombe',
    clientDetails: 'SELARL • Facturation honoraires',
    ht: '1 200,00 $',
    tva: '240,00 $',
    ttc: '1 440,00 $',
    status: 'Brouillon',
    paiements: 'Non émise (en révision)',
  },
];

export const Invoices: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'Toutes' | 'Payée' | 'Partielle' | 'En retard' | 'Envoyée' | 'Brouillon'>('Toutes');
  const [invoices, setInvoices] = useState<InvoiceRow[]>(INVOICES_DATA);
  const [showCreateDrawer, setShowCreateDrawer] = useState(false);

  // Formulaire de création de facture
  const [selectedClient, setSelectedClient] = useState('ETS Congo Tech Distribution Gombe (SARL)');
  const [lineItems, setLineItems] = useState([
    { description: 'Prestation d’audit organisationnel', quantity: 2, unitPriceHt: 1200, vatRate: 20 },
    { description: 'Pack Maintenance & Support mensuel', quantity: 1, unitPriceHt: 450, vatRate: 20 },
  ]);

  const addLineItem = () => {
    setLineItems([
      ...lineItems,
      { description: 'Nouvelle prestation / article', quantity: 1, unitPriceHt: 500, vatRate: 20 },
    ]);
  };

  const removeLineItem = (index: number) => {
    if (lineItems.length > 1) {
      setLineItems(lineItems.filter((_, i) => i !== index));
    }
  };

  const calculateSubtotalHt = () =>
    lineItems.reduce((sum, item) => sum + item.quantity * item.unitPriceHt, 0);

  const calculateVat = () =>
    lineItems.reduce((sum, item) => sum + (item.quantity * item.unitPriceHt * item.vatRate) / 100, 0);

  const subtotalHt = calculateSubtotalHt();
  const totalVat = calculateVat();
  const totalTtc = subtotalHt + totalVat;

  const handleCreateInvoice = (status: 'Envoyée' | 'Brouillon') => {
    const nextNumber = `FAC-2025-0${93 + invoices.length - 5}`;
    const newInvoice: InvoiceRow = {
      id: invoices.length + 1,
      number: nextNumber,
      issueDate: '15/03/2025',
      dueDate: '14/04/2025',
      client: selectedClient,
      clientDetails: 'Client certifié',
      ht: `${subtotalHt.toLocaleString()} $`,
      tva: `${totalVat.toLocaleString()} $`,
      ttc: `${totalTtc.toLocaleString()} $`,
      status,
      paiements: status === 'Envoyée' ? '0,00 $ réglé' : 'Non émise',
    };
    setInvoices([newInvoice, ...invoices]);
    setShowCreateDrawer(false);
    alert(`Facture ${nextNumber} (${totalTtc.toLocaleString()} $ TTC) enregistrée avec succès !`);
  };

  const filteredInvoices =
    activeTab === 'Toutes'
      ? invoices
      : invoices.filter((inv) => inv.status.toLowerCase().includes(activeTab.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Breadcrumb & Header */}
      <div>
        <div className="text-[11px] font-semibold text-slate-400 mb-1">
          Comptabilité &gt; <span className="text-slate-600">Factures</span>
        </div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Gestion des Factures Clients
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Centralisation du cycle de facturation, suivi des encaissements et relances conformes Factur-X.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
              <Download className="w-3.5 h-3.5" />
              <span>Rapport Facturation</span>
            </button>
            <button
              onClick={() => setShowCreateDrawer(true)}
              className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3.5 py-2 rounded-lg shadow-sm"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>+ Créer une facture</span>
            </button>
          </div>
        </div>
      </div>

      {/* 4 Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>TOTAL FACTURÉ (MOIS)</span>
            <FileText className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">84 500,00 $</div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="font-bold text-emerald-600">+12.4% vs mois précédent</span>
            <span className="text-slate-400">42 factures</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>ENCAISSÉ / RÉGLÉ</span>
            <CheckCircle2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">68 200,00 $</div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="bg-blue-50 text-blue-700 px-1.5 py-0.2 rounded font-bold">80.7% total</span>
            <span className="text-slate-500">28 soldées • Dépôt auto</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>EN SOUFFRANCE / RETARD</span>
            <AlertCircle className="w-4 h-4 text-rose-500" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">9 450,00 $</div>
          <div className="flex items-center gap-2 mt-2 text-[11px]">
            <span className="text-rose-600 font-bold">Relance Niv. 2 requise</span>
            <span className="text-slate-400">3 factures</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>BROUILLONS À VALIDER</span>
            <FileText className="w-4 h-4 text-slate-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">6 850,00 $</div>
          <div className="text-[11px] text-slate-500 mt-2">
            2 pré-émises • Prêtes pour validation fiscale
          </div>
        </div>
      </div>

      {/* Tabs Filter Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs font-semibold">
        {(['Toutes', 'Payée', 'Partielle', 'En retard', 'Envoyée', 'Brouillon'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-3.5 py-1.5 rounded-lg border transition-all ${
              activeTab === tab
                ? 'bg-blue-600 border-blue-600 text-white font-bold shadow-2xs'
                : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Invoices Table */}
      <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left text-xs min-w-[760px]">
            <thead className="bg-slate-50 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
              <tr>
                <th className="px-5 py-3">N° Facture</th>
                <th className="px-4 py-3">Émission</th>
                <th className="px-4 py-3">Échéance</th>
                <th className="px-4 py-3">Client</th>
                <th className="px-4 py-3 text-right">Montant HT</th>
                <th className="px-4 py-3 text-right">TVA</th>
                <th className="px-4 py-3 text-right">Total TTC</th>
                <th className="px-4 py-3 text-center">Statut</th>
                <th className="px-4 py-3">Paiements & Suivi</th>
                <th className="px-5 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInvoices.map((inv) => (
                <tr key={inv.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5 font-bold font-mono text-blue-700">{inv.number}</td>
                  <td className="px-4 py-3.5 text-slate-500">{inv.issueDate}</td>
                  <td className={`px-4 py-3.5 ${inv.status === 'En retard' ? 'text-rose-600 font-bold' : 'text-slate-500'}`}>
                    {inv.dueDate}
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{inv.client}</div>
                    <div className="text-[10px] text-slate-400">{inv.clientDetails}</div>
                  </td>
                  <td className="px-4 py-3.5 text-right font-medium text-slate-700">{inv.ht}</td>
                  <td className="px-4 py-3.5 text-right text-slate-500">{inv.tva}</td>
                  <td className="px-4 py-3.5 text-right font-extrabold text-slate-900">{inv.ttc}</td>
                  <td className="px-4 py-3.5 text-center">
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        inv.status === 'Payée'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : inv.status === 'Partielle'
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200'
                          : inv.status === 'En retard'
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : inv.status === 'Envoyée'
                          ? 'bg-blue-50 text-blue-700 border-blue-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-slate-600 font-medium">{inv.paiements}</td>
                  <td className="px-5 py-3.5 text-center">
                    <div className="flex items-center justify-center gap-1.5 text-slate-400">
                      <button className="p-1 hover:text-blue-600 hover:bg-blue-50 rounded">
                        <Eye className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Drawer "Créer une facture" (Exactement conforme au Screenshot 5) */}
      {showCreateDrawer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in">
          <div className="w-full max-w-full sm:max-w-xl bg-white h-full shadow-2xl p-4 sm:p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">Créer une facture</h3>
                    <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded border border-slate-200">
                      Brouillon
                    </span>
                  </div>
                  <p className="text-xs text-slate-400">Numérotation légale & conformité fiscale TVA 2025</p>
                </div>
                <button
                  onClick={() => setShowCreateDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Client destinataire */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Client destinataire *</label>
                <select
                  value={selectedClient}
                  onChange={(e) => setSelectedClient(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20"
                >
                  <option>ETS Congo Tech Distribution Gombe (SARL) — SIREN 839 201 129</option>
                  <option>Dieudonné Kasongo (Particulier Gold)</option>
                  <option>Chantal Mwamba (Freelance)</option>
                  <option>Supermarché Express Limete (SAS)</option>
                </select>
              </div>

              {/* Numéro & Condition */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Numéro de pièce (Auto)</label>
                  <input
                    type="text"
                    disabled
                    value="N° FAC-2025-093"
                    className="w-full bg-slate-100 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold text-slate-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Condition de paiement</label>
                  <select className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold">
                    <option>30 jours net (Virement bancaire)</option>
                    <option>Comptant à réception</option>
                    <option>Acompte 30% puis solde 30j</option>
                  </select>
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date d'émission</label>
                  <input
                    type="date"
                    defaultValue="2025-03-15"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Date d'échéance</label>
                  <input
                    type="date"
                    defaultValue="2025-04-14"
                    className="w-full border border-slate-200 rounded-lg p-2 text-xs font-semibold"
                  />
                </div>
              </div>

              {/* Lignes d'articles */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Lignes de prestation & Articles</label>
                  <span className="text-[11px] text-slate-400">Devise : USD ($)</span>
                </div>

                <div className="space-y-2.5">
                  {lineItems.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <input
                          type="text"
                          value={item.description}
                          onChange={(e) => {
                            const updated = [...lineItems];
                            updated[idx].description = e.target.value;
                            setLineItems(updated);
                          }}
                          className="w-full bg-white border border-slate-200 rounded p-1.5 text-xs font-semibold"
                        />
                        <button
                          type="button"
                          onClick={() => removeLineItem(idx)}
                          className="ml-2 text-slate-400 hover:text-rose-600"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <span className="text-[10px] text-slate-400 block">Qté</span>
                          <input
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => {
                              const updated = [...lineItems];
                              updated[idx].quantity = Number(e.target.value);
                              setLineItems(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">PU HT ($)</span>
                          <input
                            type="number"
                            value={item.unitPriceHt}
                            onChange={(e) => {
                              const updated = [...lineItems];
                              updated[idx].unitPriceHt = Number(e.target.value);
                              setLineItems(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                          />
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">TVA</span>
                          <select
                            value={item.vatRate}
                            onChange={(e) => {
                              const updated = [...lineItems];
                              updated[idx].vatRate = Number(e.target.value);
                              setLineItems(updated);
                            }}
                            className="w-full bg-white border border-slate-200 rounded p-1 text-xs"
                          >
                            <option value="20">20%</option>
                            <option value="10">10%</option>
                            <option value="5.5">5.5%</option>
                            <option value="0">0%</option>
                          </select>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 block">Total HT</span>
                          <div className="p-1 font-bold text-slate-900 text-xs">
                            {(item.quantity * item.unitPriceHt).toLocaleString()} $
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={addLineItem}
                  className="w-full py-2 border border-dashed border-blue-300 text-blue-600 hover:bg-blue-50/50 rounded-lg text-xs font-bold transition-colors"
                >
                  + Ajouter une ligne d'article / prestation
                </button>
              </div>

              {/* Recommandation Fiscale & IA (Exact Screenshot 5) */}
              <div className="bg-indigo-50/60 border border-indigo-100 rounded-xl p-3.5 text-xs space-y-2">
                <div className="flex items-center gap-1.5 font-bold text-indigo-900">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Recommandation Fiscale & IA</span>
                </div>
                <p className="text-[11px] text-slate-600 leading-relaxed">
                  L'IA suggère d'ajouter l'acompte habituel de <strong>30%</strong> validé avec ce client dans la convention de services, ou de mentionner l'exonération article 261-4-1° du CGI si applicable.
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => alert('Acompte de 30% appliqué automatiquement')}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-bold px-2.5 py-1 rounded shadow-2xs"
                  >
                    Appliquer acompte (1 026,00 $ TTC)
                  </button>
                  <button type="button" className="text-slate-400 hover:text-slate-600 text-[11px]">
                    Ignorer
                  </button>
                </div>
              </div>

              {/* Totaux */}
              <div className="border-t border-slate-100 pt-3 space-y-1 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total HT :</span>
                  <span className="font-bold text-slate-900">{subtotalHt.toLocaleString()} $</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>TVA collectée (20,0%) :</span>
                  <span className="font-bold text-slate-900">{totalVat.toLocaleString()} $</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-blue-700 pt-2 border-t border-slate-200">
                  <span>Total TTC :</span>
                  <span>{totalTtc.toLocaleString()} $</span>
                </div>
              </div>
            </div>

            {/* Bottom Form Actions */}
            <div className="flex items-center gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateDrawer(false)}
                className="px-3 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={() => handleCreateInvoice('Brouillon')}
                className="flex-1 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg"
              >
                Enregistrer en brouillon
              </button>
              <button
                type="button"
                onClick={() => handleCreateInvoice('Envoyée')}
                className="flex-1 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm"
              >
                Valider et Émettre
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
