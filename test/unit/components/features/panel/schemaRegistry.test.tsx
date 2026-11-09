import { describe, expect, it } from 'vitest';
import {
  apparatusProcesses,
  FIGURE_SCHEMAS,
  PROCESS_SCHEMAS,
  sectionProcesses,
} from '@/components/features/panel/schemaRegistry';
import type { Process } from '@/models/content';
import { FIGURE, SCHEMI_PROCESSO } from '../../../../../pipeline/contenuti/regole.mjs';

const process = (id: string, schema: Process['schema']) => ({ id, schema }) as Process;

describe('registro degli schemi', () => {
  it('ha un disegno per ogni schema che la pipeline ammette', () => {
    expect(Object.keys(PROCESS_SCHEMAS).sort()).toEqual([...SCHEMI_PROCESSO].sort());
    expect(Object.keys(FIGURE_SCHEMAS).sort()).toEqual([...FIGURE].sort());
  });

  it('tiene il ciclo cardiaco nella sezione "Il processo" e fuori dagli apparati', () => {
    const list = [process('a', 'cuore'), process('b', 'tiroide')];
    expect(sectionProcesses(list).map((p) => p.id)).toEqual(['a']);
    expect(apparatusProcesses(list, 'endocrino').map((x) => x.process.id)).toEqual(['b']);
  });

  it("mette per primo l'apparato dell'organo", () => {
    const list = [process('maschile', 'genitale-maschile'), process('urina', 'urinario')];
    expect(apparatusProcesses(list, 'urinario').map((x) => x.apparatus)).toEqual(['urinario', 'riproduttivo']);
    expect(apparatusProcesses(list, 'genitale-maschile').map((x) => x.apparatus)).toEqual(['riproduttivo', 'urinario']);
  });
});
