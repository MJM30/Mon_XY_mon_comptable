import React from 'react';
import {
  Users,
  CalendarCheck,
  Clock,
  Coins,
  Star,
  Download,
  Settings,
  Sparkles,
  AlertTriangle,
  UserPlus,
  MessageSquare,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

const HOURLY_DATA = [
  { heure: '08:00', terminees: 3, attente: 1 },
  { heure: '09:00', terminees: 5, attente: 2 },
  { heure: '10:00', terminees: 8, attente: 3 },
  { heure: '11:00', terminees: 14, attente: 4 },
  { heure: '12:00', terminees: 6, attente: 1 },
  { heure: '13:00', terminees: 7, attente: 2 },
  { heure: '14:00', terminees: 15, attente: 3 },
  { heure: '15:00', terminees: 11, attente: 2 },
  { heure: '16:00', terminees: 9, attente: 4 },
  { heure: '17:00', terminees: 6, attente: 1 },
  { heure: '18:00', terminees: 4, attente: 0 },
];

export const ActivityDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Dashboard Activité & Pilotage Opérationnel
            </h1>
            <span className="bg-blue-50 text-blue-700 text-[11px] font-bold px-2 py-0.5 rounded-full border border-blue-100 flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-600 animate-pulse" />
              Direct
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Performance du jour, saturation des postes et satisfaction client
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <div className="text-xs font-semibold text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg shadow-2xs flex items-center gap-2">
            <span>Aujourd'hui (14 Mars 2025)</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-bold text-[11px]">Temps réel activé</span>
          </div>

          <button className="flex items-center gap-1.5 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 text-xs font-semibold px-3 py-2 rounded-lg shadow-2xs">
            <Download className="w-3.5 h-3.5" />
            <span>Rapport Journalier PDF</span>
          </button>

          <button className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-3 py-2 rounded-lg shadow-sm">
            <Settings className="w-3.5 h-3.5" />
            <span>Paramètres d'activité</span>
          </button>
        </div>
      </div>

      {/* 5 KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Clients accueillis</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">38 <span className="text-xs font-normal text-slate-400">clients</span></div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div className="bg-blue-600 h-full rounded-full" style={{ width: '84%' }} />
          </div>
          <span className="text-[10px] text-slate-400 font-medium block mt-1">Objectif jour : 45 (84%)</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Réservations honorées</span>
            <CalendarCheck className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">26 <span className="text-xs font-normal text-slate-400">/ 28</span></div>
          <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded font-bold border border-emerald-100 block mt-2 w-max">
            Taux de présence 93%
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Temps d'attente moyen</span>
            <Clock className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">11 <span className="text-xs font-normal text-slate-400">min</span></div>
          <span className="text-[10px] text-emerald-600 font-bold block mt-2">
            -4 min vs semaine dernière
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Chiffre d'affaires jour</span>
            <Coins className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">3 840 $</div>
          <span className="text-[10px] text-slate-500 font-medium block mt-2">
            Prestations réalisées : 34 actes
          </span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between text-xs text-slate-500 font-semibold mb-1">
            <span>Indice de satisfaction</span>
            <Star className="w-4 h-4 text-amber-500 fill-amber-400" />
          </div>
          <div className="text-2xl font-extrabold text-slate-900">4.8 <span className="text-xs font-normal text-slate-400">/ 5</span></div>
          <span className="text-[10px] text-slate-500 font-medium block mt-2">
            22 avis du jour • 96% positifs
          </span>
        </div>
      </div>

      {/* Middle Grid: Fréquentation Chart Left, Staff Performance Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Fréquentation horaire */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Fréquentation horaire & Saturation des postes</h2>
              <p className="text-[11px] text-slate-400">Flux clients cumulé et répartition de 08:00 à 18:00</p>
            </div>
            <div className="flex items-center gap-3 text-xs font-semibold">
              <span className="flex items-center gap-1 text-blue-700">
                <span className="w-2.5 h-2.5 rounded bg-blue-600" /> Terminées
              </span>
              <span className="flex items-center gap-1 text-slate-500">
                <span className="w-2.5 h-2.5 rounded bg-blue-300" /> En attente
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={HOURLY_DATA}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                <XAxis dataKey="heure" tick={{ fontSize: 10, fill: '#64748B' }} />
                <YAxis tick={{ fontSize: 10, fill: '#64748B' }} />
                <Tooltip />
                <Bar dataKey="terminees" fill="#2563EB" stackId="a" radius={[0, 0, 0, 0]} />
                <Bar dataKey="attente" fill="#93C5FD" stackId="a" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>💡 Pics d'affluence constatés : <strong>11:00 (14 clients)</strong> et <strong>14:00 (15 clients)</strong></span>
            <span className="font-bold text-blue-600">Taux de saturation global : 79%</span>
          </div>
        </div>

        {/* Performance & Charge du Personnel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-sm font-bold text-slate-900">Performance & Charge du Personnel</h2>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                4 actifs
              </span>
            </div>
            <p className="text-[11px] text-slate-400 mb-4">Suivi individuel et disponibilité des postes</p>

            <div className="space-y-3.5">
              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-blue-100 text-blue-700 font-bold flex items-center justify-center text-[10px]">
                      MV
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Marc V.</span>
                      <span className="text-[10px] text-slate-400 block">Expert Senior • Poste 01</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.9</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>8 prestations réalisées</span>
                  <span className="font-bold text-slate-700">Charge : 88%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-blue-600 h-full rounded-full" style={{ width: '88%' }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 font-bold flex items-center justify-center text-[10px]">
                      CD
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Céline D.</span>
                      <span className="text-[10px] text-slate-400 block">Conseillère Pro • Poste 02</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.8</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>7 prestations réalisées</span>
                  <span className="font-bold text-slate-700">Charge : 75%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-indigo-600 h-full rounded-full" style={{ width: '75%' }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50">
                <div className="flex items-center justify-between text-xs mb-1">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-700 font-bold flex items-center justify-center text-[10px]">
                      TB
                    </div>
                    <div>
                      <span className="font-bold text-slate-900">Thomas B.</span>
                      <span className="text-[10px] text-slate-400 block">Technicien Spécialisé • Poste 03</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 text-amber-500 font-bold">
                    <Star className="w-3 h-3 fill-amber-400" />
                    <span>4.7</span>
                  </div>
                </div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-1">
                  <span>6 prestations réalisées</span>
                  <span className="font-bold text-slate-700">Charge : 65%</span>
                </div>
                <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-teal-600 h-full rounded-full" style={{ width: '65%' }} />
                </div>
              </div>

              <div className="p-2.5 rounded-lg border border-slate-100 bg-slate-50/50 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-slate-200 text-slate-700 font-bold flex items-center justify-center text-[10px]">
                    AL
                  </div>
                  <div>
                    <span className="font-bold text-slate-900">Audrey L.</span>
                    <span className="text-[10px] text-slate-400 block">Accueil & Caisse centrale</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-800">13 encaissements</span>
                  <span className="text-[10px] text-slate-400 block">Moy. 3 min / client</span>
                </div>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 text-right">
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Voir plannings complets →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Évaluations Clients Left, Alertes de Pilotage Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Dernières Évaluations Clients (7 cols) */}
        <div className="lg:col-span-7 bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>Dernières Évaluations Clients</span>
              <span className="text-[10px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full border border-emerald-100">
                Avis vérifiés
              </span>
            </h2>
            <button className="text-xs font-bold text-blue-600 hover:underline">
              Consulter tous les avis (22) →
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-slate-900">Dieudonné Kasongo • <span className="text-slate-500 font-medium">Prestation Diagnostic</span></div>
                <div className="flex text-amber-400">★★★★★</div>
              </div>
              <p className="text-xs text-slate-600 italic">
                « Prise en charge très rapide au poste 01, explications claires. »
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Il y a 28 minutes • Rapprochement validé</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-slate-900">ETS Congo Tech Distribution Gombe • <span className="text-slate-500 font-medium">Conseil Fiscalité</span></div>
                <div className="flex text-amber-400">★★★★★</div>
              </div>
              <p className="text-xs text-slate-600 italic">
                « Gestion irréprochable et dossier transmis immédiatement. »
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Il y a 1h 12m • Rapprochement validé</span>
            </div>

            <div className="p-3 rounded-lg border border-slate-100 bg-slate-50/50">
              <div className="flex items-center justify-between mb-1">
                <div className="text-xs font-bold text-slate-900">Paul M. • <span className="text-slate-500 font-medium">Prestation Standard</span></div>
                <div className="flex text-amber-400">★★★★☆</div>
              </div>
              <p className="text-xs text-slate-600 italic">
                « Service impeccable, seul le temps d'attente en salle était un peu plus long. »
              </p>
              <span className="text-[10px] text-slate-400 mt-1 block">Il y a 2h 45m • Suivi satisfaction émis</span>
            </div>
          </div>
        </div>

        {/* Alertes & Actions de Pilotage (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-2xs space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h2 className="text-xs font-bold text-slate-900 uppercase tracking-wide flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Alertes & Actions de Pilotage
              </h2>
              <span className="text-[10px] font-extrabold bg-rose-50 text-rose-700 px-2 py-0.5 rounded border border-rose-100">
                1 Priorité Haute
              </span>
            </div>

            <div className="p-3.5 bg-amber-50/50 border border-amber-200 rounded-xl space-y-2">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-bold text-slate-900">Pic d'affluence prévu à 16:30</div>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                    7 réservations simultanées pour seulement 6 postes actuellement ouverts. Risque d'augmentation du temps d'attente de +18 min.
                  </p>
                </div>
              </div>

              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between">
                <div className="flex items-center gap-1.5 text-xs text-indigo-900 font-bold">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Recommandation IA : Ouvrir poste 05</span>
                </div>
                <button
                  onClick={() => alert('Poste de secours 05 ouvert avec succès !')}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-2xs"
                >
                  Appliquer
                </button>
              </div>
            </div>

            <div className="space-y-2 pt-2">
              <p className="text-[10px] font-bold uppercase text-slate-400">Actions rapides de régulation</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => alert('Renfort mobilisé sur le guichet accueil')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <UserPlus className="w-3.5 h-3.5 text-blue-600" />
                    <span>Assigner renfort</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Mobiliser Thomas B. sur accueil</p>
                </button>

                <button
                  onClick={() => alert('Notification SMS envoyée aux 7 réservations')}
                  className="p-3 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-left text-xs space-y-1 transition-colors"
                >
                  <div className="flex items-center gap-1.5 font-bold text-slate-800">
                    <MessageSquare className="w-3.5 h-3.5 text-indigo-600" />
                    <span>SMS aux clients</span>
                  </div>
                  <p className="text-[10px] text-slate-400">Notifier créneau 16h30</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
