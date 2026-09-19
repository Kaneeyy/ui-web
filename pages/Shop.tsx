
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ref, onValue, set, get } from 'firebase/database';
import { Crown, Coins, MessageSquare, ArrowLeft, Check, Loader2 } from 'lucide-react';
import { auth, db } from '../services/firebase';
import { encrypt, decrypt } from '../services/encryption';
import { Customer, SystemPlan } from '../types';

const Shop: React.FC = () => {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [plans, setPlans] = useState<Record<string, SystemPlan>>({});
  const [loading, setLoading] = useState(false);
  const [buying, setBuying] = useState<string | null>(null);

  useEffect(() => {
    if (!auth?.currentUser?.email || !db) return;
    const emailKey = auth.currentUser.email.replace(/\./g, ',');

    onValue(ref(db, `customers/${emailKey}`), (snap) => {
      setCustomer(decrypt(snap.val()));
    });

    onValue(ref(db, `system/plans`), (snap) => {
      const raw = snap.val() || {};
      const dec: Record<string, SystemPlan> = {};
      Object.keys(raw).forEach(k => {
        const p = decrypt(raw[k]);
        if (p.onSale) dec[k] = p;
      });
      setPlans(dec);
    });
  }, []);

  const buyPlan = async (name: string, plan: SystemPlan) => {
    if (!customer || !auth?.currentUser?.email || !db) return;
    if (customer.credits < plan.creditPrice) {
      alert(`Insufficient credits. You need ${plan.creditPrice} but have ${customer.credits}.`);
      return;
    }

    if (!confirm(`Confirm purchase of ${name} for ${plan.creditPrice} credits?`)) return;

    setBuying(name);
    try {
      const emailKey = auth.currentUser.email.replace(/\./g, ',');
      const updatedCustomer = {
        ...customer,
        credits: customer.credits - plan.creditPrice,
        plan: name
      };
      await set(ref(db, `customers/${emailKey}`), encrypt(updatedCustomer));
      alert('Plan upgraded successfully!');
    } catch (err) {
      alert('Purchase failed.');
    }
    setBuying(null);
  };

  return (
    <div className="g3d-page">
      <nav className="g3d-nav" style={{ position: 'fixed', top: 0, left: 0, right: 0, margin: '20px auto', width: 'calc(100% - 80px)', maxWidth: '1280px', zIndex: 50 }}>
        <Link to="/" className="g3d-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="g3d-mark">KCA</span>
          <span>SHOP</span>
        </Link>
        <div className="g3d-links">
          <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
            <Coins className="w-4 h-4 text-yellow-500" />
            <span className="text-sm font-black text-white">{customer?.credits || 0}</span>
          </div>
          <Link to="/dashboard" className="g3d-login">DASHBOARD</Link>
        </div>
      </nav>

      <main className="pt-32 pb-20 px-8 max-w-7xl mx-auto relative z-10" style={{ animation: 'g3d-rise .8s ease both' }}>
        <div className="text-center mb-16">
          <div className="g3d-eyebrow mb-4">SHOP</div>
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-4 text-white">UPGRADE YOUR INFRASTRUCTURE.</h1>
          <p className="text-white/50 text-lg">Use your credits to unlock premium capacities and features.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {(Object.entries(plans) as [string, SystemPlan][])
            .sort((a, b) => (a[1].order || 0) - (b[1].order || 0))
            .map(([name, plan]) => (
              <div key={name} className="g3d-glass flex flex-col relative overflow-hidden" style={{ padding: 32, transition: '.35s' }}>
                {customer?.plan === name && (
                  <div className="absolute top-4 right-4 bg-success/20 text-success text-[10px] font-black uppercase px-2 py-1 rounded-full">Active</div>
                )}
                <div className="mb-6">
                  <h3 className="text-xl font-black mb-1 text-white">{name}</h3>
                  <div className="text-3xl font-black flex items-center gap-2 text-white">
                    {plan.creditPrice} <span className="text-[10px] text-white/40 font-black uppercase tracking-widest">Credits</span>
                  </div>
                </div>
                <ul className="space-y-4 mb-8 text-sm text-white/50 flex-grow">
                  <li className="flex items-center gap-2 font-bold"><Check size={16} className="text-white" /> Max Apps: {plan.maxApps}</li>
                  <li className="flex items-center gap-2 font-bold"><Check size={16} className="text-white" /> Max Users: {plan.maxUsers}</li>
                  {plan.features?.map(feature => (
                    <li key={feature} className="flex items-center gap-2 font-bold">
                      <Check size={16} className="text-white" />
                      {feature === 'webhooks' && 'Webhooks Support'}
                      {feature === 'multi_app' && 'Multiple Applications'}
                      {feature === 'reseller' && 'Reseller Portal Access'}
                      {feature === 'cloud_vars' && 'Cloud Variables'}
                      {feature === 'user_data' && 'User Data Export'}
                      {!['webhooks', 'multi_app', 'reseller', 'cloud_vars', 'user_data'].includes(feature) && feature}
                    </li>
                  ))}
                  {(!plan.features || plan.features.length === 0) && <li className="text-white/30 italic text-xs">No extra perks</li>}
                </ul>
                <button
                  onClick={() => buyPlan(name, plan)}
                  disabled={customer?.plan === name || buying === name}
                  className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-[10px] transition-all ${customer?.plan === name ? 'bg-white/5 text-white/30 cursor-not-allowed' : 'bg-white text-black hover:bg-[#cfd0ff] active:scale-95'}`}
                  style={customer?.plan !== name && buying !== name ? { boxShadow: '0 10px 28px rgba(99,102,241,.2)' } : {}}
                >
                  {buying === name ? <Loader2 className="animate-spin mx-auto" /> : customer?.plan === name ? 'Current Plan' : 'Purchase with Credits'}
                </button>
              </div>
            ))}
          {Object.keys(plans).length === 0 && (
            <div className="col-span-full py-20 text-center text-white/40 font-bold opacity-50">No plans currently on sale.</div>
          )}
        </div>

        <div className="g3d-glass mt-20 text-center max-w-3xl mx-auto relative overflow-hidden" style={{ padding: 40 }}>
          <h2 className="text-2xl font-black mb-4 uppercase tracking-tight text-white relative z-10">FREE CREDITS AWAIT!</h2>
          <p className="text-white/50 mb-8 text-sm leading-relaxed font-bold relative z-10">Please join our Discord server to earn free credits through daily rewards and community events.</p>
          <a href="https://dsc.gg/tenzoxcode" target="_blank" rel="noopener noreferrer" className="g3d-hero-btn" style={{ textDecoration: 'none' }}>
            <MessageSquare size={16} /> JOIN COMMUNITY
          </a>
        </div>
      </main>
    </div>
  );
};

export default Shop;
