import type React from 'react';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

export const Fireworks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles: Particle[] = [];

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 5 + 1;
        this.speedX = Math.random() * 3 - 1.5;
        this.speedY = Math.random() * 3 - 1.5;
        this.color = `hsl(${Math.random() * 360}, 100%, 50%)`;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;
        if (this.size > 0.1) this.size -= 0.1;
      }

      draw() {
        if (!ctx) return;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    function createParticles() {
      for (let i = 0; i < 50; i++) {
        particles.push(new Particle());
      }
    }

    function animateParticles() {
      if (!ctx) return;
      if (canvas) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      for (let i = 0; i < particles.length; i++) {
        particles[i].update();
        particles[i].draw();
        if (particles[i].size <= 0.1) {
          particles.splice(i, 1);
          i--;
        }
      }
      requestAnimationFrame(animateParticles);
    }

    createParticles();
    animateParticles();

    const interval = setInterval(createParticles, 500);

    return () => clearInterval(interval);
  }, []);

  return (
    <motion.canvas
      ref={canvasRef}
      className='fixed inset-0 pointer-events-none z-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    />
  );
};
