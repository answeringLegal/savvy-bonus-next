'use client';

import React, {
  useEffect,
  useRef,
  useState,
  forwardRef,
  useImperativeHandle,
} from 'react';
import Matter from 'matter-js';

interface MoneyPitProps {
  initialPaidAccounts: number;
  elementSize?: number;
}

export interface MoneyPitHandle {
  addElements: (count: number) => void;
  setTotalPaidAccounts: (count: number) => void;
}

const ELEMENT_SIZE = 80; // Increase size to represent bills better

const MoneyPit = forwardRef<MoneyPitHandle, MoneyPitProps>(
  ({ initialPaidAccounts, elementSize = ELEMENT_SIZE }, ref) => {
    const containerRef = useRef<HTMLDivElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const engineRef = useRef<Matter.Engine | null>(null);
    const totalPaidAccountsRef = useRef(initialPaidAccounts);
    const [elementCount, setElementCount] = useState(0);

    useEffect(() => {
      if (!containerRef.current || !canvasRef.current) return;

      const container = containerRef.current;
      const canvas = canvasRef.current;

      const updateCanvasSize = () => {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      };

      updateCanvasSize();

      // Create engine
      const engine = Matter.Engine.create({
        gravity: { x: 0, y: 1, scale: 0.001 },
      });
      engineRef.current = engine;

      // Create renderer
      const render = Matter.Render.create({
        canvas: canvas,
        engine: engine,
        options: {
          width: canvas.width,
          height: canvas.height,
          wireframes: false,
          background: 'transparent',
        },
      });

      // Create walls
      const wallOptions: Matter.IChamferableBodyDefinition = {
        isStatic: true,
        render: { fillStyle: '#1e2942' },
        restitution: 0.5,
        friction: 0.05,
      };

      const addWalls = () => {
        Matter.Composite.clear(engine.world, false);
        Matter.Composite.add(engine.world, [
          Matter.Bodies.rectangle(
            canvas.width / 2,
            canvas.height,
            canvas.width,
            50,
            wallOptions
          ), // Bottom
          Matter.Bodies.rectangle(
            0,
            canvas.height / 2,
            50,
            canvas.height,
            wallOptions
          ), // Left
          Matter.Bodies.rectangle(
            canvas.width,
            canvas.height / 2,
            50,
            canvas.height,
            wallOptions
          ), // Right
        ]);
      };

      addWalls();

      // Create runner
      const runner = Matter.Runner.create();

      // Run the engine
      Matter.Runner.run(runner, engine);
      Matter.Render.run(render);

      // Handle window resize
      const handleResize = () => {
        updateCanvasSize();
        Matter.Render.setPixelRatio(render, window.devicePixelRatio);
        addWalls();
      };

      window.addEventListener('resize', handleResize);

      // Add initial elements based on initialPaidAccounts
      for (let i = 0; i < initialPaidAccounts; i++) {
        addElement(engine);
      }

      return () => {
        window.removeEventListener('resize', handleResize);
        Matter.Render.stop(render);
        Matter.Runner.stop(runner);
        Matter.World.clear(engine.world, false);
        Matter.Engine.clear(engine);
      };
    }, [initialPaidAccounts]);

    const addElement = (engine: Matter.Engine) => {
      if (!canvasRef.current) return;

      const canvas = canvasRef.current;
      const element = createBillElement(
        Math.random() * canvas.width,
        -elementSize,
        elementSize
      );

      Matter.Composite.add(engine.world, element);
      setElementCount((prev) => prev + 1);
    };

    // **Creates a Bill Instead of a Coin**
    const createBillElement = (x: number, y: number, size: number) => {
      return Matter.Bodies.rectangle(
        x,
        y,
        size * 2, // Longer width for bills
        size / 2, // Shorter height for bills
        {
          render: {
            sprite: {
              texture: '/stack.png', // sprite image
              xScale: 0.2,
              yScale: 0.2,
            },
          },
          angle: Math.random() * Math.PI, // Random rotation for realism
          restitution: 0.3, // how Bouncy
          friction: 0.8, // how Slippery
        }
      );
    };

    useImperativeHandle(ref, () => ({
      addElements: (count: number) => {
        if (engineRef.current) {
          for (let i = 0; i < count; i++) {
            addElement(engineRef.current);
          }
          totalPaidAccountsRef.current += count;
        }
      },
      setTotalPaidAccounts: (count: number) => {
        totalPaidAccountsRef.current = count;
      },
    }));

    return (
      <div className='flex flex-col items-center space-y-4 p-4'>
        <div
          ref={containerRef}
          className='w-full h-[600px] rounded-b-2xl overflow-hidden'
        >
          <canvas ref={canvasRef} />
        </div>
        <div>Elements: {elementCount}</div>
      </div>
    );
  }
);

export default MoneyPit;
