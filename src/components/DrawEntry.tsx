import { useState } from 'react';
import { Plus, X, Save, ExternalLink } from 'lucide-react';

interface DrawEntryProps {
  onAddDraw: (game: string, numbers: number[], bonus: number) => void;
}

const GAMES = [
  { key: 'lotto', label: 'SA Lotto', count: 6 },
  { key: 'lotto_plus_1', label: 'Lotto Plus 1', count: 6 },
  { key: 'lotto_plus_2', label: 'Lotto Plus 2', count: 6 },
  { key: 'powerball', label: 'Powerball', count: 5 },
];

export default function DrawEntry({ onAddDraw }: DrawEntryProps) {
  const [open, setOpen] = useState(false);
  const [game, setGame] = useState('lotto');
  const [nums, setNums] = useState<string[]>(['', '', '', '', '', '']);
  const [bonus, setBonus] = useState('');

  const gameConfig = GAMES.find(g => g.key === game)!;

  function handleSubmit() {
    const numbers = nums.slice(0, gameConfig.count)
      .map(n => parseInt(n.trim()))
      .filter(n => !isNaN(n) && n > 0);
    const b = parseInt(bonus);
    if (numbers.length === gameConfig.count && !isNaN(b)) {
      onAddDraw(game, numbers, b);
      setNums(['', '', '', '', '', '']);
      setBonus('');
      setOpen(false);
    }
  }

  if (!open) {
    return (
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105 active:scale-95"
          style={{
            background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
            color: '#0B0C10',
            boxShadow: '0 0 20px rgba(102, 252, 241, 0.3)',
            minHeight: 48,
          }}
        >
          <Plus size={16} />
          Add Latest Draw Result
        </button>
        <a
          href="https://www.nationallottery.co.za/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium transition-all duration-300 hover:scale-105"
          style={{
            background: 'rgba(31, 40, 51, 0.6)',
            border: '1px solid #2A3A4B',
            color: '#8A95A5',
            minHeight: 48,
          }}
        >
          <ExternalLink size={14} />
          Check Official Results
        </a>
      </div>
    );
  }

  return (
    <div
      className="rounded-2xl p-6 mx-auto max-w-md"
      style={{
        background: 'rgba(11, 12, 16, 0.95)',
        border: '1px solid #2A3A4B',
        boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
      }}
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold" style={{ color: '#C5C6C7', fontFamily: "'Space Grotesk', sans-serif" }}>
          Add New Draw Result
        </h3>
        <button onClick={() => setOpen(false)} className="p-1 rounded-lg hover:bg-white/10">
          <X size={18} style={{ color: '#8A95A5' }} />
        </button>
      </div>

      <p className="text-xs mb-4" style={{ color: '#8A95A5' }}>
        Paste the latest winning numbers from the official SA Lottery site. The AI will instantly re-run all 6 prediction models.
      </p>

      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: '#8A95A5' }}>Game</label>
        <div className="flex flex-wrap gap-2">
          {GAMES.map(g => (
            <button
              key={g.key}
              onClick={() => { setGame(g.key); setNums(['', '', '', '', '', '']); }}
              className="px-3 py-2 rounded-lg text-xs font-medium transition-all"
              style={{
                background: game === g.key ? 'rgba(102, 252, 241, 0.15)' : 'rgba(31, 40, 51, 0.4)',
                border: `1px solid ${game === g.key ? '#66FCF1' : '#2A3A4B'}`,
                color: game === g.key ? '#66FCF1' : '#8A95A5',
                minHeight: 40,
              }}
            >
              {g.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: '#8A95A5' }}>
          Winning Numbers ({gameConfig.count})
        </label>
        <div className="flex gap-2 flex-wrap">
          {Array.from({ length: gameConfig.count }, (_, i) => (
            <input
              key={i}
              type="number"
              min={1}
              max={52}
              value={nums[i]}
              onChange={e => {
                const next = [...nums];
                next[i] = e.target.value;
                setNums(next);
              }}
              className="w-14 h-14 text-center text-lg font-mono font-bold rounded-xl outline-none transition-all focus:scale-110"
              style={{
                background: 'rgba(31, 40, 51, 0.8)',
                border: '2px solid #2A3A4B',
                color: '#66FCF1',
                boxShadow: '0 0 8px rgba(102, 252, 241, 0.1)',
              }}
              onFocus={e => e.currentTarget.style.borderColor = '#66FCF1'}
              onBlur={e => e.currentTarget.style.borderColor = '#2A3A4B'}
            />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <label className="text-xs uppercase tracking-wider mb-2 block" style={{ color: '#8A95A5' }}>Bonus Ball</label>
        <input
          type="number"
          min={1}
          max={52}
          value={bonus}
          onChange={e => setBonus(e.target.value)}
          className="w-14 h-14 text-center text-lg font-mono font-bold rounded-xl outline-none transition-all focus:scale-110"
          style={{
            background: 'rgba(31, 40, 51, 0.8)',
            border: '2px solid #2A3A4B',
            color: '#f472b6',
            boxShadow: '0 0 8px rgba(236, 72, 153, 0.1)',
          }}
        />
      </div>

      <button
        onClick={handleSubmit}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold uppercase tracking-wider transition-all duration-300 active:scale-95"
        style={{
          background: 'linear-gradient(135deg, #66FCF1, #45A29E)',
          color: '#0B0C10',
          minHeight: 48,
        }}
      >
        <Save size={16} />
        Add & Re-run AI Predictions
      </button>
    </div>
  );
}
