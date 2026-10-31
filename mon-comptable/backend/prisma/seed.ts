import { PrismaClient, UserRole, TransactionType, PaymentMethod, TransactionStatus, InvoiceStatus, StationStatus, QueuePriority, QueueStatus } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Amorçage de la base de données PostgreSQL Optima PME PRO...');

  // 1. Entreprise
  const company = await prisma.company.upsert({
    where: { id: 1 },
    update: {},
    create: {
      name: 'Optima SaaS Solutions',
      legalName: 'Optima Technologies SAS',
      email: 'contact@optima.fr',
      phone: '+33 1 42 68 55 00',
      address: '15 Boulevard Haussmann, 75009 Paris',
      taxId: 'FR 84 920 114 892',
      currency: 'EUR',
    },
  });

  // 2. Utilisateurs
  const passwordHash = await bcrypt.hash('Admin123!', 10);
  const managerPasswordHash = await bcrypt.hash('Gerant123!', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@optima.fr' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Thomas Laurent',
      email: 'admin@optima.fr',
      password: passwordHash,
      role: UserRole.ADMIN,
      isAccredited: true,
      title: 'Dirigeant / Admin',
    },
  });

  const manager = await prisma.user.upsert({
    where: { email: 'gerant@optima.fr' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Patrick Mukendi',
      email: 'gerant@optima.fr',
      password: managerPasswordHash,
      role: UserRole.MANAGER,
      isAccredited: false, // Permet de tester l'accréditation RBAC !
      title: 'Gérant d’exploitation',
    },
  });

  const accountant = await prisma.user.upsert({
    where: { email: 'compta@optima.fr' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Mireille Kabongo',
      email: 'compta@optima.fr',
      password: passwordHash,
      role: UserRole.ACCOUNTANT,
      isAccredited: false,
      title: 'Comptable senior • Visa opérationnel',
    },
  });

  const seller = await prisma.user.upsert({
    where: { email: 'vendeur@optima.fr' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Marc Lefebvre',
      email: 'vendeur@optima.fr',
      password: await bcrypt.hash('Vendeur123!', 10),
      role: UserRole.SELLER,
      isAccredited: false,
      title: 'Ingénieur Commercial POS & Caisses',
    },
  });

  const financeOfficer = await prisma.user.upsert({
    where: { email: 'finance@optima.fr' },
    update: {},
    create: {
      companyId: company.id,
      name: 'Sophie Finance',
      email: 'finance@optima.fr',
      password: await bcrypt.hash('Finance123!', 10),
      role: UserRole.FINANCE,
      isAccredited: true,
      title: 'Contrôleur Financier & Rapprochement',
    },
  });

  // 3. Comptes de trésorerie
  await prisma.cashAccount.deleteMany({ where: { companyId: company.id } });
  await prisma.cashAccount.createMany({
    data: [
      { companyId: company.id, name: 'Banque Principale (BNP)', type: 'BANK', balance: 81200.0, accountNumber: 'FR76 3000 4000 1234 5678 901' },
      { companyId: company.id, name: 'Caisse physique centrale', type: 'CASH_REGISTER', balance: 13110.0 },
    ],
  });

  // 4. Catégories
  const catSalaires = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Salaires & Charges', type: 'EXPENSE' } },
    update: {},
    create: { companyId: company.id, name: 'Salaires & Charges', type: 'EXPENSE', code: '641' },
  });

  const catFournisseurs = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Fournisseurs & Achats', type: 'EXPENSE' } },
    update: {},
    create: { companyId: company.id, name: 'Fournisseurs & Achats', type: 'EXPENSE', code: '601' },
  });

  const catLoyer = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Loyer & Locaux', type: 'EXPENSE' } },
    update: {},
    create: { companyId: company.id, name: 'Loyer & Locaux', type: 'EXPENSE', code: '613' },
  });

  const catLogiciels = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Services & Logiciels', type: 'EXPENSE' } },
    update: {},
    create: { companyId: company.id, name: 'Services & Logiciels', type: 'EXPENSE', code: '618' },
  });

  const catBanque = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Frais Divers & Banque', type: 'EXPENSE' } },
    update: {},
    create: { companyId: company.id, name: 'Frais Divers & Banque', type: 'EXPENSE', code: '627' },
  });

  const catVente = await prisma.category.upsert({
    where: { companyId_name_type: { companyId: company.id, name: 'Vente Prestation', type: 'REVENUE' } },
    update: {},
    create: { companyId: company.id, name: 'Vente Prestation', type: 'REVENUE', code: '706' },
  });

  // 5. Clients
  const clientAlpha = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Entreprise Alpha (SARL)',
      contactName: 'Marc Lefebvre',
      email: 'm.lefebvre@alpha-corp.fr',
      phone: '+33 6 12 34 56 78',
      taxId: 'SIREN 839 201 129',
      badge: 'Client Entreprise',
    },
  });

  const clientDupont = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Jean Dupont',
      email: 'jean.dupont@email.fr',
      phone: '+33 6 98 76 54 32',
      badge: 'Fidélité Gold',
    },
  });

  const clientMartin = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Sarah Martin',
      email: 'sarah.martin@freelance.fr',
      phone: '+33 7 45 12 89 63',
      badge: 'Particulier Premium',
    },
  });

  const clientBeta = await prisma.client.create({
    data: {
      companyId: company.id,
      name: 'Entreprise Beta (SAS)',
      email: 'contact@betagroup.com',
      taxId: 'SIREN 910 442 811',
      badge: 'Client Mandaté',
    },
  });

  // 6. Fournisseurs
  const suppCarburant = await prisma.supplier.create({
    data: { companyId: company.id, name: 'Congo Carburant Express', email: 'contact@carburant.cd' },
  });
  const suppImprimerie = await prisma.supplier.create({
    data: { companyId: company.id, name: 'Imprimerie Centrale de la Gombe', email: 'imprimerie@gombe.cd' },
  });
  const suppVodacom = await prisma.supplier.create({
    data: { companyId: company.id, name: 'Vodacom Congo RDC Fibre', email: 'b2b@vodacom.cd' },
  });
  const suppMateriel = await prisma.supplier.create({
    data: { companyId: company.id, name: 'Fournisseur Matériel Tech Pro', email: 'tech@materiel-pro.fr' },
  });
  const suppCloud = await prisma.supplier.create({
    data: { companyId: company.id, name: 'Cloud Hosting SAS', email: 'support@cloudhosting.io' },
  });

  // 7. Factures
  const inv1 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientAlpha.id,
      invoiceNumber: 'FAC-2025-092',
      issueDate: new Date('2025-03-14'),
      dueDate: new Date('2025-04-14'),
      subtotalHt: 4000.0,
      vatRate: 20.0,
      vatAmount: 800.0,
      totalTtc: 4800.0,
      paidAmount: 0.0,
      status: InvoiceStatus.SENT,
      paymentTerms: '30 jours net (Virement bancaire)',
      items: {
        create: [
          { description: 'Prestation d’audit organisationnel', quantity: 2, unitPriceHt: 1200.0, vatRate: 20.0, totalHt: 2400.0 },
          { description: 'Pack Maintenance & Support mensuel', quantity: 1, unitPriceHt: 1600.0, vatRate: 20.0, totalHt: 1600.0 },
        ],
      },
    },
  });

  const inv2 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientDupont.id,
      invoiceNumber: 'FAC-2025-089',
      issueDate: new Date('2025-03-01'),
      dueDate: new Date('2025-03-09'), // En retard !
      subtotalHt: 1541.67,
      vatRate: 20.0,
      vatAmount: 308.33,
      totalTtc: 1850.0,
      paidAmount: 0.0,
      status: InvoiceStatus.OVERDUE,
      paymentTerms: 'Comptant à réception',
      items: {
        create: [{ description: 'Prestation Diagnostic & Conseil fiscal', quantity: 1, unitPriceHt: 1541.67, vatRate: 20.0, totalHt: 1541.67 }],
      },
    },
  });

  const inv3 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientMartin.id,
      invoiceNumber: 'FAC-2025-088',
      issueDate: new Date('2025-03-08'),
      dueDate: new Date('2025-04-08'),
      subtotalHt: 2400.0,
      vatRate: 20.0,
      vatAmount: 480.0,
      totalTtc: 2880.0,
      paidAmount: 2880.0,
      status: InvoiceStatus.PAID,
      paymentTerms: 'Prélèvement SEPA',
      items: {
        create: [{ description: 'Forfait Mensuel Gestion & Trésorerie', quantity: 1, unitPriceHt: 2400.0, vatRate: 20.0, totalHt: 2400.0 }],
      },
    },
  });

  const inv4 = await prisma.invoice.create({
    data: {
      companyId: company.id,
      clientId: clientBeta.id,
      invoiceNumber: 'FAC-2025-087',
      issueDate: new Date('2025-03-05'),
      dueDate: new Date('2025-04-05'),
      subtotalHt: 5500.0,
      vatRate: 20.0,
      vatAmount: 1100.0,
      totalTtc: 6600.0,
      paidAmount: 3300.0,
      status: InvoiceStatus.PARTIAL,
      paymentTerms: 'Acompte 50% à la commande',
      items: {
        create: [{ description: 'Déploiement ERP & Intégration bancaire', quantity: 1, unitPriceHt: 5500.0, vatRate: 20.0, totalHt: 5500.0 }],
      },
    },
  });

  // 8. Transactions (Dépenses & Recettes réelles)
  await prisma.transaction.createMany({
    data: [
      { companyId: company.id, supplierId: suppCarburant.id, categoryId: catFournisseurs.id, type: TransactionType.EXPENSE, refNumber: 'DEP-2025-0084', amount: 850.0, paymentMethod: PaymentMethod.BANK_TRANSFER, status: TransactionStatus.VALIDATED, description: 'Carburant groupe & flotte', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-14') },
      { companyId: company.id, supplierId: suppImprimerie.id, categoryId: catFournisseurs.id, type: TransactionType.EXPENSE, refNumber: 'DEP-2025-0083', amount: 620.0, paymentMethod: PaymentMethod.MOBILE_MONEY, status: TransactionStatus.VALIDATED, description: 'Fournitures d’exploitation & imprimés', justificatifDgi: 'Reçu provisoire', date: new Date('2025-03-13') },
      { companyId: company.id, supplierId: suppVodacom.id, categoryId: catLogiciels.id, type: TransactionType.EXPENSE, refNumber: 'DEP-2025-0082', amount: 450.0, paymentMethod: PaymentMethod.MOBILE_MONEY, status: TransactionStatus.VALIDATED, description: 'Fibre optique & forfaits flotte', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-12') },
      { companyId: company.id, supplierId: suppMateriel.id, categoryId: catFournisseurs.id, type: TransactionType.EXPENSE, refNumber: 'DEP-2025-0112', amount: 1450.0, paymentMethod: PaymentMethod.CARD, status: TransactionStatus.VALIDATED, description: 'Équipements et périphériques postes', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-13') },
      { companyId: company.id, supplierId: suppCloud.id, categoryId: catLogiciels.id, type: TransactionType.EXPENSE, refNumber: 'DEP-2025-0111', amount: 240.0, paymentMethod: PaymentMethod.CARD, status: TransactionStatus.VALIDATED, description: 'Serveurs cloud & sauvegardes', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-11') },
      { companyId: company.id, clientId: clientAlpha.id, categoryId: catVente.id, type: TransactionType.REVENUE, refNumber: 'REC-2025-0089', amount: 4800.0, paymentMethod: PaymentMethod.BANK_TRANSFER, status: TransactionStatus.VALIDATED, description: 'Virement facture Alpha Corp', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-14') },
      { companyId: company.id, clientId: clientMartin.id, categoryId: catVente.id, type: TransactionType.REVENUE, refNumber: 'REC-2025-0088', amount: 650.0, paymentMethod: PaymentMethod.BANK_TRANSFER, status: TransactionStatus.VALIDATED, description: 'Forfait Mensuel Freelance', justificatifDgi: 'Facture normalisée DGI', date: new Date('2025-03-12') },
    ],
  });

  // 9. Postes & Stations
  await prisma.station.deleteMany({ where: { companyId: company.id } });
  await prisma.station.createMany({
    data: [
      { companyId: company.id, name: 'Poste 01 • Marc V.', code: 'P01', status: StationStatus.OCCUPIED, currentClient: 'Jean Dupont', progressPct: 55 },
      { companyId: company.id, name: 'Poste 02 • Non assigné', code: 'P02', status: StationStatus.AVAILABLE, currentClient: null, progressPct: 0 },
      { companyId: company.id, name: 'Poste 03 • Céline D.', code: 'P03', status: StationStatus.OCCUPIED, currentClient: 'Entreprise Beta', progressPct: 50 },
      { companyId: company.id, name: 'Poste 04 • Lucas T.', code: 'P04', status: StationStatus.PAUSED, currentClient: 'En pause déjeuner', progressPct: 0 },
      { companyId: company.id, name: 'Poste 05 • Prêt guichet', code: 'P05', status: StationStatus.AVAILABLE, currentClient: null, progressPct: 0 },
      { companyId: company.id, name: 'Poste 06 • Technique', code: 'P06', status: StationStatus.MAINTENANCE, currentClient: 'Révision matériel TPE', progressPct: 0 },
    ],
  });

  // 10. File d'attente
  await prisma.queueEntry.deleteMany({ where: { companyId: company.id } });
  await prisma.queueEntry.createMany({
    data: [
      { companyId: company.id, clientId: clientDupont.id, ticketCode: '#A-104', priority: QueuePriority.NORMAL, position: 1, serviceName: 'Consultation Diagnostic', status: QueueStatus.WAITING },
      { companyId: company.id, clientId: clientMartin.id, ticketCode: '#A-105', priority: QueuePriority.PRIORITY, position: 2, serviceName: 'Prestation Premium', status: QueueStatus.WAITING },
      { companyId: company.id, clientId: clientBeta.id, ticketCode: '#A-106', priority: QueuePriority.URGENT, position: 3, serviceName: 'Signature & Remise', status: QueueStatus.WAITING },
      { companyId: company.id, clientId: clientAlpha.id, ticketCode: '#A-107', priority: QueuePriority.NORMAL, position: 4, serviceName: 'Contrôle technique', status: QueueStatus.WAITING },
    ],
  });

  // 11. Produits & Stock
  await prisma.product.deleteMany({ where: { companyId: company.id } });
  await prisma.product.createMany({
    data: [
      { companyId: company.id, reference: 'PRD-001', name: 'Pack Maintenance & Support mensuel', category: 'Services', purchasePrice: 250.0, salePrice: 450.0, quantity: 18, minThreshold: 5, status: 'IN_STOCK' },
      { companyId: company.id, reference: 'PRD-002', name: 'Licence Optima Cloud Pro (Annuelle)', category: 'Logiciels', purchasePrice: 80.0, salePrice: 180.0, quantity: 45, minThreshold: 10, status: 'IN_STOCK' },
      { companyId: company.id, reference: 'PRD-003', name: 'Terminal TPE Électronique Fixe', category: 'Matériel', purchasePrice: 320.0, salePrice: 550.0, quantity: 3, minThreshold: 5, status: 'ALERT' },
      { companyId: company.id, reference: 'PRD-004', name: 'Câblage Blindé & Switch Réseau Pro', category: 'Fournitures', purchasePrice: 15.0, salePrice: 35.0, quantity: 85, minThreshold: 15, status: 'IN_STOCK' },
    ],
  });

  // 12. Avis & Satisfaction
  await prisma.rating.createMany({
    data: [
      { clientName: 'Jean Dupont', targetName: 'Poste 01', targetType: 'SERVICE', score: 5, comment: 'Prise en charge très rapide au poste 01, explications claires.' },
      { clientName: 'Entreprise Alpha', targetName: 'Conseil Fiscalité', targetType: 'STAFF', score: 5, comment: 'Gestion irréprochable et dossier transmis immédiatement.' },
      { clientName: 'Paul M.', targetName: 'Prestation Standard', targetType: 'SERVICE', score: 4, comment: 'Service impeccable, seul le temps d’attente en salle était un peu plus long.' },
    ],
  });

  // 13. Matériel POS TaixunPOS & Variantes
  const pos1 = await prisma.posProduct.create({
    data: {
      companyId: company.id,
      name: 'TaixunPOS 15.6" Tactile Pro All-in-One',
      modelNumber: 'TX-1560-PRO',
      brand: 'TaixunPOS',
      screenSize: '15.6 pouces',
      resolution: '1920 × 1080 Full HD',
      touchType: 'Écran capacitif tactile multipoint 10 points',
      osSupport: 'Windows 10/11 IoT, Linux Ubuntu',
      ports: '6x USB, 1x HDMI, 1x RJ45 Gigabit, 1x RJ11 Tiroir-caisse, 1x Audio',
      hasPrinter: true,
      hasMsr: true,
      hasRfid: true,
      description: 'Châssis aluminium ultra-fin Fanless avec pied inclinable 0° à 90°.',
      variants: {
        create: [
          { sku: 'TX15-N95-8G-128G', title: 'Starter N95 / 8 Go / 128 Go SSD', cpu: 'Intel Alder Lake N95 (3.4 GHz)', ram: '8 Go DDR4', storage: '128 Go SSD M.2', costPrice: 420.0, salePrice: 690.0, stockQuantity: 18, minThreshold: 5 },
          { sku: 'TX15-I3-16G-256G', title: 'Performance i3-1215U / 16 Go / 256 Go SSD', cpu: 'Intel Core i3-1215U (4.4 GHz)', ram: '16 Go DDR4', storage: '256 Go SSD M.2', costPrice: 580.0, salePrice: 940.0, stockQuantity: 12, minThreshold: 4 },
          { sku: 'TX15-I5-16G-512G', title: 'Entreprise i5-1235U / 16 Go / 512 Go SSD', cpu: 'Intel Core i5-1235U (4.4 GHz)', ram: '16 Go DDR4', storage: '512 Go SSD M.2', costPrice: 750.0, salePrice: 1250.0, stockQuantity: 7, minThreshold: 3 },
        ],
      },
    },
  });

  // 14. Objectifs de vente du Vendeur
  await prisma.salesTarget.upsert({
    where: { sellerId_period: { sellerId: seller.id, period: '2026-10' } },
    update: {},
    create: {
      companyId: company.id,
      sellerId: seller.id,
      period: '2026-10',
      targetAmount: 15000.0,
      achievedAmount: 8228.0,
      targetUnits: 15,
      achievedUnits: 9,
      commissionRate: 5.0,
    },
  });

  console.log('✅ Base de données PostgreSQL alimentée avec succès avec les données réelles !');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
