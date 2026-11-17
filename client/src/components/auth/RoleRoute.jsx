import React from 'react';
import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const RoleRoute = ({ allowedRoles = [], children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!allowedRoles.includes(user?.role)) {
    return (
      <div className="min-h-[75vh] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-2xl shadow-xl border border-rose-100 p-8 text-center">
          <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Restricted</h2>
          <p className="text-slate-600 text-sm mb-6">
            Your current role (<span className="font-semibold text-brand-600 uppercase tracking-wide text-xs px-2 py-0.5 bg-brand-50 rounded-full">{user?.role}</span>) does not have authorization to view this secure zone.
          </p>
          <Link
            to={
              user?.role === 'admin'
                ? '/admin'
                : user?.role === 'exhibitor'
                ? '/exhibitor'
                : '/events'
            }
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-medium rounded-xl text-sm transition-all shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            Return to Authorized Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return children;
};
