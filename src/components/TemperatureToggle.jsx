'use client';

export default function TemperatureToggle({ unit, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className="px-4 py-2 rounded-xl bg-white/18 backdrop-blur-2xl
                border border-white/30 text-white text-sm
                hover:bg-white/20 transition-colors duration-200"
    >
      Switch to °{unit === 'C' ? 'F' : 'C'}
    </button>
  );
}