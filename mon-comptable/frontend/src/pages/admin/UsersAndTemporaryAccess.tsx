import React, { useState } from 'react';
import {
  ShieldCheck,
  Users,
  Clock,
  Key,
  Lock,
  Unlock,
  AlertCircle,
  CheckCircle2,
  XCircle,
  FileText,
  PlusCircle,
  Trash2,
  Activity,
  Building2,
} from 'lucide-react';
import { useAuth, getBaseAllowedSpacesForRole } from '../../context/AuthContext';
import { UserRole, WorkspaceSpaceId } from '../../types';

interface CompanyStaffMember {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  roleLabel: string;
  defaultWorkspaceLabel: string;
  isActive: boolean;
}

const COMPANY_STAFF_MEMBERS: CompanyStaffMember[] = [
  {
    id: 1,
    name: 'Dieudonné Kasongo',
    email: 'admin@monxy.cd',
    role: 'ADMIN',
    roleLabel: 'Administrateur PME',
    defaultWorkspaceLabel: 'Tous les modules de son entreprise + Administration PME',
    isActive: true,
  },
  {
    id: 2,
    name: 'Felly Ilunga',
    email: 'gerant@monxy.cd',
    role: 'MANAGER',
    roleLabel: 'Gérant d’Exploitation',
    defaultWorkspaceLabel: 'Exclusivement : Gestion commerciale & trésorerie + Tiers et Gestion',
    isActive: true,
  },
  {
    id: 3,
    name: 'Mireille Kabongo',
    email: 'compta@monxy.cd',
    role: 'ACCOUNTANT',
    roleLabel: 'Comptable SYSCOHADA',
    defaultWorkspaceLabel: 'Exclusivement : Extension Financière (Générale, Financière, Analytique)',
    isActive: true,
  },
  {
    id: 7,
    name: 'Jean-Paul Mukendi',
    email: 'controleur@monxy.cd',
    role: 'CONTROLLER',
    roleLabel: 'Contrôleur Financier',
    defaultWorkspaceLabel: 'Exclusivement : Contrôle Financier (Audit lecture seule & Budgets)',
    isActive: true,
  },
  {
    id: 5,
    name: 'Alain Tshisekedi',
    email: 'vendeur@monxy.cd',
    role: 'SELLER',
    roleLabel: 'Vendeur POS',
    defaultWorkspaceLabel: 'Exclusivement : Ventes POS & Caisse',
    isActive: true,
  },
  {
    id: 4,
    name: 'Grâce Kalonji',
    email: 'caisse@monxy.cd',
    role: 'CASHIER',
    roleLabel: 'Caissier / Caissière',
    defaultWorkspaceLabel: 'Exclusivement : Ventes POS & Caisse (Différencié dans le journal)',
    isActive: true,
  },
];

const MODULE_GRANT_OPTIONS: {
  code: WorkspaceSpaceId;
  label: string;
  defaultPermissions: string[];
}[] = [
  {
    code: 'ventes-pos',
    label: 'Ventes POS & Caisse (Terminal de vente & Encaissement)',
    defaultPermissions: ['POS_SALE', 'POS_CASH_COLLECTION', 'POS_PRINT_RECEIPT'],
  },
  {
    code: 'extension-financiere',
    label: 'Extension Financière (Comptabilité Générale, Financière & Analytique)',
    defaultPermissions: ['VIEW_ACCOUNTING', 'ENTRY_CREATE', 'FINANCIAL_REPORTS'],
  },
  {
    code: 'controle-financier',
    label: 'Contrôle Financier (Vérification paiements, Audit & Budgets)',
    defaultPermissions: ['VIEW_DASHBOARD', 'VERIFY_PAYMENTS', 'VIEW_BUDGET_VARIANCES'],
  },
  {
    code: 'gestion-commerciale',
    label: 'Gestion Commerciale & Trésorerie (Ventes, Facturation, Stocks)',
    defaultPermissions: ['COMMERCIAL_MANAGEMENT', 'TREASURY_MANAGEMENT', 'STOCK_MANAGEMENT'],
  },
  {
    code: 'tiers-gestion',
    label: 'Tiers et Gestion (Clients, Fournisseurs, Personnel, File d’attente)',
    defaultPermissions: ['TIERS_MANAGEMENT', 'QUEUE_STATIONS_MANAGEMENT'],
  },
  {
    code: 'administration-pme',
    label: 'Administration PME (Paramètres fiscaux, Charte White Label)',
    defaultPermissions: ['CONFIGURE_TAX_PARAMETERS', 'WHITE_LABEL_CONFIG'],
  },
];

const DURATION_SHORTCUTS = [
  { id: '1h', label: '1 heure', hours: 1 },
  { id: '4h', label: '4 heures', hours: 4 },
  { id: '1d', label: '1 jour (24h)', hours: 24 },
  { id: '2d', label: '2 jours (48h)', hours: 48 },
  { id: '7d', label: '7 jours', hours: 168 },
  { id: 'custom', label: 'Date personnalisée', hours: 0 },
] as const;

export const UsersAndTemporaryAccess: React.FC = () => {
  const {
    activeCompany,
    activeBranding,
    temporaryGrants,
    grantTemporaryAccess,
    revokeTemporaryAccess,
    auditLogs,
    switchRole,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<'TEMP_ACCESS' | 'RBAC_MATRIX' | 'AUDIT_LOGS'>('TEMP_ACCESS');

  // Formulaire de création d'accès temporaire
  const [selectedStaffId, setSelectedStaffId] = useState<number>(2); // Felly Ilunga (Gérant)
  const [selectedModuleCode, setSelectedModuleCode] = useState<WorkspaceSpaceId>('extension-financiere');
  const [selectedDurationId, setSelectedDurationId] = useState<string>('4h');
  const [customExpiresAt, setCustomExpiresAt] = useState<string>(() => {
    const d = new Date(Date.now() + 4 * 3600 * 1000);
    return d.toISOString().slice(0, 16);
  });
  const [reason, setReason] = useState<string>('');
  const [selectedPerms, setSelectedPerms] = useState<string[]>([
    'VIEW_ACCOUNTING',
    'ENTRY_CREATE',
    'FINANCIAL_REPORTS',
  ]);

  const handleModuleChange = (code: WorkspaceSpaceId) => {
    setSelectedModuleCode(code);
    const found = MODULE_GRANT_OPTIONS.find((m) => m.code === code);
    if (found) {
      setSelectedPerms(found.defaultPermissions);
    }
  };

  const handleDurationSelect = (shortcutId: string, hours: number) => {
    setSelectedDurationId(shortcutId);
    if (hours > 0) {
      const exp = new Date(Date.now() + hours * 3600 * 1000);
      setCustomExpiresAt(exp.toISOString().slice(0, 16));
    }
  };

  const handleGrantSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const staff = COMPANY_STAFF_MEMBERS.find((s) => s.id === selectedStaffId);
    const mod = MODULE_GRANT_OPTIONS.find((m) => m.code === selectedModuleCode);
    if (!staff || !mod) return;

    if (!reason.trim()) {
      alert('Veuillez renseigner le motif obligatoire de cet accès temporaire pour le journal d’audit.');
      return;
    }

    const shortcutObj = DURATION_SHORTCUTS.find((d) => d.id === selectedDurationId);

    grantTemporaryAccess({
      companyId: activeCompany.id,
      userId: staff.id,
      userName: staff.name,
      userEmail: staff.email,
      userRole: staff.role,
      moduleCode: mod.code,
      moduleLabel: mod.label,
      permissions: selectedPerms,
      reason: reason.trim(),
      startsAt: new Date().toISOString(),
      expiresAt: new Date(customExpiresAt).toISOString(),
      durationLabel: shortcutObj?.label || 'Personnalisée',
    });

    setReason('');
  };

  const companyGrants = temporaryGrants.filter((g) => g.companyId === activeCompany.id);

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Contrôle d’Accès Basé sur les Rôles (RBAC) & Accès Temporaires</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              <Building2 className="w-3.5 h-3.5" />
              <span>Entreprise : {activeCompany.tradeName}</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900">
            Rôles, Permissions, Accès Temporaires & Journal d’Audit
          </h1>
          <p className="text-xs text-slate-500">
            Séparation stricte des espaces par métier, attribution d’autorisations temporaires à expiration automatique et traçabilité complète non modifiable.
          </p>
        </div>

        {/* Navigation interne */}
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setActiveTab('TEMP_ACCESS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'TEMP_ACCESS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Accès Temporaires ({companyGrants.filter((g) => g.status === 'ACTIVE').length} actifs)</span>
          </button>

          <button
            onClick={() => setActiveTab('RBAC_MATRIX')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'RBAC_MATRIX'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Users className="w-3.5 h-3.5" />
            <span>Rôles & Matrice RBAC</span>
          </button>

          <button
            onClick={() => setActiveTab('AUDIT_LOGS')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition ${
              activeTab === 'AUDIT_LOGS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Journal d’Audit ({auditLogs.length})</span>
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* ONGLET 1 : GESTION DES ACCÈS TEMPORAIRES                  */}
      {/* ========================================================= */}
      {activeTab === 'TEMP_ACCESS' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Formulaire d'attribution (5 cols) */}
          <form
            onSubmit={handleGrantSubmit}
            className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4"
          >
            <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
              <Key className="w-4 h-4 text-amber-600" />
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Accorder un Accès Temporaire Exceptionnel
                </h2>
                <p className="text-[11px] text-slate-500">
                  L’accès sera révoqué automatiquement dès l’échéance atteinte.
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  1. Collaborateur bénéficiaire
                </label>
                <select
                  value={selectedStaffId}
                  onChange={(e) => setSelectedStaffId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {COMPANY_STAFF_MEMBERS.filter((s) => s.role !== 'ADMIN').map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — ({s.roleLabel})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  2. Module ou Espace autorisé temporairement
                </label>
                <select
                  value={selectedModuleCode}
                  onChange={(e) => handleModuleChange(e.target.value as WorkspaceSpaceId)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-900"
                >
                  {MODULE_GRANT_OPTIONS.map((m) => (
                    <option key={m.code} value={m.code}>
                      {m.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1.5">
                  3. Durée de validité (Expiration obligatoire)
                </label>
                <div className="grid grid-cols-3 gap-1.5 mb-2">
                  {DURATION_SHORTCUTS.map((sc) => (
                    <button
                      key={sc.id}
                      type="button"
                      onClick={() => handleDurationSelect(sc.id, sc.hours)}
                      className={`py-1.5 px-2 rounded-lg text-[11px] font-bold border transition ${
                        selectedDurationId === sc.id
                          ? 'bg-blue-600 text-white border-blue-600'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      {sc.label}
                    </button>
                  ))}
                </div>
                <input
                  type="datetime-local"
                  value={customExpiresAt}
                  onChange={(e) => {
                    setSelectedDurationId('custom');
                    setCustomExpiresAt(e.target.value);
                  }}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono font-bold text-slate-800"
                  required
                />
              </div>

              <div>
                <label className="block font-bold text-slate-600 mb-1">
                  4. Motif obligatoire de l’accès temporaire (Audit)
                </label>
                <textarea
                  rows={2}
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  placeholder="Ex: Remplacement congé maladie, clôture mensuelle, inventaire physique..."
                  className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-2.5 rounded-xl text-white text-xs font-extrabold flex items-center justify-center gap-2 shadow-sm hover:opacity-95 transition"
              style={{ backgroundColor: activeBranding.buttonColor }}
            >
              <PlusCircle className="w-4 h-4" />
              <span>Activer l’Accès Temporaire Immédiatement</span>
            </button>
          </form>

          {/* Tableau des accès temporaires actifs, expirés et révoqués (7 cols) */}
          <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Registre des Accès Temporaires (Actifs, Expirés & Révoqués)
                </h2>
                <p className="text-[11px] text-slate-500">
                  Révocation manuelle en un clic à tout moment par l’Administrateur.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {companyGrants.map((grant) => (
                <div
                  key={grant.id}
                  className={`p-4 rounded-2xl border space-y-2.5 ${
                    grant.status === 'ACTIVE'
                      ? 'bg-amber-50/40 border-amber-200'
                      : 'bg-slate-50/60 border-slate-200 opacity-80'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-extrabold text-slate-900">{grant.userName}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                        Rôle de base : {grant.userRole}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {grant.status === 'ACTIVE' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-300">
                          <Clock className="w-3 h-3 animate-pulse" />
                          <span>ACTIF ({grant.durationLabel})</span>
                        </span>
                      )}
                      {grant.status === 'EXPIRED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-slate-200 text-slate-700">
                          <span>EXPIRÉ AUTOMATIQUEMENT</span>
                        </span>
                      )}
                      {grant.status === 'REVOKED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold bg-rose-100 text-rose-800">
                          <XCircle className="w-3 h-3" />
                          <span>RÉVOQUÉ MANUELLEMENT</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-xs space-y-1">
                    <p className="font-bold text-blue-800">
                      Module débloqué : {grant.moduleLabel}
                    </p>
                    <p className="text-slate-600 italic">« {grant.reason} »</p>
                  </div>

                  <div className="pt-2 border-t border-slate-200/70 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500">
                    <div>
                      <span>Accordé par : <strong>{grant.grantedByName}</strong></span>
                      <span className="mx-2">•</span>
                      <span>
                        Expire le :{' '}
                        <strong className="font-mono text-slate-800">
                          {new Date(grant.expiresAt).toLocaleString('fr-FR')}
                        </strong>
                      </span>
                    </div>

                    {grant.status === 'ACTIVE' && (
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => switchRole(grant.userRole)}
                          className="px-2.5 py-1 rounded-lg bg-blue-100 hover:bg-blue-200 text-blue-800 font-bold text-[11px]"
                        >
                          Tester ce profil
                        </button>
                        <button
                          onClick={() => revokeTemporaryAccess(grant.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-bold text-[11px]"
                        >
                          Révoquer immédiatement
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ONGLET 2 : MATRICE STRICTE DES RÔLES & ESPACES            */}
      {/* ========================================================= */}
      {activeTab === 'RBAC_MATRIX' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div>
            <h2 className="text-sm font-extrabold text-slate-900">
              Règle de Référence Stricte de Séparation des Espaces par Rôle
            </h2>
            <p className="text-xs text-slate-500">
              Aucun utilisateur ne voit un menu, bouton ou route non autorisé pour son rôle (sauf accès temporaire actif).
            </p>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-3">Collaborateur</th>
                  <th className="py-3 px-3">Rôle Métier</th>
                  <th className="py-3 px-3">Espace(s) Visible(s) par Défaut (Règle Stricte)</th>
                  <th className="py-3 px-3">Statut</th>
                  <th className="py-3 px-3 text-right">Simulation Immédiate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {COMPANY_STAFF_MEMBERS.map((member) => (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3">
                      <p className="font-extrabold text-slate-900">{member.name}</p>
                      <p className="text-[11px] text-slate-400">{member.email}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                        {member.roleLabel} ({member.role})
                      </span>
                    </td>
                    <td className="py-3 px-3 font-semibold text-slate-700">
                      {member.defaultWorkspaceLabel}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <CheckCircle2 className="w-3 h-3" /> Actif
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => switchRole(member.role, true)}
                        className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-[11px]"
                      >
                        Basculer sur ce Rôle
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* ONGLET 3 : JOURNAL D'AUDIT ET TRAÇABILITÉ INALTÉRABLE     */}
      {/* ========================================================= */}
      {activeTab === 'AUDIT_LOGS' && (
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-extrabold text-slate-900">
                Journal d’Audit et de Traçabilité Sécurisé (Immuable)
              </h2>
              <p className="text-xs text-slate-500">
                Enregistrement automatique des connexions, ventes POS, validations comptables, modifications White Label et accès temporaires.
              </p>
            </div>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
              <Lock className="w-3.5 h-3.5" /> Journal non modifiable
            </span>
          </div>

          <div className="overflow-x-auto min-w-0">
            <table className="w-full text-left border-collapse min-w-[780px]">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-extrabold uppercase text-slate-400">
                  <th className="py-3 px-3">Horodatage</th>
                  <th className="py-3 px-3">Entreprise</th>
                  <th className="py-3 px-3">Utilisateur & Rôle</th>
                  <th className="py-3 px-3">Action / Module</th>
                  <th className="py-3 px-3">Détail de l’Opération</th>
                  <th className="py-3 px-3">Adresse IP</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {auditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-500 whitespace-nowrap">
                      {log.timestamp}
                    </td>
                    <td className="py-3 px-3 font-bold text-slate-800">{log.companyName}</td>
                    <td className="py-3 px-3">
                      <span className="font-bold text-slate-900">{log.userName}</span>
                      <span className="ml-1.5 text-[10px] px-1.5 py-0.5 rounded bg-slate-100 font-bold text-slate-600">
                        {log.userRole}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block text-[10px] font-extrabold px-2 py-0.5 rounded uppercase ${
                          log.severity === 'CRITICAL'
                            ? 'bg-rose-100 text-rose-800'
                            : log.severity === 'WARNING'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-blue-50 text-blue-800'
                        }`}
                      >
                        {log.action}
                      </span>
                      <p className="text-[10px] text-slate-400 mt-0.5">{log.module}</p>
                    </td>
                    <td className="py-3 px-3 text-slate-700 max-w-md">{log.description}</td>
                    <td className="py-3 px-3 font-mono text-[11px] text-slate-400 whitespace-nowrap">
                      {log.ipAddress}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
