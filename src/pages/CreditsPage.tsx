import { type ReactNode, useState } from 'react';
import { Button } from '@/components/common/Button';
import { PageLink } from '@/components/common/PageLink';
import { ReadingLayout } from '@/components/features/layout/ReadingLayout';
import { GLOSSARY, GUIDED_PATHS, QUIZ_THEMES, STRUCTURES } from '@/utils/content';
import { LAYER_SLUGS } from '@/utils/url';

/** Indirizzo a cui scrivere per errori e proposte, con un modello già pronto nel programma di posta. */
const CONTACT_EMAIL = 'stefanosatta@outlook.com';

function mailto(subject: string, body: string) {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

const REPORT_ERROR = mailto(
  'Atlante del corpo umano: segnalazione di un errore',
  "Struttura o pagina (con il suo indirizzo):\n\nCosa c'è scritto o cosa succede:\n\nCosa ti aspettavi, e da quale fonte:\n\nBrowser e dispositivo:\n",
);
const PROPOSE = mailto(
  'Atlante del corpo umano: una proposta',
  "Cosa vorresti trovare nell'atlante:\n\nPerché ti servirebbe (studio, insegnamento, curiosità…):\n",
);

interface Entry {
  id: string;
  title: string;
  subtitle?: string;
  body: ReactNode;
}

/** I numeri dell'atlante si contano sui contenuti pubblicati, così restano veri a ogni build. */
function progress() {
  const questions = Object.values(QUIZ_THEMES).reduce((sum, t) => sum + t.domande, 0);
  return { structures: STRUCTURES.length, terms: GLOSSARY.length, paths: GUIDED_PATHS.length, questions };
}

function sections(): { id: string; title: string; entries: Entry[] }[] {
  const n = progress();
  const systems = Object.keys(LAYER_SLUGS).length;
  return [
    {
      id: 'progetto',
      title: 'Il progetto',
      entries: [
        {
          id: 'come-e-nato',
          title: 'Come è nato',
          body: (
            <>
              <p>
                L'atlante è cominciato come un esperimento: capire fin dove si arriva costruendo un'applicazione vera,
                dal primo file alla messa online, insieme a Claude Code, l'assistente di programmazione di Anthropic. La
                divisione dei compiti è semplice. Io decido cosa serve, come deve comportarsi e quando un testo è
                pronto; Claude Code mi aiuta a scrivere il codice, a preparare i modelli 3D, a confrontare i testi con
                le fonti e a trovare i casi a cui non avevo pensato.
              </p>
              <p>
                Strada facendo l'esperimento è diventato un atlante da usare davvero: un corpo da ruotare e sezionare
                nel browser, senza installare nulla, in cui ogni frase dice da dove viene.
              </p>
            </>
          ),
        },
        {
          id: 'regole',
          title: 'Le regole che mi sono dato',
          body: (
            <ul>
              <li>
                <strong>Ogni affermazione ha una fonte.</strong> I testi si scrivono solo da fonti autorevoli, lette e
                controllate: manuali universitari aperti, enti di sanità pubblica, la terminologia anatomica
                internazionale. Ogni paragrafo rimanda alla sua fonte, e un controllo automatico ferma la pubblicazione
                se ne manca una. Il metodo completo è nella pagina <PageLink page="informazioni">Informazioni</PageLink>
                .
              </li>
              <li>
                <strong>Dire anche cosa non si sa.</strong> I testi non sono stati rivisti da un medico e lo dicono.
                Dove le fonti non concordano, o il modello 3D semplifica, la differenza è dichiarata.
              </li>
              <li>
                <strong>Solo materiali liberi.</strong> Modelli, caratteri e programmi hanno licenze che permettono di
                riusarli; nulla viene da opere con licenze non commerciali.
              </li>
              <li>
                <strong>Niente account, niente pubblicità, niente tracciamento.</strong> Apri la pagina ed esplori. Non
                ci sono cookie di profilazione né statistiche su quello che fai: il tour già visto e il miglior
                risultato del quiz restano nel tuo browser.
              </li>
              <li>
                <strong>Per tutti.</strong> L'atlante funziona dal telefono, si usa con la tastiera, rispetta chi
                preferisce meno movimento e, se il dispositivo non regge il 3D, si legge in una versione solo testo.
              </li>
            </ul>
          ),
        },
        {
          id: 'a-che-punto',
          title: 'A che punto è',
          body: (
            <p>
              Oggi l'atlante conta {n.structures} strutture descritte in {systems} apparati, {n.terms} voci di
              glossario, {n.paths === 1 ? '1 percorso guidato' : `${n.paths} percorsi guidati`} e {n.questions} domande
              di quiz. Preferisco aggiungere poche strutture alla volta, verificate una per una, che riempire l'atlante
              di testi da controllare.
            </p>
          ),
        },
      ],
    },
    {
      id: 'crediti',
      title: 'Crediti',
      entries: [
        {
          id: 'modelli',
          title: 'Modelli 3D',
          subtitle: 'BodyParts3D, Z-Anatomy, Human Reference Atlas',
          body: (
            <ul>
              <li>
                <strong>BodyParts3D</strong>, © The Database Center for Life Science (DBCLS): il corpo di partenza, con
                ossa, organi, muscoli e vasi. Licenza CC BY 4.0; i modelli semplificati usati nel sito sono distribuiti
                con licenza CC BY-SA 4.0.
              </li>
              <li>
                <strong>Z-Anatomy</strong>, The libre 3D atlas of anatomy (Gauthier Kervyn e altri autori): le strutture
                che BodyParts3D non contiene, come polmoni, tiroide, parte dei muscoli, dei vasi e dei nervi. Licenza CC
                BY-SA 4.0.
              </li>
              <li>
                <strong>Human Reference Atlas</strong>, 3D Reference Object Library (HuBMAP; Kristen Browne, Heidi
                Schlehlein e altri autori): gli organi del corpo femminile. Licenza CC BY 4.0.
              </li>
            </ul>
          ),
        },
        {
          id: 'fonti',
          title: 'Fonti dei testi',
          subtitle: 'OpenStax, NHLBI, FIPAT, StatPearls',
          body: (
            <p>
              I testi sono scritti a partire da OpenStax Anatomy and Physiology 2e, dalle pagine del National Heart,
              Lung, and Blood Institute (NHLBI), dalla Terminologia Anatomica (TA2) del FIPAT e, per muscoli, vasi e
              nervi che il manuale non descrive, da StatPearls. Le opere sono usate solo come fonti delle affermazioni:
              nessun loro testo o immagine è riprodotto. L'elenco completo, con le date di consultazione, è nella pagina{' '}
              <PageLink page="fonti">Fonti</PageLink>.
            </p>
          ),
        },
        {
          id: 'caratteri',
          title: 'Caratteri',
          subtitle: 'Bricolage Grotesque, Atkinson Hyperlegible Next',
          body: (
            <p>
              Bricolage Grotesque (The Bricolage Grotesque Project Authors) per i titoli e Atkinson Hyperlegible Next
              (The Atkinson Hyperlegible Next Project Authors) per il testo, entrambi con licenza SIL Open Font License
              1.1.
            </p>
          ),
        },
        {
          id: 'programmi',
          title: 'Programmi',
          subtitle: 'React, three.js, React Three Fiber, camera-controls',
          body: (
            <p>
              Il sito è costruito con React, React Router, three.js, React Three Fiber e camera-controls, tutti con
              licenza MIT, e scritto con l'aiuto di Claude Code.
            </p>
          ),
        },
      ],
    },
  ];
}

/**
 * Credits: chi ha fatto l'atlante, con quali regole e con quali materiali, e come segnalare un errore.
 * Ha lo stile del Glossario: gruppi con un titolo e voci che si aprono dal nome.
 */
export function CreditsPage() {
  const groups = sections();
  const ids = groups.flatMap((g) => g.entries.map((e) => e.id));
  const [open, setOpen] = useState<ReadonlySet<string>>(() => new Set(['come-e-nato']));
  const allOpen = ids.every((id) => open.has(id));

  const toggle = (id: string, isOpen: boolean) =>
    setOpen((current) => {
      if (current.has(id) === isOpen) return current;
      const next = new Set(current);
      if (isOpen) next.add(id);
      else next.delete(id);
      return next;
    });

  return (
    <ReadingLayout title="Credits">
      <div className="atlas-index glossary-page credits-page">
        <p className="credits-lead">Un corpo da esplorare, con testi che dicono da dove vengono.</p>
        <p className="intro">
          L'Atlante del corpo umano è un sito divulgativo per esplorare il corpo in tre dimensioni e leggere, struttura
          per struttura, testi scritti da fonti autorevoli e citati frase per frase. È gratis, non chiede un account e
          non mostra pubblicità.
        </p>

        <div className="glossary-tools">
          <Button variant="text" onClick={() => setOpen(new Set(allOpen ? [] : ids))}>
            {allOpen ? 'Chiudi tutte le sezioni' : 'Apri tutte le sezioni'}
          </Button>
        </div>

        {groups.map((g) => (
          <section key={g.id} className="glossary-letter" aria-labelledby={`credits-${g.id}`}>
            <h2 id={`credits-${g.id}`}>{g.title}</h2>
            <ul className="glossary">
              {g.entries.map((e) => (
                <li key={e.id}>
                  <details
                    id={`credits-${e.id}`}
                    className="glossary-entry"
                    open={open.has(e.id)}
                    onToggle={(ev) => toggle(e.id, ev.currentTarget.open)}
                  >
                    <summary>
                      <span className="entry-name">{e.title}</span>
                      {e.subtitle && <span className="entry-term">{e.subtitle}</span>}
                    </summary>
                    <div className="glossary-body credits-body">{e.body}</div>
                  </details>
                </li>
              ))}
            </ul>
          </section>
        ))}

        <section className="glossary-letter credits-contact" aria-labelledby="credits-contatti">
          <h2 id="credits-contatti">Hai trovato un errore o ti manca qualcosa?</h2>
          <p>
            Scrivimi. Se un testo ti sembra sbagliato, indica la struttura, cosa c'è scritto e, se puoi, la fonte che
            dice altro: ogni segnalazione si controlla sulle fonti prima di cambiare il testo. Se qualcosa non funziona,
            raccontami cosa stavi facendo e con quale browser. Se ti serve una struttura o un percorso che non c'è,
            descrivimi a cosa ti servirebbe.
          </p>
          <p className="credits-actions">
            <a className="action" href={REPORT_ERROR}>
              Segnala un errore
            </a>
            <a className="action" href={PROPOSE}>
              Proponi un'aggiunta
            </a>
          </p>
          <p className="credits-note">
            I pulsanti aprono il tuo programma di posta con un modello già pronto. Puoi anche scrivere direttamente a{' '}
            <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
          </p>
        </section>
      </div>
    </ReadingLayout>
  );
}
