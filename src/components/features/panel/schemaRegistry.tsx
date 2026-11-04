import { type ComponentType, type LazyExoticComponent, lazy, type ReactNode } from 'react';
import type { BodyKind } from '@/models/atlas';
import type { Figure, Process } from '@/models/content';

// Registro degli schemi che una scheda può mostrare. Il tipo obbliga ad avere una voce per ogni schema:
// per aggiungerne uno basta una riga qui, senza toccare `DetailSheet`. I disegni si scaricano solo
// quando si apre la scheda che li contiene.

const CardiacCycle = lazy(() => import('@/components/features/cardiac-cycle/CardiacCycle'));
const ReproductiveProcess = lazy(() => import('@/components/features/reproductive-system/ReproductiveProcess'));
const UrinaryProcess = lazy(() => import('@/components/features/urinary-system/UrinaryProcess'));
const ThyroidProcess = lazy(() => import('@/components/features/endocrine-system/ThyroidProcess'));
const VisionProcess = lazy(() => import('@/components/features/visual-system/VisionProcess'));

export type Apparatus = 'urinario' | 'riproduttivo' | 'endocrino' | 'visivo';

/** Titolo della sottosezione di un apparato e, se è il solo della scheda, inizio del titolo della sezione. */
export const APPARATUS: Record<Apparatus, { title: string; section: string }> = {
  urinario: { title: 'Apparato urinario', section: "L'apparato" },
  riproduttivo: { title: 'Apparato riproduttivo', section: "L'apparato" },
  // Il sistema endocrino è un "sistema", non un "apparato": il titolo della sezione lo segue.
  endocrino: { title: 'Sistema endocrino', section: 'Il sistema' },
  visivo: { title: 'Apparato visivo', section: "L'apparato" },
};

/** Apparato di ogni campo `apparato` delle strutture che ha degli schemi. */
const APPARATUS_OF_SYSTEM: Record<string, Apparatus> = {
  urinario: 'urinario',
  endocrino: 'endocrino',
  visivo: 'visivo',
  'genitale-maschile': 'riproduttivo',
  'genitale-femminile': 'riproduttivo',
};

interface ProcessContext {
  structure: string;
  body: BodyKind;
}

type ProcessSchema = Process['schema'];

interface ProcessEntry<S extends ProcessSchema> {
  /** Apparato in cui si mostra; null se lo schema sta nella sezione "Il processo" della scheda. */
  apparatus: Apparatus | null;
  render: (process: Extract<Process, { schema: S }>, context: ProcessContext) => ReactNode;
}

export const PROCESS_SCHEMAS: { [S in ProcessSchema]: ProcessEntry<S> } = {
  cuore: { apparatus: null, render: (process) => <CardiacCycle process={process} /> },
  'genitale-maschile': {
    apparatus: 'riproduttivo',
    render: (process, { structure }) => <ReproductiveProcess process={process} current={structure} />,
  },
  'genitale-femminile': {
    apparatus: 'riproduttivo',
    render: (process, { structure }) => <ReproductiveProcess process={process} current={structure} />,
  },
  urinario: {
    apparatus: 'urinario',
    render: (process, { structure, body }) => <UrinaryProcess process={process} current={structure} body={body} />,
  },
  tiroide: {
    apparatus: 'endocrino',
    render: (process, { structure }) => <ThyroidProcess process={process} current={structure} />,
  },
  vista: {
    apparatus: 'visivo',
    render: (process, { structure }) => <VisionProcess process={process} current={structure} />,
  },
};

export function renderProcess(process: Process, context: ProcessContext) {
  const render = PROCESS_SCHEMAS[process.schema].render as (p: Process, c: ProcessContext) => ReactNode;
  return render(process, context);
}

/** Schemi che stanno nella sezione "Il processo" della scheda. */
export const sectionProcesses = (processes: Process[]) =>
  processes.filter((p) => PROCESS_SCHEMAS[p.schema].apparatus === null);

/**
 * Schemi di un intero apparato, che hanno una sezione propria dopo il testo dell'organo: prima
 * quello dell'organo stesso (l'uretra maschile è in entrambi).
 */
export function apparatusProcesses(processes: Process[], system: string) {
  const own = APPARATUS_OF_SYSTEM[system];
  return processes
    .flatMap((process) => {
      const apparatus = PROCESS_SCHEMAS[process.schema].apparatus;
      return apparatus ? [{ process, apparatus }] : [];
    })
    .sort((a, b) => Number(b.apparatus === own) - Number(a.apparatus === own));
}

/** Figure disegnate delle schede, una per schema. */
export const FIGURE_SCHEMAS: Record<Figure['schema'], LazyExoticComponent<ComponentType<{ figure: Figure }>>> = {
  vulva: lazy(() => import('@/components/features/reproductive-system/VulvaFigure')),
  orecchio: lazy(() => import('@/components/features/hearing-system/EarFigure')),
  mammella: lazy(() => import('@/components/features/reproductive-system/BreastFigure')),
  denti: lazy(() => import('@/components/features/digestive-system/TeethFigure')),
};
