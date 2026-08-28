import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import authService from '../../services/authService';
import { useTheme } from '../../context/ThemeContext';
import { LayoutDashboard, History, ShieldCheck, User, Moon, Sun, LogOut } from 'lucide-react';

const Navbar = () => {
    const location = useLocation();
    const user = authService.getCurrentUser();
    const isUserAdmin = authService.isAdmin();
    const { theme, toggleTheme } = useTheme();

    const handleLogout = async () => {
        if (window.confirm('Are you sure you want to logout?')) {
            await authService.logout();
        }
    };

    const navLinks = [
        { path: '/', label: 'Dashboard', icon: LayoutDashboard },
        { path: '/history', label: 'History', icon: History },
    ];

    // Conditionally include Admin link for administrator only
    if (isUserAdmin) {
        navLinks.push({ path: '/admin', label: 'Admin', icon: ShieldCheck });
    }

    return (
        <nav className="sticky top-0 z-50 glass border-b border-border-theme card-shadow h-16 flex items-center justify-between px-6 md:px-12">
            <div className="flex items-center gap-2">
                <Link to="/" className="flex items-center gap-2">
                    <div className="w-9 h-9 bg-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                        <span className="text-white font-bold text-xl leading-none italic">AI</span>
                    </div>
                    <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-700 to-primary-500 hidden sm:block">
                        MockInterview
                    </h1>
                </Link>
            </div>

            <div className="flex items-center gap-6 md:gap-8">
                {user && (
                    <div className="flex items-center gap-4 md:gap-6">
                        {navLinks.map(({ path, label, icon: Icon }) => {
                            const isActive = location.pathname === path;
                            return (
                                <Link
                                    key={path}
                                    to={path}
                                    className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 p-2 rounded-md ${
                                        isActive 
                                        ? 'text-primary-theme bg-primary-theme/10' 
                                        : 'text-text-secondary hover:text-primary-theme hover:bg-accent-theme'
                                    }`}
                                >
                                    <Icon size={18} />
                                    <span className="hidden md:block">{label}</span>
                                </Link>
                            );
                        })}
                    </div>
                )}
                
                {user && <div className="h-6 w-px bg-border-theme hidden sm:block"></div>}
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={toggleTheme}
                        aria-label="Toggle Theme"
                        className="p-2 text-text-secondary hover:text-primary-theme hover:bg-accent-theme rounded-full transition-colors flex items-center justify-center cursor-pointer"
                    >
                        {theme === 'dark' ? <Sun size={20} className="text-amber-400" /> : <Moon size={20} />}
                    </button>
                    
                    {user && (
                        <div className="flex items-center gap-3">
                            <div className="flex flex-col items-end hidden md:flex">
                                <span className="text-xs font-bold text-text-main leading-none">{user.name}</span>
                                <span className="text-[10px] font-medium text-text-secondary capitalize">{isUserAdmin ? 'Platform Administrator' : (user.role || 'Candidate')}</span>
                            </div>
                            <div className="relative group">
                                <div className="w-10 h-10 rounded-full bg-accent-theme border-2 border-border-theme shadow-sm flex items-center justify-center cursor-pointer hover:border-primary-200 transition-all">
                                    {user.picture ? (
                                        <img src={user.picture} alt={user.name} className="w-full h-full rounded-full object-cover" />
                                    ) : (
                                        <User size={20} className="text-text-secondary" />
                                    )}
                                </div>
                                <button 
                                    onClick={handleLogout}
                                    className="absolute top-12 right-0 bg-card border border-border-theme rounded-xl py-2 px-4 shadow-xl text-rose-500 text-xs font-bold flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap hover:bg-rose-50 dark:hover:bg-rose-950/40 border-rose-100 dark:border-rose-900/40"
                                >
                                    <LogOut size={14} /> Logout Session
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;
