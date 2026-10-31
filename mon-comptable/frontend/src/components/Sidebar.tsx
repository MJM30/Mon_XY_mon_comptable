import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  MinusCircle,
  ArrowLeftRight,
  FileText,
  CreditCard,
  Landmark,
  Users,
  Building2,
  Package,
  BarChart3,
  Users2,
  Calendar,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Monitor,
  Target,
  FileCheck2,
  BookOpen,
  PieChart,
  Wallet,
  Layers,
  FileSpreadsheet,
  Lock,
  Percent,
  Sliders,
  Scale,
  FolderTree,
  X,
  Palette,
  Clock,
  Globe,
  Receipt,
  AlertTriangle,
} from 'lucide-react';
import { useAuth, getBaseAllowedSpacesForRole } from '../context/AuthContext';
import { STRICT_WORKSPACE_DEFINITIONS } from './Header';
import { WorkspaceSpaceId } from '../types';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen = false, onClose }) => {
  const {
    user,
    activeSpace,
    setActiveSpace,
    activeCompany,
    activeBranding,
    allowedSpaces,
    activeUserGrants,
  } = useAuth();
  const navigate = useNavigate();

  const visibleSpaces = STRICT_WORKSPACE_DEFINITIONS.filter((sp) =>
    allowedSpaces.includes(sp.id)
  );
  const baseRoleSpaces = user ? getBaseAllowedSpacesForRole(user.role) : [];

  const handleLinkClick = () => {
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const handleSpaceChange = (spaceId: WorkspaceSpaceId) => {
    if (!allowedSpaces.includes(spaceId)) return;
    setActiveSpace(spaceId);
    const meta = STRICT_WORKSPACE_DEFINITIONS.find((s) => s.id === spaceId);
    if (meta) {
      navigate(meta.defaultRoute);
    }
    if (window.innerWidth < 1024) {
      onClose?.();
    }
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${
      isActive
        ? 'text-white shadow-sm font-bold'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
    }`;

  const getActiveStyle = (isActive: boolean) =>
    isActive ? { backgroundColor: activeBranding.buttonColor } : undefined;

  return (
    <>
      {/* Backdrop sombre tactile pour tablettes et mobiles */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`
          fixed lg:sticky top-0 lg:top-16 z-50 lg:z-10
          h-full lg:h-[calc(100vh-4rem)]
          w-72 sm:w-80 lg:w-64
          bg-white border-r border-slate-200
          flex flex-col justify-between
          select-none overflow-y-auto
          transition-transform duration-300 ease-in-out
          ${isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full lg:translate-x-0 shadow-none'}
        `}
      >
        <div
          className="p-4 space-y-5"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest('a')) {
              handleLinkClick();
            }
          }}
        >
          {/* En-tête mobile/tablette avec Logo White Label et bouton Fermer */}
          <div className="lg:hidden pb-3 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-extrabold text-xs shadow-xs"
                style={{ backgroundColor: activeBranding.primaryColor }}
              >
                {activeBranding.logoText || 'XY'}
              </div>
              <div>
                <div className="font-extrabold text-xs text-slate-900 leading-tight">
                  {activeBranding.workspaceName}
                </div>
                <div className="text-[10px] text-slate-500 font-semibold">
                  {activeCompany.city} • {activeCompany.currency} ($)
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="Fermer le menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Sélecteur d'espace autorisé (affiché si l'utilisateur a plus d'un espace autorisé) */}
          {visibleSpaces.length > 1 && (
            <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-200/80">
              <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1.5">
                Espace de travail actif ({user?.role})
              </label>
              <select
                value={activeSpace}
                onChange={(e) => handleSpaceChange(e.target.value as WorkspaceSpaceId)}
                className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-2xs"
              >
                {visibleSpaces.map((sp) => {
                  const isTemp = !baseRoleSpaces.includes(sp.id);
                  return (
                    <option key={sp.id} value={sp.id}>
                      {isTemp ? `⏳ [Temp] ${sp.label}` : sp.label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Badge d'information sur l'isolation du rôle */}
          {visibleSpaces.length === 1 && (
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/90 space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold uppercase text-slate-500">
                  Espace Dédié ({user?.role})
                </span>
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800">
                  RBAC Strict
                </span>
              </div>
              <p className="text-xs font-extrabold text-slate-900">
                {visibleSpaces[0].label}
              </p>
            </div>
          )}

          {/* ========================================================= */}
          {/* 1. ESPACE : VENTES POS & CAISSE (VENDEUR & CAISSIER)      */}
          {/* ========================================================= */}
          {activeSpace === 'ventes-pos' && allowedSpaces.includes('ventes-pos') && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 mb-2">
                  Ventes POS & Caisse ({activeCompany.tradeName})
                </p>
                <nav className="space-y-1">
                  <NavLink
                    to="/pos/terminal"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Receipt className="w-4 h-4" />
                    <span>Caisse Tactile & Ventes POS</span>
                  </NavLink>
                  <NavLink
                    to="/vendeur/dashboard"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Target className="w-4 h-4" />
                    <span>Tableau de Bord Ventes</span>
                  </NavLink>
                  <NavLink
                    to="/vendeur/catalogue"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Monitor className="w-4 h-4" />
                    <span>Catalogue Équipements POS</span>
                  </NavLink>
                  <NavLink
                    to="/vendeur/commandes"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <ShoppingCart className="w-4 h-4" />
                    <span>Devis, Commandes & Reçus</span>
                  </NavLink>
                  <NavLink
                    to="/vendeur/prospects"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Clients & Prospects POS</span>
                  </NavLink>
                </nav>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 2. ESPACE : EXTENSION FINANCIÈRE (COMPTABLE)              */}
          {/* ========================================================= */}
          {activeSpace === 'extension-financiere' &&
            allowedSpaces.includes('extension-financiere') && (
              <div className="space-y-5">
                {/* 2.A Comptabilité Générale */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-blue-700 tracking-wider px-3 mb-1.5">
                    1. Comptabilité Générale (SYSCOHADA)
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/comptabilite/dashboard"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Dashboard Comptable</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/plan-comptable"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FolderTree className="w-4 h-4" />
                      <span>Plan Comptable</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/journaux"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FileSpreadsheet className="w-4 h-4" />
                      <span>Journaux Auxiliaires</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/ecritures"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Saisie & Validation Écritures</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/grand-livre"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Grand Livre Général</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/balance"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Scale className="w-4 h-4" />
                      <span>Balance Générale (6 col.)</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/etats-financiers"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Bilan & Compte de Résultat</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/cloture"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Lock className="w-4 h-4" />
                      <span>Clôture des Périodes</span>
                    </NavLink>
                  </nav>
                </div>

                {/* 2.B Gestion Financière */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-indigo-700 tracking-wider px-3 mb-1.5">
                    2. Gestion Financière & Trésorerie
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/recettes"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Recettes</span>
                    </NavLink>
                    <NavLink
                      to="/depenses"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>Dépenses & Charges</span>
                    </NavLink>
                    <NavLink
                      to="/factures"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Factures Clients & Fourn.</span>
                    </NavLink>
                    <NavLink
                      to="/paiements"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Paiements & Règlements</span>
                    </NavLink>
                    <NavLink
                      to="/tresorerie"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Landmark className="w-4 h-4" />
                      <span>Trésorerie & Banques</span>
                    </NavLink>
                    <NavLink
                      to="/paiements-numeriques/rapprochement"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Scale className="w-4 h-4" />
                      <span>Rapprochement Mobile Money</span>
                    </NavLink>
                  </nav>
                </div>

                {/* 2.C Comptabilité Analytique */}
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-emerald-700 tracking-wider px-3 mb-1.5">
                    3. Comptabilité Analytique
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/analytique/dashboard"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <PieChart className="w-4 h-4" />
                      <span>Vue Analytique</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/centres-couts"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Layers className="w-4 h-4" />
                      <span>Centres de Coûts</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/sections"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Sliders className="w-4 h-4" />
                      <span>Sections Analytiques</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/repartition"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Percent className="w-4 h-4" />
                      <span>Clés de Répartition</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/rentabilite"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Rentabilité par Activité</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/budgets"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Target className="w-4 h-4" />
                      <span>Budgets & Écarts</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}

          {/* ========================================================= */}
          {/* 3. ESPACE : CONTRÔLE FINANCIER (CONTRÔLEUR FINANCIER)     */}
          {/* ========================================================= */}
          {activeSpace === 'controle-financier' &&
            allowedSpaces.includes('controle-financier') && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-purple-800 tracking-wider px-3 mb-2">
                    Contrôle Financier & Audit
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/finance/controle"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Hub Contrôle & Anomalies</span>
                    </NavLink>
                    <NavLink
                      to="/finance/verification"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FileCheck2 className="w-4 h-4" />
                      <span>Vérification des Paiements</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/budgets"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Target className="w-4 h-4" />
                      <span>Contrôle Budgétaire & Écarts</span>
                    </NavLink>
                    <NavLink
                      to="/analytique/rentabilite"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <BarChart3 className="w-4 h-4" />
                      <span>Analyse de Rentabilité</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/grand-livre"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <BookOpen className="w-4 h-4" />
                      <span>Audit Grand Livre (Lecture)</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/balance"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Scale className="w-4 h-4" />
                      <span>Audit Balance (Lecture)</span>
                    </NavLink>
                    <NavLink
                      to="/comptabilite/etats-financiers"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FileText className="w-4 h-4" />
                      <span>États Financiers (Lecture)</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}

          {/* ========================================================= */}
          {/* 4. ESPACE : GESTION COMMERCIALE & TRÉSORERIE (GÉRANT)     */}
          {/* ========================================================= */}
          {activeSpace === 'gestion-commerciale' &&
            allowedSpaces.includes('gestion-commerciale') && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 mb-2">
                    Gestion Commerciale & Trésorerie
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/"
                      end
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <LayoutDashboard className="w-4 h-4" />
                      <span>Tableau de Bord Commercial</span>
                    </NavLink>
                    <NavLink
                      to="/recettes"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <PlusCircle className="w-4 h-4" />
                      <span>Ventes & Recettes</span>
                    </NavLink>
                    <NavLink
                      to="/depenses"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <MinusCircle className="w-4 h-4" />
                      <span>Dépenses d’Exploitation</span>
                    </NavLink>
                    <NavLink
                      to="/vendeur/commandes"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <ShoppingCart className="w-4 h-4" />
                      <span>Devis & Commandes</span>
                    </NavLink>
                    <NavLink
                      to="/factures"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <FileText className="w-4 h-4" />
                      <span>Facturation</span>
                    </NavLink>
                    <NavLink
                      to="/paiements"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <CreditCard className="w-4 h-4" />
                      <span>Paiements & Encaissements</span>
                    </NavLink>
                    <NavLink
                      to="/tresorerie"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Landmark className="w-4 h-4" />
                      <span>Trésorerie & Caisse</span>
                    </NavLink>
                    <NavLink
                      to="/paiements-numeriques/dashboard"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Wallet className="w-4 h-4" />
                      <span>Mobile Money & Cartes</span>
                    </NavLink>
                    <NavLink
                      to="/stocks"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Package className="w-4 h-4" />
                      <span>Gestion des Stocks</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}

          {/* ========================================================= */}
          {/* 5. ESPACE : TIERS ET GESTION (GÉRANT)                     */}
          {/* ========================================================= */}
          {activeSpace === 'tiers-gestion' && allowedSpaces.includes('tiers-gestion') && (
            <div className="space-y-4">
              <div>
                <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 mb-2">
                  Tiers et Gestion Opérationnelle
                </p>
                <nav className="space-y-1">
                  <NavLink
                    to="/clients"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Users className="w-4 h-4" />
                    <span>Clients & Fidélité</span>
                  </NavLink>
                  <NavLink
                    to="/fournisseurs"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Fournisseurs</span>
                  </NavLink>
                  <NavLink
                    to="/gestion/queue"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Users2 className="w-4 h-4" />
                    <span>File d’Attente & Accueil</span>
                  </NavLink>
                  <NavLink
                    to="/gestion/postes"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Building2 className="w-4 h-4" />
                    <span>Personnel, Coiffeurs, Serveurs & Tables</span>
                  </NavLink>
                  <NavLink
                    to="/gestion/activite"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Calendar className="w-4 h-4" />
                    <span>Activité & Établissements</span>
                  </NavLink>
                  <NavLink
                    to="/stocks"
                    className={navLinkClass}
                    style={({ isActive }) => getActiveStyle(isActive)}
                  >
                    <Package className="w-4 h-4" />
                    <span>Catégories, Produits & Services</span>
                  </NavLink>
                </nav>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* 6. ESPACE : ADMINISTRATION PME (ADMIN)                    */}
          {/* ========================================================= */}
          {activeSpace === 'administration-pme' &&
            allowedSpaces.includes('administration-pme') && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider px-3 mb-2">
                    Administration de l’Entreprise
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/admin/utilisateurs-acces"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Clock className="w-4 h-4" />
                      <span>Rôles, Accès Temporaires & Audit</span>
                    </NavLink>
                    <NavLink
                      to="/admin/white-label"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Palette className="w-4 h-4" />
                      <span>Identité Visuelle White Label</span>
                    </NavLink>
                    <NavLink
                      to="/admin/entreprises"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Building2 className="w-4 h-4" />
                      <span>Profil Métier & Multi-Entreprises</span>
                    </NavLink>
                    <NavLink
                      to="/admin/pos-management"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Target className="w-4 h-4" />
                      <span>Supervision Marges & Quotas</span>
                    </NavLink>
                    <NavLink
                      to="/paiements-numeriques/configuration"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Settings className="w-4 h-4" />
                      <span>Configuration Moyens de Paiement</span>
                    </NavLink>
                    <NavLink
                      to="/parametres"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>Paramètres Généraux & Accréditations</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}

          {/* ========================================================= */}
          {/* 7. ESPACE : PLATEFORME SAAS MULTI-ENTREPRISES (SUPER ADMIN) */}
          {/* ========================================================= */}
          {activeSpace === 'plateforme-saas' &&
            allowedSpaces.includes('plateforme-saas') && (
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-extrabold uppercase text-rose-700 tracking-wider px-3 mb-2">
                    Plateforme SaaS Multi-Entreprises
                  </p>
                  <nav className="space-y-1">
                    <NavLink
                      to="/admin/entreprises"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Globe className="w-4 h-4" />
                      <span>Gestion des Entreprises & Onboarding</span>
                    </NavLink>
                    <NavLink
                      to="/admin/white-label"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <Palette className="w-4 h-4" />
                      <span>Personnalisation White Label</span>
                    </NavLink>
                    <NavLink
                      to="/admin/utilisateurs-acces"
                      className={navLinkClass}
                      style={({ isActive }) => getActiveStyle(isActive)}
                    >
                      <ShieldCheck className="w-4 h-4" />
                      <span>RBAC, Accès Temporaires & Audit</span>
                    </NavLink>
                  </nav>
                </div>
              </div>
            )}
        </div>

        {/* Footer info avec isolation tenant */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          {activeUserGrants.length > 0 && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-2 text-[10px] text-amber-900">
              <p className="font-extrabold flex items-center gap-1">
                <Clock className="w-3 h-3 text-amber-600" />
                <span>Accès Temporaire Actif</span>
              </p>
              <p className="truncate">{activeUserGrants[0].moduleLabel}</p>
            </div>
          )}

          <div className="bg-slate-50 border border-slate-200/60 rounded-xl p-2.5 text-[11px] text-slate-500 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
              <span className="font-bold text-slate-700 truncate">
                {activeCompany.code}
              </span>
            </div>
            <span className="text-[10px] font-mono text-slate-400 shrink-0">Isolé • {activeCompany.currency}</span>
          </div>
        </div>
      </aside>
    </>
  );
};
