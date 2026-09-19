
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

const TOS: React.FC = () => {
  return (
    <div className="g3d-auth-bg">
      <div className="w-full max-w-3xl px-6 py-20 relative z-10" style={{ animation: 'g3d-rise .8s ease both' }}>
        <Link to="/" className="inline-flex items-center text-sm text-white/50 hover:text-white transition-colors mb-8">
          <ArrowLeft className="mr-2" size={16} /> Back to Home
        </Link>

        <header className="mb-12">
          <div className="g3d-eyebrow mb-4">LEGAL</div>
          <h1 className="text-5xl font-black mb-4 uppercase tracking-tighter text-white">Terms of Service</h1>
          <p className="text-white/50 font-bold">Last updated: December 2025</p>
        </header>

        <div className="g3d-glass space-y-8 text-white/50 leading-relaxed font-medium" style={{ padding: 40 }}>
          <section>
            <h2 className="text-lg font-black text-white mb-4 uppercase tracking-widest">1. Acceptance of Terms</h2>
            <p>By using KCA (TenzoxAuthentication), you agree to these terms. Our software utilizes AES-256 encryption for data security. We do not claim "military-grade" encryption, but industry-standard cryptographic methods.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-4 uppercase tracking-widest">2. Use License</h2>
            <p>Permission is granted to use KCA for software licensing management. You may not reverse engineer our authentication protocols or attempt to exploit our database infrastructure.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-4 uppercase tracking-widest">3. Disclaimer</h2>
            <p>KCA Security is a new platform under active development. While we strive for 99.9% uptime, we are not responsible for any data loss during the early access phase.</p>
          </section>

          <section>
            <h2 className="text-lg font-black text-white mb-4 uppercase tracking-widest">4. Limitations</h2>
            <p>In no event shall KCA or its developers be liable for damages arising out of the use or inability to use the platform. Use at your own risk during this work-in-progress period.</p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default TOS;
