import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Loader2 } from 'lucide-react';

export default function AuthCallback() {
  const navigate = useNavigate();

  useEffect(() => {
    setTimeout(() => {
      navigate(createPageUrl('Gallery'), { replace: true });
    }, 1000);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-[#F8F6F3] film-grain flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="w-12 h-12 animate-spin text-[#8B6F47]" />
        <p className="text-[#8B6F47]">Completing sign in...</p>
      </div>
    </div>
  );
}
