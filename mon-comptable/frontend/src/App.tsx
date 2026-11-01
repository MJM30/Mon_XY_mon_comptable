import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { ForgotPassword } from './pages/ForgotPassword';
import { DashboardComptable } from './pages/DashboardComptable';
import { Revenues } from './pages/Revenues';
import { Expenses } from './pages/Expenses';
import { Transactions } from './pages/Transactions';
import { Payments } from './pages/Payments';
import { Invoices } from './pages/Invoices';
import { Treasury } from './pages/Treasury';
import { Clients } from './pages/Clients';
import { Suppliers } from './pages/Suppliers';
import { Stock } from './pages/Stock';
import { QueueAndStations } from './pages/QueueAndStations';
import { ActivityDashboard } from './pages/ActivityDashboard';
import { SettingsAccreditation } from './pages/SettingsAccreditation';
import { SellerDashboard } from './pages/seller/SellerDashboard';
import { PosCatalog } from './pages/seller/PosCatalog';
import { ProspectsCrm } from './pages/seller/ProspectsCrm';
import { QuotesAndOrders } from './pages/seller/QuotesAndOrders';
import { SellerExpenses } from './pages/seller/SellerExpenses';
import { FinanceVerification } from './pages/finance/FinanceVerification';
import { AdminPosManagement } from './pages/admin/AdminPosManagement';
import { NotFound } from './pages/NotFound';

// Comptabilité Générale
import { GeneralAccountingDashboard } from './pages/accounting/GeneralAccountingDashboard';
import { ChartOfAccounts } from './pages/accounting/ChartOfAccounts';
import { AccountingJournals } from './pages/accounting/AccountingJournals';
import { JournalEntries } from './pages/accounting/JournalEntries';
import { GeneralLedger } from './pages/accounting/GeneralLedger';
import { TrialBalance } from './pages/accounting/TrialBalance';
import { FinancialStatements } from './pages/accounting/FinancialStatements';
import { FiscalYearsClosing } from './pages/accounting/FiscalYearsClosing';

// Comptabilité Analytique
import { AnalyticalDashboard } from './pages/analytical/AnalyticalDashboard';
import { CostCenters } from './pages/analytical/CostCenters';
import { AnalyticalSections } from './pages/analytical/AnalyticalSections';
import { IndirectCostAllocation } from './pages/analytical/IndirectCostAllocation';
import { ProfitabilityReport } from './pages/analytical/ProfitabilityReport';
import { BudgetControl } from './pages/analytical/BudgetControl';

// Paiements Numériques
import { DigitalPaymentsDashboard } from './pages/digital-payments/DigitalPaymentsDashboard';
import { PaymentProvidersConfig } from './pages/digital-payments/PaymentProvidersConfig';
import { TransactionHistory } from './pages/digital-payments/TransactionHistory';
import { PaymentReconciliationPage } from './pages/digital-payments/PaymentReconciliation';

// Extension Multi-Entreprises (Multi-Tenant), White Label, RBAC, Accès Temporaires & POS Métier
import { SectorPosTerminal } from './pages/pos/SectorPosTerminal';
import { FinancialControllerWorkspace } from './pages/finance/FinancialControllerWorkspace';
import { WhiteLabelSettings } from './pages/admin/WhiteLabelSettings';
import { UsersAndTemporaryAccess } from './pages/admin/UsersAndTemporaryAccess';
import { SaasCompaniesManagement } from './pages/admin/SaasCompaniesManagement';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Routes Publiques d'Authentification */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />

          {/* Routes Protégées de l'Application */}
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            {/* Espace 1 - Mon Comptable (Gestion PME existante) */}
            <Route index element={<DashboardComptable />} />
            <Route path="recettes" element={<Revenues />} />
            <Route path="depenses" element={<Expenses />} />
            <Route path="transactions" element={<Transactions />} />
            <Route path="factures" element={<Invoices />} />
            <Route path="paiements" element={<Payments />} />
            <Route path="tresorerie" element={<Treasury />} />
            <Route path="clients" element={<Clients />} />
            <Route path="fournisseurs" element={<Suppliers />} />
            <Route path="stocks" element={<Stock />} />
            <Route path="rapports" element={<DashboardComptable />} />

            {/* Portail Vendeur POS & Caisses Enregistreuses + Terminal POS Multi-Métiers */}
            <Route path="pos/terminal" element={<SectorPosTerminal />} />
            <Route path="vendeur/dashboard" element={<SellerDashboard />} />
            <Route path="vendeur/catalogue" element={<PosCatalog />} />
            <Route path="vendeur/prospects" element={<ProspectsCrm />} />
            <Route path="vendeur/commandes" element={<QuotesAndOrders />} />
            <Route path="vendeur/depenses" element={<SellerExpenses />} />

            {/* Espace Contrôle Financier & Trésorerie */}
            <Route path="finance/controle" element={<FinancialControllerWorkspace />} />
            <Route path="finance/verification" element={<FinanceVerification />} />

            {/* Espace Administration PME, Multi-Entreprises, White Label & Accès Temporaires */}
            <Route path="admin/entreprises" element={<SaasCompaniesManagement />} />
            <Route path="admin/white-label" element={<WhiteLabelSettings />} />
            <Route path="admin/utilisateurs-acces" element={<UsersAndTemporaryAccess />} />
            <Route
              path="admin/pos-management"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <AdminPosManagement />
                </ProtectedRoute>
              }
            />

            {/* Extension Majeure 1: COMPTABILITÉ GÉNÉRALE (SYSCOHADA & PCG) */}
            <Route path="comptabilite/dashboard" element={<GeneralAccountingDashboard />} />
            <Route path="comptabilite/plan-comptable" element={<ChartOfAccounts />} />
            <Route path="comptabilite/journaux" element={<AccountingJournals />} />
            <Route path="comptabilite/ecritures" element={<JournalEntries />} />
            <Route path="comptabilite/grand-livre" element={<GeneralLedger />} />
            <Route path="comptabilite/balance" element={<TrialBalance />} />
            <Route path="comptabilite/etats-financiers" element={<FinancialStatements />} />
            <Route path="comptabilite/cloture" element={<FiscalYearsClosing />} />

            {/* Extension Majeure 2: COMPTABILITÉ ANALYTIQUE */}
            <Route path="analytique/dashboard" element={<AnalyticalDashboard />} />
            <Route path="analytique/centres-couts" element={<CostCenters />} />
            <Route path="analytique/sections" element={<AnalyticalSections />} />
            <Route path="analytique/repartition" element={<IndirectCostAllocation />} />
            <Route path="analytique/rentabilite" element={<ProfitabilityReport />} />
            <Route path="analytique/budgets" element={<BudgetControl />} />

            {/* Extension Majeure 3: PAIEMENTS NUMÉRIQUES (M-Pesa, Orange, Airtel, IllicoCash, CB) */}
            <Route path="paiements-numeriques/dashboard" element={<DigitalPaymentsDashboard />} />
            <Route path="paiements-numeriques/transactions" element={<TransactionHistory />} />
            <Route path="paiements-numeriques/configuration" element={<PaymentProvidersConfig />} />
            <Route path="paiements-numeriques/rapprochement" element={<PaymentReconciliationPage />} />

            {/* Espace 2 - Interface de Gestion (Accréditation requise) */}
            <Route
              path="gestion/queue"
              element={
                <ProtectedRoute requireGestionAccreditation>
                  <QueueAndStations />
                </ProtectedRoute>
              }
            />
            <Route
              path="gestion/postes"
              element={
                <ProtectedRoute requireGestionAccreditation>
                  <QueueAndStations />
                </ProtectedRoute>
              }
            />
            <Route
              path="gestion/activite"
              element={
                <ProtectedRoute requireGestionAccreditation>
                  <ActivityDashboard />
                </ProtectedRoute>
              }
            />

            {/* Système (Réservé à l'Administrateur) */}
            <Route
              path="parametres"
              element={
                <ProtectedRoute allowedRoles={['ADMIN', 'SUPER_ADMIN']}>
                  <SettingsAccreditation />
                </ProtectedRoute>
              }
            />
          </Route>

          {/* Page 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
