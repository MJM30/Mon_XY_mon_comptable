import React, { useState, useEffect } from 'react';
import {
  Palette,
  Upload,
  RotateCcw,
  Save,
  CheckCircle2,
  Eye,
  Receipt,
  FileText,
  Sparkles,
  Building2,
  Image as ImageIcon,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { DEFAULT_PLATFORM_BRANDING } from '../../data/multiTenantMockData';

export const WhiteLabelSettings: React.FC = () => {
  const {
    activeCompany,
    activeBranding,
    updateCompanyBranding,
    resetCompanyBranding,
  } = useAuth();

  const [workspaceName, setWorkspaceName] = useState(activeBranding.workspaceName);
  const [dashboardTitle, setDashboardTitle] = useState(activeBranding.dashboardTitle);
  const [invoiceHeaderName, setInvoiceHeaderName] = useState(activeBranding.invoiceHeaderName);
  const [receiptHeaderName, setReceiptHeaderName] = useState(activeBranding.receiptHeaderName);
  const [logoText, setLogoText] = useState(activeBranding.logoText || 'XY');
  const [logoUrl, setLogoUrl] = useState(activeBranding.logoUrl || '');
  const [primaryColor, setPrimaryColor] = useState(activeBranding.primaryColor);
  const [secondaryColor, setSecondaryColor] = useState(activeBranding.secondaryColor);
  const [accentColor, setAccentColor] = useState(activeBranding.accentColor);
  const [buttonColor, setButtonColor] = useState(activeBranding.buttonColor);
  const [receiptFooterText, setReceiptFooterText] = useState(activeBranding.receiptFooterText || '');
  const [invoiceFooterText, setInvoiceFooterText] = useState(activeBranding.invoiceFooterText || '');
  const [useCustomBranding, setUseCustomBranding] = useState(activeBranding.useCustomBranding);
  const [savedBanner, setSavedBanner] = useState(false);

  // Synchronise le formulaire quand on change d'entreprise active
  useEffect(() => {
    const b = activeCompany.branding;
    setWorkspaceName(b.workspaceName);
    setDashboardTitle(b.dashboardTitle);
    setInvoiceHeaderName(b.invoiceHeaderName);
    setReceiptHeaderName(b.receiptHeaderName);
    setLogoText(b.logoText || 'XY');
    setLogoUrl(b.logoUrl || '');
    setPrimaryColor(b.primaryColor);
    setSecondaryColor(b.secondaryColor);
    setAccentColor(b.accentColor);
    setButtonColor(b.buttonColor);
    setReceiptFooterText(b.receiptFooterText || '');
    setInvoiceFooterText(b.invoiceFooterText || '');
    setUseCustomBranding(b.useCustomBranding);
  }, [activeCompany]);

  const handleLogoFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      alert('La taille maximale autorisée pour le logo est de 2 Mo.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setLogoUrl(reader.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanyBranding(activeCompany.id, {
      workspaceName,
      dashboardTitle,
      invoiceHeaderName,
      receiptHeaderName,
      logoText,
      logoUrl: logoUrl || undefined,
      primaryColor,
      secondaryColor,
      accentColor,
      buttonColor,
      receiptFooterText,
      invoiceFooterText,
      useCustomBranding: true,
    });
    setUseCustomBranding(true);
    setSavedBanner(true);
    setTimeout(() => setSavedBanner(false), 3500);
  };

  const handleRestoreDefaults = () => {
    resetCompanyBranding(activeCompany.id);
    setWorkspaceName(DEFAULT_PLATFORM_BRANDING.workspaceName);
    setDashboardTitle(DEFAULT_PLATFORM_BRANDING.dashboardTitle);
    setInvoiceHeaderName(DEFAULT_PLATFORM_BRANDING.invoiceHeaderName);
    setReceiptHeaderName(DEFAULT_PLATFORM_BRANDING.receiptHeaderName);
    setLogoText(DEFAULT_PLATFORM_BRANDING.logoText || 'XY');
    setLogoUrl('');
    setPrimaryColor(DEFAULT_PLATFORM_BRANDING.primaryColor);
    setSecondaryColor(DEFAULT_PLATFORM_BRANDING.secondaryColor);
    setAccentColor(DEFAULT_PLATFORM_BRANDING.accentColor);
    setButtonColor(DEFAULT_PLATFORM_BRANDING.buttonColor);
    setUseCustomBranding(false);
  };

  const PRESET_PALETTES = [
    {
      name: 'Mon X.Y Défaut (Bleu Royal)',
      primary: '#1d4ed8',
      secondary: '#0f172a',
      accent: '#4f46e5',
      button: '#2563eb',
    },
    {
      name: 'Salon & Beauté (Rose Prestige)',
      primary: '#be185d',
      secondary: '#500724',
      accent: '#db2777',
      button: '#be185d',
    },
    {
      name: 'Restaurant & Traiteur (Ambre Terracotta)',
      primary: '#b45309',
      secondary: '#451a03',
      accent: '#d97706',
      button: '#b45309',
    },
    {
      name: 'Bar & Lounge (Émeraude Nuit)',
      primary: '#047857',
      secondary: '#064e3b',
      accent: '#10b981',
      button: '#059669',
    },
    {
      name: 'Boutique & Mode (Violet Impérial)',
      primary: '#6d28d9',
      secondary: '#2e1065',
      accent: '#8b5cf6',
      button: '#7c3aed',
    },
  ];

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Palette className="w-3.5 h-3.5" />
              <span>Personnalisation White Label Multi-Entreprises</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              <Building2 className="w-3.5 h-3.5" />
              <span>Entreprise cible : {activeCompany.tradeName}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Identité Visuelle & Charte Graphique (White Label)
          </h1>
          <p className="text-xs text-slate-500">
            Personnalisez le nom affiché, le logo, la palette de couleurs et les entêtes des factures et tickets POS pour{' '}
            <strong>{activeCompany.tradeName}</strong> sans affecter les autres entreprises de la plateforme.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold flex items-center gap-1.5 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restaurer le thème « Mon X.Y mon comptable »</span>
          </button>
        </div>
      </div>

      {savedBanner && (
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>
            La personnalisation White Label de « {workspaceName} » a été enregistrée et appliquée en temps réel !
          </span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Formulaire de configuration (7 colonnes) */}
        <form
          onSubmit={handleSave}
          className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-5"
        >
          {/* Section 1 : Noms affichés */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              1. Personnalisation des Noms Affichés & Entêtes
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Nom affiché dans l’espace de travail
                </label>
                <input
                  type="text"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Titre principal du tableau de bord
                </label>
                <input
                  type="text"
                  value={dashboardTitle}
                  onChange={(e) => setDashboardTitle(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Nom sur l’en-tête des Factures PDF
                </label>
                <input
                  type="text"
                  value={invoiceHeaderName}
                  onChange={(e) => setInvoiceHeaderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Nom sur les Tickets de Caisse POS (80mm)
                </label>
                <input
                  type="text"
                  value={receiptHeaderName}
                  onChange={(e) => setReceiptHeaderName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 2 : Logo de l'entreprise */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              2. Logo de l’Entreprise (Barre latérale, Factures, Reçus POS)
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Initiales du Monogramme (si pas d’image)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={logoText}
                  onChange={(e) => setLogoText(e.target.value.toUpperCase())}
                  className="w-28 px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-extrabold text-center uppercase"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Téléverser un logo (PNG, JPG, SVG, WEBP — max 2 Mo)
                </label>
                <label className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold border border-slate-200 transition">
                  <Upload className="w-4 h-4 text-blue-600" />
                  <span>Choisir un fichier image...</span>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/svg+xml,image/webp"
                    onChange={handleLogoFileUpload}
                    className="hidden"
                  />
                </label>
                {logoUrl && (
                  <button
                    type="button"
                    onClick={() => setLogoUrl('')}
                    className="ml-2 text-[11px] text-rose-600 font-bold hover:underline"
                  >
                    Retirer l’image
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Section 3 : Couleurs & Palettes */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              3. Charte Graphique & Palette de Couleurs
            </h2>

            {/* Palettes rapides par secteur */}
            <div>
              <p className="text-[11px] font-bold text-slate-500 mb-2">
                Palettes professionnelles recommandées par métier :
              </p>
              <div className="flex flex-wrap gap-2">
                {PRESET_PALETTES.map((pal) => (
                  <button
                    key={pal.name}
                    type="button"
                    onClick={() => {
                      setPrimaryColor(pal.primary);
                      setSecondaryColor(pal.secondary);
                      setAccentColor(pal.accent);
                      setButtonColor(pal.button);
                    }}
                    className="px-2.5 py-1.5 rounded-xl border border-slate-200 hover:border-slate-400 bg-slate-50 text-[11px] font-bold flex items-center gap-2"
                  >
                    <span
                      className="w-3.5 h-3.5 rounded-full inline-block"
                      style={{ backgroundColor: pal.primary }}
                    />
                    <span>{pal.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">Couleur Principale</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold">{primaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Couleur Secondaire</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold">{secondaryColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Couleur d’Accent</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold">{accentColor}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">Couleur Boutons</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={buttonColor}
                    onChange={(e) => setButtonColor(e.target.value)}
                    className="w-9 h-9 rounded-lg border border-slate-200 cursor-pointer"
                  />
                  <span className="font-mono text-[11px] font-bold">{buttonColor}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section 4 : Mentions légales bas de page */}
          <div className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900 border-b border-slate-100 pb-2">
              4. Mentions Pied de Page (Tickets de Caisse & Factures)
            </h2>
            <div className="grid grid-cols-1 gap-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Pied de page des Tickets de Caisse POS
                </label>
                <input
                  type="text"
                  value={receiptFooterText}
                  onChange={(e) => setReceiptFooterText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  Pied de page des Factures Commerciales (RIB Rawbank, M-Pesa, RCCM/NIF)
                </label>
                <input
                  type="text"
                  value={invoiceFooterText}
                  onChange={(e) => setInvoiceFooterText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl"
                />
              </div>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center gap-2 shadow-md hover:opacity-95 transition"
              style={{ backgroundColor: buttonColor }}
            >
              <Save className="w-4 h-4" />
              <span>Appliquer l’Identité White Label à {activeCompany.tradeName}</span>
            </button>
          </div>
        </form>

        {/* Aperçu en Direct (5 colonnes) */}
        <div className="lg:col-span-5 space-y-4 sticky top-20">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-blue-600" />
                <h3 className="text-sm font-extrabold text-slate-900">
                  Aperçu en Temps Réel (Live Preview)
                </h3>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Isolé pour {activeCompany.code}
              </span>
            </div>

            {/* Aperçu Barre de Navigation */}
            <div className="space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                1. En-tête de l’Application
              </span>
              <div
                className="p-3.5 rounded-2xl text-white flex items-center justify-between shadow-sm"
                style={{
                  background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})`,
                }}
              >
                <div className="flex items-center gap-2.5">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="Logo"
                      className="w-9 h-9 rounded-xl object-cover bg-white p-0.5"
                    />
                  ) : (
                    <div
                      className="w-9 h-9 rounded-xl flex items-center justify-center font-extrabold text-sm bg-white/20 border border-white/30"
                    >
                      {logoText || 'XY'}
                    </div>
                  )}
                  <div>
                    <p className="text-sm font-extrabold leading-tight">{workspaceName}</p>
                    <p className="text-[10px] text-white/80">{dashboardTitle}</p>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold text-white shadow-2xs"
                  style={{ backgroundColor: buttonColor }}
                >
                  Action
                </span>
              </div>
            </div>

            {/* Aperçu En-tête Facture & Ticket POS */}
            <div className="space-y-1.5 pt-2">
              <span className="text-[10px] font-bold uppercase text-slate-400">
                2. Aperçu Ticket de Caisse POS & Facture
              </span>
              <div className="border border-dashed border-slate-300 rounded-2xl p-4 bg-slate-50/60 space-y-2 text-center">
                <div
                  className="w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-white font-extrabold text-xs"
                  style={{ backgroundColor: primaryColor }}
                >
                  {logoText || 'XY'}
                </div>
                <p className="text-xs font-extrabold text-slate-900 uppercase">
                  {receiptHeaderName}
                </p>
                <p className="text-[10px] text-slate-500">
                  {activeCompany.address} • {activeCompany.phone}
                </p>
                <div className="border-t border-b border-dashed border-slate-300 py-2 my-2 text-xs flex justify-between font-bold text-slate-800">
                  <span>Exemple Prestation / Article</span>
                  <span>$45.00 USD</span>
                </div>
                <p className="text-[10px] text-slate-500 italic">{receiptFooterText}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
