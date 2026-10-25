// Raggruppa gli elementi di BodyParts3D negli organi selezionabili del prototipo,
// in base al nome inglese (FMA) riportato nell'intestazione di ogni OBJ.
// I polmoni mancano in BodyParts3D: arrivano da Z-Anatomy (esporta-polmoni.py), un lobo per file.
// Gli organi femminili arrivano dallo Human Reference Atlas (organi-donna.mjs, D29). `corpo` segna
// gli organi che si vedono solo nel corpo maschile o solo in quello femminile; gli altri sono comuni.

export const GRUPPI_ORGANI = [
  {
    id: 'cuore',
    elementi:
      /^(Wall of (left |right )?(atrium|ventricle)|.*papillary muscle.*|.*(cusp|leaflet) of (aortic|pulmonary|mitral|tricuspid) valve)$/i,
  },
  {
    id: 'encefalo',
    elementi:
      /(gyrus|occipital lobe|parietal lobule|insula|Cerebellum|White matter of .* cerebral hemisphere|Midbrain|Peduncle of midbrain|Pons|Medulla oblongata|thalamus|Hypothalamus|Corpus callosum|amygdala|hippocampus|caudate nucleus|putamen|globus pallidus|fornix of forebrain)$/i,
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
  { id: 'utero', corpo: 'donna', elementi: /^Uterus$/ },
  { id: 'tube-uterine', corpo: 'donna', elementi: /^(Right|Left) uterine tube$/ },
  { id: 'ovaie', corpo: 'donna', elementi: /^(Right|Left) ovary$/ },
  // Ricostruzione schematica, non un modello anatomico (organi-donna.mjs).
  { id: 'vagina', corpo: 'donna', elementi: /^Vagina$/ },
  { id: 'mammelle', corpo: 'donna', elementi: /^(Right|Left) breast$/ },
];
