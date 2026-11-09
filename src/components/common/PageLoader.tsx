import { LoadingBar } from './LoadingBar';

/** Caricamento di una pagina di lettura (Glossario, Indice): dice cosa si sta caricando, al posto del testo. */
export function PageLoader({ label }: { label: string }) {
  return (
    <div className="page-loader" role="status">
      <span>{label}</span>
      <LoadingBar />
    </div>
  );
}
