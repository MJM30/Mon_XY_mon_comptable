import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  Search,
  Calendar,
  Filter,
  Download,
  FileText,
  ChevronDown,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredChartOfAccounts,
  getStoredEntries,
  getStoredJournals,
  subscribeToBccRateUpdates,
  GeneralLedgerLine,
} from '../../data/accountingMockData';

export const GeneralLedger: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(getStoredChartOfAccounts);
  const [allEntries, setAllEntries] = useState(getStoredEntries);
  const entries = allEntries.filter((e) => e.status === 'VALIDATED');
  const journals = getStoredJournals();

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates(() => {
      setAccounts(getStoredChartOfAccounts());
      setAllEntries(getStoredEntries());
    });
    return unsubscribe;
  }, []);

  const [selectedAccountNumber, setSelectedAccountNumber] = useState<string>('411100');
  const [selectedJournal, setSelectedJournal] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Retrouver le compte sélectionné
  const currentAccount = accounts.find((a) => a.accountNumber === selectedAccountNumber) || accounts[0];

  // Extraire toutes les lignes d'écritures pour ce compte avec calcul du solde progressif
  let progressiveBalance = 0;
  const ledgerLines: GeneralLedgerLine[] = [];

  entries
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
    .forEach((entry) => {
      entry.lines.forEach((line) => {
        if (line.accountNumber === currentAccount.accountNumber) {
          if (selectedJournal === 'ALL' || entry.journalCode === selectedJournal) {
            // Pour les comptes d'actif (Classes 2, 3, 411, 5) : Débit augmente, Crédit diminue
            // Pour les comptes de passif/produits (Classes 1, 401, 7) : Crédit augmente, Débit diminue
            const isAssetOrExpense =
              currentAccount.accountClass === 2 ||
              currentAccount.accountClass === 3 ||
              currentAccount.accountClass === 5 ||
              currentAccount.accountClass === 6 ||
              currentAccount.accountNumber.startsWith('411');

            if (isAssetOrExpense) {
              progressiveBalance += line.debit - line.credit;
            } else {
              progressiveBalance += line.credit - line.debit;
            }

            ledgerLines.push({
              id: line.id || Math.random(),
              date: entry.date,
              entryNumber: entry.entryNumber,
              journalCode: entry.journalCode,
              pieceRef: line.pieceRef || entry.pieceRef,
              label: line.label || entry.label,
              debit: line.debit,
              credit: line.credit,
              cumulativeBalance: progressiveBalance,
            });
          }
        }
      });
    });

  const totalDebit = ledgerLines.reduce((acc, l) => acc + l.debit, 0);
  const totalCredit = ledgerLines.reduce((acc, l) => acc + l.credit, 0);

  const filteredLines = ledgerLines.filter((l) =>
    l.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
    l.entryNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Grand Livre Général • Piste d'Audit
            </span>
            <span className="text-xs text-slate-400">• Exercice 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Grand Livre des Comptes (SYSCOHADA)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Historique complet de chaque compte avec mouvement débit/crédit et calcul en continu du solde progressif.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => alert('Export du Grand Livre au format Excel/CSV généré.')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter Grand Livre (CSV / PDF)</span>
          </button>
        </div>
      </div>

      {/* Barre de sélection de compte et filtres */}
      <div className="bg-white rounded-2xl border border-slate-200/80 p-5 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div>
          <label className="font-bold text-slate-700 text-xs block mb-1">
            Sélectionnez le Compte Général :
          </label>
          <select
            value={selectedAccountNumber}
            onChange={(e) => setSelectedAccountNumber(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.accountNumber}>
                {a.accountNumber} - {a.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 text-xs block mb-1">Filtre par Journal :</label>
          <select
            value={selectedJournal}
            onChange={(e) => setSelectedJournal(e.target.value)}
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
          >
            <option value="ALL">Tous les journaux auxiliaires</option>
            {journals.map((j) => (
              <option key={j.id} value={j.code}>
                {j.code} - {j.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-bold text-slate-700 text-xs block mb-1">Recherche dans les écritures :</label>
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Libellé, référence de pièce..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* Fiche d'identité du Compte & Synthèse */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="font-mono font-black text-sm bg-blue-500/30 border border-blue-400/40 px-2.5 py-0.5 rounded-lg text-blue-200">
              {currentAccount.accountNumber}
            </span>
            <span className="text-xs text-slate-300 font-semibold">Classe {currentAccount.accountClass}</span>
          </div>
          <h2 className="text-xl font-black">{currentAccount.label}</h2>
          <p className="text-xs text-slate-300 mt-1 max-w-xl">
            {currentAccount.description || 'Compte mouvementé du référentiel comptable SYSCOHADA.'}
          </p>
        </div>

        <div className="flex items-center gap-4 bg-white/10 p-4 rounded-2xl border border-white/10 text-xs backdrop-blur-xs">
          <div>
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Cumul Débit (FC)</span>
            <span className="text-base font-black text-white">
              {Math.round(totalDebit).toLocaleString('fr-FR')} FC
            </span>
          </div>

          <div className="w-px h-8 bg-white/20" />

          <div>
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Cumul Crédit (FC)</span>
            <span className="text-base font-black text-white">
              {Math.round(totalCredit).toLocaleString('fr-FR')} FC
            </span>
          </div>

          <div className="w-px h-8 bg-white/20" />

          <div>
            <span className="text-[10px] text-slate-300 uppercase font-bold block">Solde Progressif (FC)</span>
            <span className="text-base font-black text-emerald-300">
              {Math.round(progressiveBalance).toLocaleString('fr-FR')} FC
            </span>
          </div>
        </div>
      </div>

      {/* Tableau du Grand Livre */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[760px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">N° Écriture</th>
                <th className="py-3 px-4">Journal</th>
                <th className="py-3 px-4">Pièce Réf.</th>
                <th className="py-3 px-4">Libellé de l'opération</th>
                <th className="py-3 px-4 text-right">Débit (FC)</th>
                <th className="py-3 px-4 text-right">Crédit (FC)</th>
                <th className="py-3 px-4 text-right">Solde Progressif (FC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLines.map((line) => (
                <tr key={line.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 text-slate-600">
                    {new Date(line.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-4 font-mono font-bold text-slate-900">{line.entryNumber}</td>
                  <td className="py-3 px-4">
                    <span className="font-mono px-2 py-0.5 rounded bg-slate-100 font-bold text-[10px]">
                      {line.journalCode}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-mono text-slate-500">{line.pieceRef || '-'}</td>
                  <td className="py-3 px-4 font-medium text-slate-800">{line.label}</td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {line.debit > 0
                      ? `${Math.round(line.debit).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-slate-900">
                    {line.credit > 0
                      ? `${Math.round(line.credit).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-black text-blue-700">
                    {Math.round(line.cumulativeBalance).toLocaleString('fr-FR')} FC
                  </td>
                </tr>
              ))}

              {filteredLines.length === 0 && (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    Aucun mouvement enregistré sur ce compte pour les filtres sélectionnés.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
