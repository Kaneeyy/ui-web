
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { Mail, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react';
import { auth } from '../services/firebase';

const ForgotPassword: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;

    setLoading(true);
    setError('');
    try {
      await sendPasswordResetEmail(auth!, email);
      setSent(true);
    } catch (err) {
      setError('Failed to send reset email.');
    }
    setLoading(false);
  };

  return (
    <div className="g3d-auth-bg">
      <div className="w-full max-w-md px-4 py-12 relative z-10 my-auto" style={{ animation: 'g3d-rise .6s ease both' }}>
        <Link to="/login" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="mr-2" size={16} /> Back to Login
        </Link>

        <div className="g3d-auth-card">
          {sent ? (
            <div className="text-center py-8">
              <CheckCircle2 size={48} className="text-success mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2 text-white">Check your email</h2>
              <p className="text-white/50 text-sm mb-6">If an account exists, you will receive reset instructions shortly.</p>
              <Link to="/login" className="text-white hover:underline font-bold">Back to Sign In</Link>
            </div>
          ) : (
            <>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-black mb-2 uppercase tracking-tight text-white">Reset Password</h1>
                <p className="text-white/50 text-sm">Enter your email to receive recovery instructions.</p>
              </div>

              {error && <div className="g3d-auth-error">{error}</div>}

              <form onSubmit={handleReset} className="space-y-6">
                <div>
                  <label className="g3d-auth-label">EMAIL</label>
                  <div className="relative">
                    <input name="email" type="email" required placeholder="name@example.com" className="g3d-auth-input" />
                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
                  </div>
                </div>

                <button disabled={loading} type="submit" className="g3d-auth-btn">
                  {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SEND RESET LINK'}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
