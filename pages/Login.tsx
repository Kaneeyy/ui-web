
import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup, GithubAuthProvider, onAuthStateChanged } from 'firebase/auth';
import { Mail, Lock, Loader2, ArrowLeft, Github, CheckCircle2 } from 'lucide-react';
import { ref, get, set } from 'firebase/database';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import Turnstile from '../components/Turnstile';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { discordId } = useParams<{ discordId: string }>();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);

  const linkDiscord = async (email: string, dId: string) => {
    try {
      const emailKey = email.replace(/\./g, ',');
      const snap = await get(ref(db, `customers/${emailKey}`));
      if (snap.exists()) {
        const current = decrypt(snap.val());
        if (current && typeof current === 'object') {
          await set(ref(db, `customers/${emailKey}`), encrypt({
            ...current,
            discordId: dId
          }));
        }
      }
    } catch (err) {
      console.error("Failed to link Discord:", err);
    }
  };

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        if (discordId && user.email) {
          await linkDiscord(user.email, discordId);
          setShowSuccess(true);
          return;
        }
        navigate('/dashboard');
      }
    });
    return unsubscribe;
  }, [navigate, discordId]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const email = data.get('email') as string;
    const password = data.get('password') as string;

    setLoading(true);
    setError('');

    if (!turnstileToken) {
      setError("Please complete the security check.");
      setLoading(false);
      return;
    }

    try {
      const res = await signInWithEmailAndPassword(auth!, email, password);
      if (discordId && res.user.email) {
        await linkDiscord(res.user.email, discordId);
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      let msg = "Failed to login.";
      if (err.code === "auth/invalid-credential") msg = "Invalid email or password.";
      setError(msg);
    }
    setLoading(false);
  };

  const socialLogin = async (provider: any) => {
    if (!turnstileToken) {
      setError("Please complete the security check first.");
      return;
    }

    try {
      const res = await signInWithPopup(auth!, provider);

      if (res.user && res.user.email) {
        const emailKey = res.user.email.replace(/\./g, ',');
        const snap = await get(ref(db, `customers/${emailKey}`));

        if (!snap.exists()) {
          const secret = 'KCA-' + Math.random().toString(36).substring(2, 15).toUpperCase();
          const customer = {
            email: res.user.email,
            secret,
            plan: 'Free Plan',
            credits: 0,
            discordId: discordId || '',
            createdAt: new Date().toISOString()
          };
          await set(ref(db, `customers/${emailKey}`), encrypt(customer));
        } else if (discordId && res.user.email) {
          await linkDiscord(res.user.email, discordId);
        }
      }

      if (discordId) {
        setShowSuccess(true);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError("Social sign-in failed.");
    }
  };

  return (
    <div className="g3d-auth-bg">
      <div className="w-full max-w-md px-4 py-12 relative z-10 my-auto">
        <Link to="/" className="inline-flex items-center text-sm text-white/50 hover:text-white mb-8 transition-colors">
          <ArrowLeft className="mr-2" size={16} /> Back to Home
        </Link>

        <div className="g3d-auth-card">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold mb-2 text-white">Welcome Back</h1>
            <p className="text-white/50 text-sm">Login to continue managing your apps.</p>
          </div>

          {error && <div className="g3d-auth-error">{error}</div>}

          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="g3d-auth-label">Email</label>
              <div className="relative">
                <input name="email" type="email" required placeholder="name@example.com" className="g3d-auth-input" />
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              </div>
            </div>

            <div>
              <label className="g3d-auth-label">Password</label>
              <div className="relative">
                <input name="password" type="password" required placeholder="••••••••" className="g3d-auth-input" />
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40" size={18} />
              </div>
              <div className="flex justify-end text-xs mt-3">
                <Link to="/forgot-password" className="text-white/50 hover:text-white transition-colors">Forgot Password?</Link>
              </div>
            </div>

            <Turnstile onVerify={setTurnstileToken} onExpire={() => setTurnstileToken(null)} />

            <button disabled={loading || !turnstileToken} type="submit" className="g3d-auth-btn">
              {loading ? <Loader2 className="animate-spin mx-auto" /> : 'SIGN IN'}
            </button>
          </form>

          <div className="g3d-auth-divider">
            <div className="g3d-auth-divider-line" />
            <div className="g3d-auth-divider-text"><span>OR CONTINUE WITH</span></div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => socialLogin(new GoogleAuthProvider())} className="g3d-auth-social">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.84z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Google
            </button>
            <button onClick={() => socialLogin(new GithubAuthProvider())} className="g3d-auth-social">
              <Github size={20} /> GitHub
            </button>
          </div>

          <p className="text-center mt-8 text-sm text-white/50">
            Don't have an account? <Link to="/signup" className="text-white font-medium hover:underline">Create one</Link>
          </p>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" style={{ animation: 'g3d-fade .3s ease' }}>
          <div className="w-full max-w-sm glass p-8 text-center relative" style={{ animation: 'g3d-rise .4s ease', borderRadius: 30 }}>
            <div className="w-20 h-20 bg-success/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="text-success" size={40} />
            </div>
            <h2 className="text-2xl font-bold mb-2 text-white">Linking Successful!</h2>
            <p className="text-white/50 mb-8 leading-relaxed">Your Discord account has been successfully linked to your KCA profile.</p>
            <button onClick={() => navigate('/dashboard')} className="g3d-auth-btn">ENTER DASHBOARD</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;
