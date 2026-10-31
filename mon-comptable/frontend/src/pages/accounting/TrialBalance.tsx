import React, { useState, useEffect } from 'react';
import {
  Scale,
  Search,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle,
  FolderTree,
  ShieldCheck,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredChartOfAccounts,
  getStoredEntries,
  subscribeToBccRateUpdates,
  TrialBalanceLine,
} from '../../data/accountingMockData';

export const TrialBalance: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(getStoredChartOfAccounts);
  const [allEntries, setAllEntries] = useState(getStoredEntries);
  const entries = allEntries.filter((e) => e.status === 'VALIDATED');

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates(() => {
      setAccounts(getStoredChartOfAccounts());
      setAllEntries(getStoredEntries());
    });
    return unsubscribe;
  }, []);

  const [selectedClass, setSelectedClass] = useState<number | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Calcul dynamique de la Balance Générale
  const balanceLines: TrialBalanceLine[] = accounts.map((acc) => {
    let totDebit = 0;
    let totCredit = 0;

    entries.forEach((e) => {
      e.lines.forEach((l) => {
        if (l.accountNumber === acc.accountNumber) {
          totDebit += l.debit;
          totCredit += l.credit;
        }
      });
    });

    // Détermination solde débiteur ou créditeur
    const diff = totDebit - totCredit;
    const debitBalance = diff > 0 ? diff : 0;
    const creditBalance = diff < 0 ? Math.abs(diff) : 0;

    return {
      accountNumber: acc.accountNumber,
      label: acc.label,
      accountClass: acc.accountClass,
      totalDebit: totDebit,
      totalCredit: totCredit,
      debitBalance,
      creditBalance,
    };
  });

  const filteredLines = balanceLines.filter((l) => {
    const matchesSearch =
      l.accountNumber.includes(searchQuery) ||
      l.label.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesClass = selectedClass === 'ALL' || l.accountClass === selectedClass;
    return matchesSearch && matchesClass;
  });

  // Totaux globaux de la Balance
  const totalMouvementsDebit = balanceLines.reduce((acc, l) => acc + l.totalDebit, 0);
  const totalMouvementsCredit = balanceLines.reduce((acc, l) => acc + l.totalCredit, 0);
  const totalSoldesDebiteurs = balanceLines.reduce((acc, l) => acc + l.debitBalance, 0);
  const totalSoldesCrediteurs = balanceLines.reduce((acc, l) => acc + l.creditBalance, 0);

  const isMouvementsBalanced = Math.abs(totalMouvementsDebit - totalMouvementsCredit) < 0.01;
  const isSoldesBalanced = Math.abs(totalSoldesDebiteurs - totalSoldesCrediteurs) < 0.01;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              États de Synthèse • Contrôle Périodique
            </span>
            <span className="text-xs text-slate-400">• Exercice 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Balance Générale des Comptes (6 Colonnes)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Tableau exhaustif de contrôle vérifiant l'égalité des masses de débits et crédits, et des soldes débiteurs et créditeurs.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => alert('Export de la Balance Générale au format Excel / PDF généré.')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Exporter la Balance (Excel / PDF)</span>
          </button>
        </div>
      </div>

      {/* Cartes Équilibre des Masses & Soldes */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Égalité des Mouvements */}
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
            isMouvementsBalanced
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <span className="font-extrabold block">Égalité des Mouvements en FC (Débit = Crédit)</span>
              <span className="text-xs opacity-90">
                Débit : {Math.round(totalMouvementsDebit).toLocaleString('fr-FR')} FC •
                Crédit : {Math.round(totalMouvementsCredit).toLocaleString('fr-FR')} FC
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/80 font-black text-xs shadow-2xs">
            {isMouvementsBalanced ? 'CONFORME' : 'ÉCART'}
          </span>
        </div>

        {/* Égalité des Soldes */}
        <div
          className={`p-5 rounded-2xl border flex items-center justify-between text-xs sm:text-sm ${
            isSoldesBalanced
              ? 'bg-blue-50 border-blue-200 text-blue-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-3">
            <Scale className="w-6 h-6 text-blue-600 shrink-0" />
            <div>
              <span className="font-extrabold block">Égalité des Soldes en FC (Soldes D = Soldes C)</span>
              <span className="text-xs opacity-90">
                Débiteurs : {Math.round(totalSoldesDebiteurs).toLocaleString('fr-FR')} FC •
                Créditeurs : {Math.round(totalSoldesCrediteurs).toLocaleString('fr-FR')} FC
              </span>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-lg bg-white/80 font-black text-xs shadow-2xs">
            {isSoldesBalanced ? 'CONFORME' : 'ÉCART'}
          </span>
        </div>
      </div>

      {/* Barre de Filtres par Classe */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedClass('ALL')}
          className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
            selectedClass === 'ALL'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
          }`}
        >
          Toutes les classes ({balanceLines.length})
        </button>

        {[1, 2, 3, 4, 5, 6, 7].map((cls) => (
          <button
            key={cls}
            onClick={() => setSelectedClass(cls)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
              selectedClass === cls
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Classe {cls}
          </button>
        ))}
      </div>

      {/* Tableau de la Balance Générale */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[720px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-3 px-4">N° Compte</th>
                <th className="py-3 px-4">Intitulé du Compte</th>
                <th className="py-3 px-4 text-right">Mouvement Débit (FC)</th>
                <th className="py-3 px-4 text-right">Mouvement Crédit (FC)</th>
                <th className="py-3 px-4 text-right text-blue-700">Solde Débiteur (FC)</th>
                <th className="py-3 px-4 text-right text-purple-700">Solde Créditeur (FC)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLines.map((line) => (
                <tr key={line.accountNumber} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4 font-mono font-black text-slate-900 text-xs">
                    {line.accountNumber}
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{line.label}</td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {line.totalDebit > 0
                      ? `${Math.round(line.totalDebit).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-slate-700">
                    {line.totalCredit > 0
                      ? `${Math.round(line.totalCredit).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-blue-700">
                    {line.debitBalance > 0
                      ? `${Math.round(line.debitBalance).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                  <td className="py-3 px-4 text-right font-bold text-purple-700">
                    {line.creditBalance > 0
                      ? `${Math.round(line.creditBalance).toLocaleString('fr-FR')} FC`
                      : '-'}
                  </td>
                </tr>
              ))}

              {/* Ligne des Totaux Généraux */}
              <tr className="bg-slate-100 font-black text-slate-900 text-xs">
                <td colSpan={2} className="py-3 px-4 uppercase text-[11px]">
                  Totaux Généraux de la Balance (en Franc Congolais) :
                </td>
                <td className="py-3 px-4 text-right">
                  {Math.round(totalMouvementsDebit).toLocaleString('fr-FR')} FC
                </td>
                <td className="py-3 px-4 text-right">
                  {Math.round(totalMouvementsCredit).toLocaleString('fr-FR')} FC
                </td>
                <td className="py-3 px-4 text-right text-blue-700">
                  {Math.round(totalSoldesDebiteurs).toLocaleString('fr-FR')} FC
                </td>
                <td className="py-3 px-4 text-right text-purple-700">
                  {Math.round(totalSoldesCrediteurs).toLocaleString('fr-FR')} FC
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
