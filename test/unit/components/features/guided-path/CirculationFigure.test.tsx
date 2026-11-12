// @vitest-environment jsdom
import '../../../../dom-setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { CirculationFigure } from '@/components/features/guided-path/CirculationFigure';
import { CIRCULATION_PHASES, type CirculationDiagramId } from '@/models/circulation';
import { SCHEMI_PERCORSO } from '../../../../../pipeline/contenuti/regole.mjs';

const SCHEMAS = Object.keys(CIRCULATION_PHASES) as CirculationDiagramId[];
const diagram = () => document.querySelector('.circulation-diagram') as SVGElement;
const lit = () => [...diagram().querySelectorAll('[data-active]')];

afterEach(cleanup);

describe('schema del giro del sangue', () => {
  it('ha un disegno per ogni schema del percorso ammesso dalla pipeline', () => {
    for (const schema of SCHEMAS) expect(SCHEMI_PERCORSO).toContain(schema);
  });

  it('in ogni fase di ogni schema accende almeno un tratto', () => {
    for (const schema of SCHEMAS) {
      render(<CirculationFigure schema={schema} />);
      CIRCULATION_PHASES[schema].forEach((phase, i) => {
        fireEvent.click(screen.getByRole('button', { name: `Fase ${i + 1}: ${phase.label}` }));
        expect(diagram().dataset.phase).toBe(phase.id);
        expect(lit().length).toBeGreaterThan(0);
      });
      cleanup();
    }
  });

  it('segue il sangue dalle vene polmonari al ventricolo sinistro', () => {
    render(<CirculationFigure schema="cuore-sinistro" />);
    expect(screen.getByRole('figure', { name: 'Schema delle vene polmonari e del cuore sinistro' })).toBeTruthy();
    expect(diagram().querySelector('.vessel.rich[data-active]')).toBeTruthy();
    fireEvent.click(screen.getByRole('button', { name: 'Fase successiva' }));
    expect(diagram().dataset.phase).toBe('mitrale');
    expect(diagram().querySelector('.valve[data-active]')).toBeTruthy();
    expect(screen.getByText(/dall'atrio al ventricolo sinistro/)).toBeTruthy();
  });

  it('mostra coronarie e seno coronarico solo nel loro passo', () => {
    render(<CirculationFigure schema="aorta" />);
    expect(diagram().querySelectorAll('.vessel.thin')).toHaveLength(2);
    cleanup();
    render(<CirculationFigure schema="coronarie" />);
    expect(diagram().querySelectorAll('.vessel.thin')).toHaveLength(4);
  });
});
