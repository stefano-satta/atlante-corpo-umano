import { ta2Url } from '@/utils/format';

/** Termine latino della Terminologia Anatomica, con il numero che rimanda alla voce ufficiale. */
export function LatinTerm({ term, ta2 }: { term: string; ta2: number }) {
  return (
    <p className="latin-term">
      <span lang="la">{term}</span>{' '}
      <a className="ta2" href={ta2Url(ta2)} target="_blank" rel="noopener noreferrer">
        <span className="visually-hidden">Terminologia Anatomica, voce </span>TA2 {ta2}
      </a>
    </p>
  );
}
