/**
 * AlertBanner.jsx — Critical Zone Alert Bar
 * Levels: ADVISORY | WARNING | CRITICAL
 * CRITICAL plays a Web Audio API beep.
 */
import React, { useEffect, useRef } from 'react';
import { AlertTriangle, ShieldAlert, XCircle } from 'lucide-react';
import useKineticStore from '../../hooks/useKineticStore';

const ALERT_STYLES = {
  ADVISORY: {
    bg: 'bg-[#FFB800]/15',
    border: 'border-[#FFB800]/50',
    text: 'text-[#FFB800]',
    icon: AlertTriangle,
  },
  WARNING: {
    bg: 'bg-[#FFB800]/10',
    border: 'border-[#FFB800]',
    text: 'text-[#FF2D55]',
    icon: ShieldAlert,
  },
  CRITICAL: {
    bg: 'bg-[#FF2D55]',
    border: 'border-[#FF2D55]',
    text: 'text-white',
    icon: XCircle,
  },
};

function playAlertBeep() {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    osc.type = 'square';
    gain.gain.value = 0.1;
    osc.start();
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc.stop(ctx.currentTime + 0.3);
    setTimeout(() => ctx.close(), 500);
  } catch (e) {
    // Silently fail if audio is blocked
  }
}

export function AlertBanner({ className = '' }) {
  const pressureMetrics = useKineticStore((s) => s.pressureMetrics);
  const beeped = useRef(false);

  const peakDensity = pressureMetrics.peakDensity || 0;

  let level = null;
  let message = '';

  if (peakDensity > 4.5) {
    level = 'CRITICAL';
    message = `CRUSH DANGER — Peak density ${peakDensity.toFixed(1)} ppl/m² exceeds safety threshold`;
  } else if (peakDensity > 3.0) {
    level = 'WARNING';
    message = `High density zone — ${peakDensity.toFixed(1)} ppl/m² approaching danger level`;
  } else if (peakDensity > 2.0) {
    level = 'ADVISORY';
    message = `Elevated crowd density — ${peakDensity.toFixed(1)} ppl/m² in monitored zones`;
  }

  useEffect(() => {
    if (level === 'CRITICAL' && !beeped.current) {
      playAlertBeep();
      beeped.current = true;
    }
    if (level !== 'CRITICAL') {
      beeped.current = false;
    }
  }, [level]);

  if (!level) return null;

  const style = ALERT_STYLES[level];
  const Icon = style.icon;

  return (
    <div
      className={`
        flex items-center space-x-2 px-3 py-2 rounded border
        ${style.bg} ${style.border} ${style.text}
        ${level === 'CRITICAL' ? 'animate-pulse' : ''}
        ${className}
      `}
    >
      <Icon className="w-4 h-4 shrink-0" />
      <span className="text-xs font-mono font-bold">{message}</span>
    </div>
  );
}

export default AlertBanner;
