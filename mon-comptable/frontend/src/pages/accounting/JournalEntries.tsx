import React, { useState, useEffect } from 'react';
import {
  Plus,
  Trash2,
  CheckCircle2,
  AlertTriangle,
  FileText,
  RotateCcw,
  Calculator,
  Coins,
  ArrowRightLeft,
  Clock,
  Receipt,
  Printer,
  CheckCheck,
  Sparkles,
  X,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  DEFAULT_BCC_EXCHANGE_RATE,
  getStoredChartOfAccounts,
  getStoredJournals,
  getStoredEntries,
  saveStoredEntries,
  getStoredBccExchangeRate,
  saveStoredBccExchangeRate,
  subscribeToBccRateUpdates,
  syncLiveBccExchangeRate,
  runMidnightAutoValidationForPosEntries,
  AccountingEntry,
  PosAttachedReceipt,
} from '../../data/accountingMockData';

export const JournalEntries: React.FC = () => {
  const { user, logAuditEvent } = useAuth();
  const isAdminOrAccountant =
    user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN' || user?.role === 'ACCOUNTANT';

  const accounts = getStoredChartOfAccounts();
  const journals = getStoredJournals();
  const [entries, setEntries] = useState<AccountingEntry[]>(getStoredEntries);

  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);
  const [selectedPosReceiptModal, setSelectedPosReceiptModal] = useState<PosAttachedReceipt | null>(
    null
  );
  const [midnightCountdown, setMidnightCountdown] = useState<string>('');

  // Taux de change officiel BCC (1 USD -> FC) et convertisseur rapide USD -> FC
  const [bccRate, setBccRate] = useState<number>(getStoredBccExchangeRate);
  const [usdHelperAmount, setUsdHelperAmount] = useState<string>('1000');

  // Formulaire de saisie d'écriture
  const [entryDate, setEntryDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [journalCode, setJournalCode] = useState<string>('VT');
  const [entryLabel, setEntryLabel] = useState<string>('');
  const [pieceRef, setPieceRef] = useState<string>('');

  // Lignes d'écriture (montants en Francs Congolais FC / CDF : 1 000 $ * 2 261 FC = 2 261 000 FC)
  const [lines, setLines] = useState<
    {
      accountId: number;
      accountNumber: string;
      accountLabel: string;
      lineLabel: string;
      debit: string;
      credit: string;
    }[]
  >([
    {
      accountId: 11,
      accountNumber: '411100',
      accountLabel: 'Clients ordinaires - Ventes locales',
      lineLabel: '',
      debit: '2261000',
      credit: '0',
    },
    {
      accountId: 29,
      accountNumber: '701100',
      accountLabel: 'Ventes de terminaux tactiles POS Taixun',
      lineLabel: '',
      debit: '0',
      credit: '2261000',
    },
  ]);

  const showNotice = (msg: string) => {
    setFeedbackMsg(msg);
    setTimeout(() => {
      setFeedbackMsg(null);
    }, 6000);
  };

  // Abonnement en temps réel aux variations du taux de la Banque Centrale du Congo (BCC)
  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
      setEntries(getStoredEntries());
      if (meta.rate !== meta.previousRate) {
        showNotice(
          `📈 [FLUX BCC TEMPS RÉEL] La Banque Centrale du Congo a mis à jour le taux : 1 USD = ${meta.rate.toLocaleString(
            'fr-FR'
          )} FC (précédent : ${meta.previousRate.toLocaleString(
            'fr-FR'
          )} FC). Les écritures en attente ont été réajustées automatiquement.`
        );
      }
    });
    return unsubscribe;
  }, []);

  // Vérification automatique de minuit (00h00) au chargement et toutes les secondes + compte à rebours
  useEffect(() => {
    const checkMidnightAndTimer = () => {
      const now = new Date();
      const midnight = new Date(now);
      midnight.setHours(24, 0, 0, 0);
      const diffMs = midnight.getTime() - now.getTime();

      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diffMs % (1000 * 60)) / 1000);

      setMidnightCountdown(
        `${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(
          seconds
        ).padStart(2, '0')}s`
      );

      // Si minuit est franchi pour des écritures de la veille ou exactement à 00:00:00
      const result = runMidnightAutoValidationForPosEntries(
        now.getHours() === 0 && now.getMinutes() === 0 && now.getSeconds() <= 2
      );
      if (result.autoValidatedCount > 0) {
        setEntries(result.updatedEntries);
        showNotice(
          `🕛 [CLÔTURE AUTOMATIQUE 00h00] ${result.autoValidatedCount} écriture(s) issue(s) de la Caisse POS non validée(s) manuellement ont été enregistrée(s) automatiquement dans le Journal de l'entreprise.`
        );
      }
    };

    checkMidnightAndTimer();
    const timerId = setInterval(checkMidnightAndTimer, 1000);
    return () => clearInterval(timerId);
  }, []);

  // Écritures en attente issues de Ventes POS & Caisse (statut DRAFT)
  const pendingPosEntries = entries.filter((e) => e.status === 'DRAFT');

  // Valider manuellement une écriture POS en attente
  const handleValidateSinglePosEntry = (entry: AccountingEntry) => {
    if (!isAdminOrAccountant) return;

    const updated = entries.map((e) =>
      e.id === entry.id
        ? {
            ...e,
            status: 'VALIDATED' as const,
            validatedByName: `${user?.name || 'Comptable'} (Validation manuelle)`,
            validatedAt: new Date().toISOString(),
            autoPostedBySystem: false,
          }
        : e
    );

    setEntries(updated);
    saveStoredEntries(updated);

    logAuditEvent(
      'ACCOUNTING_ENTRY_VALIDATED',
      'Comptabilité Générale',
      `Validation manuelle par le Comptable de l'écriture Caisse POS ${entry.entryNumber} (Pièce justificative : Reçu ${entry.pieceRef}) pour ${entry.totalDebit.toLocaleString('fr-FR')} FC.`
    );

    showNotice(
      `✅ Écriture ${entry.entryNumber} (Reçu ${entry.pieceRef}) validée par le Comptable et enregistrée définitivement dans le Journal (${entry.journalCode}) !`
    );
  };

  // Valider tout le lot de fin de journée en 1 clic
  const handleValidateAllPosEntries = () => {
    if (!isAdminOrAccountant || pendingPosEntries.length === 0) return;

    const count = pendingPosEntries.length;
    const totalFc = pendingPosEntries.reduce((acc, e) => acc + e.totalDebit, 0);

    const updated = entries.map((e) =>
      e.status === 'DRAFT'
        ? {
            ...e,
            status: 'VALIDATED' as const,
            validatedByName: `${user?.name || 'Comptable'} (Validation Lot Fin de Journée)`,
            validatedAt: new Date().toISOString(),
            autoPostedBySystem: false,
          }
        : e
    );

    setEntries(updated);
    saveStoredEntries(updated);

    logAuditEvent(
      'ACCOUNTING_ENTRY_VALIDATED',
      'Comptabilité Générale',
      `Validation groupée de fin de journée de ${count} écriture(s) POS & Caisse pour un total de ${totalFc.toLocaleString('fr-FR')} FC par ${user?.name}.`
    );

    showNotice(
      `✅ Lot de fin de journée validé : ${count} écriture(s) Caisse POS (${totalFc.toLocaleString('fr-FR')} FC) enregistrée(s) dans le Journal de l'entreprise !`
    );
  };

  // Simuler l'exécution automatique du système à 00h00
  const handleSimulateMidnightAutoPost = () => {
    if (pendingPosEntries.length === 0) return;

    const result = runMidnightAutoValidationForPosEntries(true);
    setEntries(result.updatedEntries);

    logAuditEvent(
      'ACCOUNTING_ENTRY_VALIDATED',
      'Automate Comptable 00h00',
      `Enregistrement automatique à 00h00 de ${result.autoValidatedCount} écriture(s) POS & Caisse non validées manuellement par le Comptable.`
    );

    showNotice(
      `🕛 [AUTOMATE 00h00 EXÉCUTÉ] Le Comptable n'ayant pas validé manuellement avant minuit, le système a enregistré automatiquement les ${result.autoValidatedCount} opération(s) POS & Caisse dans le Journal de l'entreprise.`
    );
  };

  // Calcul dynamique de l'équilibre en Francs Congolais (FC)
  const sumDebit = lines.reduce((acc, l) => acc + (parseFloat(l.debit) || 0), 0);
  const sumCredit = lines.reduce((acc, l) => acc + (parseFloat(l.credit) || 0), 0);
  const balanceDifference = Math.abs(sumDebit - sumCredit);
  const isBalanced = balanceDifference < 1 && sumDebit > 0;

  const handleRateChange = (newRateVal: string) => {
    const parsed = parseFloat(newRateVal);
    if (!isNaN(parsed) && parsed > 0) {
      setBccRate(parsed);
      saveStoredBccExchangeRate(parsed);
    }
  };

  const applyUsdConversionToBalancedLines = () => {
    const usd = parseFloat(usdHelperAmount) || 0;
    if (usd <= 0) return;
    const cdfAmount = Math.round(usd * bccRate);
    if (lines.length >= 2) {
      const updated = [...lines];
      updated[0].debit = String(cdfAmount);
      updated[0].credit = '0';
      updated[1].debit = '0';
      updated[1].credit = String(cdfAmount);
      setLines(updated);
      if (!entryLabel.trim()) {
        setEntryLabel(
          `Opération comptabilisée en monnaie nationale (Contre-valeur de $${usd.toLocaleString(
            'en-US'
          )} USD au taux BCC de ${bccRate} FC/$)`
        );
      }
    }
  };

  const handleAddLine = () => {
    const defaultAcc = accounts[0];
    setLines([
      ...lines,
      {
        accountId: defaultAcc.id,
        accountNumber: defaultAcc.accountNumber,
        accountLabel: defaultAcc.label,
        lineLabel: '',
        debit: '0',
        credit: '0',
      },
    ]);
  };

  const handleRemoveLine = (index: number) => {
    if (lines.length <= 2) {
      alert(
        'Une écriture en partie double requiert au minimum deux lignes (un débit et un crédit).'
      );
      return;
    }
    setLines(lines.filter((_, i) => i !== index));
  };

  const handleLineAccountChange = (index: number, accountId: number) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    const updated = [...lines];
    updated[index].accountId = acc.id;
    updated[index].accountNumber = acc.accountNumber;
    updated[index].accountLabel = acc.label;
    setLines(updated);
  };

  const handleLineValueChange = (
    index: number,
    field: 'lineLabel' | 'debit' | 'credit',
    val: string
  ) => {
    const updated = [...lines];
    updated[index][field] = val;
    setLines(updated);
  };

  // Enregistrement de l'écriture en Francs Congolais (FC / CDF)
  const handleSaveEntry = (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAdminOrAccountant) {
      alert(
        "Permission refusée. Seul un Comptable ou l'Administrateur peut comptabiliser des écritures."
      );
      return;
    }

    if (!isBalanced) {
      alert(
        `RÈGLE COMPTABLE INVIOLABLE (SYSCOHADA RDC) :\nL'écriture est déséquilibrée (Écart: ${balanceDifference.toLocaleString(
          'fr-FR'
        )} FC).\nLe Total Débit en Francs Congolais (FC) doit obligatoirement être égal au Total Crédit.`
      );
      return;
    }

    if (!entryLabel.trim()) {
      alert("Veuillez renseigner un libellé d'écriture explicite.");
      return;
    }

    const journal = journals.find((j) => j.code === journalCode);
    const newEntryNumber = `ECR-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const newEntry: AccountingEntry = {
      id: Date.now(),
      entryNumber: newEntryNumber,
      date: new Date(entryDate).toISOString(),
      journalCode,
      journalName: journal?.name || 'Journal',
      fiscalYear: '2026',
      periodName: 'Octobre 2026',
      label: entryLabel.trim(),
      pieceRef: pieceRef.trim() || undefined,
      status: 'VALIDATED',
      sourceDocType: 'MANUAL',
      totalDebit: sumDebit,
      totalCredit: sumCredit,
      isBalanced: true,
      createdByName: user?.name || 'Comptable',
      validatedByName: user?.name || 'Comptable',
      validatedAt: new Date().toISOString(),
      lines: lines.map((l, idx) => ({
        id: Date.now() + idx,
        lineNumber: idx + 1,
        accountId: l.accountId,
        accountNumber: l.accountNumber,
        accountLabel: l.accountLabel,
        debit: parseFloat(l.debit) || 0,
        credit: parseFloat(l.credit) || 0,
        label: l.lineLabel || entryLabel.trim(),
        pieceRef: pieceRef.trim() || undefined,
      })),
    };

    const updated = [newEntry, ...entries];
    setEntries(updated);
    saveStoredEntries(updated);

    setEntryLabel('');
    setPieceRef('');
    showNotice(
      `Écriture ${newEntry.entryNumber} validée et comptabilisée en monnaie nationale (Débit: ${sumDebit.toLocaleString(
        'fr-FR'
      )} FC / Crédit: ${sumCredit.toLocaleString('fr-FR')} FC).`
    );
  };

  // Procédure comptable : Annulation d'une écriture par CONTREPASSATION
  const handleContrepasser = (targetEntry: AccountingEntry) => {
    if (!isAdminOrAccountant) return;

    const confirmation = window.confirm(
      `Confirmez-vous la contrepassation de l'écriture ${targetEntry.entryNumber} ?\n\nConformément aux normes comptables SYSCOHADA, l'écriture originale ne sera pas effacée : une écriture inverse d'annulation en Francs Congolais (FC) sera générée et tracée.`
    );
    if (!confirmation) return;

    const contrepassEntryNumber = `ECR-EXT-${Math.floor(10000 + Math.random() * 90000)}`;
    const contrepassEntry: AccountingEntry = {
      id: Date.now(),
      entryNumber: contrepassEntryNumber,
      date: new Date().toISOString(),
      journalCode: 'OD',
      journalName: 'Opérations Diverses',
      fiscalYear: targetEntry.fiscalYear,
      periodName: targetEntry.periodName,
      label: `[CONTREPASSATION] Annulation de ${targetEntry.entryNumber} - ${targetEntry.label}`,
      pieceRef: `ANNUL-${targetEntry.entryNumber}`,
      status: 'VALIDATED',
      sourceDocType: 'MANUAL',
      totalDebit: targetEntry.totalCredit,
      totalCredit: targetEntry.totalDebit,
      isBalanced: true,
      createdByName: user?.name || 'Comptable',
      validatedByName: user?.name || 'Comptable',
      validatedAt: new Date().toISOString(),
      lines: targetEntry.lines.map((l, idx) => ({
        id: Date.now() + idx,
        lineNumber: idx + 1,
        accountId: l.accountId,
        accountNumber: l.accountNumber,
        accountLabel: l.accountLabel,
        debit: l.credit,
        credit: l.debit,
        label: `Extourne / Contrepassation de ${l.label || targetEntry.label}`,
      })),
    };

    const updated = entries.map((e) =>
      e.id === targetEntry.id ? { ...e, status: 'CANCELLED' as const } : e
    );

    const finalized = [contrepassEntry, ...updated];
    setEntries(finalized);
    saveStoredEntries(finalized);

    showNotice(
      `Écriture ${targetEntry.entryNumber} contrepassée. Écriture d'annulation ${contrepassEntry.entryNumber} générée en FC.`
    );
  };

  const convertedCdfPreview = Math.round((parseFloat(usdHelperAmount) || 0) * bccRate);

  return (
    <div className="space-y-6">
      {/* En-tête Législation Comptable Congolaise */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-100 text-blue-800 uppercase tracking-wider">
              Loi Comptable Congolaise • SYSCOHADA Révisé RDC
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Devise Légale d'Écriture : Franc Congolais (FC / CDF)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1.5">
            Passation & Validation des Écritures Comptables (en FC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Réception en temps réel des encaissements <strong>Ventes POS & Caisse</strong> avec leurs <strong>reçus justificatifs</strong>, validation de fin de journée et enregistrement automatique à <strong>00h00</strong>.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="px-3.5 py-2 rounded-xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-extrabold flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <Coins className="w-4 h-4 text-blue-600" />
            <span>Taux BCC Live : 1 USD ($) = {bccRate.toLocaleString('fr-FR')} FC</span>
          </div>
          <button
            type="button"
            onClick={() => syncLiveBccExchangeRate(bccRate + 15)}
            className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-1.5 shadow-2xs transition"
            title="Simuler une hausse du taux de la Banque Centrale du Congo en temps réel"
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Simuler Hausse BCC (+15 FC)</span>
          </button>
          {bccRate !== DEFAULT_BCC_EXCHANGE_RATE && (
            <button
              type="button"
              onClick={() => saveStoredBccExchangeRate(DEFAULT_BCC_EXCHANGE_RATE, 'FLUX_LIVE_BCC')}
              className="px-2.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1 transition"
              title="Rétablir le taux officiel actuel de 2 261 FC"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>2 261 FC</span>
            </button>
          )}
        </div>
      </div>

      {/* Message notification */}
      {feedbackMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 shadow-xs">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span className="font-semibold">{feedbackMsg}</span>
        </div>
      )}

      {/* ===================================================================== */}
      {/* FILE D'ATTENTE DES OPÉRATIONS « VENTES POS & CAISSE » À VALIDER       */}
      {/* AVEC REÇUS COMME PIÈCES JUSTIFICATIVES & AUTOMATE 00h00               */}
      {/* ===================================================================== */}
      <div className="bg-gradient-to-br from-amber-50/90 via-white to-blue-50/60 rounded-3xl border-2 border-amber-300/80 p-5 sm:p-6 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
          <div className="space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-amber-200/80 text-amber-950 uppercase tracking-wider">
                <Receipt className="w-3.5 h-3.5 text-amber-800" />
                <span>Liaison Directe : Ventes POS & Caisse → Comptable</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-900 text-amber-300">
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Enregistrement Auto à 00h00 dans : {midnightCountdown}</span>
              </span>
            </div>
            <h2 className="text-base sm:text-lg font-black text-slate-900">
              Opérations POS & Caisse du Jour en Attente de Validation ({pendingPosEntries.length})
            </h2>
            <p className="text-xs text-slate-600">
              Chaque encaissement validé par le Vendeur ou Caissier arrive ici sous forme d'écriture comptable équilibrée en <strong>Francs Congolais (FC)</strong> accompagnée du <strong>reçu de caisse comme pièce justificative</strong>. Si le Comptable ne valide pas manuellement avant <strong>00h00</strong>, le système l'enregistre automatiquement dans le Journal de l'entreprise.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {pendingPosEntries.length > 0 && isAdminOrAccountant && (
              <>
                <button
                  type="button"
                  onClick={handleValidateAllPosEntries}
                  className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-2 shadow-sm transition"
                >
                  <CheckCheck className="w-4 h-4" />
                  <span>Valider tout le lot du jour ({pendingPosEntries.length})</span>
                </button>
                <button
                  type="button"
                  onClick={handleSimulateMidnightAutoPost}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-amber-300 font-bold text-xs flex items-center gap-1.5 shadow-xs transition"
                  title="Tester immédiatement la bascule automatique de minuit (00h00)"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Simuler 00h00 (Auto-Enregistrement)</span>
                </button>
              </>
            )}
          </div>
        </div>

        {pendingPosEntries.length === 0 ? (
          <div className="p-6 bg-white/80 rounded-2xl border border-emerald-200 text-center space-y-1">
            <CheckCircle2 className="w-7 h-7 text-emerald-600 mx-auto" />
            <p className="text-xs sm:text-sm font-extrabold text-slate-800">
              Toutes les opérations POS & Caisse de la journée ont été validées et inscrites au Journal de l'entreprise !
            </p>
            <p className="text-[11px] text-slate-500">
              Les nouveaux encaissements validés depuis le terminal « Ventes POS & Caisse » apparaîtront instantanément ici avec leur reçu.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingPosEntries.map((posEntry) => {
              const receipt = posEntry.attachedPosReceipt;
              return (
                <div
                  key={posEntry.id}
                  className="bg-white rounded-2xl border border-amber-200 p-4 shadow-2xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md font-mono font-black text-xs bg-amber-100 text-amber-900">
                        {posEntry.entryNumber}
                      </span>
                      <span className="px-2 py-0.5 rounded-md font-bold text-[10px] bg-blue-100 text-blue-800">
                        Journal : {posEntry.journalCode}
                      </span>
                      <span className="text-xs font-extrabold text-slate-900">
                        {posEntry.label}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-500 font-semibold">
                        Opérateur : <strong>{posEntry.createdByName}</strong>
                      </span>
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-100 text-amber-800">
                        EN ATTENTE VALIDATION (OU AUTO 00h00)
                      </span>
                    </div>
                  </div>

                  {/* Prévisualisation des lignes comptables générées en FC */}
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse text-xs">
                      <thead>
                        <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-100">
                          <th className="py-1.5 px-2">Compte SYSCOHADA</th>
                          <th className="py-1.5 px-2">Intitulé du Compte</th>
                          <th className="py-1.5 px-2">Libellé de l'imputation</th>
                          <th className="py-1.5 px-2 text-right">Débit (FC)</th>
                          <th className="py-1.5 px-2 text-right">Crédit (FC)</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-50">
                        {posEntry.lines.map((line, i) => (
                          <tr key={i}>
                            <td className="py-1.5 px-2 font-mono font-bold text-slate-900">
                              {line.accountNumber}
                            </td>
                            <td className="py-1.5 px-2 text-slate-700 font-medium">
                              {line.accountLabel}
                            </td>
                            <td className="py-1.5 px-2 text-slate-500">{line.label}</td>
                            <td className="py-1.5 px-2 text-right font-extrabold text-blue-700">
                              {line.debit > 0 ? `${line.debit.toLocaleString('fr-FR')} FC` : '-'}
                            </td>
                            <td className="py-1.5 px-2 text-right font-extrabold text-purple-700">
                              {line.credit > 0 ? `${line.credit.toLocaleString('fr-FR')} FC` : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Barre d'actions : Voir le Reçu Justificatif + Valider l'écriture */}
                  <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-2">
                      {receipt && (
                        <button
                          type="button"
                          onClick={() => setSelectedPosReceiptModal(receipt)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold flex items-center gap-1.5 transition"
                        >
                          <Receipt className="w-3.5 h-3.5 text-blue-600" />
                          <span>
                            Voir Reçu Justificatif ({receipt.receiptId} • $
                            {receipt.totalUsd.toFixed(2)})
                          </span>
                        </button>
                      )}
                      <span className="text-[11px] text-slate-500">
                        Total équilibré :{' '}
                        <strong className="text-slate-900">
                          {posEntry.totalDebit.toLocaleString('fr-FR')} FC
                        </strong>
                      </span>
                    </div>

                    {isAdminOrAccountant && (
                      <button
                        type="button"
                        onClick={() => handleValidateSinglePosEntry(posEntry)}
                        className="px-4 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold flex items-center gap-1.5 shadow-2xs transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Valider & Enregistrer au Journal</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Convertisseur Rapide Pièce USD -> Écriture FC (CDF) */}
      <div className="bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 rounded-2xl p-4 sm:p-5 text-white shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-extrabold text-amber-300 uppercase tracking-wider">
            <Calculator className="w-4 h-4" />
            <span>Assistant de Conversion Comptable (Pièce en USD $ → Écriture Légale en FC)</span>
          </div>
          <p className="text-xs text-slate-300">
            Lorsqu'une facture ou opération commerciale est reçue en Dollars ($), convertissez-la instantanément en Francs Congolais (FC) au cours du jour pour passer l'écriture.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 bg-white/10 p-2.5 rounded-xl border border-white/15 text-xs">
          <div>
            <label className="block text-[10px] text-slate-300 font-bold mb-0.5">
              Montant Pièce ($ USD)
            </label>
            <input
              type="number"
              value={usdHelperAmount}
              onChange={(e) => setUsdHelperAmount(e.target.value)}
              className="w-28 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 font-extrabold text-xs"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-300 font-bold mb-0.5">
              Taux du jour (FC / 1 $)
            </label>
            <input
              type="number"
              value={bccRate}
              onChange={(e) => handleRateChange(e.target.value)}
              className="w-24 px-2.5 py-1.5 rounded-lg bg-white text-slate-900 font-extrabold text-xs"
            />
          </div>

          <div className="px-2">
            <span className="block text-[10px] text-emerald-300 font-bold">
              Contre-valeur Légale (CDF)
            </span>
            <span className="text-sm font-black text-white">
              {convertedCdfPreview.toLocaleString('fr-FR')} FC
            </span>
          </div>

          <button
            type="button"
            onClick={applyUsdConversionToBalancedLines}
            className="px-3 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>Injecter en FC dans l'écriture</span>
          </button>
        </div>
      </div>

      {/* Formulaire de Saisie Manuelle d'Écriture en FC */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900">
                Bordereau de Saisie Comptable Manuelle (Montants en Francs Congolais - FC)
              </h3>
              <p className="text-xs text-slate-400">
                Renseignez l'en-tête et les lignes de débit/crédit en monnaie nationale (CDF)
              </p>
            </div>
          </div>

          {/* Badge d'équilibre instantané en FC */}
          <div
            className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-2 border ${
              isBalanced
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            {isBalanced ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>
                  Écriture équilibrée : {sumDebit.toLocaleString('fr-FR')} FC (≈ $
                  {(sumDebit / bccRate).toLocaleString('en-US', { maximumFractionDigits: 2 })})
                </span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-4 h-4 text-rose-600" />
                <span>Déséquilibre : {balanceDifference.toLocaleString('fr-FR')} FC</span>
              </>
            )}
          </div>
        </div>

        <form onSubmit={handleSaveEntry} className="space-y-6 text-xs">
          {/* En-tête de pièce */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 bg-slate-50/60 p-4 rounded-2xl border border-slate-100">
            <div>
              <label className="font-bold text-slate-700 block mb-1">Date Comptable *</label>
              <input
                type="date"
                required
                value={entryDate}
                onChange={(e) => setEntryDate(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">Journal de Saisie *</label>
              <select
                value={journalCode}
                onChange={(e) => setJournalCode(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl font-bold focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              >
                {journals.map((j) => (
                  <option key={j.id} value={j.code}>
                    {j.code} - {j.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">N° Pièce Justificative DGI</label>
              <input
                type="text"
                placeholder="Ex: FAC-2026-009, VIR-8820"
                value={pieceRef}
                onChange={(e) => setPieceRef(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-mono"
              />
            </div>

            <div>
              <label className="font-bold text-slate-700 block mb-1">
                Libellé Général de l'Écriture *
              </label>
              <input
                type="text"
                required
                placeholder="Ex: Facture Vente Client Gombe (en FC)"
                value={entryLabel}
                onChange={(e) => setEntryLabel(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-hidden font-bold"
              />
            </div>
          </div>

          {/* Tableau des lignes d'écritures en FC */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-extrabold uppercase text-[11px] text-slate-500 tracking-wider">
                Lignes d'écritures en Partie Double — Montants en Francs Congolais (FC / CDF) :
              </span>
              <button
                type="button"
                onClick={handleAddLine}
                className="px-3 py-1.5 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs flex items-center gap-1.5 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Ajouter une Ligne</span>
              </button>
            </div>

            <div className="overflow-x-auto min-w-0 border border-slate-200 rounded-2xl">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                    <th className="py-2.5 px-3 w-64">Compte Général SYSCOHADA</th>
                    <th className="py-2.5 px-3">Libellé spécifique (optionnel)</th>
                    <th className="py-2.5 px-3 w-44 text-right">Débit (FC / CDF)</th>
                    <th className="py-2.5 px-3 w-44 text-right">Crédit (FC / CDF)</th>
                    <th className="py-2.5 px-2 w-12 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {lines.map((line, idx) => (
                    <tr key={idx} className="hover:bg-slate-50/50">
                      <td className="py-2.5 px-3">
                        <select
                          value={line.accountId}
                          onChange={(e) => handleLineAccountChange(idx, parseInt(e.target.value))}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl font-bold text-slate-800 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        >
                          {accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountNumber} - {a.label}
                            </option>
                          ))}
                        </select>
                      </td>

                      <td className="py-2.5 px-3">
                        <input
                          type="text"
                          placeholder={entryLabel || 'Libellé de la ligne'}
                          value={line.lineLabel}
                          onChange={(e) => handleLineValueChange(idx, 'lineLabel', e.target.value)}
                          className="w-full p-2 bg-white border border-slate-200 rounded-xl text-slate-700 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                        />
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={line.debit}
                            onChange={(e) => handleLineValueChange(idx, 'debit', e.target.value)}
                            className="w-full p-2 pr-9 bg-white border border-slate-200 rounded-xl text-right font-black text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            FC
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3">
                        <div className="relative">
                          <input
                            type="number"
                            step="1"
                            min="0"
                            value={line.credit}
                            onChange={(e) => handleLineValueChange(idx, 'credit', e.target.value)}
                            className="w-full p-2 pr-9 bg-white border border-slate-200 rounded-xl text-right font-black text-slate-900 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                          />
                          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-bold text-slate-400">
                            FC
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveLine(idx)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}

                  {/* Ligne Totaux & Équilibre en FC + Contre-valeur USD */}
                  <tr className="bg-slate-50 font-black text-sm text-slate-900">
                    <td colSpan={2} className="py-3 px-4 text-right uppercase text-xs">
                      Totaux de la pièce (Monnaie Nationale FC) :
                    </td>
                    <td className="py-3 px-3 text-right text-blue-700">
                      <div>{sumDebit.toLocaleString('fr-FR')} FC</div>
                      <div className="text-[10px] font-semibold text-slate-400">
                        ≈ ${(sumDebit / bccRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right text-purple-700">
                      <div>{sumCredit.toLocaleString('fr-FR')} FC</div>
                      <div className="text-[10px] font-semibold text-slate-400">
                        ≈ ${(sumCredit / bccRate).toLocaleString('en-US', { maximumFractionDigits: 2 })} USD
                      </div>
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Pied du formulaire */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-500">
              {isBalanced ? (
                <span className="text-emerald-700 font-bold flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4" />
                  Prêt pour comptabilisation définitive en Francs Congolais (FC) au Grand Livre.
                </span>
              ) : (
                <span className="text-rose-700 font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4" />
                  Veuillez équilibrer l'écriture en FC pour pouvoir l'enregistrer (Écart :{' '}
                  {balanceDifference.toLocaleString('fr-FR')} FC).
                </span>
              )}
            </div>

            <button
              type="submit"
              disabled={!isBalanced || !isAdminOrAccountant}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-xs transition-colors"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Valider & Comptabiliser l'Écriture en FC</span>
            </button>
          </div>
        </form>
      </div>

      {/* Historique des Écritures en Francs Congolais (FC) */}
      <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-sm text-slate-900">
              Livre-Journal Général en Francs Congolais (FC / CDF) & Pièces Justificatives
            </h3>
            <p className="text-xs text-slate-400">
              Toutes les écritures validées (manuellement par le Comptable ou automatiquement à 00h00) avec accès direct au reçu POS justificatif.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto min-w-0">
          <table className="w-full text-left border-collapse text-xs min-w-[820px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px] tracking-wider">
                <th className="py-2.5 px-3">N° Écriture</th>
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Journal</th>
                <th className="py-2.5 px-3">Libellé & Validation</th>
                <th className="py-2.5 px-3">Pièce Justificative</th>
                <th className="py-2.5 px-3 text-right">Montant Débit (FC)</th>
                <th className="py-2.5 px-3 text-right">Montant Crédit (FC)</th>
                <th className="py-2.5 px-3">Statut</th>
                <th className="py-2.5 px-3 text-right">Procédure</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {entries.map((entry) => (
                <tr
                  key={entry.id}
                  className={`hover:bg-slate-50/70 transition-colors ${
                    entry.status === 'CANCELLED'
                      ? 'opacity-60 bg-rose-50/20'
                      : entry.status === 'DRAFT'
                      ? 'bg-amber-50/40'
                      : ''
                  }`}
                >
                  <td className="py-3 px-3 font-mono font-bold text-slate-900">{entry.entryNumber}</td>
                  <td className="py-3 px-3 text-slate-600">
                    {new Date(entry.date).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="py-3 px-3 font-bold text-slate-700">{entry.journalCode}</td>
                  <td className="py-3 px-3">
                    <div className="font-semibold text-slate-800">{entry.label}</div>
                    {entry.validatedByName && (
                      <div className="text-[10px] text-slate-400">
                        Validé par : <strong>{entry.validatedByName}</strong>
                      </div>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {entry.attachedPosReceipt ? (
                      <button
                        type="button"
                        onClick={() => setSelectedPosReceiptModal(entry.attachedPosReceipt!)}
                        className="px-2.5 py-1 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 font-bold text-[11px] inline-flex items-center gap-1"
                      >
                        <Receipt className="w-3 h-3" />
                        <span>Reçu {entry.pieceRef}</span>
                      </button>
                    ) : (
                      <span className="font-mono text-[11px] text-slate-500">
                        {entry.pieceRef || '-'}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {entry.totalDebit.toLocaleString('fr-FR')} FC
                  </td>
                  <td className="py-3 px-3 text-right font-black text-slate-900 whitespace-nowrap">
                    {entry.totalCredit.toLocaleString('fr-FR')} FC
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        entry.status === 'VALIDATED'
                          ? 'bg-emerald-100 text-emerald-800'
                          : entry.status === 'DRAFT'
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-rose-100 text-rose-800'
                      }`}
                    >
                      {entry.status === 'DRAFT'
                        ? 'ATTENTE (AUTO 00h00)'
                        : entry.autoPostedBySystem
                        ? 'VALIDÉ AUTO 00h00'
                        : entry.status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    {entry.status === 'DRAFT' && isAdminOrAccountant && (
                      <button
                        type="button"
                        onClick={() => handleValidateSinglePosEntry(entry)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 transition-colors"
                      >
                        <CheckCircle2 className="w-3 h-3" />
                        <span>Valider</span>
                      </button>
                    )}
                    {entry.status === 'VALIDATED' && isAdminOrAccountant && (
                      <button
                        type="button"
                        onClick={() => handleContrepasser(entry)}
                        className="px-2.5 py-1 rounded-lg border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-slate-700 hover:text-rose-700 font-bold text-[11px] flex items-center gap-1 ml-auto transition-colors"
                        title="Annulation par contrepassation comptable"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Contrepasser</span>
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* ===================================================================== */}
      {/* MODAL DE CONSULTATION DU REÇU DE CAISSE POS (PIÈCE JUSTIFICATIVE)     */}
      {/* ===================================================================== */}
      {selectedPosReceiptModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Receipt className="w-4 h-4" />
                </span>
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">
                    Pièce Justificative de Caisse POS
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Transmise par {selectedPosReceiptModal.operatorName} ({selectedPosReceiptModal.operatorRole})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedPosReceiptModal(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center border-b border-dashed border-slate-300 pb-3 space-y-0.5">
              <h4 className="font-extrabold text-xs text-slate-900 uppercase">
                {selectedPosReceiptModal.receiptHeader}
              </h4>
              <p className="text-[11px] text-slate-500">
                {selectedPosReceiptModal.companyName} • {selectedPosReceiptModal.establishmentName}
              </p>
            </div>

            <div className="text-xs space-y-1.5 border-b border-dashed border-slate-300 pb-3">
              <div className="flex justify-between">
                <span className="text-slate-500">N° Reçu Justificatif :</span>
                <span className="font-mono font-bold text-blue-700">
                  {selectedPosReceiptModal.receiptId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Heure d'encaissement :</span>
                <span className="font-semibold">{selectedPosReceiptModal.timestamp}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Client :</span>
                <span className="font-bold text-slate-800">{selectedPosReceiptModal.clientName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Poste / Caisse :</span>
                <span className="font-semibold">{selectedPosReceiptModal.tableOrStation}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Moyen de paiement :</span>
                <span className="font-bold text-slate-900">
                  {selectedPosReceiptModal.paymentMethodLabel}
                </span>
              </div>
            </div>

            {selectedPosReceiptModal.items.length > 0 && (
              <div className="space-y-1.5 border-b border-dashed border-slate-300 pb-3 text-xs">
                <span className="text-[10px] font-bold uppercase text-slate-400 block">
                  Détail des articles / prestations :
                </span>
                {selectedPosReceiptModal.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between gap-2">
                    <span className="text-slate-700">
                      {item.quantity}x {item.name}
                    </span>
                    <span className="font-bold text-slate-900">${item.totalUsd.toFixed(2)}</span>
                  </div>
                ))}
              </div>
            )}

            <div className="space-y-1.5 text-xs bg-slate-50 p-3 rounded-2xl border border-slate-200/80">
              <div className="flex justify-between text-slate-700 font-bold">
                <span>Montant Encaissé (Devise Caisse USD) :</span>
                <span>${selectedPosReceiptModal.totalUsd.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[11px] text-slate-500">
                <span>Taux de conversion appliqué (BCC) :</span>
                <span>1 $ = {selectedPosReceiptModal.bccExchangeRate.toLocaleString('fr-FR')} FC</span>
              </div>
              <div className="flex justify-between text-sm font-black text-blue-700 pt-1 border-t border-slate-200">
                <span>Montant Écriture Légale (FC / CDF) :</span>
                <span>{selectedPosReceiptModal.totalCdf.toLocaleString('fr-FR')} FC</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2">
              <button
                onClick={() => window.print()}
                className="flex-1 py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-1.5"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimer la Pièce Justificative</span>
              </button>
              <button
                onClick={() => setSelectedPosReceiptModal(null)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
