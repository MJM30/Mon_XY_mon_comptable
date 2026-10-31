import React, { useState } from 'react';
import {
  Users,
  Monitor,
  Clock,
  CheckCircle2,
  Plus,
  Tablet,
  Filter,
  PhoneCall,
  Sparkles,
  Printer,
  X,
  AlertCircle,
} from 'lucide-react';

interface QueueItem {
  ticket: string;
  heure: string;
  client: string;
  badge: string;
  type: string;
  prestation: string;
  attente: string;
  priorite: 'Normal' | 'PRIORITAIRE' | 'URGENT';
}

const INITIAL_QUEUE: QueueItem[] = [
  {
    ticket: '#A-104',
    heure: '14:15',
    client: 'Dieudonné Kasongo',
    badge: 'Fidélité Gold',
    type: 'RDV 14:30',
    prestation: 'Consultation Diagnostic',
    attente: '12 min',
    priorite: 'Normal',
  },
  {
    ticket: '#A-105',
    heure: '14:22',
    client: 'Chantal Mwamba',
    badge: 'Client Entreprise',
    type: 'RDV 14:45',
    prestation: 'Prestation Premium',
    attente: '5 min',
    priorite: 'PRIORITAIRE',
  },
  {
    ticket: '#S-042',
    heure: '14:25',
    client: 'Client Sans RDV (Paul B.)',
    badge: 'Passage comptoir',
    type: 'Sans RDV',
    prestation: 'Entretien standard',
    attente: '8 min',
    priorite: 'Normal',
  },
  {
    ticket: '#A-106',
    heure: '14:10',
    client: 'Supermarché Express Limete',
    badge: 'Représentant mandaté',
    type: 'RDV 14:15',
    prestation: 'Signature & Remise',
    attente: '22 min',
    priorite: 'URGENT',
  },
  {
    ticket: '#A-107',
    heure: '14:30',
    client: 'Claire Robert',
    badge: 'Prise de contact',
    type: 'RDV 14:30',
    prestation: 'Contrôle technique',
    attente: '0 min',
    priorite: 'Normal',
  },
];

export const QueueAndStations: React.FC = () => {
  const [queue, setQueue] = useState<QueueItem[]>(INITIAL_QUEUE);
  const [showArrivalDrawer, setShowArrivalDrawer] = useState(false);
  const [newClientName, setNewClientName] = useState('Dieudonné Kasongo');
  const [newPriority, setNewPriority] = useState<'Normal' | 'Prioritaire' | 'Urgent'>('Normal');
  const [hasAppointment, setHasAppointment] = useState(true);

  const handleAddArrival = () => {
    const nextTicket = `#A-${Math.floor(108 + Math.random() * 10)}`;
    const newItem: QueueItem = {
      ticket: nextTicket,
      heure: '14:35',
      client: newClientName,
      badge: hasAppointment ? 'RDV Confirmé' : 'Passage comptoir',
      type: hasAppointment ? 'RDV 14:40' : 'Sans RDV',
      prestation: 'Consultation Diagnostic (45 min)',
      attente: '0 min',
      priorite: newPriority === 'Urgent' ? 'URGENT' : newPriority === 'Prioritaire' ? 'PRIORITAIRE' : 'Normal',
    };
    setQueue([...queue, newItem]);
    setShowArrivalDrawer(false);
    alert(`Ticket ${nextTicket} imprimé et ajouté à la file d'attente !`);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              File d'Attente & Pilotage des Postes
            </h1>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              INTERFACE DE GESTION • EN DIRECT
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Système synchronisé (Rafraîchissement automatique 10s) • Agence Bastille
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowArrivalDrawer(true)}
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2 rounded-lg shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Enregistrer une arrivée</span>
          </button>

          <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs transition-colors">
            <Tablet className="w-3.5 h-3.5" />
            <span>Mode Kiosque Tablette</span>
          </button>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Clients en attente</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">{queue.length} personnes</div>
            <span className="text-[11px] text-blue-600 font-semibold">+2 depuis 15 min</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Users className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Postes occupés</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">4 <span className="text-sm font-normal text-slate-400">/ 6 actifs</span></div>
            <span className="text-[11px] text-slate-500 font-semibold">66% de charge globale</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
            <Monitor className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Temps d'attente moyen</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">14 min</div>
            <span className="text-[11px] text-emerald-600 font-semibold">-3 min vs objectif max 20m</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <Clock className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500 font-semibold">Prestations du jour</span>
            <div className="text-2xl font-extrabold text-slate-900 mt-1">28 <span className="text-sm font-normal text-slate-400">clôturées</span></div>
            <span className="text-[11px] text-emerald-600 font-semibold">94% satisfaction instantanée</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Main Grid: Queue on Left, Stations on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: File d'Attente Interactive (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/80 shadow-2xs overflow-hidden flex flex-col justify-between">
          <div>
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-bold text-slate-900">File d'Attente Interactive</span>
                <span className="bg-blue-50 text-blue-700 text-xs font-bold px-2 py-0.5 rounded-full border border-blue-100">
                  {queue.length} Tickets en flux
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => alert(`Appel du ticket ${queue[0]?.ticket || 'aucun'} au guichet !`)}
                  className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-2xs transition-colors"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Appeler le suivant</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto min-w-0">
              <table className="w-full text-left text-xs min-w-[620px]">
                <thead className="bg-slate-50/70 text-slate-400 font-bold uppercase text-[10px] tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="px-4 py-3">Ticket</th>
                    <th className="px-3 py-3">Heure</th>
                    <th className="px-4 py-3">Client</th>
                    <th className="px-3 py-3">Type</th>
                    <th className="px-4 py-3">Prestation demandée</th>
                    <th className="px-3 py-3">Attente</th>
                    <th className="px-4 py-3 text-center">Priorité</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {queue.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3 font-mono font-bold text-blue-700">{item.ticket}</td>
                      <td className="px-3 py-3 text-slate-400 font-medium">{item.heure}</td>
                      <td className="px-4 py-3">
                        <div className="font-bold text-slate-900">{item.client}</div>
                        <div className="text-[10px] text-slate-400">{item.badge}</div>
                      </td>
                      <td className="px-3 py-3 font-semibold text-slate-700">
                        <span className="px-2 py-0.5 rounded bg-slate-100 text-[10px] font-bold">
                          {item.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{item.prestation}</td>
                      <td className="px-3 py-3 font-bold text-slate-800">{item.attente}</td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded uppercase tracking-wider ${
                            item.priorite === 'URGENT'
                              ? 'bg-rose-50 text-rose-700 border border-rose-200 animate-pulse'
                              : item.priorite === 'PRIORITAIRE'
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {item.priorite}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="p-3 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs text-slate-500">
            <span>💡 Astuce : Les tickets avec rendez-vous sont prioritaires sur les arrivées spontanées.</span>
            <button className="font-bold text-blue-600 hover:underline">Exporter feuille de flux (CSV)</button>
          </div>
        </div>

        {/* Right: État des Postes (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200/80 shadow-2xs p-4">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Monitor className="w-4 h-4 text-blue-600" />
                <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  État des Postes (4/6 actifs)
                </h2>
              </div>
              <span className="text-[11px] font-semibold text-slate-500">Bureaux 1 à 6</span>
            </div>

            <div className="space-y-2.5">
              {/* Poste 01 */}
              <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 01 • Marc V.</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    OCCUPÉ
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>En cours : <strong>Dieudonné Kasongo</strong></span>
                  <span className="text-slate-400">24 min / 45 min</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '55%' }} />
                </div>
              </div>

              {/* Poste 02 */}
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 02 • Non assigné</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIBRE
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex items-center justify-between">
                  <span>Prochain assigné : Chantal Mwamba (#A-105)</span>
                  <button
                    onClick={() => alert('Poste 02 assigné à Chantal Mwamba !')}
                    className="text-[10px] font-bold bg-blue-600 hover:bg-blue-700 text-white px-2 py-1 rounded shadow-2xs"
                  >
                    Activer
                  </button>
                </div>
              </div>

              {/* Poste 03 */}
              <div className="p-3 rounded-lg border border-slate-200/80 bg-slate-50/40">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 03 • Céline D.</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                    OCCUPÉ
                  </span>
                </div>
                <div className="text-[11px] text-slate-600 flex justify-between">
                  <span>En cours : <strong>Supermarché Express Limete</strong></span>
                  <span className="text-slate-400">15 min / 30 min</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden mt-2">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '50%' }} />
                </div>
              </div>

              {/* Poste 04 */}
              <div className="p-3 rounded-lg border border-amber-200/80 bg-amber-50/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 04 • Lucas T.</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200">
                    EN PAUSE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">En désinfection / Pause déjeuner • Reprise prévue à 15:00</p>
              </div>

              {/* Poste 05 */}
              <div className="p-3 rounded-lg border border-emerald-200 bg-emerald-50/20">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 05 • Prêt guichet</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200">
                    LIBRE
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">Prêt pour accueil flux rapide ou sans RDV</p>
              </div>

              {/* Poste 06 */}
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/60">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-900">Poste 06 • Technique</span>
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded bg-slate-100 text-slate-600">
                    MAINTENANCE
                  </span>
                </div>
                <p className="text-[11px] text-slate-400">Poste technique en révision matériel (Terminal TPE)</p>
              </div>
            </div>
          </div>

          {/* Assistant Opérations IA Card */}
          <div className="bg-white p-4 rounded-xl border border-indigo-100 shadow-2xs bg-gradient-to-br from-white via-indigo-50/20 to-blue-50/30">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="text-xs font-bold text-slate-900">Assistant Opérations IA</h3>
              </div>
              <span className="text-[10px] font-extrabold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full border border-indigo-100">
                Temps Réel
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              <strong>Optimisation de la file :</strong> Chantal Mwamba (Ticket #A-105) attend depuis 5 min et le <strong>Poste 02</strong> vient de se libérer. Voulez-vous assigner automatiquement ?
            </p>
            <div className="flex items-center gap-2 mt-3">
              <button
                onClick={() => alert('Poste 02 assigné automatiquement par IA !')}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-1.5 rounded-lg shadow-2xs"
              >
                ✓ Assigner Poste 02
              </button>
              <button className="px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold py-1.5 rounded-lg">
                Modifier
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Drawer / Modal "Enregistrer une arrivée" (Exactement comme Screenshot 2) */}
      {showArrivalDrawer && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-2xs flex justify-end z-50 animate-in fade-in">
          <div className="w-full max-w-md bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Enregistrer une arrivée</h3>
                  <p className="text-xs text-slate-400">Génération de ticket & attribution immédiate</p>
                </div>
                <button
                  onClick={() => setShowArrivalDrawer(false)}
                  className="p-1 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Type de prise en charge */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-2">Type de prise en charge</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setHasAppointment(true)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      hasAppointment ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Avec Rendez-vous
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasAppointment(false)}
                    className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                      !hasAppointment ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-2xs' : 'border-slate-200 text-slate-600'
                    }`}
                  >
                    Sans Rendez-vous
                  </button>
                </div>
              </div>

              {/* Recherche Client */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Recherche Client ou Entreprise</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={(e) => setNewClientName(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg p-2.5 text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 font-semibold"
                />
                <div className="mt-1 text-[11px] text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Fiche certifiée (Dieudonné Kasongo #CL-9821)
                </div>
              </div>

              {/* Prestation */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Prestation ou Motif d'accueil</label>
                <select className="w-full border border-slate-200 rounded-lg p-2.5 text-xs font-semibold focus:ring-2 focus:ring-blue-500/20">
                  <option>Consultation Diagnostic (45 min)</option>
                  <option>Prestation Premium & Accompagnement (60 min)</option>
                  <option>Signature de contrat & Remise de pièces (15 min)</option>
                  <option>Entretien rapide guichet (10 min)</option>
                </select>
              </div>

              {/* Priorité */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">Niveau d'Urgence / Priorité</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['Normal', 'Prioritaire', 'Urgent'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setNewPriority(p)}
                      className={`py-2 text-xs font-bold rounded-lg border text-center transition-all ${
                        newPriority === p ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs' : 'border-slate-200 text-slate-600'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Aperçu Ticket Thermique */}
              <div className="border border-dashed border-slate-300 rounded-xl p-4 bg-slate-50 text-center space-y-1">
                <div className="flex items-center justify-between text-[10px] text-slate-400 uppercase font-mono tracking-wider">
                  <span>Aperçu Ticket Imprimante Thermique</span>
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div className="text-3xl font-mono font-extrabold text-blue-700 pt-2">#A-108</div>
                <div className="text-xs font-bold text-slate-800">{newClientName}</div>
                <div className="text-[10px] text-slate-500">Guichet d'accueil • 14:35</div>
                <div className="text-[9px] text-slate-400 pt-2 border-t border-slate-200 mt-2 font-mono">
                  Veuillez patienter en zone d'attente. Votre numéro sera appelé sur les écrans.
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center gap-3 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowArrivalDrawer(false)}
                className="flex-1 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleAddArrival}
                className="flex-2 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm flex items-center justify-center gap-2"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer & Ajouter à la file</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
