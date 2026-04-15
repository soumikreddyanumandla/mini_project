// src/components/Layout.jsx
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { LayoutDashboard, PlusCircle, ClipboardList, Settings, User, LogOut, Menu, Sun, Moon } from 'lucide-react';
import { useState } from 'react';

const navItems = [
  { to: '/dashboard',      label: 'Dashboard',    icon: LayoutDashboard },
  { to: '/surveys/create', label: 'Create Survey', icon: PlusCircle },
  { to: '/surveys',        label: 'My Surveys',    icon: ClipboardList },
  { to: '/settings',       label: 'Settings',      icon: Settings },
  { to: '/profile',        label: 'Profile',       icon: User },
];

export default function Layout() {
  const { admin, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const handleLogout = () => { logout(); navigate('/login'); };

  return (
    <div className="flex h-screen overflow-hidden bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300">

      {open && <div className="fixed inset-0 bg-black/60 z-20 lg:hidden" onClick={() => setOpen(false)}/>}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64
        bg-white dark:bg-slate-900
        border-r border-slate-200 dark:border-slate-800
        flex flex-col transition-all duration-300
        ${open ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Brand */}
        <div className="px-6 py-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center font-bold text-sm text-white">S</div>
            <span className="font-semibold text-lg tracking-tight">SurveyFlow</span>
          </div>
          <button onClick={toggleTheme} title={isDark ? 'Switch to Light' : 'Switch to Dark'}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors
              bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-yellow-400
              hover:bg-slate-200 dark:hover:bg-slate-700">
            {isDark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} onClick={() => setOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${isActive
                  ? 'bg-indigo-600 text-white'
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white'
                }`}>
              <Icon size={18}/>{label}
            </NavLink>
          ))}
        </nav>

        {/* User + logout */}
        <div className="px-3 py-4 border-t border-slate-200 dark:border-slate-800 space-y-1">
          <div className="px-3 py-2">
            <p className="text-sm font-medium truncate">{admin?.fullName}</p>
            <p className="text-xs text-slate-500 truncate">{admin?.email}</p>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium
              text-slate-500 dark:text-slate-400 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors">
            <LogOut size={18}/> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="lg:hidden flex items-center justify-between px-4 py-3
          bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800">
          <button onClick={() => setOpen(true)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
            <Menu size={22}/>
          </button>
          <span className="font-semibold">SurveyFlow</span>
          <button onClick={toggleTheme} className="text-slate-500 dark:text-yellow-400">
            {isDark ? <Sun size={16}/> : <Moon size={16}/>}
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-8">
          <Outlet/>
        </main>
      </div>
    </div>
  );
}
