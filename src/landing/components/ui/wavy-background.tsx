"use client";
import { cn } from "@/lib/utils";
import React, { useEffect, useMemo, useRef } from "react";
import { createNoise3D } from "simplex-noise";

export const WavyBackground = ({
  children,
  className,
  containerClassName,
  colors,
  waveWidth,
  backgroundFill,
  blur = 10,
  speed = "fast",
  waveOpacity = 0.5,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  waveWidth?: number;
  backgroundFill?: string;
  blur?: number;
  speed?: "slow" | "fast";
  waveOpacity?: number;
  [key: string]: unknown;
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const waveColors = useMemo(
    () =>
      colors ?? [
        "#38bdf8",
        "#818cf8",
        "#c084fc",
        "#e879f9",
        "#22d3ee",
      ],
    [colors],
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const noise = createNoise3D();
    const container = canvas.parentElement;
    const resolvedSpeed = speed === "fast" ? 0.002 : 0.001;
    let width = 0;
    let height = 0;
    let noiseTime = 0;
    let animationId = 0;

    const resize = () => {
      width = ctx.canvas.width = container
        ? container.clientWidth
        : window.innerWidth;
      height = ctx.canvas.height = container
        ? container.clientHeight
        : window.innerHeight;
      ctx.filter = `blur(${blur}px)`;
    };

    const drawWave = (waveCount: number) => {
      noiseTime += resolvedSpeed;

      for (let i = 0; i < waveCount; i++) {
        ctx.beginPath();
        ctx.lineWidth = waveWidth || 50;
        ctx.strokeStyle = waveColors[i % waveColors.length];

        for (let x = 0; x < width; x += 5) {
          const y = noise(x / 800, 0.3 * i, noiseTime) * 100;
          ctx.lineTo(x, y + height * 0.5);
        }

        ctx.stroke();
        ctx.closePath();
      }
    };

    const render = () => {
      ctx.fillStyle = backgroundFill || "black";
      ctx.globalAlpha = waveOpacity || 0.5;
      ctx.fillRect(0, 0, width, height);
      drawWave(5);
      animationId = requestAnimationFrame(render);
    };

    resize();
    render();
    window.addEventListener("resize", resize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, [backgroundFill, blur, speed, waveColors, waveOpacity, waveWidth]);

  return (
    <div
      className={cn(
        "relative flex flex-col items-center justify-center overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        className="absolute inset-0 z-0"
        ref={canvasRef}
        id="canvas"
      ></canvas>
      <div className={cn("relative z-10 ", className)} {...props}>
        {children}
      </div>
    </div>
  );
};
