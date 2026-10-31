import React, { useState } from 'react';
import {
  Calendar,
  Lock,
  Unlock,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  RotateCcw,
  Plus,
  History,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredFiscalYears,
  saveStoredFiscalYears,
  getStoredPeriods,
  saveStoredPeriods,
  FiscalYear,
  AccountingPeriod,
} from '../../data/accountingMockData';

export const FiscalYearsClosing: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [fiscalYears, setFiscalYears] = useState<FiscalYear[]>(getStoredFiscalYears);
  const [periods, setPeriods] = useState<AccountingPeriod[]>(getStoredPeriods);
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 5000);
  };

  const handleTogglePeriodLock = (period: AccountingPeriod) => {
    if (!isAdmin) {
      alert("Permission refusée. Seul l'Administrateur peut verrouiller ou réouvrir une période comptable.");
      return;
    }

    const nextState = !period.isClosed;
    const actionName = nextState ? 'clôturée et verrouillée' : 'réouverte avec trace d’audit';

    const updated = periods.map((p) =>
      p.id === period.id
        ? {
            ...p,
            isClosed: nextState,
            closedAt: nextState ? new Date().toISOString() : undefined,
          }
        : p
    );

    setPeriods(updated);
    saveStoredPeriods(updated);
    showNotice(`Période « ${period.name} » ${actionName}.`);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Gouvernance Comptable & Sécurité
            </span>
            <span className="text-xs text-slate-400">• Piste d'audit inaltérable</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Exercices Comptables & Clôtures Périodiques
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Verrouillage mensuel des écritures contre toute altération rétroactive et report des soldes à nouveau.
          </p>
        </div>

        <div className="px-3.5 py-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs font-bold flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-purple-600" />
          <span>Contrôle administrateur actif</span>
        </div>
      </div>

      {/* Message notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Exercices Comptables */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="font-extrabold text-sm text-slate-900">Exercices Fiscaux Déclarés</h3>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {fiscalYears.map((fy) => (
            <div
              key={fy.id}
              className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
            >
              <div>
                <span className="font-mono font-black text-base text-slate-900 block">
                  Exercice {fy.year}
                </span>
                <span className="text-[11px] text-slate-500">
                  Du {new Date(fy.startDate).toLocaleDateString('en-US')} au{' '}
                  {new Date(fy.endDate).toLocaleDateString('en-US')}
                </span>
              </div>

              <div>
                {fy.isClosed ? (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700 flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>CLÔTURÉ DÉFINITIF</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>EN COURS (OUVERT)</span>
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Périodes Mensuelles & Verrouillage */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Périodes Mensuelles de l'Exercice 2026
            </h3>
            <p className="text-xs text-slate-400">
              Une période clôturée protège les écritures contre toute modification, ajout ou suppression.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {periods.map((p) => (
            <div
              key={p.id}
              className={`p-3.5 rounded-2xl border transition-all flex items-center justify-between ${
                p.isClosed
                  ? 'bg-slate-50 border-slate-200/80 text-slate-600'
                  : 'bg-blue-50/40 border-blue-200 text-slate-900 shadow-2xs'
              }`}
            >
              <div>
                <span className="font-bold text-xs block">{p.name}</span>
                <span className="text-[10px] text-slate-400">
                  {p.isClosed ? 'Verrouillée (Audit actif)' : 'Ouverte pour saisie'}
                </span>
              </div>

              <div className="flex items-center gap-2">
                {p.isClosed ? (
                  <span className="px-2 py-0.5 rounded-md bg-slate-200 text-slate-700 font-bold text-[10px] flex items-center gap-1">
                    <Lock className="w-3 h-3" />
                    <span>Clôturée</span>
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-md bg-blue-600 text-white font-bold text-[10px]">
                    Active
                  </span>
                )}

                {isAdmin && (
                  <button
                    type="button"
                    onClick={() => handleTogglePeriodLock(p)}
                    className="p-1.5 rounded-lg border border-slate-200 hover:bg-white text-slate-600 transition-colors"
                    title={p.isClosed ? 'Déverrouiller avec trace d’audit' : 'Clôturer la période'}
                  >
                    {p.isClosed ? <Unlock className="w-3.5 h-3.5" /> : <Lock className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
