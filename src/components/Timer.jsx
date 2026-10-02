import React, { useEffect, useState } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

export default function Timer({
  totalMinutes = 20,
  isPaused = false,
  onTimeUp,
  onTick
}) {
  const [secondsRemaining, setSecondsRemaining] = useState(totalMinutes * 60);

  useEffect(() => {
    setSecondsRemaining(totalMinutes * 60);
  }, [totalMinutes]);

  useEffect(() => {
    if (isPaused || secondsRemaining <= 0) return;

    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          if (onTimeUp) onTimeUp();
          return 0;
        }
        const updated = prev - 1;
        if (onTick) onTick(totalMinutes * 60 - updated);
        return updated;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isPaused, secondsRemaining, totalMinutes, onTimeUp, onTick]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const formatted = `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  const percentRemaining = (secondsRemaining / (totalMinutes * 60)) * 100;
  const isLowTime = secondsRemaining < 120; // less than 2 minutes

  return (
    <div className={`flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border transition-all ${
      isLowTime
        ? 'bg-red-50 border-red-200 text-red-700'
        : 'bg-white border-[#EAE6DF] text-gray-800 shadow-2xs'
    }`}>
      <Clock className={`w-3.5 h-3.5 ${isLowTime ? 'text-red-500 animate-pulse' : 'text-[#D4AF37]'}`} />
      <span className="font-mono font-bold text-xs tracking-wider">
        {formatted} remaining
      </span>
      {isPaused && (
        <span className="text-[10px] uppercase font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200">
          Paused
        </span>
      )}
    </div>
  );
}
