import React, { useState } from 'react';
import {
  Monitor,
  Cpu,
  HardDrive,
  Layers,
  Printer,
  CheckCircle2,
  SlidersHorizontal,
  Search,
  ShoppingCart,
  ShieldCheck,
  FileText,
  Info,
  DollarSign,
  TrendingUp,
  X,
  Package,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getStoredPosProducts, PosProduct, PosVariant } from '../../data/posMockData';

export const PosCatalog: React.FC = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [products] = useState<PosProduct[]>(getStoredPosProducts);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<PosProduct | null>(null);
  const [activeVariant, setActiveVariant] = useState<PosVariant | null>(null);
  const [showSpecModal, setShowSpecModal] = useState<boolean>(false);
  const [quoteSuccessMsg, setQuoteSuccessMsg] = useState<string | null>(null);

  const openSpecSheet = (product: PosProduct) => {
    setSelectedProduct(product);
    setActiveVariant(product.variants[0] || null);
    setShowSpecModal(true);
  };

  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.modelNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase());

    if (selectedCategory === 'ALL') return matchesSearch;
    if (selectedCategory === 'POS') return matchesSearch && p.modelNumber.startsWith('TX');
    if (selectedCategory === 'ACC') return matchesSearch && p.modelNumber.startsWith('ACC');
    return matchesSearch;
  });

  const handleSimulateQuote = (product: PosProduct, variant: PosVariant) => {
    setQuoteSuccessMsg(
      `Variante « ${variant.title} » ajoutée ! Vous pouvez la retrouver dans l’onglet Devis pour finaliser l’offre.`
    );
    setTimeout(() => {
      setQuoteSuccessMsg(null);
    }, 4500);
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-100 text-blue-700 uppercase tracking-wider">
              Gamme TaixunPOS & Périphériques
            </span>
            <span className="text-xs text-slate-400">• Catalogue Commercial 2026</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Catalogue Terminaux POS & Caisses Tactiles
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Équipements de point de vente professionnels haute durabilité avec fiches techniques et tarification.
          </p>
        </div>

        {/* Badge Rôle & Masquage Marges */}
        <div className="flex items-center gap-3">
          {isAdmin ? (
            <div className="px-3.5 py-1.5 rounded-xl bg-purple-50 border border-purple-200 text-purple-700 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-purple-600" />
              <span>Mode Administrateur (Coûts d'achat & Marges visibles)</span>
            </div>
          ) : (
            <div className="px-3.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Mode Vendeur (Tarifs publics & Devis clients)</span>
            </div>
          )}
        </div>
      </div>

      {/* Message de succès simulation devis */}
      {quoteSuccessMsg && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs sm:text-sm flex items-center gap-3 animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{quoteSuccessMsg}</span>
        </div>
      )}

      {/* Barre de recherche et Filtres */}
      <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher par modèle, référence (ex: TX-1560, N95)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500 text-slate-800 shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <SlidersHorizontal className="w-4 h-4 text-slate-400" />
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'ALL'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Tous les équipements
          </button>
          <button
            onClick={() => setSelectedCategory('POS')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'POS'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Terminaux Tactiles POS
          </button>
          <button
            onClick={() => setSelectedCategory('ACC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              selectedCategory === 'ACC'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            Imprimantes & Tiroirs
          </button>
        </div>
      </div>

      {/* Grille des terminaux POS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.map((product) => {
          const defaultVariant = product.variants[0];
          const minPrice = Math.min(...product.variants.map((v) => v.salePrice));
          const maxPrice = Math.max(...product.variants.map((v) => v.salePrice));
          const totalStock = product.variants.reduce((acc, v) => acc + v.stockQuantity, 0);

          return (
            <div
              key={product.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden flex flex-col justify-between"
            >
              <div>
                {/* Image & Badges */}
                <div className="relative h-48 bg-slate-100 overflow-hidden group">
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                    <span className="px-2.5 py-1 rounded-md bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold uppercase tracking-wider">
                      {product.brand}
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-blue-600/90 backdrop-blur-xs text-white text-[10px] font-bold">
                      {product.screenSize}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <span
                      className={`px-2 py-1 rounded-md text-[10px] font-bold shadow-xs ${
                        totalStock > 5
                          ? 'bg-emerald-500 text-white'
                          : totalStock > 0
                          ? 'bg-amber-500 text-white'
                          : 'bg-rose-500 text-white'
                      }`}
                    >
                      {totalStock > 0 ? `${totalStock} en stock` : 'Rupture'}
                    </span>
                  </div>
                </div>

                {/* Contenu */}
                <div className="p-5 space-y-4">
                  <div>
                    <span className="text-[11px] font-extrabold text-blue-600 tracking-wider uppercase">
                      Réf. {product.modelNumber}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 line-clamp-1">{product.name}</h3>
                    <p className="text-xs text-slate-500 line-clamp-2 mt-1 leading-relaxed">
                      {product.description}
                    </p>
                  </div>

                  {/* Caractéristiques rapides */}
                  <div className="grid grid-cols-2 gap-2 text-[11px] py-2 border-y border-slate-100 bg-slate-50/50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Monitor className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span className="truncate">{product.resolution}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Layers className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span className="truncate">Tactile capacitif</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="truncate">{product.variants.length} configurations</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Printer className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span className="truncate">{product.hasPrinter ? 'Impr. intégrable' : 'Périphérique'}</span>
                    </div>
                  </div>

                  {/* Prix et Configurations disponibles */}
                  <div className="space-y-1.5">
                    <div className="text-[10px] font-bold uppercase text-slate-400">Tarification HT :</div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xl font-black text-slate-900">
                        {minPrice === maxPrice
                          ? `${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} $`
                          : `De ${minPrice} $ à ${maxPrice} $`}
                      </span>
                      <span className="text-[11px] text-slate-400">HT / unité</span>
                    </div>

                    {/* Marge visible pour admin */}
                    {isAdmin && defaultVariant && defaultVariant.costPrice && (
                      <div className="text-[10px] font-semibold text-purple-700 bg-purple-50 px-2 py-1 rounded-md flex items-center justify-between">
                        <span>Coût d’achat : {defaultVariant.costPrice} $</span>
                        <span>Marge brute : +{(defaultVariant.salePrice - defaultVariant.costPrice).toFixed(2)} $</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="p-5 pt-0 grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => openSpecSheet(product)}
                  className="px-3 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-700 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span>Fiche technique</span>
                </button>

                <button
                  type="button"
                  onClick={() => openSpecSheet(product)}
                  className="px-3 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>Configurer & Devis</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ================= MODALE FICHE TECHNIQUE & CONFIGURATEUR ================= */}
      {showSpecModal && selectedProduct && activeVariant && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full border border-slate-200 shadow-2xl overflow-hidden animate-scale-in">
            {/* Header Modale */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-xs">
                  <Monitor className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-base">{selectedProduct.name}</h3>
                  <p className="text-xs text-slate-500">
                    Modèle {selectedProduct.modelNumber} • {selectedProduct.brand}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setShowSpecModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-200/80 flex items-center justify-center text-slate-400 hover:text-slate-700 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Corps de la modale */}
            <div className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
              {/* Choix de la variante (processeur / mémoire / SSD) */}
              <div className="space-y-3">
                <label className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Cpu className="w-4 h-4 text-blue-600" />
                  <span>Sélectionnez la configuration matérielle :</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {selectedProduct.variants.map((v) => {
                    const isSelected = activeVariant.id === v.id;
                    return (
                      <div
                        key={v.id}
                        onClick={() => setActiveVariant(v)}
                        className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isSelected ? 'bg-blue-600 text-white' : 'bg-slate-100 text-slate-600'
                            }`}
                          >
                            {v.cpu.includes('N95') ? 'N95 Entry' : v.cpu.includes('i3') ? 'Core i3' : 'Core i5 Pro'}
                          </span>
                          <span className="text-xs font-black text-slate-900">{v.salePrice} $ HT</span>
                        </div>
                        <div className="text-xs font-bold text-slate-800 line-clamp-1">{v.cpu}</div>
                        <div className="text-[11px] text-slate-500 mt-1">
                          {v.ram} • {v.storage}
                        </div>
                        <div className="text-[10px] text-emerald-600 font-bold mt-2 flex items-center gap-1">
                          <Package className="w-3 h-3" />
                          <span>{v.stockQuantity} unités disponibles</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Fiche technique détaillée */}
              <div className="space-y-3">
                <div className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-blue-600" />
                  <span>Spécifications Techniques Complètes (Conforme TaixunPOS) :</span>
                </div>

                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Dalle & Écran tactile</span>
                    <span className="font-semibold text-slate-800">
                      {selectedProduct.screenSize} • {selectedProduct.resolution}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">{selectedProduct.touchType}</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Processeur sélectionné</span>
                    <span className="font-semibold text-slate-800">{activeVariant.cpu}</span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Ventilation passive silencieuse (Fanless)</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Mémoire & Disque</span>
                    <span className="font-semibold text-slate-800">
                      {activeVariant.ram} + {activeVariant.storage}
                    </span>
                    <p className="text-[11px] text-slate-500 mt-0.5">Support Dual-Channel extensible</p>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Systèmes d'exploitation</span>
                    <span className="font-semibold text-slate-800">{selectedProduct.osSupport}</span>
                  </div>

                  <div className="sm:col-span-2">
                    <span className="text-[10px] font-bold uppercase text-slate-400 block">Connectique & Ports I/O</span>
                    <span className="font-semibold text-slate-800">{selectedProduct.ports}</span>
                  </div>
                </div>
              </div>

              {/* Récapitulatif Tarifaire */}
              <div className="p-4 bg-gradient-to-r from-blue-900 to-slate-900 rounded-2xl text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-[11px] text-blue-200 font-semibold block">Configuration retenue :</span>
                  <div className="text-sm font-bold">{activeVariant.title}</div>
                  <div className="text-[11px] text-slate-300 mt-0.5">Réf. SKU : {activeVariant.sku}</div>
                </div>

                <div className="text-right">
                  <div className="text-xs text-blue-200">Prix de vente unitaire</div>
                  <div className="text-2xl font-black text-white">
                    {activeVariant.salePrice.toLocaleString('en-US', { minimumFractionDigits: 2 })} $ HT
                  </div>
                  <div className="text-[10px] text-slate-300">
                    TVA (20%) : {(activeVariant.salePrice * 0.2).toFixed(2)} $ • TTC :{' '}
                    {(activeVariant.salePrice * 1.2).toFixed(2)} $
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de la modale */}
            <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-100 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowSpecModal(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 font-bold text-xs hover:bg-slate-100 transition-colors"
              >
                Fermer
              </button>

              <button
                type="button"
                onClick={() => {
                  handleSimulateQuote(selectedProduct, activeVariant);
                  setShowSpecModal(false);
                }}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs transition-colors"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Générer un Devis avec cette Variante</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
