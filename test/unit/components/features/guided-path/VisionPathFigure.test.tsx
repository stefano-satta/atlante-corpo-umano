// @vitest-environment jsdom
import '../../../../dom-setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { VisionPathFigure } from '@/components/features/guided-path/VisionPathFigure';
import { VISION_PATH_PHASES, type VisionPathDiagramId } from '@/models/visionPath';
import { SCHEMI_PERCORSO } from '../../../../../pipeline/contenuti/regole.mjs';

const diagram = () => document.querySelector('.vision-diagram') as SVGElement;

afterEach(cleanup);

describe('schemi del percorso "Dalla luce all\'immagine"', () => {
  it('ogni schema è ammesso dalla pipeline', () => {
    for (const schema of Object.keys(VISION_PATH_PHASES)) expect(SCHEMI_PERCORSO).toContain(schema);
  });

  it('il primo passo scorre tutte le fasi della vista', () => {
    render(<VisionPathFigure schema="vista" />);
    expect(diagram().dataset.phase).toBe('cornea');
    fireEvent.click(screen.getByRole('button', { name: 'Fase 6: Corteccia visiva' }));
    expect(diagram().dataset.phase).toBe('corteccia');
  });

  it('uno schema con una sola fase mostra il disegno e la didascalia, senza comandi', () => {
    const single = (Object.keys(VISION_PATH_PHASES) as VisionPathDiagramId[]).filter(
      (s) => VISION_PATH_PHASES[s].length === 1,
    );
    expect(single.length).toBeGreaterThan(0);
    render(<VisionPathFigure schema="vista-chiasma" />);
    expect(diagram().dataset.phase).toBe('chiasma');
    expect(document.querySelector('.phase-caption strong')?.textContent).toBe('Chiasma ottico');
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.queryByText(/Fase 1 di 1/)).toBeNull();
  });
});
