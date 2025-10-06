import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8F6F3] film-grain flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 animate-spin text-[#8B6F47]" />
          <p className="text-[#8B6F47]">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to={createPageUrl('Login')} replace />;
  }

  return children;
}
