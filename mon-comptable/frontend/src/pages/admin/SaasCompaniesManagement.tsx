import React, { useState } from 'react';
import {
  Building2,
  PlusCircle,
  CheckCircle2,
  PauseCircle,
  XCircle,
  Clock,
  Globe,
  Palette,
  ArrowRight,
  ArrowLeft,
  Store,
  Scissors,
  Utensils,
  Wine,
  Shirt,
  Monitor,
  ShieldCheck,
  MapPin,
  Layers,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { BusinessSector, CompanyStatus } from '../../types';
import { useNavigate } from 'react-router-dom';

const BUSINESS_SECTOR_OPTIONS: {
  id: BusinessSector;
  label: string;
  description: string;
  defaultColor: string;
  secondaryColor: string;
}[] = [
  {
    id: 'SALON_COIFFURE',
    label: 'Salon de Coiffure & Esthétique',
    description: 'Prestations coiffure, tresses, brushing, soins, coiffeurs, RDV & produits capillaires.',
    defaultColor: '#be185d',
    secondaryColor: '#500724',
  },
  {
    id: 'RESTAURANT',
    label: 'Restaurant, Grillades & Traiteur',
    description: 'Menus, plats, fiches recettes/ingrédients, tables, serveurs, tickets cuisine & coûts de revient.',
    defaultColor: '#b45309',
    secondaryColor: '#451a03',
  },
  {
    id: 'BAR_TERRASSE',
    label: 'Bar Lounge & Terrasse',
    description: 'Boissons, casiers/seaux, tables terrasse, serveurs, additions rapides & suivi des pertes.',
    defaultColor: '#047857',
    secondaryColor: '#064e3b',
  },
  {
    id: 'BOUTIQUE_MODE',
    label: 'Boutique & Maison d’Habillement',
    description: 'Vêtements, tailles (S-XXL), couleurs, codes-barres SKU, collections & retours/échanges.',
    defaultColor: '#6d28d9',
    secondaryColor: '#2e1065',
  },
  {
    id: 'SUPERETTE_EPICERIE',
    label: 'Supérette & Commerce de Proximité',
    description: 'Articles grande consommation, rayon frais, codes-barres rapides & caisses multiples.',
    defaultColor: '#0284c7',
    secondaryColor: '#0c4a6e',
  },
  {
    id: 'POS_DISTRIBUTION',
    label: 'Distribution Terminaux POS & Équipements',
    description: 'Terminaux tactiles, imprimantes thermiques, tiroirs-caisses, devis & SAV.',
    defaultColor: '#1d4ed8',
    secondaryColor: '#0f172a',
  },
];

export const SaasCompaniesManagement: React.FC = () => {
  const {
    companies,
    activeCompany,
    switchCompany,
    createCompany,
    updateCompanyStatus,
  } = useAuth();
  const navigate = useNavigate();

  const [showOnboardingWizard, setShowOnboardingWizard] = useState(false);
  const [step, setStep] = useState<number>(1);

  // État du Wizard 7 étapes
  const [legalName, setLegalName] = useState('');
  const [tradeName, setTradeName] = useState('');
  const [sector, setSector] = useState<BusinessSector>('SALON_COIFFURE');
  const [city, setCity] = useState('Kinshasa');
  const [address, setAddress] = useState('Avenue de la Libération, Gombe');
  const [phone, setPhone] = useState('+243 81 ');
  const [email, setEmail] = useState('');
  const [taxId, setTaxId] = useState('RCCM CD/KIN/RCCM/26-B-');

  // Étape 2 : White Label
  const [logoText, setLogoText] = useState('MC');
  const [primaryColor, setPrimaryColor] = useState('#be185d');
  const [secondaryColor, setSecondaryColor] = useState('#500724');
  const [receiptHeader, setReceiptHeader] = useState('');

  // Étape 3 : Comptabilité
  const [currency, setCurrency] = useState('USD');
  const [framework, setFramework] = useState<'SYSCOHADA_REVISED' | 'PCG'>('SYSCOHADA_REVISED');

  // Étape 4 : Établissements
  const [mainEstName, setMainEstName] = useState('Siège & Point de Vente Principal');
  const [secondEstName, setSecondEstName] = useState('');

  // Étape 5 : Compte Admin Entreprise
  const [adminName, setAdminName] = useState('Jean-Claude Mbuyi');
  const [adminEmail, setAdminEmail] = useState('admin@nouvelle-pme.cd');

  const handleSectorSelect = (sec: BusinessSector) => {
    setSector(sec);
    const found = BUSINESS_SECTOR_OPTIONS.find((s) => s.id === sec);
    if (found) {
      setPrimaryColor(found.defaultColor);
      setSecondaryColor(found.secondaryColor);
    }
  };

  const handleFinishOnboarding = () => {
    const sectorMeta = BUSINESS_SECTOR_OPTIONS.find((s) => s.id === sector) || BUSINESS_SECTOR_OPTIONS[0];
    const code = `ENT-RDC-00${companies.length + 1}`;
    const displayTradeName = tradeName.trim() || legalName.trim() || 'Nouvelle PME RDC';

    const estList = [
      {
        code: `${code}-EST1`,
        name: mainEstName || 'Siège Principal',
        address,
        city,
        phone,
        managerName: adminName,
        isMain: true,
        isActive: true,
      },
    ];

    if (secondEstName.trim()) {
      estList.push({
        code: `${code}-EST2`,
        name: secondEstName.trim(),
        address: `Succursale ${city}`,
        city,
        phone,
        managerName: adminName,
        isMain: false,
        isActive: true,
      });
    }

    const created = createCompany({
      code,
      slug: displayTradeName.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      name: legalName.trim() || `${displayTradeName} SARL`,
      tradeName: displayTradeName,
      address,
      country: 'RD Congo',
      city,
      phone,
      email: email || adminEmail,
      taxId,
      businessSector: sector,
      sectorLabel: sectorMeta.label,
      currency,
      accountingFramework: framework,
      status: 'ACTIVE',
      branding: {
        companyId: 0,
        workspaceName: displayTradeName,
        dashboardTitle: `Espace Gestion — ${displayTradeName}`,
        invoiceHeaderName: `${displayTradeName.toUpperCase()} — ${city.toUpperCase()}`,
        receiptHeaderName: receiptHeader || `${displayTradeName.toUpperCase()} — TICKET CAISSE`,
        logoText: logoText || displayTradeName.substring(0, 2).toUpperCase(),
        primaryColor,
        secondaryColor,
        accentColor: primaryColor,
        buttonColor: primaryColor,
        receiptFooterText: `Merci de votre visite chez ${displayTradeName} !`,
        invoiceFooterText: `${displayTradeName} — Règlement en ${currency} ($).`,
        useCustomBranding: true,
      },
      establishments: estList as any,
    });

    switchCompany(created.id);
    setShowOnboardingWizard(false);
    setStep(1);
  };

  return (
    <div className="space-y-6">
      {/* En-tête Multi-Entreprises */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <Building2 className="w-3.5 h-3.5" />
              <span>Architecture Multi-Entreprises (Multi-Tenant SaaS)</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloisonnement Strict des Données par companyId</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Gestion des Entreprises Clientes & Onboarding Métier
          </h1>
          <p className="text-xs text-slate-500">
            Supervisez toutes les entreprises indépendantes utilisant la plateforme, basculez d’un environnement métier à un autre ou créez une nouvelle entreprise en 7 étapes.
          </p>
        </div>

        <button
          onClick={() => {
            setShowOnboardingWizard(true);
            setStep(1);
          }}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-sm transition self-start lg:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Créer une Nouvelle Entreprise (Wizard 7 Étapes)</span>
        </button>
      </div>

      {/* Grille des Entreprises Multi-Tenants */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
        {companies.map((comp) => {
          const isCurrent = comp.id === activeCompany.id;
          return (
            <div
              key={comp.id}
              className={`bg-white rounded-2xl border p-5 flex flex-col justify-between space-y-4 transition shadow-2xs ${
                isCurrent
                  ? 'border-2 border-blue-600 ring-4 ring-blue-500/10'
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              <div className="space-y-3">
                {/* Top Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-extrabold text-sm shadow-sm shrink-0"
                      style={{ backgroundColor: comp.branding.primaryColor }}
                    >
                      {comp.branding.logoText || 'XY'}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400">
                          {comp.code}
                        </span>
                        {isCurrent && (
                          <span className="text-[10px] font-extrabold px-2 py-0.2 rounded-full bg-blue-600 text-white">
                            ENVIRONNEMENT ACTIF
                          </span>
                        )}
                      </div>
                      <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                        {comp.tradeName}
                      </h2>
                      <p className="text-[11px] text-slate-500">{comp.name}</p>
                    </div>
                  </div>

                  {/* Badge Statut */}
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase ${
                      comp.status === 'ACTIVE'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : comp.status === 'TRIAL'
                        ? 'bg-amber-50 text-amber-800 border border-amber-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {comp.status === 'ACTIVE'
                      ? 'Active'
                      : comp.status === 'TRIAL'
                      ? 'En période d’essai'
                      : comp.status === 'SUSPENDED'
                      ? 'Suspendue'
                      : 'Fermée'}
                  </span>
                </div>

                {/* Secteur Métier & Ville */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 space-y-1.5 text-xs">
                  <p className="font-bold text-slate-800">{comp.sectorLabel}</p>
                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      {comp.city}, {comp.country}
                    </span>
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-slate-400" />
                      {comp.establishments.length} établissement(s)
                    </span>
                  </div>
                </div>

                {/* KPIs isolés de l'entreprise */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">CA Mensuel</span>
                    <span className="text-xs font-extrabold text-emerald-700">
                      ${comp.stats.monthlyRevenue.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">Trésorerie</span>
                    <span className="text-xs font-extrabold text-slate-900">
                      ${comp.stats.cashBalance.toLocaleString()}
                    </span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="block text-[10px] text-slate-400 font-bold">Utilisateurs</span>
                    <span className="text-xs font-extrabold text-blue-700">
                      {comp.stats.activeUsersCount} actifs
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-slate-100 space-y-2">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => switchCompany(comp.id)}
                    className={`flex-1 py-2 rounded-xl text-xs font-extrabold transition ${
                      isCurrent
                        ? 'bg-emerald-600 text-white'
                        : 'bg-slate-900 hover:bg-slate-800 text-white'
                    }`}
                  >
                    {isCurrent ? '✓ Espace Actuellement Ouvert' : 'Basculer dans cet Espace'}
                  </button>
                  <button
                    onClick={() => {
                      switchCompany(comp.id);
                      navigate('/pos/terminal');
                    }}
                    className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                    title="Ouvrir la Caisse POS de cette entreprise"
                  >
                    Ouvrir POS
                  </button>
                </div>

                {/* Changement de statut du compte */}
                <div className="flex items-center justify-between text-[11px] pt-1">
                  <span className="text-slate-400 font-semibold">Statut du compte :</span>
                  <div className="flex items-center gap-1">
                    {(['ACTIVE', 'TRIAL', 'SUSPENDED', 'CLOSED'] as CompanyStatus[]).map((st) => (
                      <button
                        key={st}
                        onClick={() => updateCompanyStatus(comp.id, st)}
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          comp.status === st
                            ? 'bg-blue-100 text-blue-800'
                            : 'text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {st === 'ACTIVE'
                          ? 'Active'
                          : st === 'TRIAL'
                          ? 'Essai'
                          : st === 'SUSPENDED'
                          ? 'Suspendre'
                          : 'Fermer'}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* ========================================================= */}
      {/* MODAL WIZARD ONBOARDING D'UNE NOUVELLE ENTREPRISE (7 ÉTAPES) */}
      {/* ========================================================= */}
      {showOnboardingWizard && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                  Étape {step} sur 7 • Parcours d’Onboarding PME
                </span>
                <h2 className="text-lg font-extrabold text-slate-900 mt-1">
                  Création d’un Nouvel Environnement Entreprise Isolé
                </h2>
              </div>
              <button
                onClick={() => setShowOnboardingWizard(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            {/* Barre de progression 7 étapes */}
            <div className="grid grid-cols-7 gap-1.5">
              {[1, 2, 3, 4, 5, 6, 7].map((s) => (
                <div
                  key={s}
                  className={`h-2 rounded-full transition-all ${
                    s <= step ? 'bg-blue-600' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* ÉTAPE 1 : Informations Générales */}
            {step === 1 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 1 : Informations Générales de l’Entreprise
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Nom commercial (affiché) *
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Salon Reine du Fleuve"
                      value={tradeName}
                      onChange={(e) => setTradeName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Raison sociale *</label>
                    <input
                      type="text"
                      placeholder="Ex: Reine Beauté SARL"
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Ville (RDC)</label>
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">Téléphone</label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-600 mb-1">
                      N° Identification Fiscale (RCCM / ID.NAT / NIF DGI)
                    </label>
                    <input
                      type="text"
                      value={taxId}
                      onChange={(e) => setTaxId(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 2 : Personnalisation Visuelle (White Label) */}
            {step === 2 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 2 : Personnalisation Visuelle White Label (Logo, Couleurs, Nom)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Initiales du Logo (Monogramme)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={logoText}
                      onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-extrabold uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      En-tête des Tickets de Caisse POS
                    </label>
                    <input
                      type="text"
                      placeholder={`${tradeName || 'ENTREPRISE'} — TICKET OFFICIEL`}
                      value={receiptHeader}
                      onChange={(e) => setReceiptHeader(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Couleur Principale White Label
                    </label>
                    <input
                      type="color"
                      value={primaryColor}
                      onChange={(e) => setPrimaryColor(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Couleur Secondaire
                    </label>
                    <input
                      type="color"
                      value={secondaryColor}
                      onChange={(e) => setSecondaryColor(e.target.value)}
                      className="w-full h-10 rounded-xl border border-slate-200 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 3 : Paramètres Comptables */}
            {step === 3 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 3 : Paramètres Comptables, Devise & Référentiel
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Devise Principale
                    </label>
                    <select
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="USD">Dollar Américain ($ USD) — Recommandé RDC</option>
                      <option value="CDF">Franc Congolais (CDF)</option>
                      <option value="EUR">Euro (€)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Référentiel Comptable
                    </label>
                    <select
                      value={framework}
                      onChange={(e) => setFramework(e.target.value as any)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    >
                      <option value="SYSCOHADA_REVISED">SYSCOHADA Révisé (Zone OHADA / RDC)</option>
                      <option value="PCG">Plan Comptable Général (PCG)</option>
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 4 : Création des Établissements ou Points de Vente */}
            {step === 4 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 4 : Établissements, Salons, Restaurants ou Points de Vente
                </h3>
                <div className="space-y-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Établissement Principal #1 *
                    </label>
                    <input
                      type="text"
                      value={mainEstName}
                      onChange={(e) => setMainEstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Deuxième Succursale / Point de Vente (Optionnel)
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Succursale Lubumbashi ou Annexe Ngaliema"
                      value={secondEstName}
                      onChange={(e) => setSecondEstName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 5 : Création du Compte Administrateur de l'Entreprise */}
            {step === 5 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 5 : Compte Administrateur de l’Entreprise
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Nom complet de l’Administrateur PME
                    </label>
                    <input
                      type="text"
                      value={adminName}
                      onChange={(e) => setAdminName(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl font-bold"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-600 mb-1">
                      Adresse e-mail de connexion
                    </label>
                    <input
                      type="email"
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      className="w-full px-3 py-2 border border-slate-200 rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ÉTAPE 6 : Configuration Métier Spécifique */}
            {step === 6 && (
              <div className="space-y-3 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 6 : Profil Métier Spécifique (Salon, Restaurant, Bar, Boutique...)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {BUSINESS_SECTOR_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSectorSelect(opt.id)}
                      className={`p-3 rounded-2xl border text-left transition ${
                        sector === opt.id
                          ? 'border-2 border-blue-600 bg-blue-50/50'
                          : 'border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      <p className="font-extrabold text-slate-900">{opt.label}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">{opt.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ÉTAPE 7 : Création des Utilisateurs et Rôles & Activation */}
            {step === 7 && (
              <div className="space-y-4 text-xs">
                <h3 className="text-sm font-extrabold text-slate-900">
                  Étape 7 : Récapitulatif des Rôles Préconfigurés & Activation
                </h3>
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 space-y-2 text-emerald-950">
                  <p className="font-extrabold text-sm">
                    Prêt à activer « {tradeName || 'Nouvelle PME'} » !
                  </p>
                  <ul className="list-disc pl-5 space-y-1 text-[11px]">
                    <li>
                      <strong>Secteur Métier :</strong>{' '}
                      {BUSINESS_SECTOR_OPTIONS.find((s) => s.id === sector)?.label}
                    </li>
                    <li>
                      <strong>Comptabilité :</strong> {framework} en {currency} ($) avec journaux VT, AC, BQ, CA, OD pré-initialisés.
                    </li>
                    <li>
                      <strong>Séparation RBAC activée :</strong> Vendeur & Caissier (Ventes POS & Caisse), Comptable (Extension Financière), Contrôleur Financier (Contrôle Financier), Gérant (Gestion commerciale & Tiers).
                    </li>
                  </ul>
                </div>
              </div>
            )}

            {/* Navigation du Wizard */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => (step > 1 ? setStep(step - 1) : setShowOnboardingWizard(false))}
                className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>{step > 1 ? 'Étape précédente' : 'Annuler'}</span>
              </button>

              {step < 7 ? (
                <button
                  type="button"
                  onClick={() => setStep(step + 1)}
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold flex items-center gap-1.5"
                >
                  <span>Étape suivante ({step + 1}/7)</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleFinishOnboarding}
                  className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold flex items-center gap-2 shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Créer et Ouvrir l’Environnement de l’Entreprise</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
