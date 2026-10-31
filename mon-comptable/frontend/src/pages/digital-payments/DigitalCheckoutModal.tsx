import React, { useState, useEffect } from 'react';
import {
  X,
  CreditCard,
  Smartphone,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Loader2,
  Lock,
  ArrowRight,
  Banknote,
  Coins,
  Receipt
} from 'lucide-react';
import { DigitalPaymentProvider, DigitalPaymentStatus, PaymentTransaction } from '../../types';
import {
  getStoredProviderConfigs,
  getStoredEntries,
  saveStoredEntries,
  saveStoredPaymentTransactions,
  getStoredPaymentTransactions,
} from '../../data/accountingMockData';

interface DigitalCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (transaction: PaymentTransaction) => void;
  defaultAmount?: number;
  orderReference?: string;
  customerName?: string;
}

export const DigitalCheckoutModal: React.FC<DigitalCheckoutModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  defaultAmount = 450,
  orderReference = `CMD-${Date.now().toString().slice(-6)}`,
  customerName = 'Boutique Élégance Kinshasa',
}) => {
  const [provider, setProvider] = useState<DigitalPaymentProvider>(DigitalPaymentProvider.CASH);
  const [amount, setAmount] = useState<number>(defaultAmount);
  const [cashTendered, setCashTendered] = useState<number>(defaultAmount);
  const [cashRegister, setCashRegister] = useState<string>('571100');
  const [phone, setPhone] = useState<string>('+243 81 234 5678');
  const [cardHolder, setCardHolder] = useState<string>(customerName);
  const [cardNumber, setCardNumber] = useState<string>('4242 •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvc, setCardCvc] = useState<string>('789');

  const [step, setStep] = useState<'FORM' | 'PROCESSING' | '3DS_CHALLENGE' | 'SUCCESS' | 'ERROR'>('FORM');
  const [countdown, setCountdown] = useState<number>(10);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [createdTxn, setCreatedTxn] = useState<PaymentTransaction | null>(null);

  const configs = getStoredProviderConfigs();
  const currentConfig = configs.find((c) => c.provider === provider) || configs[0];

  const feeRate = provider === DigitalPaymentProvider.CASH ? 0 : currentConfig ? currentConfig.commissionRate : 2.0;
  const calculatedFee = provider === DigitalPaymentProvider.CASH ? 0 : Number(((amount * feeRate) / 100).toFixed(2));
  const calculatedNet = Number((amount - calculatedFee).toFixed(2));
  const changeDue = Math.max(0, Number((cashTendered - amount).toFixed(2)));

  // Reset when opening
  useEffect(() => {
    if (isOpen) {
      setStep('FORM');
      setCountdown(10);
      setErrorMessage('');
      setCreatedTxn(null);
      setCashTendered(amount);
    }
  }, [isOpen, amount]);

  // Countdown timer when processing USSD prompt
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === 'PROCESSING' && countdown > 0) {
      timer = setTimeout(() => {
        setCountdown((c) => c - 1);
      }, 1000);
    } else if (step === 'PROCESSING' && countdown === 0) {
      finalizeTransaction();
    }
    return () => clearTimeout(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  const handleStartPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) {
      setErrorMessage('Le montant doit être supérieur à zéro.');
      return;
    }

    if (provider === DigitalPaymentProvider.CASH) {
      if (cashTendered < amount) {
        setErrorMessage(`Le montant remis ($${cashTendered}) est inférieur au montant dû ($${amount}).`);
        return;
      }
      finalizeTransaction();
      return;
    }

    if (provider === DigitalPaymentProvider.CARD_VISA_MASTERCARD) {
      setStep('3DS_CHALLENGE');
      setTimeout(() => {
        setStep('PROCESSING');
        setCountdown(3);
      }, 2000);
    } else {
      setStep('PROCESSING');
      setCountdown(5);
    }
  };

  const finalizeTransaction = () => {
    try {
      const isCash = provider === DigitalPaymentProvider.CASH;
      const isCard = provider === DigitalPaymentProvider.CARD_VISA_MASTERCARD;
      const refPrefix = isCash ? 'CSH' : provider.substring(0, 3).toUpperCase();
      const txRef = `TXN-${refPrefix}-${Date.now().toString().slice(-7)}`;
      const externalId = isCash ? `RECU-CSH-${Date.now().toString().slice(-6)}` : `EXT-${Math.random().toString(36).substring(2, 10).toUpperCase()}`;

      // 1. Create balanced double-entry accounting entry
      const existingEntries = getStoredEntries();
      const newEntryId = existingEntries.length > 0 ? Math.max(...existingEntries.map((e) => e.id)) + 1 : 1;
      const entryNumber = `ECR-2026-${String(newEntryId).padStart(5, '0')}`;
      const nowStr = new Date().toISOString().split('T')[0];

      const accountingAccount = isCash ? cashRegister : currentConfig?.accountingAccountCode || '518100';
      const journalCode = isCash ? 'CA' : 'BQ';
      const journalId = isCash ? 4 : 3;

      const lines = isCash
        ? [
            {
              id: 1,
              accountId: 571,
              accountCode: cashRegister,
              accountLabel: cashRegister === '571100' ? 'Caisse Principale Kinshasa Gombe' : 'Caisse Lubumbashi',
              label: `Encaissement Espèces ($) - ${orderReference}`,
              debit: amount,
              credit: 0,
            },
            {
              id: 2,
              accountId: 411,
              accountCode: '411100',
              accountLabel: 'Clients - Ventes comptoir',
              label: `Règlement vente ${orderReference}`,
              debit: 0,
              credit: amount,
            },
          ]
        : [
            {
              id: 1,
              accountId: 518,
              accountCode: accountingAccount,
              accountLabel: `Transit ${provider}`,
              label: `Règlement numérique net (${orderReference})`,
              debit: calculatedNet,
              credit: 0,
            },
            {
              id: 2,
              accountId: 627,
              accountCode: '627800',
              accountLabel: 'Commissions sur transactions numériques',
              label: `Commission opérateur ${feeRate}%`,
              debit: calculatedFee,
              credit: 0,
            },
            {
              id: 3,
              accountId: 411,
              accountCode: '411100',
              accountLabel: 'Clients - Ventes comptoir',
              label: `Encaissement vente ${orderReference}`,
              debit: 0,
              credit: amount,
            },
          ];

      const newEntry = {
        id: newEntryId,
        entryNumber,
        journalId,
        journalCode,
        periodId: 10,
        date: nowStr,
        reference: txRef,
        label: isCash
          ? `Encaissement Espèces Caisse ($) - ${orderReference}`
          : `Encaissement numérique ${provider} - ${orderReference}`,
        status: 'VALIDATED' as const,
        totalDebit: amount,
        totalCredit: amount,
        createdAt: new Date().toISOString(),
        lines,
      };

      saveStoredEntries([...existingEntries, newEntry]);

      // 2. Create PaymentTransaction
      const newTxn: PaymentTransaction = {
        id: Date.now(),
        reference: txRef,
        externalTransactionId: externalId,
        provider,
        amount,
        currency: 'USD',
        fee: calculatedFee,
        netAmount: calculatedNet,
        status: DigitalPaymentStatus.SUCCESS,
        customerPhone: isCash || isCard ? undefined : phone,
        customerCardLast4: isCard ? '4242' : undefined,
        metadata: {
          orderReference,
          customerName,
          cashTendered: isCash ? cashTendered : undefined,
          changeDue: isCash ? changeDue : undefined,
          feeRate,
        },
        idempotencyKey: `idemp_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        accountingEntryId: newEntryId,
        createdAt: new Date().toLocaleString('en-US'),
      };

      const storedTxns = getStoredPaymentTransactions();
      saveStoredPaymentTransactions([newTxn, ...storedTxns]);

      setCreatedTxn(newTxn);
      setStep('SUCCESS');
      onSuccess(newTxn);
    } catch {
      setErrorMessage('Une erreur est survenue lors de la validation du paiement.');
      setStep('ERROR');
    }
  };

  const formatUSD = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full max-h-[92vh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-5 sm:px-6 py-4 bg-gradient-to-r from-blue-950 via-slate-900 to-indigo-950 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl backdrop-blur-md">
              <Lock className="w-5 h-5 text-emerald-400" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base leading-tight">Mon X.Y — Encaissement Caisse & Numérique</h3>
              <p className="text-[11px] sm:text-xs text-slate-300">Monnaie : Dollars USD ($) • SYSCOHADA Révisé RDC</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto">
          {step === 'FORM' && (
            <form onSubmit={handleStartPayment} className="space-y-4">
              {/* Amount Display */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">Montant Total Dû</span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {formatUSD(amount)}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400">Réf. Commande</span>
                  <div className="text-xs font-mono font-bold text-slate-700">{orderReference}</div>
                  <div className="text-[11px] text-slate-500">{customerName}</div>
                </div>
              </div>

              {/* Provider Selection */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                  Mode de Paiement :
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {/* CASH / ESPÈCES */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.CASH)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.CASH
                        ? 'border-emerald-500 bg-emerald-50/60 text-emerald-900 ring-2 ring-emerald-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-emerald-600" />
                    <span className="text-xs font-bold">Espèces / Cash</span>
                    <span className="text-[10px] text-emerald-700 font-medium">Billets USD ($)</span>
                  </button>

                  {/* M-PESA */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.MPESA)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.MPESA
                        ? 'border-red-500 bg-red-50/50 text-red-900 ring-2 ring-red-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-red-600" />
                    <span className="text-xs font-bold">M-Pesa</span>
                    <span className="text-[10px] text-slate-500">Vodacom RDC</span>
                  </button>

                  {/* ORANGE MONEY */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.ORANGE_MONEY)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.ORANGE_MONEY
                        ? 'border-orange-500 bg-orange-50/50 text-orange-900 ring-2 ring-orange-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-orange-600" />
                    <span className="text-xs font-bold">Orange Money</span>
                    <span className="text-[10px] text-slate-500">WebPay Instant</span>
                  </button>

                  {/* AIRTEL MONEY */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.AIRTEL_MONEY)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.AIRTEL_MONEY
                        ? 'border-rose-500 bg-rose-50/50 text-rose-900 ring-2 ring-rose-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-rose-600" />
                    <span className="text-xs font-bold">Airtel Money</span>
                    <span className="text-[10px] text-slate-500">Airtel RDC</span>
                  </button>

                  {/* ILLICOCASH */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.ILLICOCASH)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.ILLICOCASH
                        ? 'border-blue-500 bg-blue-50/50 text-blue-900 ring-2 ring-blue-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <Smartphone className="w-5 h-5 text-blue-600" />
                    <span className="text-xs font-bold">IllicoCash</span>
                    <span className="text-[10px] text-slate-500">Rawbank RDC</span>
                  </button>

                  {/* CARTE BANCAIRE */}
                  <button
                    type="button"
                    onClick={() => setProvider(DigitalPaymentProvider.CARD_VISA_MASTERCARD)}
                    className={`p-3 rounded-xl border text-left flex flex-col items-start gap-1 transition ${
                      provider === DigitalPaymentProvider.CARD_VISA_MASTERCARD
                        ? 'border-indigo-500 bg-indigo-50/50 text-indigo-900 ring-2 ring-indigo-500/20'
                        : 'border-slate-200 hover:border-slate-300 bg-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-600" />
                    <span className="text-xs font-bold">Carte Visa / MC</span>
                    <span className="text-[10px] text-slate-500">3D Secure 2.0</span>
                  </button>
                </div>
              </div>

              {/* Dynamic Inputs depending on payment type */}
              {provider === DigitalPaymentProvider.CASH && (
                <div className="bg-emerald-50/50 border border-emerald-200/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-emerald-900 font-bold text-xs">
                    <Banknote className="w-4 h-4 text-emerald-600" />
                    <span>Règlement au Comptoir — Caisse Espèces</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Montant Remis en Espèces ($)
                      </label>
                      <input
                        type="number"
                        step="1"
                        min={amount}
                        value={cashTendered}
                        onChange={(e) => setCashTendered(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-base font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500/20"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Monnaie à Rendre ($)
                      </label>
                      <div className="w-full px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-100/60 text-base font-extrabold text-emerald-800">
                        {formatUSD(changeDue)}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Caisse SYSCOHADA de Rattachement
                    </label>
                    <select
                      value={cashRegister}
                      onChange={(e) => setCashRegister(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 bg-white"
                    >
                      <option value="571100">571100 — Caisse Principale Kinshasa (Gombe)</option>
                      <option value="571200">571200 — Caisse Secondaire Lubumbashi</option>
                    </select>
                  </div>
                </div>
              )}

              {provider !== DigitalPaymentProvider.CASH && provider !== DigitalPaymentProvider.CARD_VISA_MASTERCARD && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Numéro de Téléphone Mobile Money ({provider})
                  </label>
                  <div className="relative">
                    <Smartphone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <input
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+243 81 000 0000"
                      className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                      required
                    />
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Une notification USSD push sera envoyée pour validation par code PIN secret.
                  </p>
                </div>
              )}

              {provider === DigitalPaymentProvider.CARD_VISA_MASTERCARD && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Nom du Titulaire</label>
                    <input
                      type="text"
                      value={cardHolder}
                      onChange={(e) => setCardHolder(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-medium"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Numéro de Carte</label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">Expiration</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/AA"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono text-center"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">CVC / CVV</label>
                      <input
                        type="password"
                        maxLength={4}
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value)}
                        placeholder="•••"
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono text-center"
                        required
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Commission Summary */}
              <div className="bg-slate-50 rounded-xl p-3 text-xs text-slate-600 space-y-1 border border-slate-100">
                <div className="flex justify-between">
                  <span>Commission intermédiaire ({feeRate}%) :</span>
                  <span className="font-semibold text-amber-700">
                    -{formatUSD(calculatedFee)}
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-800 pt-1 border-t border-slate-200">
                  <span>Net comptabilisé en trésorerie :</span>
                  <span className="text-emerald-700 font-extrabold">
                    {formatUSD(calculatedNet)}
                  </span>
                </div>
              </div>

              {errorMessage && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20"
              >
                {provider === DigitalPaymentProvider.CASH ? (
                  <>
                    <Banknote className="w-4 h-4" />
                    <span>Encaisser {formatUSD(amount)} en Espèces</span>
                  </>
                ) : (
                  <>
                    <span>Confirmer et Lancer l'Ordre de Paiement</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {step === '3DS_CHALLENGE' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-indigo-50/50">
                <ShieldCheck className="w-8 h-8 animate-pulse" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Authentification 3D Secure 2.0</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  Validation de la transaction avec la banque émettrice...
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 animate-spin" />
              </div>
            </div>
          )}

          {step === 'PROCESSING' && (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-blue-50/50">
                <Smartphone className="w-8 h-8 animate-bounce" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-lg">Push USSD Envoyé sur le Téléphone</h4>
                <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                  En attente de la saisie du code PIN par le client sur son téléphone portable ({phone})...
                </p>
              </div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-slate-100 rounded-full text-xs font-mono font-bold text-slate-700">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-600" />
                Délai de réponse : {countdown}s
              </div>
            </div>
          )}

          {step === 'SUCCESS' && createdTxn && (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto ring-8 ring-emerald-50/50">
                <CheckCircle className="w-9 h-9" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-xl">
                  {createdTxn.provider === DigitalPaymentProvider.CASH ? 'Encaissement Espèces Réussi !' : 'Paiement Numérique Validé !'}
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enregistré dans <strong>Mon X.Y mon comptable</strong> avec écriture automatique en partie double.
                </p>
              </div>

              <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 text-left space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-500">Réf. Transaction :</span>
                  <span className="font-mono font-bold text-slate-800">{createdTxn.reference}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Mode de Paiement :</span>
                  <span className="font-bold text-slate-800">
                    {createdTxn.provider === DigitalPaymentProvider.CASH ? '💵 Espèces (Cash USD)' : createdTxn.provider}
                  </span>
                </div>
                {createdTxn.provider === DigitalPaymentProvider.CASH && createdTxn.metadata?.changeDue !== undefined && (
                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Monnaie Rendue au Client :</span>
                    <span>{formatUSD(createdTxn.metadata.changeDue)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Écriture Comptable Générée :</span>
                  <span className="font-mono font-bold text-blue-600">
                    ECR #{createdTxn.accountingEntryId} (Journal {createdTxn.provider === DigitalPaymentProvider.CASH ? 'CA' : 'BQ'})
                  </span>
                </div>
                <div className="flex justify-between font-bold text-slate-900 pt-1 border-t border-slate-200">
                  <span>Montant Encaissé :</span>
                  <span className="text-emerald-600 text-base font-extrabold">
                    {formatUSD(createdTxn.amount)}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 bg-slate-900 text-white rounded-xl font-bold text-sm hover:bg-slate-800 transition"
              >
                Fermer
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
