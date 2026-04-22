import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Brain, Dice3, Thermometer, Waves, BarChart3, Clock } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const algorithms = [
  {
    icon: BarChart3,
    name: 'Markov Transition',
    description: 'Analyzes sequential draw-to-draw patterns using transition probability matrices to predict which numbers follow others.',
    weight: '20%',
    color: '#66FCF1',
  },
  {
    icon: Thermometer,
    name: 'Seasonal Swing',
    description: 'Detects temporal cycles and seasonal patterns in number distributions across months and years.',
    weight: '10%',
    color: '#45A29E',
  },
  {
    icon: Brain,
    name: 'LSTM Neural Net',
    description: 'Deep learning temporal pattern recognition using Long Short-Term Memory networks trained on 20-draw sequences.',
    weight: '30%',
    color: '#ec4899',
  },
  {
    icon: Dice3,
    name: 'Monte Carlo',
    description: 'Runs thousands of random simulations to identify statistically significant number combinations.',
    weight: '10%',
    color: '#eab308',
  },
  {
    icon: Clock,
    name: 'Gap Analysis',
    description: 'Identifies overdue numbers based on regression-to-mean theory. Numbers 38+ draws absent get highest scores.',
    weight: '15%',
    color: '#f97316',
  },
  {
    icon: Waves,
    name: 'Hot Streak',
    description: 'Recency-weighted frequency analysis that prioritizes numbers appearing more frequently in recent draws.',
    weight: '15%',
    color: '#22c55e',
  },
];

export default function AlgorithmSection() {
  const sectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const cards = section.querySelectorAll('.algo-card');

    gsap.fromTo(
      cards,
      { opacity: 0, y: 40 },
      {
        opacity: 1,
        y: 0,
        duration: 0.8,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        },
      }
    );

    return () => {
      ScrollTrigger.getAll().forEach((st) => st.kill());
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
      style={{ background: '#1F2833' }}
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
          >
            Algorithm Intelligence
          </h2>
          <p className="text-lg max-w-2xl mx-auto" style={{ color: '#8A95A5' }}>
            Our Chrono-Probability Engine combines six distinct machine learning models,
            each analyzing different statistical dimensions of 26 years of lottery history.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {algorithms.map((algo) => {
            const Icon = algo.icon;
            return (
              <div
                key={algo.name}
                className="algo-card p-6 rounded-xl transition-all duration-300 hover:-translate-y-1"
                style={{
                  background: 'rgba(11, 12, 16, 0.6)',
                  border: '1px solid #2A3A4B',
                  boxShadow: '0 4px 24px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-center justify-between mb-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center"
                    style={{ background: `${algo.color}15`, border: `1px solid ${algo.color}30` }}
                  >
                    <Icon size={24} style={{ color: algo.color }} />
                  </div>
                  <span
                    className="text-sm font-mono px-3 py-1 rounded-full"
                    style={{
                      background: `${algo.color}15`,
                      color: algo.color,
                      border: `1px solid ${algo.color}30`,
                    }}
                  >
                    {algo.weight}
                  </span>
                </div>
                <h3 className="text-lg font-semibold mb-2" style={{ color: '#C5C6C7' }}>
                  {algo.name}
                </h3>
                <p className="text-sm leading-relaxed" style={{ color: '#8A95A5' }}>
                  {algo.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
