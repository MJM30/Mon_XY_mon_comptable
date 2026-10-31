import React, { useState, useEffect } from 'react';
import {
  Download,
  TrendingUp,
  Scale,
  ShieldCheck,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import {
  getStoredChartOfAccounts,
  getStoredEntries,
  getStoredBccExchangeRate,
  subscribeToBccRateUpdates,
} from '../../data/accountingMockData';

export const FinancialStatements: React.FC = () => {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState(getStoredChartOfAccounts);
  const [bccRate, setBccRate] = useState(getStoredBccExchangeRate);
  const [activeTab, setActiveTab] = useState<'BILAN' | 'RESULTAT' | 'TFT'>('BILAN');

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
      setAccounts(getStoredChartOfAccounts());
    });
    return unsubscribe;
  }, []);

  const formatFc = (val: number) => `${Math.round(val).toLocaleString('fr-FR')} FC`;
  const formatUsdEq = (val: number) =>
    `≈ ${(val / bccRate).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} $`;

  // ================= BILAN EN FRANC CONGOLAIS (FC / CDF) =================
  // Actif Immobilisé (Classe 2)
  const immobilisations = accounts
    .filter((a) => a.accountClass === 2)
    .reduce((acc, a) => acc + (a.balance || 0), 0);

  // Actif Circulant : Stocks (Classe 3) + Créances Clients (411)
  const stocks = accounts
    .filter((a) => a.accountClass === 3)
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const creancesClients = accounts
    .filter((a) => a.accountNumber.startsWith('411'))
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const actifCirculant = stocks + creancesClients;

  // Trésorerie Actif (Classe 5)
  const tresorerieActif = accounts
    .filter((a) => a.accountClass === 5)
    .reduce((acc, a) => acc + (a.balance || 0), 0);

  const totalActif = immobilisations + actifCirculant + tresorerieActif;

  // Capitaux Propres (Classe 1 : 101, 111) en Franc Congolais au taux BCC (2 261 FC / $)
  const capitalSocial = 226100000; // 100 000 $ * 2 261 FC
  const reserves = 33915000; // 15 000 $ * 2 261 FC

  // Dettes Financières (Emprunts 162)
  const emprunts = accounts
    .filter((a) => a.accountNumber.startsWith('162'))
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);

  // Dettes d'Exploitation (Fournisseurs 401 + Fiscal 443)
  const dettesFournisseurs = accounts
    .filter((a) => a.accountNumber.startsWith('401'))
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);
  const dettesFiscales = accounts
    .filter((a) => a.accountNumber.startsWith('443'))
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);
  const dettesCirculantes = dettesFournisseurs + dettesFiscales;

  // ================= COMPTE DE RÉSULTAT EN FRANC CONGOLAIS =================
  // Produits (Classe 7)
  const ventesMarchandises = accounts
    .filter((a) => a.accountNumber === '701100')
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);
  const prestationsServices = accounts
    .filter((a) => a.accountNumber === '706100')
    .reduce((acc, a) => acc + Math.abs(a.balance || 0), 0);
  const totalProduitsExploitation = ventesMarchandises + prestationsServices;

  // Charges (Classe 6)
  const achatsMarchandises = accounts
    .filter((a) => a.accountNumber === '601100')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const loyers = accounts
    .filter((a) => a.accountNumber === '613200')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const energieFluides = accounts
    .filter((a) => a.accountNumber === '606100')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const fraisMobileMoney = accounts
    .filter((a) => a.accountNumber === '631100')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const salairesCharges = accounts
    .filter((a) => a.accountNumber === '641100')
    .reduce((acc, a) => acc + (a.balance || 0), 0);
  const dotationsAmort = accounts
    .filter((a) => a.accountNumber === '681100')
    .reduce((acc, a) => acc + (a.balance || 0), 0);

  const totalChargesExploitation =
    achatsMarchandises +
    loyers +
    energieFluides +
    fraisMobileMoney +
    salairesCharges +
    dotationsAmort;

  const resultatNetExercice = totalProduitsExploitation - totalChargesExploitation;

  // Total Passif avec Résultat équilibrant
  const totalCapitauxPropres = capitalSocial + reserves + resultatNetExercice;
  const totalPassif = totalCapitauxPropres + emprunts + dettesCirculantes;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              États Financiers Réglementaires DGI RDC
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 uppercase tracking-wider">
              Monnaie Nationale : Franc Congolais (FC / CDF)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Bilan Comptable & Compte de Résultat (en FC)
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            États de synthèse officiels établis en Franc Congolais (FC) conformément au droit comptable OHADA en vigueur en RDC.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => alert('Téléchargement de la liasse fiscale DGI RDC en Franc Congolais (PDF).')}
            className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Télécharger Liasse Fiscale DGI (FC)</span>
          </button>
        </div>
      </div>

      {/* Onglets Bilan / Compte de Résultat / TFT */}
      <div className="flex border-b border-slate-200 overflow-x-auto">
        <button
          onClick={() => setActiveTab('BILAN')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'BILAN'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <Scale className="w-4 h-4" />
          <span>Bilan Actif / Passif (FC)</span>
        </button>

        <button
          onClick={() => setActiveTab('RESULTAT')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'RESULTAT'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Compte de Résultat (FC)</span>
        </button>

        <button
          onClick={() => setActiveTab('TFT')}
          className={`pb-3 px-4 text-xs font-extrabold flex items-center gap-2 border-b-2 whitespace-nowrap transition-colors ${
            activeTab === 'TFT'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Tableau des Flux de Trésorerie (TFT)</span>
        </button>
      </div>

      {/* ================= ONGLET BILAN ================= */}
      {activeTab === 'BILAN' && (
        <div className="space-y-6">
          {/* Bannière de conformité bilan */}
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-emerald-900">
            <div className="flex items-center gap-2.5">
              <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>
                <strong>Équilibre Fondamental du Bilan (SYSCOHADA RDC) :</strong> Total Actif (FC) = Total Passif (FC)
              </span>
            </div>
            <span className="font-black text-sm">
              {formatFc(totalActif)} ({formatUsdEq(totalActif)})
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* COLONNE GAUCHE : ACTIF */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">ACTIF (en FC)</h3>
                <span className="text-xs text-slate-400 font-bold">Emplois des capitaux</span>
              </div>

              {/* Actif Immobilisé */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Actif Immobilisé (Classe 2)
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Logiciels & Frais de développement (211)</span>
                  <span className="font-bold text-slate-900">40 698 000 FC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Matériel POS Taixun & Équipements (241/244)</span>
                  <span className="font-bold text-slate-900">54 942 300 FC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Amortissements cumulés (284)</span>
                  <span className="font-bold text-rose-600">-9 496 200 FC</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1">
                  <span>Total Actif Immobilisé Net :</span>
                  <span>{formatFc(immobilisations)}</span>
                </div>
              </div>

              {/* Actif Circulant */}
              <div className="space-y-2 text-xs pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Actif Circulant (Classes 3 & 4)
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Stocks terminaux POS & accessoires (311/312)</span>
                  <span className="font-bold text-slate-900">{formatFc(stocks)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Créances clients & comptes rattachés (411)</span>
                  <span className="font-bold text-slate-900">{formatFc(creancesClients)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1">
                  <span>Total Actif Circulant :</span>
                  <span>{formatFc(actifCirculant)}</span>
                </div>
              </div>

              {/* Trésorerie Actif */}
              <div className="space-y-2 text-xs pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Trésorerie Actif (Classe 5)
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Banque Rawbank & EquityBCDC (521)</span>
                  <span className="font-bold text-slate-900">130 685 800 FC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Comptes Marchands Mobile Money (M-Pesa, Orange, Airtel, Illico)</span>
                  <span className="font-bold text-slate-900">63 194 950 FC</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Caisse centrale espèces (571)</span>
                  <span className="font-bold text-slate-900">20 145 510 FC</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1">
                  <span>Total Trésorerie Actif :</span>
                  <span>{formatFc(tresorerieActif)}</span>
                </div>
              </div>

              {/* TOTAL ACTIF */}
              <div className="p-4 bg-blue-50 rounded-2xl flex justify-between items-center text-sm font-black text-blue-900">
                <span>TOTAL GÉNÉRAL ACTIF (FC) :</span>
                <div className="text-right">
                  <span className="text-base block">{formatFc(totalActif)}</span>
                  <span className="text-[11px] font-bold text-blue-600">{formatUsdEq(totalActif)}</span>
                </div>
              </div>
            </div>

            {/* COLONNE DROITE : PASSIF */}
            <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-extrabold text-base text-slate-900">PASSIF (en FC)</h3>
                <span className="text-xs text-slate-400 font-bold">Origine des ressources</span>
              </div>

              {/* Capitaux Propres */}
              <div className="space-y-2 text-xs">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Capitaux Propres & Ressources Durables (Classe 1)
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Capital social souscrit (101)</span>
                  <span className="font-bold text-slate-900">{formatFc(capitalSocial)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Réserve légale (111)</span>
                  <span className="font-bold text-slate-900">{formatFc(reserves)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Résultat net de l'exercice (Bénéfice)</span>
                  <span className="font-bold text-emerald-600">+{formatFc(resultatNetExercice)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1">
                  <span>Total Capitaux Propres :</span>
                  <span>{formatFc(totalCapitauxPropres)}</span>
                </div>
              </div>

              {/* Dettes Financières */}
              <div className="space-y-2 text-xs pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Dettes Financières & Emprunts
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Emprunts bancaires moyen terme Rawbank (162)</span>
                  <span className="font-bold text-slate-900">{formatFc(emprunts)}</span>
                </div>
              </div>

              {/* Dettes d'Exploitation */}
              <div className="space-y-2 text-xs pt-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                  Dettes Circulantes d'Exploitation (Classe 4)
                </span>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Dettes Fournisseurs d'équipements (401)</span>
                  <span className="font-bold text-slate-900">{formatFc(dettesFournisseurs)}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-slate-50 text-slate-700">
                  <span>Dettes fiscales DGI & TVA facturée (443)</span>
                  <span className="font-bold text-slate-900">{formatFc(dettesFiscales)}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 pt-1">
                  <span>Total Dettes Circulantes :</span>
                  <span>{formatFc(dettesCirculantes)}</span>
                </div>
              </div>

              {/* TOTAL PASSIF */}
              <div className="p-4 bg-purple-50 rounded-2xl flex justify-between items-center text-sm font-black text-purple-900">
                <span>TOTAL GÉNÉRAL PASSIF (FC) :</span>
                <div className="text-right">
                  <span className="text-base block">{formatFc(totalPassif)}</span>
                  <span className="text-[11px] font-bold text-purple-600">{formatUsdEq(totalPassif)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================= ONGLET COMPTE DE RÉSULTAT ================= */}
      {activeTab === 'RESULTAT' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-6">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Compte de Résultat de l'Exercice (en Franc Congolais - FC)
              </h3>
              <p className="text-xs text-slate-400">
                Période du 01/01/2026 au 31/12/2026 (Normes SYSCOHADA Révisé RDC)
              </p>
            </div>
            <span className="px-3 py-1 rounded-xl bg-emerald-100 text-emerald-800 font-black text-xs">
              Résultat Bénéficiaire en FC
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
            {/* CHARGES */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-rose-600 block pb-2 border-b border-rose-100">
                CHARGES D'EXPLOITATION (Classe 6 - en FC)
              </span>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Achats de terminaux POS Taixun (601)</span>
                  <span className="font-bold text-slate-900">{formatFc(achatsMarchandises)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Loyers bureaux & Showroom Gombe (613)</span>
                  <span className="font-bold text-slate-900">{formatFc(loyers)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Énergie SNEL & Regideso (606)</span>
                  <span className="font-bold text-slate-900">{formatFc(energieFluides)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Frais commissions Mobile Money & passerelles (631)</span>
                  <span className="font-bold text-slate-900">{formatFc(fraisMobileMoney)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Salaires & Rémunérations du personnel (641)</span>
                  <span className="font-bold text-slate-900">{formatFc(salairesCharges)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Dotations aux amortissements (681)</span>
                  <span className="font-bold text-slate-900">{formatFc(dotationsAmort)}</span>
                </div>

                <div className="p-3 bg-rose-50 rounded-xl flex justify-between font-black text-rose-900">
                  <span>Total Charges d'Exploitation (FC) :</span>
                  <span>{formatFc(totalChargesExploitation)}</span>
                </div>
              </div>
            </div>

            {/* PRODUITS */}
            <div className="space-y-4">
              <span className="text-xs font-black uppercase text-emerald-600 block pb-2 border-b border-emerald-100">
                PRODUITS D'EXPLOITATION (Classe 7 - en FC)
              </span>

              <div className="space-y-2">
                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Ventes de terminaux tactiles POS (701)</span>
                  <span className="font-bold text-slate-900">{formatFc(ventesMarchandises)}</span>
                </div>

                <div className="flex justify-between py-1.5 border-b border-slate-100 text-slate-700">
                  <span>Prestations assistance, support & logiciel (706)</span>
                  <span className="font-bold text-slate-900">{formatFc(prestationsServices)}</span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl flex justify-between font-black text-emerald-900">
                  <span>Total Produits d'Exploitation (FC) :</span>
                  <span>{formatFc(totalProduitsExploitation)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* RÉSULTAT NET */}
          <div className="p-5 bg-gradient-to-r from-blue-900 to-indigo-950 rounded-2xl text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <span className="text-xs text-blue-200 uppercase font-bold block">
                Résultat Net Comptable en Franc Congolais (Produits - Charges) :
              </span>
              <span className="text-2xl font-black text-emerald-300">
                +{formatFc(resultatNetExercice)} ({formatUsdEq(resultatNetExercice)})
              </span>
            </div>
            <div className="text-right text-xs text-slate-300">
              Marge d'exploitation :{' '}
              <strong>{((resultatNetExercice / totalProduitsExploitation) * 100).toFixed(1)} %</strong>
            </div>
          </div>
        </div>
      )}

      {/* ================= ONGLET TABLEAU FLUX TRÉSORERIE ================= */}
      {activeTab === 'TFT' && (
        <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-xs space-y-4 text-xs">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h3 className="font-extrabold text-base text-slate-900">
              Tableau des Flux de Trésorerie (TFT en Franc Congolais - FC)
            </h3>
            <span className="text-xs text-slate-400 font-bold">Variations de liquidités en FC</span>
          </div>

          <div className="space-y-3">
            <div className="p-3 bg-slate-50 rounded-xl flex justify-between font-bold text-slate-800">
              <span>Trésorerie nette en début d'exercice (01/01/2026) :</span>
              <span>96 092 500 FC</span>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl flex justify-between font-bold text-emerald-900">
              <span>Flux net de trésorerie lié aux opérations d'exploitation :</span>
              <span>+132 630 260 FC</span>
            </div>

            <div className="p-3 bg-rose-50 rounded-xl flex justify-between font-bold text-rose-900">
              <span>Flux net lié aux investissements matériels (Terminaux démo) :</span>
              <span>-14 696 500 FC</span>
            </div>

            <div className="p-4 bg-purple-50 rounded-2xl flex justify-between items-center text-sm font-black text-purple-900">
              <span>Trésorerie nette disponible en fin de période (en FC) :</span>
              <span>{formatFc(tresorerieActif)} ({formatUsdEq(tresorerieActif)})</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
