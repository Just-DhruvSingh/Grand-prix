/**
 * VenueSelector.jsx — Preset Venue Dropdown
 */
import React from 'react';
import { Building2 } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { PRESET_VENUES } from '../../constants/venues';

export function VenueSelector({ className = '' }) {
  const venue = useKineticStore((s) => s.venue);
  const setVenue = useKineticStore((s) => s.setVenue);

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-xs text-[#8A7F72] font-mono flex items-center space-x-1.5">
        <Building2 className="w-3.5 h-3.5 text-[#FFB800]" />
        <span>Venue Layout:</span>
      </label>
      <select
        value={venue?.id || 'railway-terminal'}
        onChange={(e) => {
          const selected = PRESET_VENUES.find(v => v.id === e.target.value);
          if (selected) setVenue(selected);
        }}
        className="w-full bg-[#161310] text-[#F0EBE3] border border-[#2E2820] rounded px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#FFB800] transition-colors cursor-pointer"
      >
        {PRESET_VENUES.map((v) => (
          <option key={v.id} value={v.id}>{v.name}</option>
        ))}
      </select>
      <p className="text-[9px] text-[#8A7F72] font-mono">{venue?.description}</p>
    </div>
  );
}

export default VenueSelector;
