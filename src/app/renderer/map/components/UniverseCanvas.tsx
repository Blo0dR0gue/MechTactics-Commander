import { useEffect, useRef } from 'react';
import UniverseController from '../controller/UniverseController';

export default function UniverseCanvas(): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const canvasContextRef = useRef<CanvasRenderingContext2D | null>(null);
  const engine = useRef<UniverseController | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) {
      return;
    }
    const context = canvas.getContext('2d');
    if (context === null) {
      return;
    }
    canvasContextRef.current = context;

    engine.current = new UniverseController({
      canvas: canvas,
      canvasCtx: context,
      onSelectedPlanetsChange: (): void => {}
    });

    engine.current.startRendering();
    return (): void => {
      engine.current?.stopRendering();
      engine.current = null;
      canvasContextRef.current = null;
    };
  }, []);

  return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}
