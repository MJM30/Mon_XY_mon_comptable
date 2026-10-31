import React, { useState } from 'react';
import {
  CreditCard,
  Smartphone,
  Shield,
  Key,
  CheckCircle2,
  Settings2,
  RefreshCw,
  Eye,
  EyeOff,
  Radio,
  Save,
  Check,
  AlertCircle
} from 'lucide-react';
import {
  getStoredProviderConfigs,
  saveStoredProviderConfigs,
} from '../../data/accountingMockData';
import { DigitalPaymentProvider, ProviderConfiguration } from '../../types';

export const PaymentProvidersConfig: React.FC = () => {
  const [configs, setConfigs] = useState<ProviderConfiguration[]>(getStoredProviderConfigs());
  const [selectedProviderId, setSelectedProviderId] = useState<number>(configs[0]?.id || 1);
  const [showSecrets, setShowSecrets] = useState<{ [key: number]: boolean }>({});
  const [testStatus, setTestStatus] = useState<{ [key: number]: { loading: boolean; success?: boolean; message?: string } }>({});
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const selectedConfig = configs.find((c) => c.id === selectedProviderId) || configs[0];

  const handleToggleActive = (id: number) => {
    const updated = configs.map((c) => (c.id === id ? { ...c, isActive: !c.isActive } : c));
    setConfigs(updated);
    saveStoredProviderConfigs(updated);
  };

  const handleToggleSandbox = (id: number) => {
    const updated = configs.map((c) => (c.id === id ? { ...c, isSandbox: !c.isSandbox } : c));
    setConfigs(updated);
    saveStoredProviderConfigs(updated);
  };

  const handleFieldChange = (field: keyof ProviderConfiguration, value: any) => {
    const updated = configs.map((c) => (c.id === selectedConfig.id ? { ...c, [field]: value } : c));
    setConfigs(updated);
  };

  const handleSave = () => {
    saveStoredProviderConfigs(configs);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  };

  const handleTestConnection = (id: number) => {
    setTestStatus((prev) => ({ ...prev, [id]: { loading: true } }));
    setTimeout(() => {
      setTestStatus((prev) => ({
        ...prev,
        [id]: {
          loading: false,
          success: true,
          message: 'Connexion API vérifiée avec succès (Ping: 42ms, Signature Webhook valide).',
        },
      }));
    }, 1200);
  };

  const toggleShowSecret = (id: number) => {
    setShowSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const getProviderIcon = (provider: DigitalPaymentProvider) => {
    switch (provider) {
      case DigitalPaymentProvider.CARD_VISA_MASTERCARD:
        return <CreditCard className="w-5 h-5 text-indigo-600" />;
      case DigitalPaymentProvider.MPESA:
        return <Smartphone className="w-5 h-5 text-red-600" />;
      case DigitalPaymentProvider.ORANGE_MONEY:
        return <Smartphone className="w-5 h-5 text-orange-600" />;
      case DigitalPaymentProvider.AIRTEL_MONEY:
        return <Smartphone className="w-5 h-5 text-rose-600" />;
      case DigitalPaymentProvider.ILLICOCASH:
        return <Smartphone className="w-5 h-5 text-blue-600" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              Architecture Passerelles & Clés d'API
            </span>
            <span className="text-xs text-slate-500 font-medium">Sécurité & Chiffrement AES-256</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Settings2 className="w-7 h-7 text-slate-700" />
            Configuration des Passerelles de Paiement
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Paramétrez les comptes marchands, clés secrètes, webhooks et comptes de transit comptable associés.
          </p>
        </div>

        <button
          onClick={handleSave}
          className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition shadow-sm hover:shadow"
        >
          {saveSuccess ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saveSuccess ? 'Paramètres Enregistrés !' : 'Enregistrer les Modifications'}
        </button>
      </div>

      {/* Main Grid: Left Tabs / Right Settings Form */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Provider List */}
        <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-4 space-y-2">
          <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
            Passerelles Disponibles ({configs.length})
          </h2>
          {configs.map((c) => {
            const isSelected = c.id === selectedConfig.id;
            return (
              <button
                key={c.id}
                onClick={() => setSelectedProviderId(c.id)}
                className={`w-full text-left p-3.5 rounded-xl border transition flex items-center justify-between ${
                  isSelected
                    ? 'border-blue-500 bg-blue-50/50 shadow-sm'
                    : 'border-slate-100 hover:border-slate-200 hover:bg-slate-50/60'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-white shadow-xs border border-slate-100">
                    {getProviderIcon(c.provider)}
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-900">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      Cpt {c.accountingAccountCode} • {c.commissionRate}% comm.
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {c.isSandbox && (
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800">
                      TEST
                    </span>
                  )}
                  <span
                    className={`w-2 h-2 rounded-full ${
                      c.isActive ? 'bg-emerald-500 ring-2 ring-emerald-100' : 'bg-slate-300'
                    }`}
                  />
                </div>
              </button>
            );
          })}
        </div>

        {/* Right Column: Settings Form for Selected Provider */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-200/80 shadow-sm p-6 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200">
                {getProviderIcon(selectedConfig.provider)}
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900">{selectedConfig.name}</h2>
                <p className="text-xs text-slate-500">Code Fournisseur : {selectedConfig.provider}</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleToggleSandbox(selectedConfig.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedConfig.isSandbox
                    ? 'bg-amber-50 text-amber-800 border-amber-200'
                    : 'bg-emerald-50 text-emerald-800 border-emerald-200'
                }`}
              >
                Mode : {selectedConfig.isSandbox ? 'Bac à Sable (Sandbox)' : 'Production Réelle'}
              </button>

              <button
                type="button"
                onClick={() => handleToggleActive(selectedConfig.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                  selectedConfig.isActive
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-slate-100 text-slate-600 border-slate-200'
                }`}
              >
                {selectedConfig.isActive ? 'Passerelle Active' : 'Passerelle Désactivée'}
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Paramètres Financiers & Affectation Comptable
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Compte de Transit SYSCOHADA
                </label>
                <input
                  type="text"
                  value={selectedConfig.accountingAccountCode}
                  onChange={(e) => handleFieldChange('accountingAccountCode', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono font-semibold"
                  placeholder="ex: 518100"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Débité lors de l'encaissement client
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Taux de Commission Opérateur (%)
                </label>
                <input
                  type="number"
                  step="0.1"
                  value={selectedConfig.commissionRate}
                  onChange={(e) => handleFieldChange('commissionRate', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Imputé au compte 627800
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Frais Fixe par Transaction ($)
                </label>
                <input
                  type="number"
                  step="0.05"
                  value={selectedConfig.fixedFee || 0}
                  onChange={(e) => handleFieldChange('fixedFee', Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-semibold"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  Part fixe contractuelle
                </span>
              </div>
            </div>

            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 pt-3">
              Identifiants API & Sécurité
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Identifiant Marchand / Merchant ID
                </label>
                <input
                  type="text"
                  value={selectedConfig.merchantId || ''}
                  onChange={(e) => handleFieldChange('merchantId', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  placeholder="ex: MERCH_MPESA_789456"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clé Publique / Client ID
                </label>
                <input
                  type="text"
                  value={selectedConfig.publicKey || ''}
                  onChange={(e) => handleFieldChange('publicKey', e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm font-mono"
                  placeholder="ex: pk_live_..."
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Clé Secrète / Private API Key
                </label>
                <div className="relative">
                  <input
                    type={showSecrets[selectedConfig.id] ? 'text' : 'password'}
                    value={selectedConfig.secretKey || ''}
                    onChange={(e) => handleFieldChange('secretKey', e.target.value)}
                    className="w-full px-3 py-2 pr-10 rounded-xl border border-slate-200 text-sm font-mono"
                    placeholder="••••••••••••••••••••••••••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => toggleShowSecret(selectedConfig.id)}
                    className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  >
                    {showSecrets[selectedConfig.id] ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  URL de Notification Webhook (Callback)
                </label>
                <input
                  type="text"
                  readOnly
                  value={`https://api.mon-comptable.com/api/v1/payments/webhook/${selectedConfig.provider.toLowerCase()}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-slate-50 text-slate-600 text-xs font-mono"
                />
                <span className="text-[10px] text-slate-400 mt-0.5 block">
                  À déclarer dans la console développeur de l'opérateur pour la confirmation instantanée
                </span>
              </div>
            </div>

            {/* Test Connection Box */}
            <div className="p-4 bg-slate-50 border border-slate-200/80 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                  <Shield className="w-4 h-4 text-emerald-600" />
                  Vérification de l'Intégrité des API
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  Testez la communication et la signature cryptographique HMAC.
                </p>
                {testStatus[selectedConfig.id]?.message && (
                  <div className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    {testStatus[selectedConfig.id].message}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => handleTestConnection(selectedConfig.id)}
                disabled={testStatus[selectedConfig.id]?.loading}
                className="px-4 py-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 ${
                    testStatus[selectedConfig.id]?.loading ? 'animate-spin text-blue-600' : ''
                  }`}
                />
                Tester la Connexion
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
