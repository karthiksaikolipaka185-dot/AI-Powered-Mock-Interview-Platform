import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../../services/authService';
import { 
    Mail, 
    Lock, 
    User as UserIcon, 
    LogIn, 
    UserPlus, 
    ArrowRight,
    AlertCircle,
    CheckCircle2
} from 'lucide-react';

const GoogleIcon = () => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
    </svg>
);

const AuthPage = () => {
    const navigate = useNavigate();
    const [isLogin, setIsLogin] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            let response;
            if (isLogin) {
                // Remove name from payload if logging in
                const { email, password } = formData;
                response = await authService.login({ email, password });
            } else {
                response = await authService.register(formData);
            }

            if (response.success) {
                setSuccess(isLogin ? 'Login successful!' : 'Account created successfully!');
                setTimeout(() => {
                    navigate('/');
                }, 1500);
            } else {
                setError(response.message || 'Authentication failed');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'An unexpected error occurred. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        // Placeholder for Google OAuth logic integration
        alert('Google OAuth integration is being initialized. Please use Email/Password for now.');
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-slate-50 relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-white rounded-3xl border border-slate-200 card-shadow overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-4 text-center">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
                            {isLogin ? <LogIn className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
                        </div>
                        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-slate-500 mt-2 font-medium">
                            {isLogin ? 'Sign in to continue your interview practice' : 'Create an account to start your AI journey'}
                        </p>
                    </div>

                    {/* Form Area */}
                    <div className="p-8 pt-4">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 border border-rose-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm font-bold text-rose-600">{error}</p>
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                <CheckCircle2 className="text-emerald-500 shrink-0 mt-0.5" size={18} />
                                <p className="text-sm font-bold text-emerald-600">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserIcon className="text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white transition-all font-medium text-slate-800"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    </div>
                                    <input 
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="name@company.com"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-widest">Password</label>
                                    {isLogin && (
                                        <button type="button" className="text-[10px] font-bold text-primary-600 hover:text-primary-700 tracking-tight">Forgot?</button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-slate-400 group-focus-within:text-primary-500 transition-colors" size={18} />
                                    </div>
                                    <input 
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-slate-50 border-2 border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-500 focus:bg-white transition-all font-medium text-slate-800"
                                    />
                                </div>
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary-600 text-white rounded-2xl py-4 font-extrabold text-lg shadow-xl shadow-primary-500/20 hover:bg-primary-700 active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
                            >
                                {loading ? (
                                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        {isLogin ? 'Sign In Now' : 'Create My Account'}
                                        <ArrowRight size={20} />
                                    </>
                                )}
                            </button>
                        </form>

                        {/* Divider */}
                        <div className="relative my-8">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-slate-100"></div>
                            </div>
                            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                                <span className="bg-white px-4 text-slate-300">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <button 
                            type="button"
                            onClick={handleGoogleLogin}
                            className="w-full bg-white border border-slate-200 rounded-2xl py-3.5 font-bold text-slate-700 hover:bg-slate-50 active:scale-[0.98] transition-all flex items-center justify-center gap-3 card-shadow-sm"
                        >
                            <GoogleIcon />
                            Google Account
                        </button>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-slate-50/50 border-t border-slate-100 text-center">
                        <p className="text-sm font-medium text-slate-500">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button 
                                onClick={() => setIsLogin(!isLogin)} 
                                className="text-primary-600 font-extrabold hover:text-primary-700 hover:underline transition-all"
                            >
                                {isLogin ? 'Sign Up Free' : 'Sign In'}
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;
