# Atlante del corpo umano

Atlante interattivo del corpo umano in 3D: scheletro, organi e muscoli esplorabili nel browser, con schede di testo scientifiche e citate, glossario e schemi animati dei processi fisiologici.

Sito statico costruito con Vite, React 19, TypeScript, three.js (React Three Fiber) e camera-controls.

## Avvio

```bash
npm install
npm run dev        # sviluppo (include le bozze)
npm run build      # build di produzione in dist/ (solo testi approvati)
npm test           # test unitari (Vitest)
npm run test:e2e   # test end-to-end (Playwright)
```

## Struttura

- `src/` — applicazione React e scena 3D
- `contenuti/` — testi delle strutture, dei processi e dei percorsi (Markdown + YAML), fonti e glossario
- `pipeline/` — compilazione dei contenuti e preparazione dei modelli 3D
- `public/modelli/` — modelli 3D già pronti (`.glb`)
- `docs/` — decisioni di progetto e rapporti

## Contenuti e licenze

I testi citano solo fonti autorevoli (OpenStax Anatomy & Physiology 2e, NHLBI, FIPAT TA2) e non sostituiscono il parere di un medico.

I modelli 3D derivano da BodyParts3D (CC BY 4.0), Z-Anatomy (CC BY-SA 4.0) e Human Reference Atlas (CC BY 4.0): attribuzioni complete in [`public/modelli/LICENZE.md`](public/modelli/LICENZE.md).
