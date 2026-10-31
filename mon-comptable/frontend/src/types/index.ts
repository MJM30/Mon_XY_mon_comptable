export type UserRole =
  | 'SUPER_ADMIN'
  | 'ADMIN'
  | 'MANAGER'
  | 'ACCOUNTANT'
  | 'CASHIER'
  | 'STAFF'
  | 'SELLER'
  | 'FINANCE'
  | 'CONTROLLER';

export type WorkspaceSpaceId =
  | 'ventes-pos'
  | 'extension-financiere'
  | 'controle-financier'
  | 'gestion-commerciale'
  | 'tiers-gestion'
  | 'administration-pme'
  | 'plateforme-saas'
  // Legacy space aliases kept for backward compatibility
  | 'mon-comptable'
  | 'interface-gestion'
  | 'portail-vendeur'
  | 'espace-finance'
  | 'comptabilite-generale'
  | 'comptabilite-analytique'
  | 'paiements-numeriques';

export interface User {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  isAccredited: boolean;
  title?: string;
  avatarUrl?: string;
  companyId?: number;
  establishmentId?: number;
  isActive?: boolean;
  permissions?: string[];
}

export interface Client {
  id: number;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  taxId?: string;
  badge?: string;
  totalFacture?: number;
  totalRegle?: number;
  soldeDu?: number;
}

export interface Supplier {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  taxId?: string;
  totalDepenses?: number;
}

export interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  unitPriceHt: number;
  vatRate: number;
  totalHt: number;
}

export interface Invoice {
  id: number;
  invoiceNumber: string;
  client: Client;
  issueDate: string;
  dueDate: string;
  subtotalHt: number;
  vatRate: number;
  vatAmount: number;
  totalTtc: number;
  paidAmount: number;
  remainingAmount?: number;
  status: 'DRAFT' | 'SENT' | 'PARTIAL' | 'PAID' | 'OVERDUE';
  paymentTerms?: string;
  notes?: string;
  items?: InvoiceItem[];
}

export interface Transaction {
  id: number;
  refNumber: string;
  type: 'REVENUE' | 'EXPENSE';
  amount: number;
  paymentMethod: string;
  status: 'VALIDATED' | 'PENDING' | 'CANCELLED';
  description: string;
  justificatifDgi?: string;
  date: string;
  category?: { id: number; name: string };
  client?: { id: number; name: string; badge?: string };
  supplier?: { id: number; name: string };
}

export interface Station {
  id: number;
  name: string;
  code?: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'PAUSED' | 'MAINTENANCE';
  currentClient?: string;
  progressPct?: number;
}

export interface QueueEntry {
  id: number;
  ticketCode: string;
  client: Client;
  serviceName: string;
  priority: 'NORMAL' | 'PRIORITY' | 'URGENT';
  status: 'WAITING' | 'IN_SERVICE' | 'COMPLETED' | 'CANCELLED';
  position: number;
  arrivedAt: string;
}

export interface Rating {
  id: number;
  clientName: string;
  targetName: string;
  targetType: string;
  score: number;
  comment?: string;
  createdAt: string;
}

export interface Product {
  id: number;
  reference: string;
  name: string;
  category?: string;
  purchasePrice: number;
  salePrice: number;
  quantity: number;
  minThreshold: number;
  isAlert?: boolean;
  totalValuation?: number;
}

// ==========================================
// TYPES PORTAIL VENDEUR & TERMINAUX POS
// ==========================================

export interface PosVariant {
  id: number;
  posProductId: number;
  sku: string;
  title: string;
  cpu: string;
  ram: string;
  storage: string;
  costPrice?: number;
  salePrice: number;
  stockQuantity: number;
  minThreshold: number;
}

export interface PosProduct {
  id: number;
  name: string;
  modelNumber: string;
  brand: string;
  screenSize: string;
  resolution: string;
  touchType: string;
  osSupport: string;
  ports: string;
  hasPrinter: boolean;
  hasMsr: boolean;
  hasRfid: boolean;
  description?: string;
  imageUrl?: string;
  isActive: boolean;
  variants: PosVariant[];
}

export type ProspectStatus = 'NEW' | 'QUALIFIED' | 'PROPOSAL_SENT' | 'NEGOTIATION' | 'CONVERTED' | 'LOST';

export interface Prospect {
  id: number;
  companyName: string;
  contactName: string;
  phone: string;
  email?: string;
  address?: string;
  city?: string;
  businessType: string;
  status: ProspectStatus;
  estimatedBudget?: number;
  notes?: string;
  nextFollowUp?: string;
  sellerId: number;
  sellerName?: string;
  createdAt: string;
  updatedAt?: string;
}

export type QuoteStatus = 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED';

export interface QuoteItem {
  id?: number;
  posVariantId?: number;
  variantTitle?: string;
  description: string;
  quantity: number;
  unitPriceHt: number;
  vatRate: number;
  totalHt: number;
}

export interface Quote {
  id: number;
  quoteNumber: string;
  sellerId: number;
  sellerName?: string;
  prospectId?: number;
  prospectName?: string;
  clientId?: number;
  clientName?: string;
  validUntil: string;
  subtotalHt: number;
  vatRate: number;
  vatAmount: number;
  totalTtc: number;
  status: QuoteStatus;
  notes?: string;
  createdAt: string;
  items: QuoteItem[];
}

export type OrderProcessingStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';
export type OrderPaymentStatus = 'UNPAID' | 'PARTIALLY_PAID' | 'PAID';

export interface OrderItem {
  id?: number;
  posVariantId?: number;
  variantTitle?: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface Order {
  id: number;
  orderNumber: string;
  sellerId: number;
  sellerName?: string;
  clientId: number;
  clientName: string;
  clientPhone?: string;
  quoteId?: number;
  processingStatus: OrderProcessingStatus;
  paymentStatus: OrderPaymentStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount?: number;
  shippingAddress?: string;
  deliveryDate?: string;
  notes?: string;
  createdAt: string;
  items: OrderItem[];
  payments?: PaymentItem[];
}

export type PaymentVerificationStatus = 'PENDING' | 'CONFIRMED' | 'REJECTED';

export interface PaymentItem {
  id: number;
  orderId?: number;
  orderNumber?: string;
  clientName?: string;
  sellerId?: number;
  sellerName?: string;
  amount: number;
  paymentMethod: 'CASH' | 'BANK_TRANSFER' | 'CARD' | 'MOBILE_MONEY' | 'CHECK';
  reference?: string;
  paymentDate: string;
  receiptUrl?: string;
  verificationStatus: PaymentVerificationStatus;
  rejectionReason?: string;
  verifiedById?: number;
  verifiedByName?: string;
  verifiedAt?: string;
  notes?: string;
}

export interface SalesTarget {
  id: number;
  sellerId: number;
  sellerName?: string;
  period: string;
  targetAmount: number;
  achievedAmount: number;
  targetUnits: number;
  achievedUnits: number;
  commissionRate: number;
}

export interface Commission {
  id: number;
  sellerId: number;
  sellerName?: string;
  orderId: number;
  orderNumber: string;
  amount: number;
  status: 'PENDING' | 'VALIDATED' | 'PAID';
  createdAt: string;
  paidAt?: string;
}

// ==========================================
// COMPTABILITÉ GÉNÉRALE (SYSCOHADA / PCG)
// ==========================================

export type AccountNature = 'ASSET' | 'LIABILITY' | 'EQUITY' | 'EXPENSE' | 'REVENUE' | 'DEBIT' | 'CREDIT' | 'BOTH';

export interface ChartOfAccount {
  id: number;
  accountNumber: string;
  label: string;
  accountClass: number;
  accountType: AccountNature;
  parentId?: number;
  description?: string;
  isActive: boolean;
  framework: 'SYSCOHADA_REVISED' | 'PCG_FRANCE';
  currentDebit?: number;
  currentCredit?: number;
  balance?: number;
}

export interface AccountingJournal {
  id: number;
  code: string;
  name: string;
  category: 'VENTES' | 'ACHATS' | 'BANQUE' | 'CAISSE' | 'OPERATIONS_DIVERSES' | 'PAIE';
  isActive: boolean;
  entriesCount?: number;
}

export interface FiscalYear {
  id: number;
  year: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
}

export interface AccountingPeriod {
  id: number;
  fiscalYearId: number;
  periodNumber: number;
  name: string;
  startDate: string;
  endDate: string;
  isClosed: boolean;
  closedAt?: string;
}

export interface AccountingEntryLine {
  id?: number;
  entryId?: number;
  accountId?: number;
  accountNumber?: string;
  accountCode?: string;
  accountLabel: string;
  lineNumber?: number;
  debit: number;
  credit: number;
  label?: string;
  pieceRef?: string;
  letteredCode?: string;
  costCenterId?: number;
  costCenterCode?: string;
  analyticalSectionId?: number;
}

export interface PosAttachedReceipt {
  receiptId: string;
  timestamp: string;
  dateIso: string;
  companyName: string;
  receiptHeader: string;
  receiptFooter: string;
  establishmentName: string;
  operatorName: string;
  operatorRole: string;
  clientName: string;
  tableOrStation: string;
  paymentMethodCode: string;
  paymentMethodLabel: string;
  paymentReference: string;
  subtotalUsd: number;
  discountAmountUsd: number;
  totalUsd: number;
  bccExchangeRate: number;
  totalCdf: number;
  cashReceivedUsd?: number;
  changeReturnedUsd?: number;
  items: {
    sku: string;
    name: string;
    quantity: number;
    unitPriceUsd: number;
    totalUsd: number;
  }[];
}

export interface AccountingEntry {
  id: number;
  entryNumber: string;
  date: string;
  journalId?: number;
  journalCode: string;
  journalName?: string;
  fiscalYear?: string;
  periodId?: number;
  periodName?: string;
  label: string;
  reference?: string;
  pieceRef?: string;
  status: 'DRAFT' | 'VALIDATED' | 'CANCELLED';
  sourceDocType?: 'INVOICE' | 'PAYMENT' | 'DIGITAL_PAYMENT' | 'MANUAL' | 'EXPENSE' | 'POS_RECEIPT';
  sourceDocId?: number;
  totalDebit: number;
  totalCredit: number;
  isBalanced?: boolean;
  createdByName?: string;
  validatedByName?: string;
  validatedAt?: string;
  createdAt?: string;
  autoPostAtMidnight?: boolean;
  autoPostedBySystem?: boolean;
  attachedPosReceipt?: PosAttachedReceipt;
  lines: AccountingEntryLine[];
}

export interface GeneralLedgerLine {
  id: number;
  date: string;
  entryNumber: string;
  journalCode: string;
  pieceRef?: string;
  label: string;
  debit: number;
  credit: number;
  cumulativeBalance: number;
}

export interface TrialBalanceLine {
  accountNumber: string;
  label: string;
  accountClass: number;
  totalDebit: number;
  totalCredit: number;
  debitBalance: number;
  creditBalance: number;
}

// ==========================================
// COMPTABILITÉ ANALYTIQUE DE GESTION
// ==========================================

export interface CostCenter {
  id: number;
  code: string;
  name: string;
  description?: string;
  managerName?: string;
  isActive: boolean;
  totalExpenses?: number;
  allocatedBudget?: number;
}

export interface AnalyticalSection {
  id: number;
  code: string;
  name: string;
  axisCode: string;
  description?: string;
  isActive: boolean;
  directCost?: number;
  indirectCost?: number;
  revenue?: number;
  margin?: number;
}

export interface AnalyticalAllocation {
  id: number;
  entryLineId: number;
  costCenterId?: number;
  costCenterName?: string;
  analyticalSectionId?: number;
  analyticalSectionName?: string;
  percentage: number;
  amount: number;
  note?: string;
}

export interface AllocationRule {
  id: number;
  name: string;
  sourceAccountPrefix: string;
  costCenterId: number;
  costCenterName: string;
  percentage: number;
  ruleType: 'DIRECT' | 'INDIRECT';
  keyMetric?: string;
  isActive: boolean;
}

export interface Budget {
  id: number;
  name: string;
  year: string;
  status: 'DRAFT' | 'APPROVED' | 'CLOSED';
  totalPlanned?: number;
  totalRealized?: number;
  lines: BudgetLine[];
}

export interface BudgetLine {
  id: number;
  budgetId?: number;
  costCenterId?: number;
  costCenterName?: string;
  analyticalSectionId?: number;
  analyticalSectionName?: string;
  accountCode?: string;
  period?: string;
  month?: number;
  budgetedAmount: number;
  plannedAmount?: number;
  actualAmount: number;
  realizedAmount?: number;
  varianceAmount: number;
  variancePercent?: number;
  variancePercentage?: number;
  consumptionRate?: number;
}

// ==========================================
// PAIEMENTS NUMÉRIQUES (MOBILE MONEY & CARTES)
// ==========================================

export enum DigitalPaymentProvider {
  CASH = 'CASH',
  MPESA = 'MPESA',
  ORANGE_MONEY = 'ORANGE_MONEY',
  AIRTEL_MONEY = 'AIRTEL_MONEY',
  ILLICOCASH = 'ILLICOCASH',
  CARD_VISA_MASTERCARD = 'CARD_VISA_MASTERCARD',
}

export enum DigitalPaymentStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  SUCCESS = 'SUCCESS',
  FAILED = 'FAILED',
  EXPIRED = 'EXPIRED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export interface ProviderConfiguration {
  id: number;
  provider: DigitalPaymentProvider;
  name: string;
  isActive: boolean;
  isEnabled?: boolean;
  isSandbox: boolean;
  merchantId?: string;
  publicKey?: string;
  secretKey?: string;
  accountNumber?: string;
  accountingAccountCode: string;
  currency: string;
  commissionRate: number;
  feePercentage?: number;
  fixedFee: number;
  logoUrl?: string;
}

export interface PaymentTransaction {
  id: number;
  reference: string;
  transactionRef?: string;
  provider: DigitalPaymentProvider;
  providerRef?: string;
  externalTransactionId?: string;
  invoiceId?: number;
  invoiceNumber?: string;
  orderId?: number;
  orderNumber?: string;
  clientName?: string;
  customerPhone?: string;
  customerEmail?: string;
  customerCardLast4?: string;
  amount: number;
  currency: string;
  fee: number;
  feeAmount?: number;
  netAmount: number;
  status: DigitalPaymentStatus;
  metadata?: any;
  idempotencyKey: string;
  accountingEntryId?: number;
  accountingEntryNumber?: string;
  createdAt: string;
  confirmedAt?: string;
  updatedAt?: string;
}

export interface PaymentReconciliation {
  id: number;
  provider: DigitalPaymentProvider;
  batchReference?: string;
  period: string;
  gatewayAmount: number;
  totalProcessed?: number;
  feeAmount: number;
  totalFees?: number;
  settledAmount: number;
  totalSettled?: number;
  status: 'RECONCILED' | 'MATCHED' | 'DISCREPANCY' | 'PENDING';
  discrepancyAmount: number;
  notes?: string;
  reconciledAt?: string;
}

// ==========================================
// ARCHITECTURE MULTI-ENTREPRISES (MULTI-TENANT), WHITE LABEL, RBAC & PROFILS MÉTIERS
// ==========================================

export type BusinessSector =
  | 'SALON_COIFFURE'
  | 'BAR_TERRASSE'
  | 'RESTAURANT'
  | 'BOUTIQUE_MODE'
  | 'SUPERETTE_EPICERIE'
  | 'COMMERCE_DISTRIBUTION'
  | 'PRESTATION_SERVICES'
  | 'PRODUCTION_PME'
  | 'POS_DISTRIBUTION';

export type CompanyStatus = 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'CLOSED';

export interface CompanyBranding {
  id?: number;
  companyId: number;
  workspaceName: string;
  dashboardTitle: string;
  invoiceHeaderName: string;
  receiptHeaderName: string;
  logoUrl?: string;
  logoText?: string;
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  buttonColor: string;
  receiptFooterText?: string;
  invoiceFooterText?: string;
  useCustomBranding: boolean;
}

export interface Establishment {
  id: number;
  companyId: number;
  code: string;
  name: string;
  address?: string;
  city: string;
  phone?: string;
  managerName?: string;
  isMain: boolean;
  isActive: boolean;
}

export interface TenantCompany {
  id: number;
  code: string;
  slug: string;
  name: string; // Raison sociale
  tradeName: string; // Nom commercial
  logoUrl?: string;
  address: string;
  country: string;
  city: string;
  phone: string;
  email: string;
  website?: string;
  taxId?: string; // NIF / RCCM
  businessSector: BusinessSector;
  sectorLabel: string;
  currency: string;
  accountingFramework: 'SYSCOHADA_REVISED' | 'PCG';
  createdAt: string;
  status: CompanyStatus;
  branding: CompanyBranding;
  establishments: Establishment[];
  stats: {
    monthlyRevenue: number;
    monthlyExpenses: number;
    activeUsersCount: number;
    dailyTransactionsCount: number;
    cashBalance: number;
  };
}

export type TemporaryGrantStatus = 'ACTIVE' | 'EXPIRED' | 'REVOKED';

export interface TemporaryAccessGrant {
  id: number;
  companyId: number;
  userId: number;
  userName: string;
  userEmail: string;
  userRole: UserRole;
  grantedById: number;
  grantedByName: string;
  moduleCode: WorkspaceSpaceId;
  moduleLabel: string;
  permissions: string[];
  reason: string;
  startsAt: string;
  expiresAt: string;
  durationLabel: string;
  status: TemporaryGrantStatus;
  revokedAt?: string;
  revokedByName?: string;
  createdAt: string;
}

export interface AuditLogEvent {
  id: number;
  companyId: number;
  companyName: string;
  userId: number;
  userName: string;
  userRole: UserRole;
  action:
    | 'LOGIN'
    | 'LOGOUT'
    | 'ROLE_SWITCH'
    | 'COMPANY_SWITCH'
    | 'TEMP_ACCESS_GRANTED'
    | 'TEMP_ACCESS_REVOKED'
    | 'TEMP_ACCESS_EXPIRED'
    | 'BRANDING_UPDATED'
    | 'BRANDING_RESET'
    | 'POS_SALE_COMPLETED'
    | 'ACCOUNTING_ENTRY_CREATED'
    | 'ACCOUNTING_ENTRY_VALIDATED'
    | 'ANOMALY_REPORTED'
    | 'COMPANY_CREATED'
    | 'COMPANY_STATUS_CHANGED';
  module: string;
  description: string;
  ipAddress: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

export interface SectorCatalogItem {
  id: number;
  companyId: number;
  sector: BusinessSector;
  sku: string;
  name: string;
  category: string;
  unitPrice: number;
  costPrice: number;
  stockQuantity: number;
  isService?: boolean;
  // Salon de coiffure
  durationMinutes?: number;
  stylistName?: string;
  // Restaurant & Bar
  prepZone?: 'CUISINE_CHAUDE' | 'GRILLADES' | 'PATISSERIE' | 'BAR_TERRASSE';
  ingredientsSummary?: string;
  // Boutique & Mode
  sizes?: string[];
  colors?: string[];
  collectionName?: string;
  barcode?: string;
}

export interface SectorActiveOrderOrAppointment {
  id: number;
  companyId: number;
  sector: BusinessSector;
  reference: string;
  clientName: string;
  staffOrWaiterName: string;
  tableOrStationName: string;
  itemsSummary: string;
  totalAmount: number;
  status: 'WAITING' | 'IN_PROGRESS' | 'READY' | 'SERVED_OR_DONE' | 'PAID';
  timeLabel: string;
  orderType?: 'SUR_PLACE' | 'A_EMPORTER' | 'LIVRAISON' | 'RDV_SALON' | 'VENTE_BOUTIQUE';
}

export interface ControllerAnomalyReport {
  id: number;
  companyId: number;
  entryNumber: string;
  reportedBy: string;
  reportedAt: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  category: 'PIECE_MANQUANTE' | 'ECART_MONTANT' | 'IMPUTATION_COMPTE' | 'DEPASSEMENT_BUDGET';
  description: string;
  status: 'OPEN' | 'IN_REVIEW' | 'RESOLVED';
}
