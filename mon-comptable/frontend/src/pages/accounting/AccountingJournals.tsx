import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Calendar,
  Filter,
  Search,
  Eye,
  Plus,
  ArrowRight,
  TrendingUp,
  FileText,
  DollarSign,
  Scale,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredJournals,
  getStoredEntries,
  getStoredPeriods,
  subscribeToBccRateUpdates,
  AccountingJournal,
} from '../../data/accountingMockData';

export const AccountingJournals: React.FC = () => {
  const { user } = useAuth();
  const journals = getStoredJournals();
  const [entries, setEntries] = useState(getStoredEntries);
  const periods = getStoredPeriods();

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates(() => {
      setEntries(getStoredEntries());
    });
    return unsubscribe;
  }, []);

  const [selectedJournalCode, setSelectedJournalCode] = useState<string>('ALL');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Octobre 2026');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEntries = entries.filter((entry) => {
    const matchesJournal =
      selectedJournalCode === 'ALL' || entry.journalCode === selectedJournalCode;
    const matchesPeriod = !selectedPeriod || entry.periodName === selectedPeriod;
    const matchesSearch =
      entry.entryNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.pieceRef && entry.pieceRef.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesJournal && matchesPeriod && matchesSearch;
  });

  const totalPeriodDebit = filteredEntries.reduce((acc, e) => acc + e.totalDebit, 0);
  const totalPeriodCredit = filteredEntries.reduce((acc, e) => acc + e.totalCredit, 0);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Journaux Auxiliaires & Périodes
            </span>
            <span className="text-xs text-slate-400">• Référentiel SYSCOHADA / PCG</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Consultation des Journaux Comptables
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Ventilation chronologique des opérations par journal : Ventes, Achats, Banque, Caisse, Opérations Diverses.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Link
            to="/comptabilite/ecritures"
            className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>Nouvelle Écriture (FC)</span>
          </Link>
        </div>
      </div>

      {/* Cartes Sélecteur de Journaux */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div
          onClick={() => setSelectedJournalCode('ALL')}
          className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
            selectedJournalCode === 'ALL'
              ? 'border-blue-600 bg-blue-50/50 shadow-xs'
              : 'border-slate-200 bg-white hover:border-slate-300'
          }`}
        >
          <span className="text-[10px] font-extrabold uppercase text-slate-400 block">Tous</span>
          <div className="font-black text-sm text-slate-900 mt-1">Tous Journaux</div>
          <div className="text-[11px] text-slate-500 mt-0.5">{entries.length} écritures</div>
        </div>

        {journals.map((j) => {
          const isSelected = selectedJournalCode === j.code;
          const count = entries.filter((e) => e.journalCode === j.code).length;

          return (
            <div
              key={j.id}
              onClick={() => setSelectedJournalCode(j.code)}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-mono font-black text-xs px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {j.code}
                </span>
                <span className="text-[10px] text-slate-400 font-bold">{count} ecr.</span>
              </div>
              <div className="font-bold text-xs text-slate-800 mt-2 truncate">{j.name}</div>
            </div>
          );
        })}
      </div>

      {/* Barre de filtres et Recherche */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par N° écriture, libellé, pièce..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <Calendar className="w-4 h-4 text-slate-400" />
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="bg-white border border-slate-200 text-slate-700 text-xs font-bold rounded-xl px-3 py-2 shadow-xs"
          >
            {periods.map((p) => (
              <option key={p.id} value={p.name}>
                {p.name} {p.isClosed ? '(Clôturée)' : '(Ouverte)'}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Résumé Période */}
      <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-4">
          <span className="font-extrabold text-slate-700">
            Journal sélectionné : {selectedJournalCode === 'ALL' ? 'Tous les journaux' : selectedJournalCode}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-600 font-medium">Période : {selectedPeriod}</span>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Débit Période (FC)</span>
            <span className="font-black text-blue-700 text-sm">
              {Math.round(totalPeriodDebit).toLocaleString('fr-FR')} FC
            </span>
          </div>

          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Total Crédit Période (FC)</span>
            <span className="font-black text-purple-700 text-sm">
              {Math.round(totalPeriodCredit).toLocaleString('fr-FR')} FC
            </span>
          </div>

          <span className="px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-800">
            ÉQUILIBRÉ EN FC
          </span>
        </div>
      </div>

      {/* Tableau détaillé des écritures du journal */}
      <div className="space-y-4">
        {filteredEntries.map((entry) => (
          <div
            key={entry.id}
            className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs space-y-3 hover:shadow-md transition-all"
          >
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <span className="px-2.5 py-1 rounded-lg font-mono font-black text-xs bg-blue-100 text-blue-800">
                  {entry.journalCode}
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-black text-sm text-slate-900">{entry.entryNumber}</span>
                    <span className="text-slate-400 text-xs">•</span>
                    <span className="text-xs text-slate-500">
                      {new Date(entry.date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="font-bold text-xs text-slate-800 mt-0.5">{entry.label}</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {entry.pieceRef && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 font-mono text-[11px]">
                    Pièce : {entry.pieceRef}
                  </span>
                )}
                <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                  {entry.status}
                </span>
              </div>
            </div>

            {/* Lignes d'écriture comptables en partie double */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="text-slate-400 font-bold uppercase text-[10px] border-b border-slate-100">
                    <th className="py-2 px-3">Compte</th>
                    <th className="py-2 px-3">Intitulé</th>
                    <th className="py-2 px-3">Libellé Ligne</th>
                    <th className="py-2 px-3 text-right">Débit (FC / CDF)</th>
                    <th className="py-2 px-3 text-right">Crédit (FC / CDF)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {entry.lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2 px-3 font-mono font-bold text-slate-900">
                        {line.accountNumber}
                      </td>
                      <td className="py-2 px-3 text-slate-700">{line.accountLabel}</td>
                      <td className="py-2 px-3 text-slate-500">{line.label || entry.label}</td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {line.debit > 0
                          ? `${Math.round(line.debit).toLocaleString('fr-FR')} FC`
                          : '-'}
                      </td>
                      <td className="py-2 px-3 text-right font-bold text-slate-900">
                        {line.credit > 0
                          ? `${Math.round(line.credit).toLocaleString('fr-FR')} FC`
                          : '-'}
                      </td>
                    </tr>
                  ))}
                  <tr className="bg-slate-50 font-black text-slate-900">
                    <td colSpan={3} className="py-2 px-3 text-right uppercase text-[10px]">
                      Total Écriture (Franc Congolais) :
                    </td>
                    <td className="py-2 px-3 text-right text-blue-700">
                      {Math.round(entry.totalDebit).toLocaleString('fr-FR')} FC
                    </td>
                    <td className="py-2 px-3 text-right text-purple-700">
                      {Math.round(entry.totalCredit).toLocaleString('fr-FR')} FC
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ))}

        {filteredEntries.length === 0 && (
          <div className="bg-white rounded-2xl border border-slate-200/80 p-8 text-center text-slate-400 text-xs">
            Aucune écriture trouvée pour ce journal et cette période.
          </div>
        )}
      </div>
    </div>
  );
};
