import {
  PosProduct,
  PosVariant,
  Prospect,
  ProspectStatus,
  Quote,
  QuoteItem,
  QuoteStatus,
  Order,
  OrderItem,
  PaymentItem,
  PaymentVerificationStatus,
  SalesTarget,
  Commission,
} from '../types';

export type {
  PosProduct,
  PosVariant,
  Prospect,
  ProspectStatus,
  Quote,
  QuoteItem,
  QuoteStatus,
  Order,
  OrderItem,
  PaymentItem,
  PaymentVerificationStatus,
  SalesTarget,
  Commission,
};

export const INITIAL_POS_PRODUCTS: PosProduct[] = [
  {
    id: 1,
    name: 'TaixunPOS 15.6" Tactile Pro All-in-One',
    modelNumber: 'TX-1560-PRO',
    brand: 'TaixunPOS',
    screenSize: '15.6 pouces (39,6 cm)',
    resolution: '1920 × 1080 Full HD (16:9)',
    touchType: 'Écran capacitif tactile multipoint 10 points (verre trempé antireflet)',
    osSupport: 'Windows 10 / 11 Pro IoT Enterprise, Linux Ubuntu LTS',
    ports: '6x USB 2.0/3.0, 1x HDMI, 1x RJ45 Gigabit Ethernet, 1x RJ11 Tiroir-caisse (12V/24V), 1x Audio Jack 3.5mm',
    hasPrinter: true,
    hasMsr: true,
    hasRfid: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742049-0a67c5574f73?auto=format&fit=crop&w=800&q=80',
    description:
      'Terminal de point de vente professionnel tout-en-un dernière génération. Châssis ultra-fin en alliage d\'aluminium avec dissipation thermique sans ventilateur (Fanless) et pied inclinable de 0° à 90°. Déployé à Kinshasa, Lubumbashi et Goma pour supermarchés, retail et hôtellerie.',
    isActive: true,
    variants: [
      {
        id: 101,
        posProductId: 1,
        sku: 'TX15-N95-8G-128G',
        title: 'Édition Starter • Intel Alder Lake N95 (3.4 GHz) / 8 Go RAM / 128 Go SSD',
        cpu: 'Intel 12th Gen Alder Lake N95 (4 Cœurs / 4 Threads jusqu\'à 3.40 GHz)',
        ram: '8 Go DDR4 3200 MHz',
        storage: '128 Go SSD M.2 High-Speed NVMe',
        costPrice: 420.0,
        salePrice: 690.0,
        stockQuantity: 18,
        minThreshold: 5,
      },
      {
        id: 102,
        posProductId: 1,
        sku: 'TX15-I3-16G-256G',
        title: 'Édition Performance • Intel Core i3-1215U / 16 Go RAM / 256 Go SSD',
        cpu: 'Intel Core i3-1215U (6 Cœurs / 8 Threads, Turbo 4.40 GHz, 10MB Cache)',
        ram: '16 Go DDR4 3200 MHz Dual-Channel',
        storage: '256 Go SSD M.2 NVMe PCIe 4.0',
        costPrice: 580.0,
        salePrice: 940.0,
        stockQuantity: 12,
        minThreshold: 4,
      },
      {
        id: 103,
        posProductId: 1,
        sku: 'TX15-I5-16G-512G',
        title: 'Édition Entreprise • Intel Core i5-1235U / 16 Go RAM / 512 Go SSD',
        cpu: 'Intel Core i5-1235U (10 Cœurs / 12 Threads, Turbo 4.40 GHz, Iris Xe Graphics)',
        ram: '16 Go DDR4 3200 MHz Dual-Channel',
        storage: '512 Go SSD M.2 NVMe Haute Vitesse',
        costPrice: 750.0,
        salePrice: 1250.0,
        stockQuantity: 7,
        minThreshold: 3,
      },
    ],
  },
  {
    id: 2,
    name: 'TaixunPOS Dual Screen 15.6" + Afficheur Client 10.1"',
    modelNumber: 'TX-1560-DUAL',
    brand: 'TaixunPOS',
    screenSize: 'Principal 15.6" Full HD + Secondaire 10.1" Client',
    resolution: '1920 × 1080 (Principal) + 1280 × 800 (Afficheur client)',
    touchType: 'Écran capacitif tactile 10 points sur écran principal',
    osSupport: 'Windows 10/11 Pro, Linux Ubuntu',
    ports: '6x USB, 1x HDMI, 1x RJ45, 1x RJ11, 1x Audio',
    hasPrinter: true,
    hasMsr: true,
    hasRfid: true,
    imageUrl: 'https://images.unsplash.com/photo-1556740758-90de374c12ad?auto=format&fit=crop&w=800&q=80',
    description:
      'Terminal POS double écran idéal pour afficher le détail du ticket en Dollars ($ USD) et les campagnes promotionnelles directement face au client.',
    isActive: true,
    variants: [
      {
        id: 201,
        posProductId: 2,
        sku: 'TX15D-I3-16G-256G',
        title: 'Dual Screen Pro • Intel Core i3-1215U / 16 Go / 256 Go SSD',
        cpu: 'Intel Core i3-1215U (6 Cœurs, 4.40 GHz)',
        ram: '16 Go DDR4',
        storage: '256 Go SSD NVMe',
        costPrice: 720.0,
        salePrice: 1190.0,
        stockQuantity: 9,
        minThreshold: 3,
      },
      {
        id: 202,
        posProductId: 2,
        sku: 'TX15D-I5-16G-512G',
        title: 'Dual Screen Ultimate • Intel Core i5-1235U / 16 Go / 512 Go SSD',
        cpu: 'Intel Core i5-1235U (10 Cœurs, Iris Xe)',
        ram: '16 Go DDR4',
        storage: '512 Go SSD NVMe',
        costPrice: 890.0,
        salePrice: 1480.0,
        stockQuantity: 5,
        minThreshold: 2,
      },
    ],
  },
  {
    id: 3,
    name: 'Pack Périphériques Caisse & Terminal Sécurisé',
    modelNumber: 'ACC-PACK-PRO',
    brand: 'Mon X.Y Hardware RDC',
    screenSize: 'N/A (Accessoires)',
    resolution: 'N/A',
    touchType: 'N/A',
    osSupport: 'Plug & Play compatible tous terminaux POS',
    ports: 'USB 2.0 / 3.0 / Bluetooth',
    hasPrinter: true,
    hasMsr: true,
    hasRfid: true,
    imageUrl: 'https://images.unsplash.com/photo-1556742111-a301076d9d18?auto=format&fit=crop&w=800&q=80',
    description:
      'Imprimante thermique 80mm haute vitesse (250 mm/s massicot auto), Tiroir-caisse renforcé 5 compartiments billets USD / 8 pièces, Douchette scanner code-barres 1D/2D sans fil.',
    isActive: true,
    variants: [
      {
        id: 301,
        posProductId: 3,
        sku: 'ACC-PRINT-80',
        title: 'Imprimante Ticket Thermique 80mm Seiko avec Massicot Auto',
        cpu: 'Contrôleur thermique 250 mm/s',
        ram: 'Mémoire tampon 4 Mo',
        storage: 'N/A',
        costPrice: 85.0,
        salePrice: 165.0,
        stockQuantity: 35,
        minThreshold: 10,
      },
      {
        id: 302,
        posProductId: 3,
        sku: 'ACC-DRAWER-410',
        title: 'Tiroir-Caisse Métallique Renforcé 410mm RJ11 24V',
        cpu: 'Mécanisme acier avec serrure 3 positions',
        ram: 'N/A',
        storage: 'N/A',
        costPrice: 45.0,
        salePrice: 95.0,
        stockQuantity: 28,
        minThreshold: 8,
      },
      {
        id: 303,
        posProductId: 3,
        sku: 'ACC-SCAN-2D',
        title: 'Scanner Douchette Laser 1D/2D QR Code Sans Fil Bluetooth + Support',
        cpu: 'Capteur optique CMOS 60 fps',
        ram: 'N/A',
        storage: 'N/A',
        costPrice: 55.0,
        salePrice: 120.0,
        stockQuantity: 22,
        minThreshold: 5,
      },
    ],
  },
];

export const INITIAL_PROSPECTS: Prospect[] = [
  {
    id: 1,
    companyName: 'Bistrot & Lounge Bandal',
    contactName: 'Trésor Mbuyi',
    phone: '+243 81 234 5678',
    email: 'direction@bistrotbandal.cd',
    address: '14 Avenue Kasa-Vubu, Bandalungwa',
    city: 'Kinshasa',
    businessType: 'Restaurant & Bar Lounge',
    status: 'NEGOTIATION',
    estimatedBudget: 3500,
    notes: 'Intéressé par 2 caisses TaixunPOS N95 + 1 imprimante cuisine réseau + 2 imprimantes tickets.',
    nextFollowUp: '2026-10-31',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    createdAt: '2026-10-18T10:30:00Z',
  },
  {
    id: 2,
    companyName: 'Supermarché Express Limete',
    contactName: 'Maman Pascaline Bolingi',
    phone: '+243 89 555 4321',
    email: 'direction@expresslimete.cd',
    address: 'Boulevard Lumumba, 7ème Rue Limete',
    city: 'Kinshasa',
    businessType: 'Supermarché / Retail',
    status: 'QUALIFIED',
    estimatedBudget: 6200,
    notes: 'Besoin de 4 postes d\'encaissement complets avec scanners 2D et tiroirs-caisses renforcés.',
    nextFollowUp: '2026-11-02',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    createdAt: '2026-10-21T14:15:00Z',
  },
  {
    id: 3,
    companyName: 'Pharmacie Grand Kasaï Gombe',
    contactName: 'Dr. Héritier Luvumbu',
    phone: '+243 99 888 7766',
    email: 'contact@pharmagrandkasai.cd',
    address: '28 Boulevard du 30 Juin, Gombe',
    city: 'Kinshasa',
    businessType: 'Pharmacie & Matériel Médical',
    status: 'PROPOSAL_SENT',
    estimatedBudget: 4800,
    notes: 'Devis envoyé pour 3 terminaux i3 avec double écran client pour affichage ordonnances et prix en Dollars.',
    nextFollowUp: '2026-10-30',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    createdAt: '2026-10-23T09:00:00Z',
  },
  {
    id: 4,
    companyName: 'Boutique Élégance Lubumbashi',
    contactName: 'Nathalie Katumbi',
    phone: '+243 97 111 2233',
    email: 'contact@elegance-lshi.cd',
    address: '15 Avenue Sendwe',
    city: 'Lubumbashi',
    businessType: 'Prêt-à-porter de luxe',
    status: 'NEW',
    estimatedBudget: 1800,
    notes: 'Premier contact via le portail Mon X.Y. Cherche une caisse tactile blanche.',
    nextFollowUp: '2026-11-04',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    createdAt: '2026-10-26T16:45:00Z',
  },
  {
    id: 5,
    companyName: 'Mining Supplies & Catering Kolwezi',
    contactName: 'Baudouin Mutombo',
    phone: '+243 84 777 8899',
    email: 'b.mutombo@miningsupplies.cd',
    address: 'Route Likasi, Zone Industrielle',
    city: 'Kolwezi',
    businessType: 'Fournitures Industrielles & Restauration',
    status: 'CONVERTED',
    estimatedBudget: 5400,
    notes: 'Client converti ! Commande de 4 terminaux TaixunPOS Dual Screen pour le site minier.',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    createdAt: '2026-10-10T11:00:00Z',
  },
];

export const INITIAL_QUOTES: Quote[] = [
  {
    id: 1,
    quoteNumber: 'DEV-2026-0042',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    prospectId: 3,
    prospectName: 'Pharmacie Grand Kasaï Gombe',
    validUntil: '2026-11-20',
    subtotalHt: 3570.0,
    vatRate: 16.0,
    vatAmount: 571.2,
    totalTtc: 4141.2,
    status: 'SENT',
    notes: 'Offre incluant 3x TaixunPOS Dual Screen 15.6"+10.1", 3x imprimantes tickets 80mm et formation du personnel.',
    createdAt: '2026-10-24T10:00:00Z',
    items: [
      {
        id: 1,
        posVariantId: 201,
        variantTitle: 'Dual Screen Pro • Intel Core i3-1215U / 16 Go / 256 Go SSD',
        description: 'Terminal POS 15.6" Full HD + Écran client 10.1" intégré',
        quantity: 3,
        unitPriceHt: 1190.0,
        vatRate: 16.0,
        totalHt: 3570.0,
      },
    ],
  },
  {
    id: 2,
    quoteNumber: 'DEV-2026-0038',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    prospectId: 1,
    prospectName: 'Bistrot & Lounge Bandal',
    validUntil: '2026-11-15',
    subtotalHt: 2190.0,
    vatRate: 16.0,
    vatAmount: 350.4,
    totalTtc: 2540.4,
    status: 'ACCEPTED',
    notes: 'Devis validé par Trésor Mbuyi. Acompte payé en Espèces USD à la caisse.',
    createdAt: '2026-10-19T14:30:00Z',
    items: [
      {
        id: 2,
        posVariantId: 101,
        variantTitle: 'Édition Starter • Intel N95 / 8 Go RAM / 128 Go SSD',
        description: 'TaixunPOS 15.6" Tactile Multipoint All-in-One',
        quantity: 2,
        unitPriceHt: 690.0,
        vatRate: 16.0,
        totalHt: 1380.0,
      },
      {
        id: 3,
        posVariantId: 301,
        variantTitle: 'Imprimante Ticket Thermique 80mm Seiko',
        description: 'Imprimante tickets de caisse haute vitesse 250 mm/s',
        quantity: 2,
        unitPriceHt: 165.0,
        vatRate: 16.0,
        totalHt: 330.0,
      },
      {
        id: 4,
        posVariantId: 302,
        variantTitle: 'Tiroir-Caisse Métallique Renforcé 410mm',
        description: 'Tiroir 5 billets USD / 8 pièces avec serrure',
        quantity: 2,
        unitPriceHt: 95.0,
        vatRate: 16.0,
        totalHt: 190.0,
      },
      {
        id: 5,
        posVariantId: 303,
        variantTitle: 'Scanner Douchette Laser 1D/2D',
        description: 'Scanner sans fil Bluetooth avec base de charge',
        quantity: 2,
        unitPriceHt: 145.0,
        vatRate: 16.0,
        totalHt: 290.0,
      },
    ],
  },
];

export const INITIAL_ORDERS: Order[] = [
  {
    id: 1,
    orderNumber: 'CMD-POS-2026-0018',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    clientId: 1,
    clientName: 'ETS Congo Tech Distribution Gombe',
    clientPhone: '+243 82 444 9900',
    quoteId: 2,
    processingStatus: 'CONFIRMED',
    paymentStatus: 'PARTIALLY_PAID',
    totalAmount: 2628.0,
    paidAmount: 1500.0,
    remainingAmount: 1128.0,
    shippingAddress: 'Boulevard du 30 Juin, Immeuble BCDC, Gombe, Kinshasa',
    deliveryDate: '2026-11-05',
    notes: 'Acompte de $1,500 reçu en Espèces à la caisse principale. Solde à la livraison.',
    createdAt: '2026-10-22T11:30:00Z',
    items: [
      {
        id: 1,
        posVariantId: 101,
        variantTitle: 'TaixunPOS 15.6" Tactile Intel N95 / 8 Go / 128 Go SSD',
        description: 'Terminal caisse tactile tout-en-un',
        quantity: 2,
        unitPrice: 690.0,
        totalPrice: 1380.0,
      },
      {
        id: 2,
        posVariantId: 301,
        variantTitle: 'Imprimante Ticket Thermique 80mm Seiko',
        description: 'Imprimante thermique haute vitesse',
        quantity: 2,
        unitPrice: 165.0,
        totalPrice: 330.0,
      },
      {
        id: 3,
        posVariantId: 302,
        variantTitle: 'Tiroir-Caisse Métallique Renforcé 410mm',
        description: 'Tiroir-caisse RJ11 24V',
        quantity: 2,
        unitPrice: 95.0,
        totalPrice: 190.0,
      },
    ],
    payments: [
      {
        id: 101,
        orderId: 1,
        orderNumber: 'CMD-POS-2026-0018',
        clientName: 'ETS Congo Tech Distribution Gombe',
        sellerId: 5,
        sellerName: 'Alain Tshisekedi',
        amount: 1500.0,
        paymentMethod: 'CASH',
        reference: 'RECU-CSH-883719',
        paymentDate: '2026-10-23T14:00:00Z',
        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        verificationStatus: 'CONFIRMED',
        verifiedById: 6,
        verifiedByName: 'Chantal Mwamba',
        verifiedAt: '2026-10-24T09:15:00Z',
        notes: 'Acompte en espèces ($) vérifié et enregistré en caisse principale 571100.',
      },
      {
        id: 102,
        orderId: 1,
        orderNumber: 'CMD-POS-2026-0018',
        clientName: 'ETS Congo Tech Distribution Gombe',
        sellerId: 5,
        sellerName: 'Alain Tshisekedi',
        amount: 1128.0,
        paymentMethod: 'BANK_TRANSFER',
        reference: 'VIR-RAW-99120',
        paymentDate: '2026-10-28T16:30:00Z',
        verificationStatus: 'PENDING',
        notes: 'Preuve de virement Rawbank soumise par le client. En attente de rapprochement bancaire.',
      },
    ],
  },
  {
    id: 2,
    orderNumber: 'CMD-POS-2026-0019',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    clientId: 2,
    clientName: 'Boutique Élégance Kinshasa',
    clientPhone: '+243 82 555 1234',
    processingStatus: 'PREPARING',
    paymentStatus: 'PAID',
    totalAmount: 1880.0,
    paidAmount: 1880.0,
    remainingAmount: 0.0,
    shippingAddress: 'Avenue de la Libération (ex-24 Novembre), Kinshasa Gombe',
    deliveryDate: '2026-11-03',
    notes: 'Payé intégralement via Vodacom M-Pesa. Matériel en test dans notre atelier.',
    createdAt: '2026-10-24T08:45:00Z',
    items: [
      {
        id: 4,
        posVariantId: 102,
        variantTitle: 'TaixunPOS 15.6" Tactile Intel i3-1215U / 16 Go / 256 Go SSD',
        description: 'Édition Performance pour commerce de détail',
        quantity: 2,
        unitPrice: 940.0,
        totalPrice: 1880.0,
      },
    ],
    payments: [
      {
        id: 103,
        orderId: 2,
        orderNumber: 'CMD-POS-2026-0019',
        clientName: 'Boutique Élégance Kinshasa',
        sellerId: 5,
        sellerName: 'Alain Tshisekedi',
        amount: 1880.0,
        paymentMethod: 'MOBILE_MONEY',
        reference: 'MPESA-TXN-241026-991',
        paymentDate: '2026-10-24T09:00:00Z',
        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        verificationStatus: 'CONFIRMED',
        verifiedById: 6,
        verifiedByName: 'Chantal Mwamba',
        verifiedAt: '2026-10-24T09:30:00Z',
        notes: 'Paiement instantané validé via passerelle Vodacom M-Pesa.',
      },
    ],
  },
  {
    id: 3,
    orderNumber: 'CMD-POS-2026-0020',
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    clientId: 3,
    clientName: 'Supermarché Express Limete',
    clientPhone: '+243 89 555 4321',
    processingStatus: 'PENDING',
    paymentStatus: 'PARTIALLY_PAID',
    totalAmount: 3810.0,
    paidAmount: 1500.0,
    remainingAmount: 2310.0,
    shippingAddress: '7ème Rue Limete Résidentiel, Kinshasa',
    deliveryDate: '2026-11-12',
    notes: 'Bon de commande signé. Acompte reçu en Espèces ($ USD) à la caisse.',
    createdAt: '2026-10-27T10:00:00Z',
    items: [
      {
        id: 5,
        posVariantId: 103,
        variantTitle: 'TaixunPOS 15.6" Tactile Intel i5-1235U / 16 Go / 512 Go SSD',
        description: 'Édition Entreprise haute performance',
        quantity: 2,
        unitPrice: 1250.0,
        totalPrice: 2500.0,
      },
      {
        id: 6,
        posVariantId: 201,
        variantTitle: 'TaixunPOS Dual Screen Pro 15.6" + 10.1"',
        description: 'Poste caisse principal avec affichage publicitaire client',
        quantity: 1,
        unitPrice: 1190.0,
        totalPrice: 1190.0,
      },
      {
        id: 7,
        posVariantId: 303,
        variantTitle: 'Scanner 2D QR Code Sans Fil',
        description: 'Douchette code-barres Bluetooth',
        quantity: 1,
        unitPrice: 120.0,
        totalPrice: 120.0,
      },
    ],
    payments: [
      {
        id: 104,
        orderId: 3,
        orderNumber: 'CMD-POS-2026-0020',
        clientName: 'Supermarché Express Limete',
        sellerId: 5,
        sellerName: 'Alain Tshisekedi',
        amount: 1500.0,
        paymentMethod: 'CASH',
        reference: 'RECU-CSH-LIMETE-01',
        paymentDate: '2026-10-27T11:30:00Z',
        receiptUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=800&q=80',
        verificationStatus: 'CONFIRMED',
        verifiedById: 6,
        verifiedByName: 'Chantal Mwamba',
        notes: 'Acompte cash en billets de $100 vérifié au détecteur de faux billets.',
      },
    ],
  },
];

export const INITIAL_SALES_TARGETS: SalesTarget[] = [
  {
    id: 1,
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    period: '2026-10',
    targetAmount: 15000.0,
    achievedAmount: 8318.0,
    targetUnits: 15,
    achievedUnits: 9,
    commissionRate: 5.0,
  },
];

export const INITIAL_COMMISSIONS: Commission[] = [
  {
    id: 1,
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    orderId: 1,
    orderNumber: 'CMD-POS-2026-0018',
    amount: 131.4,
    status: 'PENDING',
    createdAt: '2026-10-22T11:30:00Z',
  },
  {
    id: 2,
    sellerId: 5,
    sellerName: 'Alain Tshisekedi',
    orderId: 2,
    orderNumber: 'CMD-POS-2026-0019',
    amount: 94.0,
    status: 'VALIDATED',
    createdAt: '2026-10-24T08:45:00Z',
  },
];

// Gestion de la persistance locale
const POS_STORAGE_KEYS = {
  PRODUCTS: 'optima_pos_products',
  PROSPECTS: 'optima_pos_prospects',
  QUOTES: 'optima_pos_quotes',
  ORDERS: 'optima_pos_orders',
  TARGETS: 'optima_pos_targets',
  COMMISSIONS: 'optima_pos_commissions',
};

export const getStoredPosProducts = (): PosProduct[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.PRODUCTS);
  return data ? JSON.parse(data) : INITIAL_POS_PRODUCTS;
};

export const saveStoredPosProducts = (products: PosProduct[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
};

export const getStoredProspects = (): Prospect[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.PROSPECTS);
  return data ? JSON.parse(data) : INITIAL_PROSPECTS;
};

export const saveStoredProspects = (prospects: Prospect[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.PROSPECTS, JSON.stringify(prospects));
};

export const getStoredQuotes = (): Quote[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.QUOTES);
  return data ? JSON.parse(data) : INITIAL_QUOTES;
};

export const saveStoredQuotes = (quotes: Quote[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.QUOTES, JSON.stringify(quotes));
};

export const getStoredOrders = (): Order[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.ORDERS);
  return data ? JSON.parse(data) : INITIAL_ORDERS;
};

export const saveStoredOrders = (orders: Order[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.ORDERS, JSON.stringify(orders));
};

export const getStoredSalesTargets = (): SalesTarget[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.TARGETS);
  return data ? JSON.parse(data) : INITIAL_SALES_TARGETS;
};

export const saveStoredSalesTargets = (targets: SalesTarget[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.TARGETS, JSON.stringify(targets));
};

export const getStoredCommissions = (): Commission[] => {
  const data = localStorage.getItem(POS_STORAGE_KEYS.COMMISSIONS);
  return data ? JSON.parse(data) : INITIAL_COMMISSIONS;
};

export const saveStoredCommissions = (commissions: Commission[]) => {
  localStorage.setItem(POS_STORAGE_KEYS.COMMISSIONS, JSON.stringify(commissions));
};
