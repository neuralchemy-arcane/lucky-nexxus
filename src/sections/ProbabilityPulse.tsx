import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePredictions } from '../hooks/usePredictions';
import { Flame, Snowflake, TrendingUp, Target, Zap, BarChart3 } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

interface PulseMetric {
  icon: React.ElementType;
  label: string;
  value: string;
  gradient: string;
  description: string;
}

export default function ProbabilityPulse() {
  const { data } = usePredictions();
  const sectionRef = useRef<HTMLDivElement>(null);

  const lotto = data?.lotto;

  const metrics: PulseMetric[] = lotto
    ? [
        {
          icon: Flame,
          label: 'Hot Streak',
          value: lotto.hot_numbers.slice(0, 5).join(', '),
          gradient: 'linear-gradient(45deg, #ef4444, #f97316)',
          description: 'Most frequent numbers in recent draws',
        },
        {
          icon: Snowflake,
          label: 'Deep Freeze',
          value: lotto.cold_numbers.slice(0, 5).join(', '),
          gradient: 'linear-gradient(45deg, #3b82f6, #06b6d4)',
          description: 'Numbers overdue for appearance',
        },
        {
          icon: TrendingUp,
          label: 'Top Confidence',
          value: lotto.primary.slice(0, 3).join(', '),
          gradient: 'linear-gradient(45deg, #22c55e, #14b8a6)',
          description: 'Highest AI confidence picks',
        },
        {
          icon: Target,
          label: 'Sum Prediction',
          value: lotto.primary.reduce((a, b) => a + b, 0).toString(),
          gradient: 'linear-gradient(45deg, #eab308, #f59e0b)',
          description: 'Predicted sum of next draw',
        },
        {
          icon: Zap,
          label: 'Even/Odd Split',
          value: `${lotto.primary.filter((n) => n % 2 === 0).length}E / ${lotto.primary.filter((n) => n % 2 !== 0).length}O`,
          gradient: 'linear-gradient(45deg, #a855f7, #ec4899)',
          description: 'Even/odd balance in prediction',
        },
        {
          icon: BarChart3,
          label: 'High/Low Split',
          value: `${lotto.primary.filter((n) => n <= 26).length}L / ${lotto.primary.filter((n) => n > 26).length}H`,
          gradient: 'linear-gradient(45deg, #6366f1, #8b5cf6)',
          description: 'Low/high number distribution',
        },
      ]
    : [];

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const badges = section.querySelectorAll('.pulse-metric');

    gsap.fromTo(
      badges,
      { opacity: 0, y: 30 },
      {
        opacity: 1,
        y: 0,
        duration: 0.6,
        stagger: 0.08,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        },
      }
    );
  }, [data]);

  return (
    <section ref={sectionRef} className="relative z-10 py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
          >
            Live Probability Pulse
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8A95A5' }}>
            Real-time statistical indicators from the SA Lotto analysis engine.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div
                key={metric.label}
                className="pulse-metric pulse-badge p-5 rounded-xl"
                style={{
                  background: 'rgba(255, 255, 255, 0.03)',
                  border: '1px solid rgba(255, 255, 255, 0.08)',
                }}
              >
                <div
                  className="pulse-gradient"
                  style={{ background: metric.gradient }}
                />
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-3">
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center"
                      style={{ background: 'rgba(255, 255, 255, 0.08)' }}
                    >
                      <Icon size={20} style={{ color: '#C5C6C7' }} />
                    </div>
                    <div>
                      <div className="text-xs uppercase tracking-wider" style={{ color: '#8A95A5' }}>
                        {metric.label}
                      </div>
                    </div>
                  </div>
                  <div
                    className="text-xl font-bold font-mono mb-1"
                    style={{ color: '#C5C6C7' }}
                  >
                    {metric.value}
                  </div>
                  <div className="text-xs" style={{ color: '#8A95A5' }}>
                    {metric.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
