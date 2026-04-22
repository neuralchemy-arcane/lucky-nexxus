import { useEffect } from 'react';
import OrbVisualizer from './components/effects/OrbVisualizer';
import HeroSection from './sections/HeroSection';
import AlgorithmSection from './sections/AlgorithmSection';
import PredictionsHub from './sections/PredictionsHub';
import FrequencyMatrix from './sections/FrequencyMatrix';
import ProbabilityPulse from './sections/ProbabilityPulse';
import HotColdSection from './sections/HotColdSection';
import Footer from './sections/Footer';

function App() {
  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const anchor = target.closest('a[href^="#"]');
      if (anchor) {
        e.preventDefault();
        const id = anchor.getAttribute('href');
        if (id) {
          const element = document.querySelector(id);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
          }
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  return (
    <div className="relative min-h-screen" style={{ background: '#0B0C10' }}>
      {/* Three.js Background Orb */}
      <OrbVisualizer />

      {/* Noise texture overlay */}
      <div
        className="fixed inset-0 pointer-events-none z-[1] opacity-30"
        style={{
          backgroundImage: 'url(/noise-texture.jpg)',
          backgroundRepeat: 'repeat',
          backgroundSize: '200px',
          mixBlendMode: 'overlay',
        }}
      />

      {/* Content */}
      <div className="relative z-10">
        <HeroSection />
        <AlgorithmSection />
        <PredictionsHub />
        <FrequencyMatrix />
        <ProbabilityPulse />
        <HotColdSection />
        <Footer />
      </div>
    </div>
  );
}

export default App;
