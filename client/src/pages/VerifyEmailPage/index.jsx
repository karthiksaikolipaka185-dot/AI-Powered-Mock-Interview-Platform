import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { verifyEmailToken } from '../../services/authService';
import { CheckCircle2, AlertCircle, RefreshCw, ArrowRight, ShieldCheck } from 'lucide-react';

const VerifyEmailPage = () => {
    const { token } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [success, setSuccess] = useState('');
    const [error, setError] = useState('');

    useEffect(() => {
        if (!token) {
            setError('Missing email verification token.');
            setLoading(false);
            return;
        }

        const verify = async () => {
            try {
                const res = await verifyEmailToken(token);
                if (res.success) {
                    setSuccess(res.message || 'Email verified successfully! You may now sign in.');
                } else {
                    setError(res.message || 'Verification failed. The link may be invalid or expired.');
                }
            } catch (err) {
                console.error('Email verification error:', err);
                setError(err.response?.data?.message || 'Verification link is invalid or has expired.');
            } finally {
                setLoading(false);
            }
        };

        verify();
    }, [token]);

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center p-6 bg-background relative overflow-hidden">
            <div className="w-full max-w-md animate-in fade-in zoom-in-95 duration-500">
                <div className="bg-card rounded-3xl border border-border-theme card-shadow p-8 text-center space-y-6">
                    
                    {loading ? (
                        <div className="space-y-4 py-8">
                            <div className="w-16 h-16 bg-primary-theme/10 text-primary-theme rounded-2xl flex items-center justify-center mx-auto">
                                <RefreshCw size={32} className="animate-spin text-primary-theme" />
                            </div>
                            <h2 className="text-2xl font-extrabold text-text-main">Verifying Email Address...</h2>
                            <p className="text-sm text-text-secondary">Please wait while we validate your verification token.</p>
                        </div>
                    ) : success ? (
                        <div className="space-y-6 py-4">
                            <div className="w-20 h-20 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-3xl flex items-center justify-center mx-auto border border-emerald-500/20 shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-text-main">Account Verified!</h2>
                                <p className="text-text-secondary mt-2 text-sm font-medium leading-relaxed">
                                    {success}
                                </p>
                            </div>

                            <Link
                                to="/auth"
                                className="w-full bg-primary-theme hover:bg-primary-theme-hover text-white rounded-2xl py-3.5 font-extrabold text-base shadow-xl shadow-primary-500/20 transition-all flex items-center justify-center gap-2"
                            >
                                Proceed to Sign In <ArrowRight size={18} />
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-6 py-4">
                            <div className="w-20 h-20 bg-rose-500/10 text-rose-600 dark:text-rose-400 rounded-3xl flex items-center justify-center mx-auto border border-rose-500/20 shadow-lg shadow-rose-500/10">
                                <AlertCircle size={40} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-extrabold text-text-main">Verification Failed</h2>
                                <p className="text-rose-600 dark:text-rose-400 mt-2 text-sm font-bold">
                                    {error}
                                </p>
                            </div>

                            <Link
                                to="/auth"
                                className="w-full bg-primary-theme hover:bg-primary-theme-hover text-white rounded-2xl py-3.5 font-extrabold text-sm transition-all flex items-center justify-center gap-2"
                            >
                                Back to Authentication Page
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
};

export default VerifyEmailPage;
