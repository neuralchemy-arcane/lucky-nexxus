import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { usePredictions } from '../hooks/usePredictions';

gsap.registerPlugin(ScrollTrigger);

function getHeatColor(percentage: number): string {
  if (percentage > 80) return '#ef4444';
  if (percentage > 60) return '#f97316';
  if (percentage > 40) return '#eab308';
  if (percentage > 20) return '#22c55e';
  return '#3b82f6';
}

interface TooltipData {
  num: number;
  freq: number;
  percentage: number;
  x: number;
  y: number;
}

function NumberCell({
  num,
  freq,
  maxFreq,
  onHover,
  onLeave,
}: {
  num: number;
  freq: number;
  maxFreq: number;
  onHover: (data: TooltipData) => void;
  onLeave: () => void;
}) {
  const cellRef = useRef<HTMLDivElement>(null);
  const percentage = maxFreq > 0 ? (freq / maxFreq) * 100 : 0;
  const color = getHeatColor(percentage);
  const barHeight = `${percentage}%`;

  return (
    <div
      ref={cellRef}
      className="number-cell relative flex flex-col items-center justify-end cursor-pointer group"
      style={{
        width: 'calc((100% - 204px) / 52)',
        minWidth: 28,
        height: 80,
        borderRadius: 4,
        background: 'rgba(31, 40, 51, 0.4)',
        border: '1px solid rgba(42, 58, 75, 0.3)',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        onHover({
          num,
          freq,
          percentage: Math.round(percentage),
          x: rect.left + rect.width / 2,
          y: rect.top,
        });
      }}
      onMouseLeave={onLeave}
    >
      {/* Laser bar */}
      <div
        className="w-full absolute bottom-0 left-0 transition-all duration-300 group-hover:opacity-100"
        style={{
          height: barHeight,
          background: `linear-gradient(to top, ${color}60, ${color}20)`,
          opacity: 0.6,
        }}
      />
      {/* Laser line on hover */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
        style={{
          height: '200%',
          background: color,
          boxShadow: `0 0 8px ${color}`,
        }}
      />
      {/* Number */}
      <span
        className="relative z-10 text-xs font-mono font-bold mb-1"
        style={{ color: percentage > 50 ? color : '#8A95A5' }}
      >
        {num}
      </span>
    </div>
  );
}

export default function FrequencyMatrix() {
  const { data } = usePredictions();
  const sectionRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);
  const [activeGame, setActiveGame] = useState<'lotto' | 'lotto_plus_1' | 'lotto_plus_2' | 'powerball'>('lotto');

  const prediction = data?.[activeGame];
  const frequencies = prediction?.frequency || {};
  const maxFreq = Math.max(...Object.values(frequencies), 1);
  const numMax = prediction?.num_max || 52;

  useEffect(() => {
    const section = sectionRef.current;
    const grid = gridRef.current;
    if (!section || !grid) return;

    const cells = grid.querySelectorAll('.number-cell');

    gsap.fromTo(
      cells,
      { opacity: 0, scaleY: 0.8 },
      {
        opacity: 1,
        scaleY: 1,
        duration: 0.8,
        ease: 'sine.inOut',
        stagger: { each: 0.02, from: 'center' },
        scrollTrigger: {
          trigger: section,
          start: 'top 85%',
        },
      }
    );

    // Ripple effect
    const rippleTl = gsap.timeline({ repeat: -1, repeatDelay: 2 });
    rippleTl.fromTo(
      cells,
      { opacity: 0.5, scaleY: 0.9 },
      {
        opacity: 1,
        scaleY: 1,
        duration: 0.8,
        ease: 'sine.inOut',
        stagger: { each: 0.02, from: 'center' },
      }
    );
    rippleTl.to(cells, {
      opacity: 0.5,
      scaleY: 0.9,
      duration: 0.8,
      ease: 'sine.inOut',
      stagger: { each: 0.02, from: 'center' },
    });

    return () => {
      rippleTl.kill();
    };
  }, [activeGame]);

  const gameButtons: { key: typeof activeGame; label: string }[] = [
    { key: 'lotto', label: 'SA Lotto' },
    { key: 'lotto_plus_1', label: 'Plus 1' },
    { key: 'lotto_plus_2', label: 'Plus 2' },
    { key: 'powerball', label: 'Powerball' },
  ];

  return (
    <section
      id="matrix"
      ref={sectionRef}
      className="relative z-10 py-24 px-4"
      style={{ background: '#1F2833' }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h2
            className="text-4xl md:text-5xl font-bold mb-4"
            style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#C5C6C7' }}
          >
            26-Year Frequency Matrix
          </h2>
          <p className="text-lg max-w-2xl mx-auto mb-8" style={{ color: '#8A95A5' }}>
            Historical frequency heatmap. Brighter colors indicate numbers drawn more often.
            Hover to see exact frequencies.
          </p>

          {/* Game Selector */}
          <div className="flex justify-center gap-2 mb-8">
            {gameButtons.map((btn) => (
              <button
                key={btn.key}
                onClick={() => setActiveGame(btn.key)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: activeGame === btn.key
                    ? 'linear-gradient(135deg, #66FCF1, #45A29E)'
                    : 'rgba(31, 40, 51, 0.6)',
                  color: activeGame === btn.key ? '#0B0C10' : '#8A95A5',
                  border: `1px solid ${activeGame === btn.key ? '#66FCF1' : '#2A3A4B'}`,
                }}
              >
                {btn.label}
              </button>
            ))}
          </div>
        </div>

        {/* Frequency Grid */}
        <div
          ref={gridRef}
          className="flex flex-wrap gap-1 justify-center p-6 rounded-2xl"
          style={{ background: 'rgba(11, 12, 16, 0.5)', border: '1px solid #2A3A4B' }}
        >
          {Array.from({ length: numMax }, (_, i) => i + 1).map((num) => (
            <NumberCell
              key={num}
              num={num}
              freq={frequencies[num.toString()] || 0}
              maxFreq={maxFreq}
              onHover={setTooltip}
              onLeave={() => setTooltip(null)}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="flex justify-center gap-6 mt-6">
          {[
            { label: 'Hot (>80%)', color: '#ef4444' },
            { label: 'Warm (60-80%)', color: '#f97316' },
            { label: 'Average (40-60%)', color: '#eab308' },
            { label: 'Cool (20-40%)', color: '#22c55e' },
            { label: 'Cold (<20%)', color: '#3b82f6' },
          ].map((item) => (
            <div key={item.label} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded-full"
                style={{ background: item.color, boxShadow: `0 0 6px ${item.color}60` }}
              />
              <span className="text-xs" style={{ color: '#8A95A5' }}>
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Tooltip */}
      {tooltip && (
        <div
          className="fixed z-50 px-4 py-3 rounded-lg pointer-events-none"
          style={{
            left: tooltip.x,
            top: tooltip.y - 80,
            transform: 'translateX(-50%)',
            background: 'rgba(11, 12, 16, 0.95)',
            border: '1px solid #2A3A4B',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          }}
        >
          <div className="text-center">
            <div
              className="text-2xl font-bold font-mono mb-1"
              style={{ color: getHeatColor(tooltip.percentage) }}
            >
              {tooltip.num}
            </div>
            <div className="text-xs" style={{ color: '#8A95A5' }}>
              Drawn {tooltip.freq} times
            </div>
            <div className="text-xs font-mono" style={{ color: '#66FCF1' }}>
              {tooltip.percentage}% of max
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
