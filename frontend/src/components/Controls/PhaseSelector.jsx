/**
 * PhaseSelector.jsx — Event Schedule Phase Picker
 */
import React from 'react';
import { Clock } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { SCHEDULE_PHASES } from '../../constants/venues';

export function PhaseSelector({ className = '' }) {
  const schedulePhase = useKineticStore((s) => s.schedulePhase);
  const setPhase = useKineticStore((s) => s.setPhase);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs text-[#8A7F72] font-mono flex items-center space-x-1.5">
        <Clock className="w-3.5 h-3.5 text-[#FFB800]" />
        <span>Event Phase:</span>
      </label>
      <select
        value={schedulePhase}
        onChange={(e) => setPhase(e.target.value)}
        className="w-full bg-[#161310] text-[#F0EBE3] border border-[#2E2820] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FFB800] transition-colors cursor-pointer"
      >
        {SCHEDULE_PHASES.map((phase) => (
          <option key={phase} value={phase}>{phase}</option>
        ))}
      </select>
    </div>
  );
}

export default PhaseSelector;
