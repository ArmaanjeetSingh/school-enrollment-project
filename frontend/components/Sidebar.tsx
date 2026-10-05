'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  School,
  FileSpreadsheet,
  GraduationCap,
  LogOut
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Sidebar = () => {
  const pathname = usePathname();
  const { user, isLoading, logout } = useAuth();

  // 1. Hide sidebar if auth is still loading, user is logged out, or on the login page
  if (isLoading || !user || pathname === '/login') {
    return null;
  }

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: LayoutDashboard,
    },
    {
      name: 'Schools',
      href: '/schools',
      icon: School,
    },
    {
      name: 'Reports',
      href: '/reports',
      icon: FileSpreadsheet,
    },
  ];

  return (
    <aside className="w-64 bg-white border-r border-gray-200 min-h-screen flex flex-col justify-between p-4 shadow-sm print:hidden">
      <div>
        {/* Branding Header */}
        <div className="flex items-center gap-3 px-3 py-4 border-b border-gray-100 mb-6">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-sm">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              E-Goshwaara
            </h3>
            <p className="text-xs text-gray-500 font-medium">School Portal</p>
          </div>
        </div>

        <nav className="space-y-1.5">
          {navigation.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive
                  ? 'bg-blue-50 text-blue-600 font-bold'
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                  }`}
              >
                <Icon
                  className={`w-5 h-5 ${isActive ? 'text-blue-600' : 'text-gray-400'
                    }`}
                />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Footer / Logout */}
      <div className="border-t border-gray-100 pt-4 space-y-3">
        {user && (
          <div className="px-3 py-2 bg-gray-50 rounded-lg">
            <p className="text-xs font-bold text-gray-800 truncate">
              {user.email || 'User Session'}
            </p>
            <p className="text-[10px] text-gray-500">Logged in</p>
          </div>
        )}

        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-3.5 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors"
        >
          <LogOut className="w-4 h-4 text-red-500" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};