/**
 * Porta un elemento di una pagina di lettura subito sotto la ricerca, che resta ferma in alto,
 * e gli dà il fuoco. Nella versione testuale scorre la pagina intera.
 */
export function scrollBelowSearch(element: HTMLElement) {
  const page = element.closest<HTMLElement>('.reading-page');
  const bar = page?.querySelector<HTMLElement>('.search');
  const offset = (bar?.offsetHeight ?? 0) + 8;
  if (page && page.scrollHeight > page.clientHeight) {
    const top = element.getBoundingClientRect().top - page.getBoundingClientRect().top + page.scrollTop;
    page.scrollTo({ top: top - offset });
  } else {
    scrollTo({ top: element.getBoundingClientRect().top + scrollY - offset });
  }
  element.focus({ preventScroll: true });
}
