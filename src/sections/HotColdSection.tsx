import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePredictions } from '../hooks/usePredictions';
import { Flame, Snowflake } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function NumberStrip({
  numbers,
  label,
  icon: Icon,
  color,
  delay,
}: {
  numbers: number[];
  label: string;
  icon: React.ElementType;
  color: string;
  delay: number;
}) {
  const stripRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const strip = stripRef.current;
    if (!strip) return;

    const items = strip.querySelectorAll('.hotcold-num');
    gsap.fromTo(
      items,
      { opacity: 0, x: -20 },
      {
        opacity: 1,
        x: 0,
        duration: 0.4,
        stagger: 0.05,
        ease: 'power2.out',
        delay,
        scrollTrigger: {
          trigger: strip,
          start: 'top 85%',
        },
      }
    );
  }, [delay]);

  return (
    <div ref={stripRef} className="mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={16} style={{ color }} />
        <span className="text-sm font-medium uppercase tracking-wider" style={{ color }}>
          {label}
        </span>
      </div>
      <div className="flex flex-wrap gap-2">
        {numbers.map((num, i) => (
          <div
            key={num}
            className="hotcold-num w-10 h-10 rounded-lg flex items-center justify-center text-sm font-mono font-bold transition-all duration-300 hover:scale-110 cursor-default"
            style={{
              background: `${color}15`,
              border: `1px solid ${color}40`,
              color,
              boxShadow: `0 0 8px ${color}20`,
              animationDelay: `${i * 0.05}s`,
            }}
          >
            {num}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function HotColdSection() {
  const { data } = usePredictions();
  const sectionRef = useRef<HTMLDivElement>(null);

  const lotto = data?.lotto;

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    gsap.fromTo(
      section.querySelector('.hotcold-content'),
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        },
      }
    );
  }, [data]);

  if (!lotto) return null;

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
      style={{ background: '#1F2833' }}
    >
      <div className="max-w-5xl mx-auto hotcold-content">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Hot Numbers */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'rgba(11, 12, 16, 0.5)',
              border: '1px solid rgba(239, 68, 68, 0.2)',
            }}
          >
            <h3
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
            >
              Hot Numbers
            </h3>
            <p className="text-sm mb-4" style={{ color: '#8A95A5' }}>
              Numbers that appear most frequently across all draws. These have a higher statistical probability of appearing again.
            </p>
            <NumberStrip
              numbers={lotto.hot_numbers}
              label="All-Time Hot"
              icon={Flame}
              color="#ef4444"
              delay={0}
            />
            <NumberStrip
              numbers={lotto.primary.slice(0, 6)}
              label="AI Picks"
              icon={Flame}
              color="#f97316"
              delay={0.2}
            />
          </div>

          {/* Cold Numbers */}
          <div
            className="p-6 rounded-2xl"
            style={{
              background: 'rgba(11, 12, 16, 0.5)',
              border: '1px solid rgba(59, 130, 246, 0.2)',
            }}
          >
            <h3
              className="text-2xl font-bold mb-6"
              style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
            >
              Cold Numbers
            </h3>
            <p className="text-sm mb-4" style={{ color: '#8A95A5' }}>
              Numbers that are overdue based on regression-to-mean theory. These are statistically due for an appearance.
            </p>
            <NumberStrip
              numbers={lotto.cold_numbers}
              label="All-Time Cold"
              icon={Snowflake}
              color="#3b82f6"
              delay={0.1}
            />
            <NumberStrip
              numbers={[...lotto.cold_numbers].reverse().slice(0, 6)}
              label="Overdue Picks"
              icon={Snowflake}
              color="#06b6d4"
              delay={0.3}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
