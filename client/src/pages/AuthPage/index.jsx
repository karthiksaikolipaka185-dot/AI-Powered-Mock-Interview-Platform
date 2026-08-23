import React, { useState, useEffect } from 'react';
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
    CheckCircle2,
    ShieldCheck,
    MailCheck
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
    const [resendLoading, setResendLoading] = useState(false);
    const [resendCooldown, setResendCooldown] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: ''
    });

    // Cooldown Timer Effect
    useEffect(() => {
        let timer;
        if (resendCooldown > 0) {
            timer = setInterval(() => {
                setResendCooldown((prev) => prev - 1);
            }, 1000);
        }
        return () => clearInterval(timer);
    }, [resendCooldown]);

    // Handle Resend Email Verification Token
    const handleResendVerification = async () => {
        if (resendCooldown > 0 || !formData.email) return;
        
        if (!isValidEmail(formData.email)) {
            setError('Please enter your email address to request a verification link.');
            return;
        }

        setResendLoading(true);
        setError('');
        setSuccess('');

        try {
            const res = await authService.resendVerificationEmail(formData.email);
            if (res.success) {
                setSuccess(res.message || 'A new verification email has been sent to your address.');
                setResendCooldown(60);
            } else {
                setError(res.message || 'Failed to resend verification email.');
            }
        } catch (err) {
            console.error('Resend error:', err);
            const errMsg = err.response?.data?.message || 'Failed to resend verification email. Please try again.';
            setError(errMsg);
            if (err.response?.status === 429) {
                setResendCooldown(60);
            }
        } finally {
            setResendLoading(false);
        }
    };

    // Email RFC Validation Regex
    const isValidEmail = (email) => {
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email.trim());
    };

    // Password Policy Checkers
    const passwordRequirements = [
        { label: 'At least 8 characters', check: (p) => p.length >= 8 },
        { label: 'One uppercase letter (A-Z)', check: (p) => /[A-Z]/.test(p) },
        { label: 'One lowercase letter (a-z)', check: (p) => /[a-z]/.test(p) },
        { label: 'One number (0-9)', check: (p) => /[0-9]/.test(p) },
        { label: 'One special character (!@#$%^&*)', check: (p) => /[!@#$%^&*(),.?":{}|<>]/.test(p) },
    ];

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        // 1. Frontend Email Format Validation
        if (!isValidEmail(formData.email)) {
            setError('Please enter a valid RFC-compliant email address (e.g. name@domain.com).');
            setLoading(false);
            return;
        }

        // 2. Frontend Password Policy Validation on Registration
        if (!isLogin) {
            const failedReq = passwordRequirements.find(r => !r.check(formData.password));
            if (failedReq) {
                setError(`Password error: ${failedReq.label}`);
                setLoading(false);
                return;
            }
        }

        try {
            let response;
            if (isLogin) {
                const { email, password } = formData;
                response = await authService.login({ email, password });
                if (response.success) {
                    setSuccess('Login successful!');
                    setTimeout(() => {
                        navigate('/');
                    }, 1000);
                }
            } else {
                response = await authService.register(formData);
                if (response.success) {
                    setSuccess(response.message || 'Account created successfully! Please check your email inbox to verify your account.');
                    setIsLogin(true); // Switch to login view
                    setFormData({ name: '', email: formData.email, password: '' });
                }
            }
        } catch (err) {
            console.error('Auth error:', err);
            setError(err.response?.data?.message || 'An unexpected authentication error occurred.');
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleCredentialResponse = async (response) => {
        console.log("Receiving credential");
        console.log('[Google Auth] handleGoogleCredentialResponse triggered.');
        if (!response || !response.credential) {
            console.error('[Google Auth] Missing credential in Google response.');
            setError('Google login failed: Missing credentials from Google.');
            return;
        }

        setLoading(true);
        setError('');
        setSuccess('');

        try {
            const credential = response.credential;
            console.log("Sending credential to backend");
            console.log('[Google Auth] Sending ID Token to backend...');
            const res = await authService.googleLogin(credential);
            console.log('[Google Auth] Backend response:', res);
            if (res.success) {
                console.log("JWT received");
                setSuccess('Google login successful!');
                console.log("Dashboard redirect");
                setTimeout(() => {
                    navigate('/');
                }, 1000);
            } else {
                setError(res.message || 'Google authentication failed.');
            }
        } catch (err) {
            console.error('[Google Auth] Google login API error:', err);
            setError(err.response?.data?.message || 'Google login failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        console.log('[Google Auth] useEffect triggered. isLogin =', isLogin);
        
        // Window blur listener to capture GSI iframe clicks programmatically
        const handleWindowBlur = () => {
            if (document.activeElement && document.activeElement.tagName === 'IFRAME') {
                const parent = document.activeElement.parentElement;
                if (parent && parent.id === 'google-signin-btn-container') {
                    console.log("Google button clicked");
                    console.log("Button clicked");
                    console.log("Launching OAuth");
                }
            }
        };
        window.addEventListener('blur', handleWindowBlur);

        const initGoogleSignIn = () => {
            console.log('[Google Auth] Checking Google Identity Services availability...');
            console.log("Google SDK loaded");
            console.log(`window.google loaded: ${Boolean(window.google)}`);
            if (window.google) {
                console.log(`window.google.accounts loaded: ${Boolean(window.google.accounts)}`);
                console.log(`window.google.accounts.id loaded: ${Boolean(window.google.accounts.id)}`);
                
                const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '926554878988-iul14fcuh97hbkpqn2222753b0ib84vm.apps.googleusercontent.com';
                console.log(`VITE_GOOGLE_CLIENT_ID loaded: ${Boolean(import.meta.env.VITE_GOOGLE_CLIENT_ID)}`);
                
                console.log("Initializing GSI");
                if (!window.googleSignInInitialized) {
                    console.log('[Google Auth] Calling google.accounts.id.initialize...');
                    window.google.accounts.id.initialize({
                        client_id: clientId,
                        callback: handleGoogleCredentialResponse
                    });
                    window.googleSignInInitialized = true;
                }

                const container = document.getElementById('google-signin-btn-container');
                if (container) {
                    console.log("Rendering button");
                    console.log('[Google Auth] Rendering official Google button inside container...');
                    // Clear previous iframe components to prevent duplicates
                    container.innerHTML = '';
                    
                    window.google.accounts.id.renderButton(container, {
                        theme: 'outline',
                        size: 'large',
                        width: 382, // Fixed width for stability
                        text: 'continue_with',
                        logo_alignment: 'left'
                    });
                    console.log('[Google Auth] Google button successfully rendered.');
                } else {
                    console.warn('[Google Auth] google-signin-btn-container element not found in DOM.');
                }
            } else {
                console.warn('[Google Auth] window.google is not available during init.');
            }
        };

        if (window.google) {
            initGoogleSignIn();
        } else {
            let script = document.getElementById('google-gsi-client-script');
            if (!script) {
                console.log('[Google Auth] Creating script tag for GSI client...');
                script = document.createElement('script');
                script.id = 'google-gsi-client-script';
                script.src = 'https://accounts.google.com/gsi/client';
                script.async = true;
                script.defer = true;
                script.onload = () => {
                    console.log('[Google Auth] GSI client script loaded successfully.');
                    initGoogleSignIn();
                };
                document.head.appendChild(script);
            } else {
                console.log('[Google Auth] GSI script tag already exists.');
                script.onload = () => {
                    console.log('[Google Auth] GSI client script onload triggered (existing script).');
                    initGoogleSignIn();
                };
            }
        }

        return () => {
            window.removeEventListener('blur', handleWindowBlur);
        };
    }, [isLogin]);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
            {/* Decorative Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-primary-500/5 rounded-full blur-[120px]"></div>
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-emerald-500/5 rounded-full blur-[120px]"></div>
            </div>

            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-card rounded-3xl border border-border-theme card-shadow overflow-hidden">
                    {/* Header */}
                    <div className="p-8 pb-4 text-center">
                        <div className="w-16 h-16 bg-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-primary-500/20">
                            {isLogin ? <LogIn className="text-white" size={32} /> : <UserPlus className="text-white" size={32} />}
                        </div>
                        <h2 className="text-3xl font-extrabold text-text-main tracking-tight">
                            {isLogin ? 'Welcome Back' : 'Get Started'}
                        </h2>
                        <p className="text-text-secondary mt-2 font-medium">
                            {isLogin ? 'Sign in to continue your interview practice' : 'Create an account to start your AI journey'}
                        </p>
                    </div>

                    {/* Form Area */}
                    <div className="p-8 pt-4">
                        {error && (
                            <div className="mb-6 p-4 bg-rose-50 dark:bg-rose-950/40 border border-rose-100 dark:border-rose-900/60 rounded-2xl flex flex-col gap-2.5 animate-in slide-in-from-top-2 duration-300">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-rose-500 shrink-0 mt-0.5" size={18} />
                                    <p className="text-xs font-bold text-rose-600 dark:text-rose-400">{error}</p>
                                </div>
                                {error.toLowerCase().includes('verify your email') && (
                                    <button
                                        type="button"
                                        onClick={handleResendVerification}
                                        disabled={resendLoading || resendCooldown > 0}
                                        className="text-xs font-extrabold text-primary-theme hover:text-primary-theme-hover hover:underline transition-all flex items-center gap-1.5 ml-7 text-left disabled:opacity-50"
                                    >
                                        <MailCheck size={14} />
                                        {resendLoading 
                                            ? 'Sending verification email...' 
                                            : resendCooldown > 0 
                                                ? `Resend link in ${resendCooldown}s` 
                                                : 'Click here to resend verification email'
                                        }
                                    </button>
                                )}
                            </div>
                        )}

                        {success && (
                            <div className="mb-6 p-4 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100 dark:border-emerald-900/60 rounded-2xl flex items-start gap-3 animate-in slide-in-from-top-2 duration-300">
                                <MailCheck className="text-emerald-500 shrink-0 mt-0.5" size={20} />
                                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">{success}</p>
                            </div>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-4">
                            {!isLogin && (
                                <div className="space-y-1.5">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Full Name</label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <UserIcon className="text-text-secondary group-focus-within:text-primary-theme transition-colors" size={18} />
                                        </div>
                                        <input 
                                            type="text"
                                            name="name"
                                            required={!isLogin}
                                            value={formData.name}
                                            onChange={handleChange}
                                            placeholder="John Doe"
                                            className="w-full bg-accent-theme border-2 border-border-theme rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-theme focus:bg-surface transition-all font-medium text-text-main placeholder-text-secondary/50"
                                        />
                                    </div>
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold text-text-secondary uppercase tracking-widest ml-1">Email Address</label>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Mail className="text-text-secondary group-focus-within:text-primary-theme transition-colors" size={18} />
                                    </div>
                                    <input 
                                        type="email"
                                        name="email"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        placeholder="john@gmail.com"
                                        className="w-full bg-accent-theme border-2 border-border-theme rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-theme focus:bg-surface transition-all font-medium text-text-main placeholder-text-secondary/50"
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center ml-1">
                                    <label className="text-xs font-bold text-text-secondary uppercase tracking-widest">Password</label>
                                    {isLogin && (
                                        <button type="button" className="text-[10px] font-bold text-primary-theme hover:text-primary-theme-hover tracking-tight">Forgot?</button>
                                    )}
                                </div>
                                <div className="relative group">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Lock className="text-text-secondary group-focus-within:text-primary-theme transition-colors" size={18} />
                                    </div>
                                    <input 
                                        type="password"
                                        name="password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        placeholder="••••••••"
                                        className="w-full bg-accent-theme border-2 border-border-theme rounded-2xl py-3.5 pl-12 pr-4 outline-none focus:border-primary-theme focus:bg-surface transition-all font-medium text-text-main placeholder-text-secondary/50"
                                    />
                                </div>

                                {/* Password Policy Checklist on Signup */}
                                {!isLogin && formData.password.length > 0 && (
                                    <div className="p-3 bg-accent-theme rounded-xl border border-border-theme text-[11px] space-y-1 mt-2">
                                        <span className="font-bold text-text-secondary block mb-1">Password Requirements:</span>
                                        {passwordRequirements.map((req, idx) => {
                                            const met = req.check(formData.password);
                                            return (
                                                <div key={idx} className={`flex items-center gap-1.5 font-medium ${met ? 'text-emerald-600 dark:text-emerald-400' : 'text-text-secondary'}`}>
                                                    {met ? <CheckCircle2 size={12} /> : <div className="w-1.5 h-1.5 rounded-full bg-text-secondary/40 ml-1"></div>}
                                                    <span>{req.label}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>

                            <button 
                                type="submit" 
                                disabled={loading}
                                className="w-full bg-primary-theme text-white rounded-2xl py-4 font-extrabold text-lg shadow-xl shadow-primary-500/20 hover:bg-primary-theme-hover active:scale-[0.98] transition-all flex items-center justify-center gap-2 mt-4 disabled:opacity-70"
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
                                <div className="w-full border-t border-border-theme"></div>
                            </div>
                            <div className="relative flex justify-center text-xs font-bold uppercase tracking-widest">
                                <span className="bg-card px-4 text-text-secondary/60">Or continue with</span>
                            </div>
                        </div>

                        {/* Social Buttons */}
                        <div className="w-full flex justify-center mt-2" onClick={() => console.log('Google button clicked')}>
                            <div 
                                id="google-signin-btn-container"
                                className="w-full flex justify-center"
                            ></div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-accent-theme/30 border-t border-border-theme text-center">
                        <p className="text-sm font-medium text-text-secondary">
                            {isLogin ? "Don't have an account?" : "Already have an account?"}{' '}
                            <button 
                                onClick={() => { setIsLogin(!isLogin); setError(''); setSuccess(''); }} 
                                className="text-primary-theme font-extrabold hover:text-primary-theme-hover hover:underline transition-all"
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
