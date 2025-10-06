
import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { Camera, Image, Aperture, Settings, Shield, Users, LogOut } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const navigationItems = [
  { name: "Camera", url: createPageUrl("Camera"), icon: Camera },
  { name: "Gallery", url: createPageUrl("Gallery"), icon: Image },
  { name: "Groups", url: createPageUrl("Groups"), icon: Users },
  { name: "Settings", url: createPageUrl("Settings"), icon: Settings },
];

export default function Layout({ children, currentPageName }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate(createPageUrl("Login"));
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8F6F3] font-serif">
      <style>{`
        :root {
          --vintage-cream: #F8F6F3;
          --vintage-brown: #8B6F47;
          --vintage-dark: #654321;
          --vintage-gold: #C9A961;
          --vintage-red: #B85450;
          --charcoal: #2C2C2C;
        }
        
        * {
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        }
        
        .film-grain {
          position: relative;
          overflow: hidden;
        }
        
        .film-grain::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 400 400' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='2.5' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
          pointer-events: none;
          z-index: 1;
        }
      `}</style>

      <div className="flex flex-col h-screen">
        {/* Header */}
        <header className="bg-white/80 backdrop-blur-sm border-b border-[#8B6F47]/20 px-6 py-4 film-grain">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-[#8B6F47] to-[#654321] rounded-lg flex items-center justify-center shadow-lg">
                <Aperture className="w-6 h-6 text-[#F8F6F3]" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-[#2C2C2C] tracking-tight">FilmVault</h1>
                <p className="text-xs text-[#8B6F47]">Vintage Photography</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-2">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.url;
                return (
                  <Link key={item.name} to={item.url}>
                    <motion.div
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      className={`flex items-center gap-2 px-4 py-2.5 rounded-lg transition-all ${
                        isActive
                          ? "bg-[#8B6F47] text-white shadow-md"
                          : "text-[#654321] hover:bg-[#8B6F47]/10"
                      }`}
                    >
                      <item.icon className="w-4 h-4" />
                      <span className="text-sm font-medium">{item.name}</span>
                    </motion.div>
                  </Link>
                );
              })}
              
              {user?.user_metadata?.privacy_settings?.default_photo_visibility === "private" && (
                <div className="ml-2 flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-800 rounded-full text-xs font-medium">
                  <Shield className="w-3 h-3" />
                  Secure
                </div>
              )}
            </nav>

            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="hidden md:flex items-center gap-2 hover:bg-[#8B6F47]/10">
                    <div className="text-right">
                      <p className="text-sm font-medium text-[#2C2C2C]">{user.user_metadata?.full_name || 'User'}</p>
                      <p className="text-xs text-[#8B6F47]">{user.email}</p>
                    </div>
                    {user.user_metadata?.profile_picture ? (
                      <img
                        src={user.user_metadata.profile_picture}
                        alt="Profile"
                        className="w-10 h-10 rounded-full object-cover border-2 border-[#8B6F47]"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#8B6F47] to-[#654321] flex items-center justify-center text-white font-medium">
                        {user.user_metadata?.full_name?.[0] || user.email[0].toUpperCase()}
                      </div>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-1.5">
                    <p className="text-sm font-medium text-[#2C2C2C]">{user.user_metadata?.full_name || 'User'}</p>
                    <p className="text-xs text-[#8B6F47]">{user.email}</p>
                  </div>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-red-600 cursor-pointer">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          {children}
        </main>

        {/* Mobile Navigation */}
        <nav className="md:hidden bg-white/90 backdrop-blur-sm border-t border-[#8B6F47]/20 px-2 py-3 film-grain">
          <div className="flex justify-around items-center">
            {navigationItems.map((item) => {
              const isActive = location.pathname === item.url;
              return (
                <Link key={item.name} to={item.url} className="flex-1">
                  <motion.div
                    whileTap={{ scale: 0.95 }}
                    className={`flex flex-col items-center gap-1 py-2 ${
                      isActive ? "text-[#8B6F47]" : "text-[#654321]/60"
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{item.name}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
