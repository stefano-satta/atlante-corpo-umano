// Raggruppa gli elementi di BodyParts3D negli organi selezionabili del prototipo,
// in base al nome inglese (FMA) riportato nell'intestazione di ogni OBJ.
// Polmoni, tiroide e paratiroidi mancano in BodyParts3D: arrivano da Z-Anatomy (esporta-polmoni.py,
// un lobo per file, ed esporta-tiroide.py).
// Vince il primo gruppo che corrisponde: ipotalamo e ipofisi precedono l'encefalo, il cui elenco
// contiene "thalamus" (che corrisponderebbe anche a "Hypothalamus").
// Gli organi femminili arrivano dallo Human Reference Atlas (organi-donna.mjs, D29). `corpo` segna
// gli organi che si vedono solo nel corpo maschile o solo in quello femminile; gli altri sono comuni.
// `nervo` ammette elementi con "nerve" nel nome, che classifica.mjs altrimenti esclude dagli organi.

export const GRUPPI_ORGANI = [
  // L'ipotalamo è parte dell'encefalo, ma si seleziona da solo come organo del sistema endocrino.
  { id: 'ipotalamo', elementi: /^Hypothalamus$/ },
  { id: 'ipofisi', elementi: /^Pituitary gland$/ },
  {
    id: 'cuore',
    elementi:
      /^(Wall of (left |right )?(atrium|ventricle)|.*papillary muscle.*|.*(cusp|leaflet) of (aortic|pulmonary|mitral|tricuspid) valve)$/i,
  },
  {
    id: 'encefalo',
    elementi:
      /(gyrus|occipital lobe|parietal lobule|insula|Cerebellum|White matter of .* cerebral hemisphere|Midbrain|Peduncle of midbrain|Pons|Medulla oblongata|thalamus|Corpus callosum|amygdala|hippocampus|caudate nucleus|putamen|globus pallidus|fornix of forebrain)$/i,
  },
  // Apparato visivo. Dell'occhio entrano le parti visibili dall'esterno e il cristallino: coroide,
  // corpo ciliare, retina, corpo vitreo e camera anteriore restano nascosti dentro la sclera e
  // peserebbero sul modello senza mostrarsi; li descrivono la scheda e lo schema animato.
  { id: 'occhi', elementi: /^(Right|Left) (sclera|cornea|iris|lens)$/ },
  { id: 'nervo-ottico', nervo: true, elementi: /^(Right|Left) (optic nerve|optic tract|lateral geniculate body)$/ },
  {
    id: 'apparato-lacrimale',
    elementi: /^(Right|Left) (lacrimal gland|lacrimal canaliculus|lacrimal sac|nasolacrimal duct)$/,
  },
  { id: 'fegato', elementi: /^(Caudate lobe of liver|Hepatovenous segment [IVX]+)$/ },
  { id: 'colecisti', elementi: /^Gallbladder$/ },
  { id: 'esofago', elementi: /^Esophagus$/ },
  { id: 'stomaco', elementi: /^Stomach$/ },
  { id: 'intestino-tenue', elementi: /^(Duodenum|(Proximal|Middle|Distal) part of (jejunum|ileum))$/ },
  { id: 'intestino-crasso', elementi: /^(Appendix|(Ascending|Transverse|Descending) colon|Rectum)$/ },
  { id: 'pancreas', elementi: /^Pancreas$/ },
  { id: 'milza', elementi: /^Spleen$/ },
  { id: 'reni', elementi: /^(Right|Left) kidney$/ },
  { id: 'vescica', elementi: /^Urinary bladder$/ },
  // L'uretra di BodyParts3D è maschile: attraversa prostata e pene.
  { id: 'uretra', corpo: 'uomo', elementi: /^Urethra$/ },
  { id: 'testicoli', corpo: 'uomo', elementi: /^(Right|Left) testis$/ },
  { id: 'epididimi', corpo: 'uomo', elementi: /^(Right|Left) epididymis$/ },
  { id: 'dotti-deferenti', corpo: 'uomo', elementi: /^(Right|Left) deferent duct$/ },
  { id: 'vescichette-seminali', corpo: 'uomo', elementi: /^(Right|Left) seminal vesicle$/ },
  { id: 'prostata', corpo: 'uomo', elementi: /^Prostate$/ },
  { id: 'pene', corpo: 'uomo', elementi: /^(Corpus cavernosum of penis|Corpus spongiosum of penis|Glans penis)$/ },
  {
    id: 'trachea-bronchi',
    elementi:
      /^(Trachea|Left main bronchus|Right main bronchus proper|.*segmental bronchial tree|.*lingular bronchial tree)$/,
  },
  { id: 'polmoni', elementi: /^(Superior|Middle|Inferior) lobe of (right|left) lung$/ },
  { id: 'tiroide', elementi: /^Thyroid gland$/ },
  { id: 'paratiroidi', elementi: /^(Right|Left) (superior|inferior) parathyroid gland$/ },
  { id: 'utero', corpo: 'donna', elementi: /^Uterus$/ },
  { id: 'tube-uterine', corpo: 'donna', elementi: /^(Right|Left) uterine tube$/ },
  { id: 'ovaie', corpo: 'donna', elementi: /^(Right|Left) ovary$/ },
  // Ricostruzione schematica, non un modello anatomico (organi-donna.mjs).
  { id: 'vagina', corpo: 'donna', elementi: /^Vagina$/ },
  { id: 'mammelle', corpo: 'donna', elementi: /^(Right|Left) breast$/ },
];
