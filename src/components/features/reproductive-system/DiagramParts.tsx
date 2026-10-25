import type { ReactNode } from 'react';

/**
 * Un organo dello schema: si colora quando lavora nel passo e ha il contorno chiaro quando è
 * l'organo della scheda aperta. I condotti (duct) sono tratti spessi invece che forme piene.
 */
export function Organ({
  id,
  active,
  current,
  duct = false,
  thin = false,
  children,
}: {
  id: string;
  active: boolean;
  current: boolean;
  duct?: boolean;
  thin?: boolean;
  children: ReactNode;
}) {
  return (
    <g
      className={`organ${duct ? ' duct' : ''}${thin ? ' thin' : ''}`}
      data-organ={id}
      data-active={active}
      data-current={current}
    >
      {children}
    </g>
  );
}

/** Freccia di cammino: un tratteggio che scorre durante la riproduzione, visibile solo nella sua fase. */
export function Flow({ d, on, marker = 'apparatus-arrow' }: { d: string; on: boolean; marker?: string }) {
  return <path className="flow" data-on={on} d={d} markerEnd={`url(#${marker})`} />;
}
