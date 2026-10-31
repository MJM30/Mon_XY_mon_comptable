import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types';
import { ShieldAlert, ArrowLeft, Key } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
  requireGestionAccreditation?: boolean;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  allowedRoles,
  requireGestionAccreditation,
}) => {
  const { user, isAuthenticated, isLoading, canAccessGestion } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold text-slate-500">Chargement de votre session sécurisée...</p>
        </div>
      </div>
    );
  }

  // 1. Redirection si non authentifié
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // 2. Vérification de l'accréditation spécifique pour l'Interface de Gestion
  if (requireGestionAccreditation && !canAccessGestion) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-amber-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto border border-amber-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-extrabold uppercase tracking-wider bg-amber-50 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
              Accès Restreint • Erreur 403
            </span>
            <h2 className="text-xl font-extrabold text-slate-900 pt-2">
              Accréditation requise
            </h2>
            <p className="text-xs text-slate-500 leading-relaxed">
              Votre compte (<strong>{user.name}</strong>, rôle : <em>{user.role}</em>) ne dispose pas encore de l’accréditation accordée par l’Administrateur pour accéder à l’Interface de Gestion.
            </p>
          </div>

          <div className="pt-2 flex flex-col gap-2">
            <button
              onClick={() => alert("Demande d'accréditation envoyée à l'Administrateur avec succès !")}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm flex items-center justify-center gap-2"
            >
              <Key className="w-4 h-4" />
              <span>Soumettre une demande d'accréditation</span>
            </button>
            <NavigateToHabituel />
          </div>
        </div>
      </div>
    );
  }

  // 3. Vérification des rôles autorisés si spécifiés
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-rose-200 shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-100">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-extrabold text-slate-900">
            Permissions insuffisantes
          </h2>
          <p className="text-xs text-slate-500">
            Vous n'avez pas les autorisations nécessaires pour consulter cette page.
          </p>

          <NavigateToHabituel />
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

const NavigateToHabituel: React.FC = () => {
  return (
    <a
      href="/"
      className="inline-flex items-center justify-center gap-1.5 py-2 px-4 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors"
    >
      <ArrowLeft className="w-3.5 h-3.5" />
      <span>Retour à mon espace habituel</span>
    </a>
  );
};
