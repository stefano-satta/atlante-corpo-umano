// @vitest-environment jsdom
import '../../../../dom-setup';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import { UrinePathFigure } from '@/components/features/guided-path/UrinePathFigure';
import { URINE_PATH_PHASES } from '@/models/urinePath';
import { SCHEMI_PERCORSO } from '../../../../../pipeline/contenuti/regole.mjs';

const diagram = () => document.querySelector('.urinary-diagram') as SVGElement;

afterEach(cleanup);

describe('schemi del percorso "Come si forma l\'urina"', () => {
  it('ogni schema è ammesso dalla pipeline', () => {
    for (const schema of Object.keys(URINE_PATH_PHASES)) expect(SCHEMI_PERCORSO).toContain(schema);
  });

  it("il primo passo scorre tutte le fasi, dai reni all'uretra", () => {
    render(<UrinePathFigure schema="urina" body="uomo" />);
    expect(diagram().dataset.phase).toBe('filtrazione');
    fireEvent.click(screen.getByRole('button', { name: "Fase 5: L'urina esce" }));
    expect(diagram().dataset.phase).toBe('minzione');
  });

  it("disegna il corpo mostrato nell'atlante", () => {
    render(<UrinePathFigure schema="urina-minzione" body="donna" />);
    expect(diagram().dataset.body).toBe('donna');
    expect(diagram().dataset.phase).toBe('minzione');
    expect(screen.queryByRole('button')).toBeNull();
  });
});
