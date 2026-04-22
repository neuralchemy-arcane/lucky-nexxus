import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

export default function HeroSection() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const luckyRef = useRef<HTMLHeadingElement>(null);
  const nexusRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const [nexusText, setNexusText] = useState('');
  const scrambleStarted = useRef(false);

  useEffect(() => {
    const lucky = luckyRef.current;
    const nexus = nexusRef.current;
    const subtitle = subtitleRef.current;
    if (!lucky || !nexus || !subtitle) return;

    // Initial state
    gsap.set(lucky, { opacity: 1, filter: 'blur(0px)', scale: 1 });
    gsap.set(nexus, { opacity: 0, display: 'none', filter: 'blur(30px)', scale: 0.8 });
    gsap.set(subtitle, { opacity: 0, y: 20 });

    // Timeline
    const tl = gsap.timeline({ delay: 0.5 });

    // Fade in subtitle
    tl.to(subtitle, { opacity: 0.7, y: 0, duration: 1.2, ease: 'power2.out' });

    // After 3 seconds, start the transition
    tl.to(lucky, {
      opacity: 0,
      filter: 'blur(30px)',
      scale: 3.5,
      duration: 1.5,
      ease: 'power2.inOut',
      onComplete: () => {
        gsap.set(lucky, { display: 'none' });
        gsap.set(nexus, { display: 'block' });
        if (!scrambleStarted.current) {
          scrambleStarted.current = true;
          animateNexusText();
        }
      },
    }, '+=1');

    tl.to(nexus, {
      opacity: 1,
      filter: 'blur(0px)',
      scale: 1,
      duration: 1.5,
      ease: 'power2.inOut',
    }, '-=0.3');

    return () => {
      tl.kill();
    };
  }, []);

  function animateNexusText() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const finalText = 'NEXUS';
    let iterations = 0;

    const interval = setInterval(() => {
      const text = finalText
        .split('')
        .map((_letter, index) => {
          if (index < iterations) {
            return finalText[index];
          }
          return chars[Math.floor(Math.random() * 36)];
        })
        .join('');

      setNexusText(text);

      if (iterations >= 12) {
        clearInterval(interval);
        setNexusText(finalText);
      }

      iterations += 1 / 3;
    }, 60);
  }

  return (
    <section
      className="relative flex items-center justify-center min-h-screen"
      style={{ perspective: '1000px' }}
    >
      <div
        ref={wrapperRef}
        className="text-center relative z-10"
        style={{ transformStyle: 'preserve-3d' }}
      >
        <h1
          ref={luckyRef}
          className="text-7xl md:text-9xl font-bold tracking-tight"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(102, 252, 241, 0.3)',
          }}
        >
          LUCKY
        </h1>
        <h1
          ref={nexusRef}
          className="text-7xl md:text-9xl font-bold tracking-tight"
          style={{
            fontFamily: "'Space Grotesk', sans-serif",
            background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textShadow: '0 0 40px rgba(102, 252, 241, 0.3)',
          }}
        >
          {nexusText || 'NEXUS'}
        </h1>
        <p
          ref={subtitleRef}
          className="mt-6 text-lg md:text-xl tracking-widest uppercase"
          style={{ color: '#8A95A5', letterSpacing: '0.2em' }}
        >
          Multi-Model Stochastic Forecasting Engine
        </p>
        <div className="mt-12 flex justify-center gap-4">
          <a
            href="#predictions"
            className="px-8 py-3 rounded-full text-sm font-medium tracking-wider uppercase transition-all duration-300 hover:scale-105"
            style={{
              background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
              color: '#0B0C10',
              boxShadow: '0 0 20px rgba(102, 252, 241, 0.3)',
            }}
          >
            View Predictions
          </a>
          <a
            href="#matrix"
            className="px-8 py-3 rounded-full text-sm font-medium tracking-wider uppercase transition-all duration-300 hover:scale-105 border"
            style={{
              borderColor: '#2A3A4B',
              color: '#C5C6C7',
              background: 'rgba(31, 40, 51, 0.5)',
            }}
          >
            Frequency Matrix
          </a>
        </div>
      </div>
    </section>
  );
}
