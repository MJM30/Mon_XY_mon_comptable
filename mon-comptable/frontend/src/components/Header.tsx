import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  ChevronDown,
  ShieldCheck,
  LogOut,
  CheckCircle2,
  BookOpen,
  Coins,
  Menu,
  X,
  Layers,
  Building2,
  ShoppingCart,
  Scale,
  Briefcase,
  Users,
  Settings,
  Globe,
  Clock,
  MapPin,
  TrendingUp,
  RefreshCw,
} from 'lucide-react';
import { useAuth, getBaseAllowedSpacesForRole } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { WorkspaceSpaceId, UserRole } from '../types';
import {
  DEFAULT_BCC_EXCHANGE_RATE,
  getStoredBccExchangeRate,
  getStoredBccRateMetadata,
  saveStoredBccExchangeRate,
  subscribeToBccRateUpdates,
  syncLiveBccExchangeRate,
  BccRateMetadata,
} from '../data/accountingMockData';

interface HeaderProps {
  onToggleSidebar?: () => void;
  isSidebarOpen?: boolean;
}

export const STRICT_WORKSPACE_DEFINITIONS: {
  id: WorkspaceSpaceId;
  label: string;
  shortLabel: string;
  badge: string;
  defaultRoute: string;
  color: string;
}[] = [
  {
    id: 'ventes-pos',
    label: 'Ventes POS & Caisse',
    shortLabel: 'Ventes POS & Caisse',
    badge: 'Vendeur / Caissier',
    defaultRoute: '/pos/terminal',
    color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
  },
  {
    id: 'extension-financiere',
    label: 'Extension Financière',
    shortLabel: 'Extension Financière',
    badge: 'Comptable SYSCOHADA',
    defaultRoute: '/comptabilite/dashboard',
    color: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  {
    id: 'controle-financier',
    label: 'Contrôle Financier',
    shortLabel: 'Contrôle Financier',
    badge: 'Contrôleur / Audit',
    defaultRoute: '/finance/controle',
    color: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  {
    id: 'gestion-commerciale',
    label: 'Gestion commerciale & trésorerie',
    shortLabel: 'Gestion Commerciale',
    badge: 'Gérant / PME',
    defaultRoute: '/',
    color: 'text-indigo-700 bg-indigo-50 border-indigo-200',
  },
  {
    id: 'tiers-gestion',
    label: 'Tiers et Gestion',
    shortLabel: 'Tiers & Gestion',
    badge: 'Gérant / Opérations',
    defaultRoute: '/clients',
    color: 'text-amber-800 bg-amber-50 border-amber-200',
  },
  {
    id: 'administration-pme',
    label: 'Administration PME',
    shortLabel: 'Admin PME',
    badge: 'White Label & RBAC',
    defaultRoute: '/admin/utilisateurs-acces',
    color: 'text-slate-800 bg-slate-100 border-slate-300',
  },
  {
    id: 'plateforme-saas',
    label: 'Multi-Entreprises SaaS',
    shortLabel: 'Multi-Entreprises',
    badge: 'Super Admin',
    defaultRoute: '/admin/entreprises',
    color: 'text-rose-700 bg-rose-50 border-rose-200',
  },
];

export const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isSidebarOpen = false }) => {
  const {
    user,
    activeSpace,
    setActiveSpace,
    switchRole,
    logout,
    companies,
    activeCompany,
    switchCompany,
    activeEstablishment,
    switchEstablishment,
    activeBranding,
    allowedSpaces,
    activeUserGrants,
    getDefaultRouteForRole,
  } = useAuth();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showCompanyMenu, setShowCompanyMenu] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [showSpaceDropdown, setShowSpaceDropdown] = useState(false);
  const [showBccMenu, setShowBccMenu] = useState(false);

  // Taux de change en temps réel de la Banque Centrale du Congo (BCC) : 1 USD = 2 261 FC
  const [bccRate, setBccRate] = useState<number>(getStoredBccExchangeRate);
  const [bccMeta, setBccMeta] = useState<BccRateMetadata>(getStoredBccRateMetadata);
  const [customBccInput, setCustomBccInput] = useState<string>(String(getStoredBccExchangeRate()));

  useEffect(() => {
    const unsubscribe = subscribeToBccRateUpdates((meta) => {
      setBccRate(meta.rate);
      setBccMeta(meta);
      setCustomBccInput(String(meta.rate));
    });
    return unsubscribe;
  }, []);

  const navigate = useNavigate();

  // Filtrer uniquement les espaces autorisés pour le rôle courant + ses accès temporaires actifs
  const visibleSpaces = STRICT_WORKSPACE_DEFINITIONS.filter((sp) =>
    allowedSpaces.includes(sp.id)
  );

  const currentSpaceMeta =
    visibleSpaces.find((s) => s.id === activeSpace) ||
    visibleSpaces[0] ||
    STRICT_WORKSPACE_DEFINITIONS[0];

  const baseRoleSpaces = user ? getBaseAllowedSpacesForRole(user.role) : [];

  const handleSpaceChange = (spaceId: WorkspaceSpaceId) => {
    if (!allowedSpaces.includes(spaceId)) {
      alert(
        "Accès refusé par le RBAC :\nVotre rôle actuel n'est pas autorisé à accéder à cet espace sans un accès temporaire accordé par l'Administrateur."
      );
      return;
    }
    setActiveSpace(spaceId);
    setShowSpaceDropdown(false);
    const meta = STRICT_WORKSPACE_DEFINITIONS.find((s) => s.id === spaceId);
    if (meta) {
      navigate(meta.defaultRoute);
    }
  };

  const handleRoleSimulation = (role: UserRole, isAccredited = true) => {
    switchRole(role, isAccredited);
    setShowUserMenu(false);
    const targetRoute = getDefaultRouteForRole(role, isAccredited);
    navigate(targetRoute);
  };

  return (
    <>
      <header className="h-16 bg-white border-b border-slate-200 px-3 sm:px-5 flex items-center justify-between sticky top-0 z-30 select-none">
        {/* Left Side: Hamburger + White Label Brand + Sélecteur Entreprise + Espaces Autorisés */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          {/* Bouton Hamburger pour tablettes et mobiles */}
          <button
            type="button"
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition focus:outline-none shrink-0"
            aria-label="Basculer le menu de navigation"
          >
            {isSidebarOpen ? <X className="w-5 h-5 text-slate-800" /> : <Menu className="w-5 h-5 text-slate-800" />}
          </button>

          {/* Logo & Brand White Label Dynamique */}
          <div
            className="flex items-center gap-2 cursor-pointer shrink-0"
            onClick={() => handleSpaceChange(visibleSpaces[0]?.id || 'ventes-pos')}
          >
            {activeBranding.logoUrl ? (
              <img
                src={activeBranding.logoUrl}
                alt={activeBranding.workspaceName}
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl object-cover border border-slate-200 shadow-2xs"
              />
            ) : (
              <div
                className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center text-white font-extrabold text-sm sm:text-base shadow-sm tracking-tighter shrink-0"
                style={{
                  background: `linear-gradient(135deg, ${activeBranding.primaryColor}, ${activeBranding.secondaryColor})`,
                }}
              >
                {activeBranding.logoText || 'XY'}
              </div>
            )}

            <div className="flex flex-col text-left">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xs sm:text-sm tracking-tight text-slate-900 truncate max-w-[130px] sm:max-w-[180px]">
                  {activeBranding.workspaceName}
                </span>
                <span className="bg-blue-50 text-blue-700 text-[9px] font-extrabold px-1.5 py-0.2 rounded uppercase border border-blue-200">
                  {activeCompany.currency}
                </span>
              </div>
              <span className="text-[10px] font-semibold text-slate-500 leading-none truncate max-w-[150px]">
                {activeBranding.useCustomBranding
                  ? `${activeCompany.city} • White Label`
                  : 'Mon X.Y mon comptable'}
              </span>
            </div>
          </div>

          {/* Sélecteur Multi-Entreprises & Établissements */}
          <div className="relative hidden sm:block">
            <button
              type="button"
              onClick={() => setShowCompanyMenu(!showCompanyMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-xs font-bold text-slate-700 transition"
              title="Changer d'entreprise ou d'établissement (Multi-Tenant)"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="truncate max-w-[110px] xl:max-w-[140px]">
                {activeEstablishment.name}
              </span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            </button>

            {showCompanyMenu && (
              <div className="absolute left-0 top-full mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 text-xs space-y-2">
                <div className="px-2 py-1 border-b border-slate-100 flex items-center justify-between">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    Environnements Entreprises (SaaS)
                  </span>
                  <span className="text-[10px] font-bold text-blue-600">
                    {companies.length} PME
                  </span>
                </div>

                <div className="max-h-60 overflow-y-auto space-y-1">
                  {companies.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        switchCompany(c.id);
                        setShowCompanyMenu(false);
                      }}
                      className={`w-full text-left p-2 rounded-xl flex items-center justify-between transition ${
                        c.id === activeCompany.id
                          ? 'bg-blue-50 border border-blue-200 text-blue-950 font-bold'
                          : 'hover:bg-slate-50 text-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span
                          className="w-7 h-7 rounded-lg text-white font-extrabold text-[11px] flex items-center justify-center shrink-0"
                          style={{ backgroundColor: c.branding.primaryColor }}
                        >
                          {c.branding.logoText || 'XY'}
                        </span>
                        <div className="min-w-0">
                          <p className="truncate font-bold text-xs">{c.tradeName}</p>
                          <p className="truncate text-[10px] text-slate-500">
                            {c.sectorLabel}
                          </p>
                        </div>
                      </div>
                      {c.id === activeCompany.id && (
                        <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                {/* Établissements de l'entreprise active */}
                {activeCompany.establishments.length > 1 && (
                  <div className="pt-2 border-t border-slate-100 space-y-1">
                    <span className="px-2 text-[10px] font-extrabold uppercase text-slate-400">
                      Points de vente / Établissements ({activeCompany.tradeName})
                    </span>
                    {activeCompany.establishments.map((est) => (
                      <button
                        key={est.id}
                        onClick={() => {
                          switchEstablishment(est.id);
                          setShowCompanyMenu(false);
                        }}
                        className={`w-full text-left px-2.5 py-1.5 rounded-lg text-[11px] flex items-center justify-between ${
                          est.id === activeEstablishment.id
                            ? 'bg-slate-900 text-white font-bold'
                            : 'text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        <span className="flex items-center gap-1.5 truncate">
                          <MapPin className="w-3 h-3 shrink-0" />
                          <span className="truncate">{est.name}</span>
                        </span>
                        <span className="text-[10px] opacity-75">{est.city}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Sélecteur d'Espace Compact pour Tablettes (md:flex 2xl:hidden) */}
          <div className="hidden md:flex 2xl:hidden items-center relative">
            <button
              type="button"
              onClick={() => setShowSpaceDropdown(!showSpaceDropdown)}
              className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 rounded-xl text-xs font-bold transition"
            >
              <Layers className="w-3.5 h-3.5 text-blue-600" />
              <span className="truncate max-w-[150px]">{currentSpaceMeta.shortLabel}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showSpaceDropdown && (
              <div className="absolute left-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2 z-50 space-y-1">
                <div className="px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Espaces autorisés ({user?.role})
                </div>
                {visibleSpaces.map((sp) => {
                  const isTempGrant = !baseRoleSpaces.includes(sp.id);
                  return (
                    <button
                      key={sp.id}
                      onClick={() => handleSpaceChange(sp.id)}
                      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition ${
                        activeSpace === sp.id
                          ? 'text-white shadow-xs'
                          : 'text-slate-700 hover:bg-slate-100'
                      }`}
                      style={
                        activeSpace === sp.id
                          ? { backgroundColor: activeBranding.buttonColor }
                          : undefined
                      }
                    >
                      <span className="truncate">{sp.label}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-semibold border ${
                          activeSpace === sp.id
                            ? 'bg-white/20 text-white border-transparent'
                            : isTempGrant
                            ? 'bg-amber-100 text-amber-800 border-amber-300'
                            : sp.color
                        }`}
                      >
                        {isTempGrant ? '⏳ Accès Temp.' : sp.badge}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* Barre d'Espaces Autorisés sur Grands Écrans (2xl:flex) */}
          <div className="hidden 2xl:flex items-center bg-slate-100/90 p-1 rounded-xl border border-slate-200/60 text-xs font-semibold gap-1">
            {visibleSpaces.map((sp) => {
              const isActive = activeSpace === sp.id;
              const isTempGrant = !baseRoleSpaces.includes(sp.id);
              return (
                <button
                  key={sp.id}
                  onClick={() => handleSpaceChange(sp.id)}
                  className={`px-2.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    isActive
                      ? 'text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  }`}
                  style={
                    isActive
                      ? { backgroundColor: activeBranding.buttonColor }
                      : undefined
                  }
                >
                  <span>{sp.shortLabel}</span>
                  {isTempGrant && (
                    <span
                      className="px-1.5 py-0.2 rounded text-[9px] bg-amber-300 text-slate-950 font-extrabold"
                      title="Accès temporaire accordé par l'Administrateur"
                    >
                      Temp.
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* Indicateur d'accès temporaire actif */}
          {activeUserGrants.length > 0 && (
            <div
              onClick={() => handleSpaceChange(activeUserGrants[0].moduleCode)}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 bg-amber-50 text-amber-900 border border-amber-300 rounded-xl text-[11px] font-extrabold cursor-pointer hover:bg-amber-100 transition"
              title={`Accès temporaire actif : ${activeUserGrants[0].moduleLabel}`}
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Accès Temp. ({activeUserGrants.length})</span>
            </div>
          )}

          {/* Badge Taux de Change BCC en Temps Réel (1 USD = 2 261 FC) */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowBccMenu(!showBccMenu)}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 hover:bg-blue-100/80 text-blue-900 border border-blue-200 rounded-xl text-xs font-extrabold transition"
              title="Taux officiel Banque Centrale du Congo (BCC) en temps réel — Cliquez pour synchroniser ou simuler une hausse BCC"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Coins className="w-3.5 h-3.5 text-blue-600" />
              <span>
                BCC Live : 1 $ = {bccRate.toLocaleString('fr-FR')} FC
              </span>
              {bccMeta.rate !== bccMeta.previousRate && (
                <span
                  className={`px-1.5 py-0.2 rounded text-[9px] font-black ${
                    bccMeta.rate > bccMeta.previousRate
                      ? 'bg-emerald-600 text-white'
                      : 'bg-amber-500 text-slate-950'
                  }`}
                >
                  {bccMeta.rate > bccMeta.previousRate
                    ? `+${bccMeta.rate - bccMeta.previousRate} FC`
                    : `${bccMeta.rate - bccMeta.previousRate} FC`}
                </span>
              )}
              <ChevronDown className="w-3 h-3 text-blue-500" />
            </button>

            {showBccMenu && (
              <div className="absolute right-0 mt-2 w-84 bg-white rounded-2xl shadow-2xl border border-slate-200 p-3.5 z-50 text-xs space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="font-black text-slate-900 text-xs">
                        Banque Centrale du Congo (BCC)
                      </p>
                      <p className="text-[10px] text-slate-500">
                        Flux de change officiel USD / CDF en temps réel
                      </p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-emerald-100 text-emerald-800 uppercase">
                    Temps Réel
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-gradient-to-r from-blue-950 to-indigo-950 text-white space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-blue-200 font-bold uppercase">
                    <span>Taux Indicatif Officiel BCC</span>
                    <span>
                      Sync :{' '}
                      {new Date(bccMeta.lastSyncAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                  <div className="flex items-baseline justify-between pt-0.5">
                    <span className="text-lg font-black text-emerald-300">
                      1 USD ($) = {bccRate.toLocaleString('fr-FR')} FC
                    </span>
                    <span className="text-[10px] text-slate-300">
                      Préc. : {bccMeta.previousRate.toLocaleString('fr-FR')} FC
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed pt-1">
                    Dès que la Banque Centrale du Congo ajuste son taux, toute la plateforme SaaS (Caisse POS, Écritures en FC, États Financiers) se met à jour instantanément.
                  </p>
                </div>

                {/* Boutons de test/simulation hausse temps réel BCC */}
                <div className="space-y-1.5">
                  <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
                    Tester une hausse BCC en temps réel :
                  </span>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() => syncLiveBccExchangeRate(bccRate + 15)}
                      className="px-2.5 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-extrabold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Hausse BCC (+15 FC)</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => syncLiveBccExchangeRate(bccRate + 50)}
                      className="px-2.5 py-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-900 border border-blue-200 font-extrabold text-[11px] flex items-center justify-center gap-1 transition"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
                      <span>Hausse BCC (+50 FC)</span>
                    </button>
                  </div>
                </div>

                {/* Saisie manuelle ou réinitialisation au taux BCC officiel 2 261 FC */}
                <div className="pt-2 border-t border-slate-100 space-y-2">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={customBccInput}
                      onChange={(e) => setCustomBccInput(e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded-lg border border-slate-200 font-extrabold text-slate-900 text-xs"
                      placeholder="Ex: 2261"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        const parsed = parseFloat(customBccInput);
                        if (!isNaN(parsed) && parsed > 0) {
                          syncLiveBccExchangeRate(parsed);
                        }
                      }}
                      className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                    >
                      Appliquer
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      saveStoredBccExchangeRate(DEFAULT_BCC_EXCHANGE_RATE, 'FLUX_LIVE_BCC');
                      setShowBccMenu(false);
                    }}
                    className="w-full py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] flex items-center justify-center gap-1.5 transition"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>
                      Rétablir le Taux Officiel BCC Actuel (1 $ = {DEFAULT_BCC_EXCHANGE_RATE.toLocaleString('fr-FR')} FC)
                    </span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bouton IA */}
          <button
            onClick={() => setShowAiModal(true)}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-gradient-to-r from-blue-50 to-indigo-50 text-indigo-700 border border-indigo-200/80 rounded-xl text-xs font-bold hover:shadow-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span className="hidden md:inline">IA</span>
          </button>

          {/* Menu Profil & Switcher de Rôles / Entreprises */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-200 transition"
            >
              <div
                className="w-8 h-8 rounded-lg text-white font-bold flex items-center justify-center text-xs shadow-xs"
                style={{ backgroundColor: activeBranding.primaryColor }}
              >
                {user?.name
                  ? user.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')
                      .substring(0, 2)
                      .toUpperCase()
                  : 'DK'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold text-slate-800 leading-tight truncate max-w-[130px]">
                  {user?.name}
                </span>
                <span className="text-[10px] text-slate-500 font-bold">
                  Rôle : {user?.role}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-2xl border border-slate-200 p-2.5 z-50 text-xs space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="font-extrabold text-slate-900">{user?.name}</p>
                  <p className="text-[11px] text-slate-500">{user?.email}</p>
                  <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-[10px] px-2 py-0.5 bg-blue-100 text-blue-800 font-extrabold rounded-full">
                      Rôle : {user?.role}
                    </span>
                    <span className="text-[10px] px-2 py-0.5 bg-slate-200 text-slate-800 font-bold rounded-full">
                      {activeCompany.tradeName}
                    </span>
                  </div>
                </div>

                {/* Simulateur Rapide des 7 Rôles du Cahier des Charges */}
                <div className="space-y-0.5">
                  <p className="text-[10px] uppercase font-extrabold text-slate-400 px-2 py-1">
                    Simuler un Rôle Métier (Test RBAC Strict)
                  </p>

                  <button
                    onClick={() => handleRoleSimulation('SELLER', false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">🛒 Vendeur (SELLER)</span>
                      <span className="block text-[10px] text-slate-500">
                        Voit uniquement : Ventes POS & Caisse
                      </span>
                    </div>
                    {user?.role === 'SELLER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('CASHIER', false)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-emerald-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">💵 Caissier (CASHIER)</span>
                      <span className="block text-[10px] text-slate-500">
                        Voit uniquement : Ventes POS & Caisse
                      </span>
                    </div>
                    {user?.role === 'CASHIER' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('ACCOUNTANT', true)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-blue-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">📘 Comptable (ACCOUNTANT)</span>
                      <span className="block text-[10px] text-slate-500">
                        Voit uniquement : Extension Financière
                      </span>
                    </div>
                    {user?.role === 'ACCOUNTANT' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('CONTROLLER', true)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-purple-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">⚖️ Contrôleur Financier</span>
                      <span className="block text-[10px] text-slate-500">
                        Voit uniquement : Contrôle Financier
                      </span>
                    </div>
                    {(user?.role === 'CONTROLLER' || user?.role === 'FINANCE') && (
                      <CheckCircle2 className="w-4 h-4 text-purple-600" />
                    )}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('MANAGER', true)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-amber-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">👔 Gérant (MANAGER)</span>
                      <span className="block text-[10px] text-slate-500">
                        Voit : Gestion commerciale & Tiers
                      </span>
                    </div>
                    {user?.role === 'MANAGER' && <CheckCircle2 className="w-4 h-4 text-amber-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('ADMIN', true)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-slate-900">🛡️ Administrateur PME (ADMIN)</span>
                      <span className="block text-[10px] text-slate-500">
                        Accès complet entreprise + White Label & Accès Temp.
                      </span>
                    </div>
                    {user?.role === 'ADMIN' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                  </button>

                  <button
                    onClick={() => handleRoleSimulation('SUPER_ADMIN', true)}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg hover:bg-rose-50 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-rose-900">🌐 Super Admin Plateforme SaaS</span>
                      <span className="block text-[10px] text-rose-600">
                        Gestion Multi-Entreprises & Onboarding 7 étapes
                      </span>
                    </div>
                    {user?.role === 'SUPER_ADMIN' && <CheckCircle2 className="w-4 h-4 text-rose-600" />}
                  </button>
                </div>

                <div className="border-t border-slate-100 pt-1.5">
                  <button
                    onClick={async () => {
                      setShowUserMenu(false);
                      await logout();
                      navigate('/login');
                    }}
                    className="w-full text-left px-2.5 py-1.5 rounded-lg text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-1.5 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Assistant IA */}
      {showAiModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">
                    Assistant IA — {activeBranding.workspaceName}
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Expertise SYSCOHADA, Multi-Entreprises & Profil Métier ({activeCompany.sectorLabel})
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowAiModal(false)}
                className="text-slate-400 hover:text-slate-600 text-lg font-bold"
              >
                ✕
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div className="bg-indigo-50/70 border border-indigo-100 rounded-xl p-3 text-indigo-950">
                <p className="font-bold mb-1">
                  🏢 Isolation Multi-Entreprises ({activeCompany.code}) :
                </p>
                <p className="text-slate-600 leading-relaxed">
                  Vous travaillez dans l’environnement cloisonné de <strong>{activeCompany.tradeName}</strong> ({activeEstablishment.name}). Chiffre d’affaires mensuel : <strong>${activeCompany.stats.monthlyRevenue.toLocaleString()} USD</strong>.
                </p>
              </div>
              <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3 text-emerald-950">
                <p className="font-bold mb-1">🔒 Contrôle RBAC Actif :</p>
                <p className="text-slate-600 leading-relaxed">
                  Votre rôle <strong>{user?.role}</strong> dispose de {visibleSpaces.length} espace(s) autorisé(s) et de {activeUserGrants.length} accès temporaire(s) actif(s).
                </p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowAiModal(false)}
                className="px-4 py-2 text-xs font-bold text-white bg-indigo-600 rounded-xl"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
