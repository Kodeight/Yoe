import React, { useEffect, useRef } from 'react';

export type VoiceBubbleState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'interrupted' | 'error';

interface VoiceBubbleProps {
  state?: VoiceBubbleState;
  audioEnergy?: number; // 0.0 to 1.0 normalized real-time audio energy
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  interactive?: boolean;
}

export const VoiceBubble: React.FC<VoiceBubbleProps> = ({
  state = 'idle',
  audioEnergy = 0,
  size = 'lg',
  className = '',
  onClick,
  interactive = false
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const currentEnergyRef = useRef<number>(0);
  const targetEnergyRef = useRef<number>(audioEnergy);
  const stateRef = useRef<VoiceBubbleState>(state);
  const phaseRef = useRef<number>(0);
  const animationFrameRef = useRef<number | null>(null);

  stateRef.current = state;
  targetEnergyRef.current = audioEnergy;

  // Dimensional sizes
  const dimensions = {
    sm: { size: 90, canvasSize: 130 },
    md: { size: 140, canvasSize: 200 },
    lg: { size: 210, canvasSize: 290 },
    xl: { size: 280, canvasSize: 380 }
  }[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let isRunning = true;

    // Check for reduced motion
    const prefersReducedMotion = typeof window !== 'undefined' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const render = () => {
      if (!isRunning) return;

      const currentState = stateRef.current;
      const targetEnergy = targetEnergyRef.current;

      // Smooth interpolation (lerp) for audio energy
      const lerpFactor = currentState === 'speaking' ? 0.25 : 0.15;
      currentEnergyRef.current += (targetEnergy - currentEnergyRef.current) * lerpFactor;
      const energy = currentEnergyRef.current;

      // Phase progression
      const speed = prefersReducedMotion
        ? 0.005
        : currentState === 'speaking'
        ? 0.03 + energy * 0.05
        : currentState === 'listening'
        ? 0.02 + energy * 0.04
        : currentState === 'thinking'
        ? 0.04
        : 0.015;

      phaseRef.current += speed;
      const phase = phaseRef.current;

      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const baseRadius = (dimensions.size / 2) * 0.78;

      ctx.clearRect(0, 0, width, height);

      // State-specific color palettes
      let primaryColor = '#10b981'; // Yoe Emerald
      let secondaryColor = '#00f0b5'; // Yoe Aqua
      let accentColor = '#00c2ff'; // Yoe Cyan
      let glowAlpha = 0.35;
      let waveCount = 6;
      let waveAmp = 3.5;

      if (currentState === 'listening') {
        primaryColor = '#00f0b5';
        secondaryColor = '#00c2ff';
        accentColor = '#38bdf8';
        glowAlpha = 0.45 + energy * 0.4;
        waveAmp = 4 + energy * 16;
      } else if (currentState === 'thinking') {
        primaryColor = '#00c2ff';
        secondaryColor = '#3b82f6';
        accentColor = '#00f0b5';
        glowAlpha = 0.5;
        waveCount = 8;
        waveAmp = 5;
      } else if (currentState === 'speaking') {
        primaryColor = '#10b981';
        secondaryColor = '#00f0b5';
        accentColor = '#00c2ff';
        glowAlpha = 0.5 + energy * 0.45;
        waveCount = 7;
        waveAmp = 4 + energy * 22;
      } else if (currentState === 'interrupted') {
        primaryColor = '#f59e0b';
        secondaryColor = '#00f0b5';
        accentColor = '#10b981';
        glowAlpha = 0.6;
        waveAmp = 12;
      } else if (currentState === 'error') {
        primaryColor = '#f43f5e';
        secondaryColor = '#fb7185';
        accentColor = '#fda4af';
        glowAlpha = 0.35;
      }

      // 1. Outer Atmospheric Soft Glow
      const glowRadius = baseRadius * (1.2 + energy * 0.3);
      const glowGrad = ctx.createRadialGradient(centerX, centerY, baseRadius * 0.5, centerX, centerY, glowRadius);
      glowGrad.addColorStop(0, `${secondaryColor}${Math.round(glowAlpha * 255).toString(16).padStart(2, '0')}`);
      glowGrad.addColorStop(0.6, `${accentColor}${Math.round(glowAlpha * 0.4 * 255).toString(16).padStart(2, '0')}`);
      glowGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = glowGrad;
      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fill();

      // 2. Liquid Glass Bubble Organic Silhouette
      const points: Array<{ x: number; y: number }> = [];
      const totalPoints = 36;
      const dynamicScale = 1 + Math.sin(phase * 1.5) * 0.02 + energy * 0.12;

      for (let i = 0; i < totalPoints; i++) {
        const angle = (i / totalPoints) * Math.PI * 2;
        const wave1 = Math.sin(angle * waveCount + phase) * waveAmp;
        const wave2 = Math.cos(angle * (waveCount / 2) - phase * 1.2) * (waveAmp * 0.5);
        const r = (baseRadius * dynamicScale) + wave1 + wave2;
        const x = centerX + Math.cos(angle) * r;
        const y = centerY + Math.sin(angle) * r;
        points.push({ x, y });
      }

      // Draw smooth curve through points
      ctx.beginPath();
      ctx.moveTo((points[0].x + points[totalPoints - 1].x) / 2, (points[0].y + points[totalPoints - 1].y) / 2);
      for (let i = 0; i < totalPoints; i++) {
        const next = (i + 1) % totalPoints;
        const midX = (points[i].x + points[next].x) / 2;
        const midY = (points[i].y + points[next].y) / 2;
        ctx.quadraticCurveTo(points[i].x, points[i].y, midX, midY);
      }
      ctx.closePath();

      // 3. Internal Liquid Glass Core Gradient
      const angleOffset = phase * 0.4;
      const gradX1 = centerX + Math.cos(angleOffset) * baseRadius;
      const gradY1 = centerY + Math.sin(angleOffset) * baseRadius;
      const gradX2 = centerX - Math.cos(angleOffset) * baseRadius;
      const gradY2 = centerY - Math.sin(angleOffset) * baseRadius;

      const bodyGrad = ctx.createLinearGradient(gradX1, gradY1, gradX2, gradY2);
      bodyGrad.addColorStop(0, primaryColor);
      bodyGrad.addColorStop(0.5, secondaryColor);
      bodyGrad.addColorStop(1, accentColor);

      ctx.save();
      ctx.fillStyle = bodyGrad;
      ctx.shadowColor = secondaryColor;
      ctx.shadowBlur = 20 + energy * 15;
      ctx.fill();
      ctx.restore();

      // 4. Liquid Glass Rim Specular Highlight
      ctx.save();
      ctx.lineWidth = 2.2;
      const rimGrad = ctx.createLinearGradient(centerX, centerY - baseRadius, centerX, centerY + baseRadius);
      rimGrad.addColorStop(0, 'rgba(255, 255, 255, 0.7)');
      rimGrad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
      rimGrad.addColorStop(1, 'rgba(255, 255, 255, 0.05)');
      ctx.strokeStyle = rimGrad;
      ctx.stroke();
      ctx.restore();

      // 5. Internal Caustic Light Flare
      const flareX = centerX - baseRadius * 0.3 + Math.cos(phase) * 6;
      const flareY = centerY - baseRadius * 0.35 + Math.sin(phase * 0.8) * 4;
      const flareRadius = baseRadius * 0.45;

      const flareGrad = ctx.createRadialGradient(flareX, flareY, 0, flareX, flareY, flareRadius);
      flareGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
      flareGrad.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
      flareGrad.addColorStop(1, 'transparent');

      ctx.fillStyle = flareGrad;
      ctx.beginPath();
      ctx.arc(flareX, flareY, flareRadius, 0, Math.PI * 2);
      ctx.fill();

      animationFrameRef.current = requestAnimationFrame(render);
    };

    animationFrameRef.current = requestAnimationFrame(render);

    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [dimensions.size]);

  // State label subtitle
  const stateLabel = {
    idle: 'Yoe Listening',
    listening: 'Listening to you...',
    thinking: 'Yoe is thinking...',
    speaking: 'Yoe is speaking',
    interrupted: 'Interrupted',
    error: 'Audio disconnected'
  }[state];

  return (
    <div
      ref={containerRef}
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center select-none ${interactive ? 'cursor-pointer group' : ''} ${className}`}
      style={{ width: dimensions.canvasSize, height: dimensions.canvasSize }}
      role="presentation"
      aria-label={`Yoe Voice Presence: ${stateLabel}`}
    >
      <canvas
        ref={canvasRef}
        width={dimensions.canvasSize}
        height={dimensions.canvasSize}
        className="w-full h-full object-contain pointer-events-none drop-shadow-[0_10px_35px_rgba(0,240,181,0.25)] transition-transform duration-300 group-hover:scale-105"
      />
    </div>
  );
};
