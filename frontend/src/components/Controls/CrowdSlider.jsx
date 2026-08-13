/**
 * CrowdSlider.jsx — 5k–100k Animated Crowd Size Slider
 */
import React from 'react';
import { Users } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';
import { Slider } from '../UI/Slider';

export function CrowdSlider({ className = '' }) {
  const expectedCrowd = useKineticStore((s) => s.expectedCrowd);
  const setCrowd = useKineticStore((s) => s.setCrowd);
  const venue = useKineticStore((s) => s.venue);

  return (
    <Slider
      label="Simulated Crowd Size:"
      value={expectedCrowd}
      onChange={setCrowd}
      min={5000}
      max={venue?.maxCrowd || 100000}
      step={venue?.maxCrowd > 200000 ? 10000 : 2500}
      icon={Users}
      className={className}
    />
  );
}

export default CrowdSlider;
