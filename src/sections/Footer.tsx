import { Brain, AlertTriangle } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="relative z-10 py-16 px-4" style={{ background: '#0B0C10', borderTop: '1px solid #2A3A4B' }}>
      <div className="max-w-6xl mx-auto">
        {/* Disclaimer */}
        <div
          className="flex items-start gap-4 p-6 rounded-xl mb-12"
          style={{
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.2)',
          }}
        >
          <AlertTriangle size={24} style={{ color: '#ef4444', flexShrink: 0, marginTop: 2 }} />
          <div>
            <h4 className="text-sm font-semibold mb-2" style={{ color: '#ef4444' }}>
              Responsible Gaming Disclaimer
            </h4>
            <p className="text-sm leading-relaxed" style={{ color: '#8A95A5' }}>
              Lottery draws are inherently random and independent events. No prediction model can guarantee winning numbers.
              This tool uses statistical analysis to identify patterns in historical data, but past performance does not guarantee future results.
              Please play responsibly. Lottery should be treated as entertainment, not investment.
              If you or someone you know has a gambling problem, please call the National Responsible Gambling Programme on 0800 006 008.
            </p>
          </div>
        </div>

        {/* Footer Content */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="Lucky Nexus" className="w-10 h-10" />
            <div>
              <span
                className="text-lg font-bold"
                style={{
                  fontFamily: "'Space Grotesk', sans-serif",
                  background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Lucky Nexus
              </span>
              <p className="text-xs" style={{ color: '#8A95A5' }}>
                AI-Powered Lottery Analysis
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Brain size={14} style={{ color: '#45A29E' }} />
            <span className="text-xs font-mono" style={{ color: '#8A95A5' }}>
              Powered by Chrono-Probability Engine v2.6
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: '#22c55e' }} />
            <span className="text-xs font-mono" style={{ color: '#22c55e' }}>
              Auto-Update Ready
            </span>
          </div>

          <div className="text-xs" style={{ color: '#8A95A5' }}>
            Data: 2000-2026 | {new Date().toLocaleDateString('en-ZA')}
          </div>
        </div>
      </div>
    </footer>
  );
}
