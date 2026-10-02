import React, { useEffect, useRef } from 'react';
import { Mic, Volume2, Sparkles, Pause, Radio } from 'lucide-react';

export default function AudioVisualizer({
  status = 'idle', // 'idle' | 'speaking' | 'listening' | 'thinking' | 'paused'
  volume = 0,
  personaName = 'AI Interviewer'
}) {
  const canvasRef = useRef(null);
  const volumeRef = useRef(volume);
  const statusRef = useRef(status);

  volumeRef.current = volume;
  statusRef.current = status;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let phase = 0;
    let smoothVolume = 0;

    const render = () => {
      const currentStatus = statusRef.current;
      const targetVolume = volumeRef.current || 0;
      smoothVolume += (targetVolume - smoothVolume) * 0.2;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;

      // Draw subtle background radial glow
      const gradient = ctx.createRadialGradient(
        centerX,
        centerY,
        5,
        centerX,
        centerY,
        width / 2
      );

      if (currentStatus === 'speaking') {
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.35)');
        gradient.addColorStop(0.5, 'rgba(226, 184, 87, 0.15)');
        gradient.addColorStop(1, 'rgba(250, 250, 247, 0)');
      } else if (currentStatus === 'listening') {
        gradient.addColorStop(0, 'rgba(16, 185, 129, 0.35)');
        gradient.addColorStop(0.5, 'rgba(52, 211, 153, 0.15)');
        gradient.addColorStop(1, 'rgba(250, 250, 247, 0)');
      } else if (currentStatus === 'thinking') {
        gradient.addColorStop(0, 'rgba(168, 85, 247, 0.35)');
        gradient.addColorStop(0.5, 'rgba(192, 132, 252, 0.15)');
        gradient.addColorStop(1, 'rgba(250, 250, 247, 0)');
      } else {
        gradient.addColorStop(0, 'rgba(212, 175, 55, 0.08)');
        gradient.addColorStop(1, 'rgba(250, 250, 247, 0)');
      }

      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);

      // Draw harmonic wave lines
      const numWaves = currentStatus === 'paused' ? 1 : 4;
      for (let w = 0; w < numWaves; w++) {
        ctx.beginPath();
        const baseRadius = 45 + w * 14;
        const waveAmp =
          currentStatus === 'speaking'
            ? 8 + Math.sin(phase * 2 + w) * 5
            : currentStatus === 'listening'
            ? 6 + Math.min(smoothVolume * 0.7, 30) + Math.sin(phase * 4 + w) * 3
            : currentStatus === 'thinking'
            ? 5 + Math.sin(phase * 3 + w) * 3
            : 2;

        for (let angle = 0; angle <= Math.PI * 2; angle += 0.06) {
          const freq = 5 + w * 2;
          const r =
            baseRadius +
            Math.sin(angle * freq + phase * (w % 2 === 0 ? 1 : -1)) * waveAmp;
          const x = centerX + Math.cos(angle) * r;
          const y = centerY + Math.sin(angle) * r;

          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.closePath();

        if (currentStatus === 'speaking') {
          ctx.strokeStyle = `rgba(212, 175, 55, ${0.7 - w * 0.14})`;
          ctx.lineWidth = 2.2 - w * 0.3;
        } else if (currentStatus === 'listening') {
          ctx.strokeStyle = `rgba(16, 185, 129, ${0.7 - w * 0.14})`;
          ctx.lineWidth = 2.2 - w * 0.3;
        } else if (currentStatus === 'thinking') {
          ctx.strokeStyle = `rgba(168, 85, 247, ${0.6 - w * 0.12})`;
          ctx.lineWidth = 1.8;
        } else {
          ctx.strokeStyle = 'rgba(200, 190, 175, 0.35)';
          ctx.lineWidth = 1.2;
        }
        ctx.stroke();
      }

      phase += 0.04;
      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <div className="relative flex flex-col items-center justify-center select-none">
      {/* Canvas Wave Visualizer */}
      <div className="relative w-52 h-52 sm:w-60 sm:h-60 flex items-center justify-center">
        <canvas
          ref={canvasRef}
          width={240}
          height={240}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Central Glowing Interactive Core */}
        <div
          className={`relative z-10 w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-500 border ${
            status === 'speaking'
              ? 'bg-gradient-to-tr from-[#D4AF37] via-[#E5C07B] to-[#F7EFCF] text-[#583C15] border-[#D4AF37] shadow-[#D4AF37]/35 scale-105'
              : status === 'listening'
              ? 'bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-300 text-white border-emerald-400 shadow-emerald-500/35 scale-105'
              : status === 'thinking'
              ? 'bg-gradient-to-tr from-purple-600 via-indigo-500 to-amber-200 text-white border-purple-300 shadow-purple-500/25'
              : status === 'paused'
              ? 'bg-gradient-to-tr from-gray-200 to-gray-300 text-gray-700 border-gray-400'
              : 'bg-white text-[#A87D1B] border-[#EEDD9E] shadow-gray-200'
          }`}
        >
          {status === 'speaking' && (
            <div className="flex flex-col items-center animate-pulse">
              <Volume2 className="w-7 h-7 drop-shadow-xs" />
              <span className="text-[9px] uppercase font-black tracking-widest mt-1 opacity-90">
                Speaking
              </span>
            </div>
          )}

          {status === 'listening' && (
            <div className="flex flex-col items-center animate-bounce">
              <Mic className="w-7 h-7 drop-shadow-xs" />
              <span className="text-[9px] uppercase font-black tracking-widest mt-1 opacity-95">
                Listening
              </span>
            </div>
          )}

          {status === 'thinking' && (
            <div className="flex flex-col items-center">
              <Sparkles className="w-7 h-7 animate-spin text-amber-200" style={{ animationDuration: '3s' }} />
              <span className="text-[9px] uppercase font-black tracking-widest mt-1">
                Analyzing
              </span>
            </div>
          )}

          {status === 'paused' && (
            <div className="flex flex-col items-center">
              <Pause className="w-7 h-7 text-gray-600" />
              <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-gray-600">
                Paused
              </span>
            </div>
          )}

          {status === 'idle' && (
            <div className="flex flex-col items-center text-gray-500">
              <Radio className="w-6 h-6 text-[#D4AF37]" />
              <span className="text-[9px] uppercase font-bold tracking-wider mt-1 text-gray-600">
                Ready
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Persona & Status Caption */}
      <div className="mt-1 text-center">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white border border-[#EAE6DF] shadow-xs">
          <span
            className={`w-2 h-2 rounded-full ${
              status === 'speaking'
                ? 'bg-[#D4AF37] animate-ping'
                : status === 'listening'
                ? 'bg-emerald-500 animate-ping'
                : status === 'thinking'
                ? 'bg-purple-500 animate-spin'
                : status === 'paused'
                ? 'bg-amber-500'
                : 'bg-gray-400'
            }`}
          ></span>
          <span className="text-gray-900 font-bold">{personaName}</span>
          <span className="text-gray-300">•</span>
          <span className="text-gray-500 capitalize font-medium text-[11px]">
            {status === 'speaking'
              ? 'Speaking Question'
              : status === 'listening'
              ? 'Listening to Candidate'
              : status === 'thinking'
              ? 'Evaluating Answer...'
              : status === 'paused'
              ? 'Interview Paused'
              : 'Standby'}
          </span>
        </div>
      </div>
    </div>
  );
}
