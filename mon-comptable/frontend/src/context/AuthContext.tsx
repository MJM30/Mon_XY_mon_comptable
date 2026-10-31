import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { apiClient } from '../services/api';
import {
  User,
  UserRole,
  WorkspaceSpaceId,
  TenantCompany,
  Establishment,
  CompanyBranding,
  TemporaryAccessGrant,
  AuditLogEvent,
  CompanyStatus,
} from '../types';
import {
  INITIAL_TENANT_COMPANIES,
  INITIAL_TEMPORARY_GRANTS,
  INITIAL_AUDIT_LOGS,
  DEFAULT_PLATFORM_BRANDING,
} from '../data/multiTenantMockData';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  activeSpace: WorkspaceSpaceId;
  setActiveSpace: (space: WorkspaceSpaceId) => void;
  loginWithCredentials: (
    email: string,
    pass: string,
    rememberMe?: boolean
  ) => Promise<{ success: boolean; error?: string; redirectUrl?: string }>;
  logout: () => Promise<void>;
  switchRole: (role: UserRole, isAccredited?: boolean, companyId?: number) => void;
  canAccessGestion: boolean;

  // Multi-Tenant (Multi-Entreprises) & Établissements
  companies: TenantCompany[];
  activeCompany: TenantCompany;
  switchCompany: (companyId: number) => void;
  createCompany: (newCompany: Omit<TenantCompany, 'id' | 'createdAt' | 'stats'>) => TenantCompany;
  updateCompanyStatus: (companyId: number, status: CompanyStatus) => void;
  activeEstablishment: Establishment;
  switchEstablishment: (establishmentId: number) => void;
  addEstablishment: (companyId: number, est: Omit<Establishment, 'id' | 'companyId'>) => void;

  // White Label (Personnalisation Visuelle)
  activeBranding: CompanyBranding;
  updateCompanyBranding: (companyId: number, branding: Partial<CompanyBranding>) => void;
  resetCompanyBranding: (companyId: number) => void;

  // RBAC Strict & Accès Temporaires
  allowedSpaces: WorkspaceSpaceId[];
  temporaryGrants: TemporaryAccessGrant[];
  activeUserGrants: TemporaryAccessGrant[];
  grantTemporaryAccess: (
    grant: Omit<TemporaryAccessGrant, 'id' | 'createdAt' | 'status' | 'grantedById' | 'grantedByName'>
  ) => void;
  revokeTemporaryAccess: (grantId: number) => void;
  hasPermission: (permissionCode: string) => boolean;
  getDefaultRouteForRole: (role: UserRole, isAccredited?: boolean) => string;

  // Journal d'Audit & Traçabilité
  auditLogs: AuditLogEvent[];
  logAuditEvent: (
    action: AuditLogEvent['action'],
    module: string,
    description: string,
    severity?: AuditLogEvent['severity']
  ) => void;
}

const DEMO_USERS: Record<string, { pass: string; user: User }> = {
  // Super Administrateur Plateforme SaaS
  'superadmin@monxy.cd': {
    pass: 'SuperAdmin123!',
    user: {
      id: 99,
      name: 'Cédric Lukombe (Super Admin SaaS)',
      email: 'superadmin@monxy.cd',
      role: 'SUPER_ADMIN',
      isAccredited: true,
      companyId: 1,
      title: 'Super Administrateur Plateforme Multi-Entreprises',
      permissions: ['ALL_PLATFORM', 'MANAGE_TENANTS', 'ONBOARD_COMPANIES'],
    },
  },

  // Administrateur PME
  'admin@monxy.cd': {
    pass: 'Admin123!',
    user: {
      id: 1,
      name: 'Dieudonné Kasongo',
      email: 'admin@monxy.cd',
      role: 'ADMIN',
      isAccredited: true,
      companyId: 1,
      title: 'Directeur Général & Administrateur PME',
      permissions: [
        'COMPANY_ADMIN',
        'MANAGE_USERS',
        'GRANT_TEMP_ACCESS',
        'WHITE_LABEL_CONFIG',
        'ENTRY_CREATE',
        'ENTRY_VALIDATE',
        'PERIOD_CLOSE',
      ],
    },
  },

  // Vendeur POS & Caisse
  'vendeur@monxy.cd': {
    pass: 'Vendeur123!',
    user: {
      id: 5,
      name: 'Alain Tshisekedi',
      email: 'vendeur@monxy.cd',
      role: 'SELLER',
      isAccredited: false,
      companyId: 1,
      title: 'Vendeur POS & Caisse — Kinshasa Gombe',
      permissions: ['POS_SALE', 'POS_DISCOUNT_STANDARD', 'POS_PRINT_RECEIPT'],
    },
  },

  // Caissier (Même espace visible que Vendeur : Ventes POS & Caisse)
  'caisse@monxy.cd': {
    pass: 'Caisse123!',
    user: {
      id: 4,
      name: 'Grâce Kalonji',
      email: 'caisse@monxy.cd',
      role: 'CASHIER',
      isAccredited: false,
      companyId: 1,
      title: 'Caissière Principale — Ventes POS & Caisse',
      permissions: ['POS_SALE', 'POS_CASH_COLLECTION', 'POS_PRINT_RECEIPT'],
    },
  },

  // Comptable (Exclusivement Extension Financière : Comptabilité Générale, Gestion Financière, Comptabilité Analytique)
  'compta@monxy.cd': {
    pass: 'Compta123!',
    user: {
      id: 3,
      name: 'Mireille Kabongo',
      email: 'compta@monxy.cd',
      role: 'ACCOUNTANT',
      isAccredited: true,
      companyId: 1,
      title: 'Comptable Senior — SYSCOHADA Révisé RDC',
      permissions: ['ENTRY_CREATE', 'ENTRY_VALIDATE', 'PERIOD_CLOSE', 'FINANCIAL_STATEMENTS'],
    },
  },

  // Contrôleur Financier (Exclusivement Contrôle Financier)
  'controleur@monxy.cd': {
    pass: 'Controleur123!',
    user: {
      id: 7,
      name: 'Jean-Paul Mukendi',
      email: 'controleur@monxy.cd',
      role: 'CONTROLLER',
      isAccredited: true,
      companyId: 1,
      title: 'Contrôleur Financier & Audit Interne',
      permissions: ['AUDIT_READ_ONLY', 'REPORT_ANOMALY', 'BUDGET_CONTROL', 'VERIFY_PAYMENTS'],
    },
  },

  // Finance (Alias Contrôleur Financier)
  'finance@monxy.cd': {
    pass: 'Finance123!',
    user: {
      id: 6,
      name: 'Chantal Mwamba',
      email: 'finance@monxy.cd',
      role: 'FINANCE',
      isAccredited: true,
      companyId: 1,
      title: 'Directrice du Contrôle Financier',
      permissions: ['AUDIT_READ_ONLY', 'REPORT_ANOMALY', 'BUDGET_CONTROL', 'VERIFY_PAYMENTS'],
    },
  },

  // Gérant (Exclusivement Gestion commerciale & trésorerie + Tiers et Gestion)
  'gerant@monxy.cd': {
    pass: 'Gerant123!',
    user: {
      id: 2,
      name: 'Felly Ilunga',
      email: 'gerant@monxy.cd',
      role: 'MANAGER',
      isAccredited: true,
      companyId: 1,
      title: 'Gérant d’Exploitation & Trésorerie',
      permissions: ['COMMERCIAL_MANAGEMENT', 'TREASURY_MANAGEMENT', 'TIERS_MANAGEMENT', 'STOCK_MANAGEMENT'],
    },
  },
  'gerant.accredite@monxy.cd': {
    pass: 'Gerant123!',
    user: {
      id: 2,
      name: 'Felly Ilunga (Gérant)',
      email: 'gerant.accredite@monxy.cd',
      role: 'MANAGER',
      isAccredited: true,
      companyId: 1,
      title: 'Gérant d’Exploitation & Trésorerie',
      permissions: ['COMMERCIAL_MANAGEMENT', 'TREASURY_MANAGEMENT', 'TIERS_MANAGEMENT', 'STOCK_MANAGEMENT'],
    },
  },
};

/**
 * Calcule les espaces stricts autorisés selon la Règle de Référence du Cahier des Charges :
 * - VENDEUR (SELLER) : Exclusivement Ventes POS & Caisse ('ventes-pos')
 * - CAISSIER (CASHIER) : Exclusivement Ventes POS & Caisse ('ventes-pos')
 * - COMPTABLE (ACCOUNTANT) : Exclusivement Extension Financière ('extension-financiere')
 * - CONTRÔLEUR FINANCIER (CONTROLLER / FINANCE) : Exclusivement Contrôle Financier ('controle-financier')
 * - GÉRANT (MANAGER) : Exclusivement Gestion commerciale & trésorerie ('gestion-commerciale') + Tiers et Gestion ('tiers-gestion')
 * - ADMINISTRATEUR (ADMIN) : Tous les espaces de son entreprise + Administration PME ('administration-pme')
 * - SUPER ADMINISTRATEUR (SUPER_ADMIN) : Plateforme SaaS ('plateforme-saas') + Tous les espaces
 */
export function getBaseAllowedSpacesForRole(role: UserRole): WorkspaceSpaceId[] {
  switch (role) {
    case 'SELLER':
    case 'CASHIER':
    case 'STAFF':
      return ['ventes-pos'];
    case 'ACCOUNTANT':
      return ['extension-financiere'];
    case 'CONTROLLER':
    case 'FINANCE':
      return ['controle-financier'];
    case 'MANAGER':
      return ['gestion-commerciale', 'tiers-gestion'];
    case 'ADMIN':
      return [
        'gestion-commerciale',
        'ventes-pos',
        'extension-financiere',
        'controle-financier',
        'tiers-gestion',
        'administration-pme',
      ];
    case 'SUPER_ADMIN':
      return [
        'plateforme-saas',
        'gestion-commerciale',
        'ventes-pos',
        'extension-financiere',
        'controle-financier',
        'tiers-gestion',
        'administration-pme',
      ];
    default:
      return ['ventes-pos'];
  }
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('optima_token') || sessionStorage.getItem('optima_token');
  });

  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('optima_user') || sessionStorage.getItem('optima_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [companies, setCompanies] = useState<TenantCompany[]>(() => {
    const saved = localStorage.getItem('monxy_tenant_companies');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TENANT_COMPANIES;
      }
    }
    return INITIAL_TENANT_COMPANIES;
  });

  const [activeCompanyId, setActiveCompanyId] = useState<number>(() => {
    const saved = localStorage.getItem('monxy_active_company_id');
    return saved ? Number(saved) : 1;
  });

  const [activeEstablishmentId, setActiveEstablishmentId] = useState<number>(() => {
    const saved = localStorage.getItem('monxy_active_establishment_id');
    return saved ? Number(saved) : 101;
  });

  const [temporaryGrants, setTemporaryGrants] = useState<TemporaryAccessGrant[]>(() => {
    const saved = localStorage.getItem('monxy_temp_grants');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_TEMPORARY_GRANTS;
      }
    }
    return INITIAL_TEMPORARY_GRANTS;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLogEvent[]>(() => {
    const saved = localStorage.getItem('monxy_audit_logs');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_AUDIT_LOGS;
      }
    }
    return INITIAL_AUDIT_LOGS;
  });

  const [isLoading, setIsLoading] = useState<boolean>(true);

  const activeCompany = useMemo(() => {
    return companies.find((c) => c.id === activeCompanyId) || companies[0];
  }, [companies, activeCompanyId]);

  const activeEstablishment = useMemo(() => {
    const found = activeCompany.establishments.find((e) => e.id === activeEstablishmentId);
    return found || activeCompany.establishments[0];
  }, [activeCompany, activeEstablishmentId]);

  const activeBranding: CompanyBranding = useMemo(() => {
    if (activeCompany?.branding?.useCustomBranding) {
      return activeCompany.branding;
    }
    return {
      ...DEFAULT_PLATFORM_BRANDING,
      companyId: activeCompany?.id || 1,
      invoiceHeaderName: activeCompany?.branding?.invoiceHeaderName || DEFAULT_PLATFORM_BRANDING.invoiceHeaderName,
      receiptHeaderName: activeCompany?.branding?.receiptHeaderName || DEFAULT_PLATFORM_BRANDING.receiptHeaderName,
    };
  }, [activeCompany]);

  // Vérification automatique de l'expiration des accès temporaires
  useEffect(() => {
    const now = new Date().getTime();
    let changed = false;
    const updated = temporaryGrants.map((g) => {
      if (g.status === 'ACTIVE' && new Date(g.expiresAt).getTime() <= now) {
        changed = true;
        return { ...g, status: 'EXPIRED' as const };
      }
      return g;
    });
    if (changed) {
      setTemporaryGrants(updated);
      localStorage.setItem('monxy_temp_grants', JSON.stringify(updated));
    }
  }, [temporaryGrants]);

  // Accès temporaires actifs pour l'utilisateur courant dans l'entreprise active
  const activeUserGrants = useMemo(() => {
    if (!user) return [];
    const now = new Date().getTime();
    return temporaryGrants.filter(
      (g) =>
        g.status === 'ACTIVE' &&
        g.companyId === activeCompany.id &&
        (g.userId === user.id || g.userRole === user.role) &&
        new Date(g.expiresAt).getTime() > now
    );
  }, [user, temporaryGrants, activeCompany]);

  // Espaces autorisés = Espaces de base du rôle + Espaces accordés temporairement
  const allowedSpaces = useMemo<WorkspaceSpaceId[]>(() => {
    if (!user) return ['ventes-pos'];
    const base = getBaseAllowedSpacesForRole(user.role);
    const extra = activeUserGrants.map((g) => g.moduleCode);
    return Array.from(new Set([...base, ...extra]));
  }, [user, activeUserGrants]);

  const [activeSpace, setActiveSpaceState] = useState<WorkspaceSpaceId>(() => {
    if (user) {
      const base = getBaseAllowedSpacesForRole(user.role);
      return base[0];
    }
    return 'gestion-commerciale';
  });

  // Synchronise activeSpace si le rôle change et que l'espace actuel n'est plus autorisé
  useEffect(() => {
    if (user && allowedSpaces.length > 0 && !allowedSpaces.includes(activeSpace)) {
      setActiveSpaceState(allowedSpaces[0]);
    }
  }, [user, allowedSpaces, activeSpace]);

  // Injection dynamique du titre de page et variables CSS White Label
  useEffect(() => {
    document.title = activeBranding.dashboardTitle || 'Mon X.Y mon comptable';
    document.documentElement.style.setProperty('--wl-primary', activeBranding.primaryColor);
    document.documentElement.style.setProperty('--wl-secondary', activeBranding.secondaryColor);
    document.documentElement.style.setProperty('--wl-accent', activeBranding.accentColor);
    document.documentElement.style.setProperty('--wl-button', activeBranding.buttonColor);
  }, [activeBranding]);

  const setActiveSpace = (space: WorkspaceSpaceId) => {
    // Support des alias historiques vers les nouveaux identifiants stricts
    let normalized: WorkspaceSpaceId = space;
    if (space === 'portail-vendeur') normalized = 'ventes-pos';
    if (space === 'comptabilite-generale' || space === 'comptabilite-analytique' || space === 'paiements-numeriques') {
      normalized = 'extension-financiere';
    }
    if (space === 'espace-finance') normalized = 'controle-financier';
    if (space === 'mon-comptable') normalized = 'gestion-commerciale';
    if (space === 'interface-gestion') normalized = 'tiers-gestion';

    setActiveSpaceState(normalized);
  };

  const canAccessGestion =
    user?.role === 'SUPER_ADMIN' ||
    user?.role === 'ADMIN' ||
    user?.role === 'MANAGER' ||
    allowedSpaces.includes('tiers-gestion');

  const logAuditEvent = (
    action: AuditLogEvent['action'],
    module: string,
    description: string,
    severity: AuditLogEvent['severity'] = 'INFO'
  ) => {
    const newEvent: AuditLogEvent = {
      id: Date.now(),
      companyId: activeCompany.id,
      companyName: activeCompany.tradeName,
      userId: user?.id || 0,
      userName: user?.name || 'Système',
      userRole: user?.role || 'ADMIN',
      action,
      module,
      description,
      ipAddress: '197.157.210.44 (Kinshasa RDC)',
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      severity,
    };
    setAuditLogs((prev) => {
      const updated = [newEvent, ...prev.slice(0, 199)];
      localStorage.setItem('monxy_audit_logs', JSON.stringify(updated));
      return updated;
    });
  };

  // Nettoyage automatique au montage des anciennes clés localStorage qui auraient conservé des caractères mal encodés (Ã©, â$, etc.)
  useEffect(() => {
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key) {
          const val = localStorage.getItem(key);
          if (val && (val.includes('Ã©') || val.includes('Ã¨') || val.includes('Ã‰') || val.includes('â$'))) {
            localStorage.removeItem(key);
          }
        }
      }
    } catch (e) {
      // Ignorer
    }
  }, []);

  // Vérification de la session au montage
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('optima_token') || sessionStorage.getItem('optima_token');
      if (storedToken) {
        try {
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`;
          const res = await apiClient.get('/auth/me');
          if (res.data) {
            setUser(res.data);
          }
        } catch (err) {
          const savedUser = localStorage.getItem('optima_user') || sessionStorage.getItem('optima_user');
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const getDefaultRouteForRole = (role: UserRole, _isAccredited = true): string => {
    switch (role) {
      case 'SUPER_ADMIN':
        return '/admin/entreprises';
      case 'ADMIN':
        return '/';
      case 'SELLER':
      case 'CASHIER':
      case 'STAFF':
        return '/pos/terminal';
      case 'ACCOUNTANT':
        return '/comptabilite/dashboard';
      case 'CONTROLLER':
      case 'FINANCE':
        return '/finance/controle';
      case 'MANAGER':
        return '/';
      default:
        return '/pos/terminal';
    }
  };

  const loginWithCredentials = async (
    email: string,
    pass: string,
    rememberMe = false
  ): Promise<{ success: boolean; error?: string; redirectUrl?: string }> => {
    setIsLoading(true);

    try {
      const response = await apiClient.post('/auth/login', { email, password: pass });
      const { accessToken, user: backendUser } = response.data;

      const storage = rememberMe ? localStorage : sessionStorage;
      storage.setItem('optima_token', accessToken);
      storage.setItem('optima_user', JSON.stringify(backendUser));

      apiClient.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
      setToken(accessToken);
      setUser(backendUser);
      const spaces = getBaseAllowedSpacesForRole(backendUser.role);
      setActiveSpaceState(spaces[0]);
      setIsLoading(false);

      const redirectUrl = getDefaultRouteForRole(backendUser.role, backendUser.isAccredited);
      return { success: true, redirectUrl };
    } catch (apiError: any) {
      const normalizedEmail = email.trim().toLowerCase();
      const demoAccount = DEMO_USERS[normalizedEmail];

      if (demoAccount && demoAccount.pass === pass) {
        const dummyToken = `demo_jwt_token_${demoAccount.user.role}_${Date.now()}`;
        const storage = rememberMe ? localStorage : sessionStorage;
        storage.setItem('optima_token', dummyToken);
        storage.setItem('optima_user', JSON.stringify(demoAccount.user));

        setToken(dummyToken);
        setUser(demoAccount.user);
        const spaces = getBaseAllowedSpacesForRole(demoAccount.user.role);
        setActiveSpaceState(spaces[0]);
        setIsLoading(false);

        logAuditEvent(
          'LOGIN',
          'Authentification',
          `Connexion réussie de ${demoAccount.user.name} (${demoAccount.user.role}) sur l'entreprise ${activeCompany.tradeName}.`
        );

        const redirectUrl = getDefaultRouteForRole(demoAccount.user.role, demoAccount.user.isAccredited);
        return { success: true, redirectUrl };
      }

      setIsLoading(false);
      const message =
        apiError?.response?.data?.message ||
        'Adresse e-mail ou mot de passe incorrect. Veuillez vérifier vos identifiants.';
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    logAuditEvent('LOGOUT', 'Authentification', `Déconnexion de ${user?.name || 'utilisateur'}.`);
    try {
      await apiClient.post('/auth/logout');
    } catch (e) {
      // Ignorer l'erreur réseau lors de la déconnexion
    } finally {
      localStorage.removeItem('optima_token');
      localStorage.removeItem('optima_user');
      sessionStorage.removeItem('optima_token');
      sessionStorage.removeItem('optima_user');
      delete apiClient.defaults.headers.common['Authorization'];
      setToken(null);
      setUser(null);
    }
  };

  const switchRole = (role: UserRole, isAccredited = true, targetCompanyId?: number) => {
    let title = 'Collaborateur';
    let name = 'Dieudonné Kasongo';
    let id = 1;
    let email = 'admin@monxy.cd';
    let permissions: string[] = [];

    if (role === 'SUPER_ADMIN') {
      name = 'Cédric Lukombe (Super Admin SaaS)';
      email = 'superadmin@monxy.cd';
      title = 'Super Administrateur Plateforme Multi-Entreprises';
      isAccredited = true;
      id = 99;
      permissions = ['ALL_PLATFORM', 'MANAGE_TENANTS', 'ONBOARD_COMPANIES'];
    } else if (role === 'ADMIN') {
      name = 'Dieudonné Kasongo';
      email = 'admin@monxy.cd';
      title = `Administrateur PME — ${activeCompany.tradeName}`;
      isAccredited = true;
      id = 1;
      permissions = [
        'COMPANY_ADMIN',
        'MANAGE_USERS',
        'GRANT_TEMP_ACCESS',
        'WHITE_LABEL_CONFIG',
        'ENTRY_CREATE',
        'ENTRY_VALIDATE',
        'PERIOD_CLOSE',
      ];
    } else if (role === 'SELLER') {
      name = 'Alain Tshisekedi';
      email = 'vendeur@monxy.cd';
      title = `Vendeur POS & Caisse — ${activeCompany.tradeName}`;
      isAccredited = false;
      id = 5;
      permissions = ['POS_SALE', 'POS_DISCOUNT_STANDARD', 'POS_PRINT_RECEIPT'];
    } else if (role === 'CASHIER') {
      name = 'Grâce Kalonji';
      email = 'caisse@monxy.cd';
      title = `Caissière Principale — ${activeCompany.tradeName}`;
      isAccredited = false;
      id = 4;
      permissions = ['POS_SALE', 'POS_CASH_COLLECTION', 'POS_PRINT_RECEIPT'];
    } else if (role === 'ACCOUNTANT') {
      name = 'Mireille Kabongo';
      email = 'compta@monxy.cd';
      title = 'Comptable Senior — SYSCOHADA Révisé RDC';
      isAccredited = true;
      id = 3;
      permissions = ['ENTRY_CREATE', 'ENTRY_VALIDATE', 'PERIOD_CLOSE', 'FINANCIAL_STATEMENTS'];
    } else if (role === 'CONTROLLER' || role === 'FINANCE') {
      name = role === 'CONTROLLER' ? 'Jean-Paul Mukendi' : 'Chantal Mwamba';
      email = role === 'CONTROLLER' ? 'controleur@monxy.cd' : 'finance@monxy.cd';
      title = 'Contrôleur Financier & Audit Interne';
      isAccredited = true;
      id = role === 'CONTROLLER' ? 7 : 6;
      permissions = ['AUDIT_READ_ONLY', 'REPORT_ANOMALY', 'BUDGET_CONTROL', 'VERIFY_PAYMENTS'];
    } else if (role === 'MANAGER') {
      name = 'Felly Ilunga';
      email = 'gerant@monxy.cd';
      title = `Gérant d'Exploitation — ${activeCompany.tradeName}`;
      isAccredited = true;
      id = 2;
      permissions = ['COMMERCIAL_MANAGEMENT', 'TREASURY_MANAGEMENT', 'TIERS_MANAGEMENT', 'STOCK_MANAGEMENT'];
    }

    if (targetCompanyId) {
      switchCompany(targetCompanyId);
    }

    const updated: User = {
      id,
      name,
      email,
      role,
      isAccredited,
      title,
      companyId: targetCompanyId || activeCompany.id,
      permissions,
    };
    setUser(updated);
    localStorage.setItem('optima_user', JSON.stringify(updated));

    const newSpaces = getBaseAllowedSpacesForRole(role);
    setActiveSpaceState(newSpaces[0]);

    logAuditEvent(
      'ROLE_SWITCH',
      'Contrôle d’Accès RBAC',
      `Basculement vers le profil ${name} (Rôle : ${role}) dans l'entreprise ${activeCompany.tradeName}.`
    );
  };

  const switchCompany = (companyId: number) => {
    const target = companies.find((c) => c.id === companyId);
    if (!target) return;
    setActiveCompanyId(companyId);
    localStorage.setItem('monxy_active_company_id', String(companyId));

    const mainEst = target.establishments.find((e) => e.isMain) || target.establishments[0];
    if (mainEst) {
      setActiveEstablishmentId(mainEst.id);
      localStorage.setItem('monxy_active_establishment_id', String(mainEst.id));
    }

    logAuditEvent(
      'COMPANY_SWITCH',
      'Architecture Multi-Entreprises',
      `Changement d'environnement actif vers "${target.tradeName}" (${target.code} • Secteur : ${target.businessSector}).`
    );
  };

  const switchEstablishment = (establishmentId: number) => {
    setActiveEstablishmentId(establishmentId);
    localStorage.setItem('monxy_active_establishment_id', String(establishmentId));
  };

  const createCompany = (newCompanyData: Omit<TenantCompany, 'id' | 'createdAt' | 'stats'>): TenantCompany => {
    const nextId = Math.max(...companies.map((c) => c.id), 0) + 1;
    const created: TenantCompany = {
      ...newCompanyData,
      id: nextId,
      createdAt: new Date().toISOString().split('T')[0],
      branding: {
        ...newCompanyData.branding,
        companyId: nextId,
      },
      establishments: newCompanyData.establishments.map((e, idx) => ({
        ...e,
        id: nextId * 100 + idx + 1,
        companyId: nextId,
      })),
      stats: {
        monthlyRevenue: 0,
        monthlyExpenses: 0,
        activeUsersCount: 2,
        dailyTransactionsCount: 0,
        cashBalance: 0,
      },
    };

    const updated = [...companies, created];
    setCompanies(updated);
    localStorage.setItem('monxy_tenant_companies', JSON.stringify(updated));

    logAuditEvent(
      'COMPANY_CREATED',
      'Onboarding Multi-Entreprises',
      `Création et activation de la nouvelle entreprise "${created.tradeName}" (${created.code}) en devise ${created.currency}.`,
      'INFO'
    );

    return created;
  };

  const updateCompanyStatus = (companyId: number, status: CompanyStatus) => {
    const updated = companies.map((c) => (c.id === companyId ? { ...c, status } : c));
    setCompanies(updated);
    localStorage.setItem('monxy_tenant_companies', JSON.stringify(updated));

    const target = companies.find((c) => c.id === companyId);
    logAuditEvent(
      'COMPANY_STATUS_CHANGED',
      'Administration SaaS',
      `Modification du statut de l'entreprise "${target?.tradeName}" vers ${status}.`,
      status === 'SUSPENDED' || status === 'CLOSED' ? 'WARNING' : 'INFO'
    );
  };

  const addEstablishment = (companyId: number, est: Omit<Establishment, 'id' | 'companyId'>) => {
    const updated = companies.map((c) => {
      if (c.id !== companyId) return c;
      const nextEstId = Math.max(...c.establishments.map((e) => e.id), companyId * 100) + 1;
      return {
        ...c,
        establishments: [...c.establishments, { ...est, id: nextEstId, companyId }],
      };
    });
    setCompanies(updated);
    localStorage.setItem('monxy_tenant_companies', JSON.stringify(updated));
  };

  const updateCompanyBranding = (companyId: number, brandingPatch: Partial<CompanyBranding>) => {
    const updated = companies.map((c) => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        branding: {
          ...c.branding,
          ...brandingPatch,
          useCustomBranding: brandingPatch.useCustomBranding ?? true,
        },
      };
    });
    setCompanies(updated);
    localStorage.setItem('monxy_tenant_companies', JSON.stringify(updated));

    logAuditEvent(
      'BRANDING_UPDATED',
      'Personnalisation White Label',
      `Mise à jour de l'identité visuelle White Label pour "${activeCompany.tradeName}".`
    );
  };

  const resetCompanyBranding = (companyId: number) => {
    const updated = companies.map((c) => {
      if (c.id !== companyId) return c;
      return {
        ...c,
        branding: {
          ...DEFAULT_PLATFORM_BRANDING,
          companyId,
          useCustomBranding: false,
        },
      };
    });
    setCompanies(updated);
    localStorage.setItem('monxy_tenant_companies', JSON.stringify(updated));

    logAuditEvent(
      'BRANDING_RESET',
      'Personnalisation White Label',
      `Restauration du thème par défaut "Mon X.Y mon comptable" pour "${activeCompany.tradeName}".`
    );
  };

  const grantTemporaryAccess = (
    grantData: Omit<TemporaryAccessGrant, 'id' | 'createdAt' | 'status' | 'grantedById' | 'grantedByName'>
  ) => {
    const newGrant: TemporaryAccessGrant = {
      ...grantData,
      id: Date.now(),
      grantedById: user?.id || 1,
      grantedByName: user?.name || 'Administrateur',
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    const updated = [newGrant, ...temporaryGrants];
    setTemporaryGrants(updated);
    localStorage.setItem('monxy_temp_grants', JSON.stringify(updated));

    logAuditEvent(
      'TEMP_ACCESS_GRANTED',
      'Gestion des Accès Temporaires',
      `Accès temporaire (${newGrant.durationLabel}) accordé à ${newGrant.userName} (${newGrant.userRole}) sur "${newGrant.moduleLabel}". Motif : ${newGrant.reason}`,
      'WARNING'
    );
  };

  const revokeTemporaryAccess = (grantId: number) => {
    const target = temporaryGrants.find((g) => g.id === grantId);
    const updated = temporaryGrants.map((g) =>
      g.id === grantId
        ? {
            ...g,
            status: 'REVOKED' as const,
            revokedAt: new Date().toISOString(),
            revokedByName: user?.name || 'Administrateur',
          }
        : g
    );
    setTemporaryGrants(updated);
    localStorage.setItem('monxy_temp_grants', JSON.stringify(updated));

    if (target) {
      logAuditEvent(
        'TEMP_ACCESS_REVOKED',
        'Gestion des Accès Temporaires',
        `Révocation immédiate de l'accès temporaire de ${target.userName} au module "${target.moduleLabel}".`,
        'CRITICAL'
      );
    }
  };

  const hasPermission = (permissionCode: string): boolean => {
    if (!user) return false;
    if (user.role === 'SUPER_ADMIN' || user.role === 'ADMIN') return true;
    if (user.permissions?.includes(permissionCode)) return true;
    return activeUserGrants.some((g) => g.permissions.includes(permissionCode));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        isAuthenticated: !!user,
        isLoading,
        activeSpace,
        setActiveSpace,
        loginWithCredentials,
        logout,
        switchRole,
        canAccessGestion: !!canAccessGestion,
        companies,
        activeCompany,
        switchCompany,
        createCompany,
        updateCompanyStatus,
        activeEstablishment,
        switchEstablishment,
        addEstablishment,
        activeBranding,
        updateCompanyBranding,
        resetCompanyBranding,
        allowedSpaces,
        temporaryGrants,
        activeUserGrants,
        grantTemporaryAccess,
        revokeTemporaryAccess,
        hasPermission,
        getDefaultRouteForRole,
        auditLogs,
        logAuditEvent,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth doit être utilisé à l'intérieur d'un AuthProvider");
  }
  return context;
};
