
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Shield, Lock, Zap, Code, Cloud, BarChart3,
  ChevronRight, Menu, X, Github, ArrowRight,
  ShieldCheck, Activity, Cpu, Globe, Users,
  Terminal, Layers, MessageSquare, ExternalLink,
  ChevronDown, Monitor, CheckCircle2
} from 'lucide-react';
import { ref, get } from 'firebase/database';
import { db } from '../services/firebase';

const Landing: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);

    const fetchUserCount = async () => {
      try {
        const statsRef = ref(db, 'system/stats');
        const snapshot = await get(statsRef);
        if (snapshot.exists()) {
          const data = snapshot.val();
          setTotalUsers(data.totalUsers || 0);
        }
      } catch (err) {
        console.error('Failed to fetch user count:', err);
      }
    };
    fetchUserCount();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const features = [
    { icon: <Lock className="w-5 h-5" />, title: 'HWID LOCK', desc: 'Secure hardware-bound licensing prevents account sharing and unauthorized access.' },
    { icon: <Monitor className="w-5 h-5" />, title: 'ADMIN CONTROLS', desc: 'Powerful dashboard to manage users, licenses, and application settings in real-time.' },
    { icon: <MessageSquare className="w-5 h-5" />, title: 'LOGS & ALERTS', desc: 'Real-time notifications and audit logs for every system event and security breach.' },
    { icon: <Shield className="w-5 h-5" />, title: 'SERVER VALIDATION', desc: 'All critical checks occur in our secure cloud environment, immune to client-side manipulation.' },
    { icon: <Terminal className="w-5 h-5" />, title: 'NATIVE SDKS', desc: 'One-line integration for all major languages with our high-perfomance, lightweight libraries.' },
    { icon: <CheckCircle2 className="w-5 h-5" />, title: 'EASY API', desc: 'Simple yet powerful REST API for custom integrations and automated workflows.' },
  ];

  const stats = [
    { label: 'TOTAL UNITS', val: totalUsers > 0 ? totalUsers.toLocaleString() : '10,000+' },
    { label: 'ACTIVE USERS', val: '99.9%' },
    { label: 'LIFETIME USERS', val: '50ms' },
    { label: 'HWID LOCKED', val: 'AES-256' },
  ];

  return (
    <div className="g3d-page">
      {/* Navigation */}
      <nav className="g3d-nav" style={isScrolled ? { position: 'fixed', top: 0, left: 0, right: 0, margin: '20px auto', width: 'calc(100% - 80px)', maxWidth: '1280px', zIndex: 50 } : {}}>
        <Link to="/" className="g3d-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="g3d-mark">KCA</span>
          <span>KCA KAMIL CHEATS AUTH</span>
        </Link>

        <div className="g3d-links">
          <Link to="/shop">SHOP</Link>
          <Link to="/tos">TERMS</Link>
          <Link to="/docs">DOCUMENTATION</Link>
          <Link to="/login" className="g3d-login">LOG IN</Link>
          <Link to="/signup" className="g3d-signup">SIGN UP</Link>
        </div>

        <button className="lg:hidden text-white p-2" onClick={() => setIsMenuOpen(!isMenuOpen)}>
          {isMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>

        {isMenuOpen && (
          <div className="lg:hidden absolute top-full left-0 right-0 mt-4 g3d-glass p-8 flex flex-col gap-6" style={{ borderRadius: 22 }}>
            {['Shop', 'TOS', 'Docs'].map((item) => (
              <Link key={item} to={`/${item.toLowerCase()}`} className="text-xs font-bold uppercase tracking-widest text-white/60 hover:text-white" onClick={() => setIsMenuOpen(false)}>
                {item === 'TOS' ? 'Terms' : item === 'Docs' ? 'Documentation' : item}
              </Link>
            ))}
            <hr className="border-white/5" />
            <Link to="/login" className="text-xs font-bold uppercase tracking-widest text-white" onClick={() => setIsMenuOpen(false)}>Log In</Link>
            <Link to="/signup" className="g3d-signup" style={{ justifyContent: 'center' }} onClick={() => setIsMenuOpen(false)}>GET STARTED</Link>
          </div>
        )}
      </nav>

      {/* Hero */}
      <section className="g3d-hero">
        <div className="g3d-hero-text">
          <span className="g3d-badge">AUTHENTICATION V2.0 IS LIVE</span>
          <h1>AUTH MADE <span>FOR EVERYONE!</span></h1>
          <p>Secure, scalable, and game-changing authentication for your applications. Get started in minutes with our powerful APIs and SDKs.</p>
          <div className="g3d-hero-actions">
            <Link to="/signup" className="g3d-hero-btn">START BUILDING <b>→</b></Link>
            <a href="#features" className="g3d-hero-btn g3d-secondary" style={{ textDecoration: 'none' }}>LEARN MORE</a>
          </div>
        </div>
        <div className="g3d-preview-wrap">
          <div className="g3d-preview">
            <img src="https://media.base44.com/images/public/6aae9f1d62588679b9d04522/a118f8389_generated_25880c04.jpg" alt="Dashboard Preview" />
            <div className="g3d-float-card">
              <ShieldCheck size={28} />
              <div style={{ marginTop: 8 }}>HWID LOCKED</div>
            </div>
          </div>
        </div>
      </section>

      {/* Languages */}
      <section className="g3d-section g3d-languages">
        <div className="g3d-eyebrow">INTEGRATE INTO ANY PROGRAMMING LANGUAGE</div>
        <div className="g3d-language-row">
          {['C++', 'C#', 'Python', 'Go', 'Rust', 'JS', 'Java'].map((lang) => (
            <span key={lang}>{lang}</span>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="g3d-section">
        <div className="g3d-stats g3d-reveal">
          {stats.map((stat, i) => (
            <div key={i} className={`g3d-glass g3d-stat ${i === 1 ? 'g3d-r2' : i === 2 ? 'g3d-r3' : ''}`}>
              <div className="g3d-stat-label">{stat.label}</div>
              <div className="g3d-stat-value">{stat.val}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section id="features" className="g3d-section">
        <div className="g3d-feature-intro g3d-reveal">
          <div className="g3d-eyebrow">FEATURES</div>
          <h2>EVERYTHING YOU NEED <span>TO SUCCEED.</span></h2>
          <p>A comprehensive suite of integrated tools for authentication, monetization, and user engagement.</p>
        </div>
        <div className="g3d-features">
          {features.map((f, i) => (
            <div key={i} className={`g3d-glass g3d-feature g3d-reveal ${i % 3 === 1 ? 'g3d-r2' : i % 3 === 2 ? 'g3d-r3' : ''}`}>
              <div className="g3d-icon">{f.icon}</div>
              <h3>{f.title}</h3>
              <p>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Notice */}
      <section className="g3d-section">
        <div className="g3d-glass g3d-notice g3d-reveal">
          <div className="g3d-notice-icon">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <h3>WE ARE AN AUTHENTICATION SERVICE</h3>
            <div className="g3d-notice-grid">
              <div>
                <p>WHAT KCA PROVIDES</p>
                <ul>
                  <li>License & Key Management</li>
                  <li>HWID Device Binding</li>
                  <li>Server-side Validation</li>
                </ul>
              </div>
              <div>
                <p>YOUR RESPONSIBILITIES</p>
                <ul>
                  <li>Integrate Server Checks</li>
                  <li>Use Obfuscation if needed</li>
                  <li>Handle Client-side Anti-tamper</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="g3d-cta">
        <div className="g3d-cta-content">
          <h2>MODERNIZE YOUR <span>AUTHENTICATION.</span></h2>
          <p>Ready to take your software security to the next level? Join the industry standard.</p>
          <Link to="/signup" className="g3d-hero-btn" style={{ textDecoration: 'none' }}>GET STARTED NOW <b>→</b></Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="g3d-footer">
        <div className="g3d-footer-grid">
          <div>
            <Link to="/" className="g3d-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
              <span className="g3d-mark">KCA</span>
              <span>KCA KAMIL CHEATS AUTH</span>
            </Link>
            <p>Empowering developers with world-class software protection and licensing architectures. Built for the modern threat landscape.</p>
            <div className="g3d-social">
              <a href="https://github.com/tenzoxcode" target="_blank" rel="noopener noreferrer"><Github size={18} /></a>
              <a href="https://dsc.gg/tenzoxcode" target="_blank" rel="noopener noreferrer"><MessageSquare size={18} /></a>
              <a href="#" rel="noopener noreferrer"><Globe size={18} /></a>
            </div>
          </div>
          <div>
            <h4>NAVIGATION</h4>
            <div className="g3d-footer-links">
              <Link to="/shop">SHOP</Link>
              <Link to="/tos">TERMS OF SERVICE</Link>
              <Link to="/docs">DOCUMENTATION</Link>
            </div>
          </div>
          <div>
            <h4>COMPANY</h4>
            <div className="g3d-footer-links">
              <a href="#">ABOUT US</a>
              <a href="#">STATUS PAGE</a>
              <a href="https://dsc.gg/tenzoxcode" target="_blank" rel="noopener noreferrer">SUPPORT</a>
            </div>
          </div>
        </div>
        <div className="g3d-copyright">
          <span>© 2025 KAMIL CHEATS AUTH. OPERATED BY TENZO.</span>
          <span>PRIVACY POLICY　 COOKIE POLICY</span>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
