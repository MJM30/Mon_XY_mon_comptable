import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ShieldCheck,
  TrendingUp,
  CreditCard,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Sparkles,
  Banknote,
  Smartphone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const loginSchema = z.object({
  email: z
    .string()
    .min(1, 'L\'adresse e-mail est obligatoire')
    .email('Veuillez entrer une adresse e-mail valide'),
  password: z
    .string()
    .min(1, 'Le mot de passe est obligatoire')
    .min(6, 'Le mot de passe doit comporter au moins 6 caractères'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const { loginWithCredentials, companies, activeCompany, switchCompany, activeBranding } = useAuth();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@monxy.cd',
      password: 'Admin123!',
      rememberMe: true,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    const result = await loginWithCredentials(data.email, data.password, data.rememberMe);

    if (result.success) {
      navigate(result.redirectUrl || '/');
    } else {
      setServerError(result.error || 'Identifiants invalides. Veuillez réessayer.');
    }
  };

  const fillDemoAccount = (email: string, pass: string) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', pass, { shouldValidate: true });
    setServerError(null);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col justify-center">
      <div className="w-full max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 overflow-hidden grid grid-cols-1 md:grid-cols-12 min-h-[640px]">
          
          {/* ================= COLONNE GAUCHE (Présentation Mon X.Y mon comptable) ================= */}
          <div className="md:col-span-5 lg:col-span-6 bg-gradient-to-br from-blue-950 via-slate-900 to-indigo-950 p-6 sm:p-8 lg:p-12 text-white flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

            {/* En-tête Marque */}
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-extrabold text-xl shadow-lg tracking-tighter">
                  XY
                </div>
                <div className="flex flex-col text-left">
                  <div className="flex items-center gap-2">
                    <span className="font-extrabold text-2xl tracking-tight text-white">Mon X.Y</span>
                    <span className="bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                      RDC • USD ($)
                    </span>
                  </div>
                  <span className="text-sm font-semibold text-slate-300 leading-none">
                    mon comptable
                  </span>
                </div>
              </div>

              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-200 text-xs font-semibold mb-4 backdrop-blur-xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-300" />
                <span>Plateforme Intégrée PME • Caisse Cash • Ventes POS</span>
              </div>

              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight text-white mb-4">
                Gérez votre activité en toute simplicité
              </h1>

              <p className="text-slate-300 text-sm leading-relaxed max-w-md">
                Retrouvez vos ventes, votre caisse en espèces ($), vos encaissements Mobile Money (M-Pesa, Orange, Airtel, IllicoCash) et votre comptabilité SYSCOHADA dans un espace sécurisé.
              </p>
            </div>

            {/* Mockup visuel financier & POS */}
            <div className="my-8 relative z-10 space-y-3">
              <div className="bg-white/10 border border-white/15 backdrop-blur-md rounded-2xl p-4 shadow-lg">
                <div className="flex items-center justify-between text-xs text-slate-300 mb-2">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                    Chiffre d'Affaires & Encaissements (USD)
                  </span>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                    +18.5% Kinshasa
                  </span>
                </div>
                <div className="text-2xl font-extrabold text-white">$148,920.00</div>
                <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden mt-3">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '84%' }} />
                </div>
              </div>

              {/* Badges fonctionnels */}
              <div className="grid grid-cols-2 gap-3 text-xs text-slate-300">
                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500/20 text-emerald-300 flex items-center justify-center shrink-0">
                    <Banknote className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">Cash & Mobile Money</span>
                    <span className="text-[10px] text-slate-400">Espèces, M-Pesa, Airtel</span>
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-xl p-3 flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-300 flex items-center justify-center shrink-0">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="font-bold text-white block">SYSCOHADA & DGI RDC</span>
                    <span className="text-[10px] text-slate-400">Partie double & Bilan</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Pied de présentation */}
            <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-slate-400 relative z-10">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Sécurité bancaire & Cryptage certifié
              </span>
              <span className="text-[11px] font-mono">Mon X.Y v2.5</span>
            </div>
          </div>

          {/* ================= COLONNE DROITE (Formulaire de Connexion) ================= */}
          <div className="md:col-span-7 lg:col-span-6 p-6 sm:p-8 lg:p-12 flex flex-col justify-between bg-white">
            <div className="max-w-md w-full mx-auto space-y-6">
              
              {/* Titre & Sous-titre */}
              <div className="space-y-1">
                <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Bienvenue !
                </h2>
                <p className="text-xs sm:text-sm text-slate-500">
                  Connectez-vous à votre espace <strong>Mon X.Y mon comptable</strong>.
                </p>
              </div>

              {/* Message d'erreur serveur */}
              {serverError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-700 animate-in fade-in duration-200">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                  <div className="leading-relaxed font-medium">{serverError}</div>
                </div>
              )}

              {/* Formulaire React Hook Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Champ Email */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Adresse e-mail <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="email"
                      autoComplete="email"
                      placeholder="nom@monxy.cd"
                      {...register('email')}
                      className={`w-full bg-slate-50/60 border text-xs sm:text-sm rounded-xl pl-10 pr-3.5 py-2.5 focus:outline-none focus:ring-2 transition-all ${
                        errors.email
                          ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {errors.email.message}
                    </p>
                  )}
                </div>

                {/* Champ Mot de passe */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                      Mot de passe <span className="text-rose-500">*</span>
                    </label>
                    <Link
                      to="/forgot-password"
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700 hover:underline"
                    >
                      Mot de passe oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      {...register('password')}
                      className={`w-full bg-slate-50/60 border text-xs sm:text-sm rounded-xl pl-10 pr-10 py-2.5 focus:outline-none focus:ring-2 transition-all ${
                        errors.password
                          ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500 text-rose-900 bg-rose-50/20'
                          : 'border-slate-200 focus:ring-blue-500/20 focus:border-blue-600 text-slate-900'
                      }`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                      title={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-[11px] text-rose-600 font-semibold mt-1">
                      {errors.password.message}
                    </p>
                  )}
                </div>

                {/* Se souvenir de moi */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      {...register('rememberMe')}
                      className="w-4 h-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Se souvenir de moi</span>
                  </label>
                </div>

                {/* Bouton de Soumission */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:opacity-70 text-white font-bold text-xs sm:text-sm py-3 px-4 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 mt-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Connexion en cours...</span>
                    </>
                  ) : (
                    <span>Se connecter</span>
                  )}
                </button>
              </form>

              {/* Raccourcis de Test Démo : Sélection Entreprise (Multi-Tenant) & Rôle Métier (RBAC) */}
              <div className="pt-4 border-t border-slate-100 space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1">
                    1. Choisir l’entreprise PME active (Multi-Entreprises & White Label) :
                  </label>
                  <select
                    value={activeCompany.id}
                    onChange={(e) => switchCompany(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-extrabold text-slate-800"
                  >
                    {companies.map((c) => (
                      <option key={c.id} value={c.id}>
                        🏢 {c.tradeName} — ({c.sectorLabel})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <p className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider mb-1.5">
                    2. Profils Démo (1-clic • Séparation Stricte des Rôles) :
                  </p>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                    <button
                      type="button"
                      onClick={() => fillDemoAccount('vendeur@monxy.cd', 'Vendeur123!')}
                      className="p-2 rounded-xl border border-emerald-200 bg-emerald-50/40 hover:bg-emerald-50 text-left font-semibold text-emerald-900 transition-colors"
                    >
                      🛒 Alain Tshisekedi
                      <span className="block text-[9px] text-emerald-700 font-normal">
                        Vendeur (Ventes POS & Caisse)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('caisse@monxy.cd', 'Caisse123!')}
                      className="p-2 rounded-xl border border-amber-200 bg-amber-50/40 hover:bg-amber-50 text-left font-semibold text-amber-900 transition-colors"
                    >
                      💵 Grâce Kalonji
                      <span className="block text-[9px] text-amber-700 font-normal">
                        Caissière (Ventes POS & Caisse)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('compta@monxy.cd', 'Compta123!')}
                      className="p-2 rounded-xl border border-blue-200 bg-blue-50/40 hover:bg-blue-50 text-left font-semibold text-blue-900 transition-colors"
                    >
                      📖 Mireille Kabongo
                      <span className="block text-[9px] text-blue-700 font-normal">
                        Comptable (Extension Financière)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('controleur@monxy.cd', 'Controleur123!')}
                      className="p-2 rounded-xl border border-purple-200 bg-purple-50/40 hover:bg-purple-50 text-left font-semibold text-purple-900 transition-colors"
                    >
                      ⚖️ Jean-Paul Mukendi
                      <span className="block text-[9px] text-purple-700 font-normal">
                        Contrôleur (Contrôle Financier)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('gerant@monxy.cd', 'Gerant123!')}
                      className="p-2 rounded-xl border border-indigo-200 bg-indigo-50/40 hover:bg-indigo-50 text-left font-semibold text-indigo-900 transition-colors"
                    >
                      👔 Felly Ilunga
                      <span className="block text-[9px] text-indigo-700 font-normal">
                        Gérant (Commercial & Tiers)
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fillDemoAccount('admin@monxy.cd', 'Admin123!')}
                      className="p-2 rounded-xl border border-slate-300 bg-slate-50 hover:bg-slate-100 text-left font-semibold text-slate-800 transition-colors"
                    >
                      🛡️ Dieudonné Kasongo
                      <span className="block text-[9px] text-slate-500 font-normal">
                        Admin PME (Accès Complet)
                      </span>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Bas de page légal */}
            <div className="text-center text-[11px] text-slate-400 pt-6">
              © 2026 Mon X.Y mon comptable — RDC. Tous droits réservés.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
