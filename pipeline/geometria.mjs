// Funzioni geometriche della pipeline: similitudine fra nuvole di punti (Umeyama) e
// allineamento iterativo per punti più vicini (ICP). I punti sono array [x, y, z].

/** Trasformazione di similitudine: p ↦ s·R·p + t (R matrice 3×3 per righe). */
export const IDENTITA = {
  R: [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ],
  s: 1,
  t: [0, 0, 0],
};

export function applica(T, p) {
  const { R, s, t } = T;
  return [0, 1, 2].map((r) => s * (R[r][0] * p[0] + R[r][1] * p[1] + R[r][2] * p[2]) + t[r]);
}

export function centroide(punti) {
  const c = [0, 0, 0];
  for (const p of punti) for (let k = 0; k < 3; k++) c[k] += p[k] / punti.length;
  return c;
}

/** Un punto ogni `passo`, per avere al più `n` punti. */
export function campiona(punti, n) {
  const passo = Math.max(1, Math.floor(punti.length / n));
  return punti.filter((_, i) => i % passo === 0);
}

/** Angolo della rotazione R, in gradi. */
export function angoloRotazione(R) {
  return (Math.acos(Math.min(1, Math.max(-1, (R[0][0] + R[1][1] + R[2][2] - 1) / 2))) * 180) / Math.PI;
}

const det = (M) =>
  M[0][0] * (M[1][1] * M[2][2] - M[1][2] * M[2][1]) -
  M[0][1] * (M[1][0] * M[2][2] - M[1][2] * M[2][0]) +
  M[0][2] * (M[1][0] * M[2][1] - M[1][1] * M[2][0]);

// Autovalori e autovettori (colonne di v) di una matrice simmetrica 3×3, metodo di Jacobi.
function jacobi(S) {
  const a = S.map((r) => [...r]);
  const v = [
    [1, 0, 0],
    [0, 1, 0],
    [0, 0, 1],
  ];
  for (let it = 0; it < 60; it++) {
    let [p, q] = [0, 1];
    for (const [i, j] of [
      [0, 2],
      [1, 2],
    ])
      if (Math.abs(a[i][j]) > Math.abs(a[p][q])) [p, q] = [i, j];
    if (Math.abs(a[p][q]) < 1e-18) break;
    const th = (a[q][q] - a[p][p]) / (2 * a[p][q]);
    const t = (th >= 0 ? 1 : -1) / (Math.abs(th) + Math.sqrt(th * th + 1));
    const c = 1 / Math.sqrt(t * t + 1);
    const s = t * c;
    for (let k = 0; k < 3; k++) [a[k][p], a[k][q]] = [c * a[k][p] - s * a[k][q], s * a[k][p] + c * a[k][q]];
    for (let k = 0; k < 3; k++) [a[p][k], a[q][k]] = [c * a[p][k] - s * a[q][k], s * a[p][k] + c * a[q][k]];
    for (let k = 0; k < 3; k++) [v[k][p], v[k][q]] = [c * v[k][p] - s * v[k][q], s * v[k][p] + c * v[k][q]];
  }
  return { valori: [a[0][0], a[1][1], a[2][2]], vettori: v };
}

// Decomposizione ai valori singolari di una matrice 3×3: A = U·diag(s)·Vᵀ.
function svd3(A) {
  const AtA = [0, 1, 2].map((r) => [0, 1, 2].map((c) => A[0][r] * A[0][c] + A[1][r] * A[1][c] + A[2][r] * A[2][c]));
  const { valori, vettori } = jacobi(AtA);
  const ordine = [0, 1, 2].sort((a, b) => valori[b] - valori[a]);
  const V = [0, 1, 2].map((r) => ordine.map((j) => vettori[r][j]));
  const s = ordine.map((j) => Math.sqrt(Math.max(valori[j], 0)));
  const U = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let c = 0; c < 3; c++) {
    const u = [0, 1, 2].map((r) => A[r][0] * V[0][c] + A[r][1] * V[1][c] + A[r][2] * V[2][c]);
    const l = Math.hypot(...u) || 1;
    for (let r = 0; r < 3; r++) U[r][c] = u[r] / l;
  }
  if (s[2] < 1e-12) {
    // Terza colonna degenere: si completa la base con il prodotto vettoriale.
    const [a, b] = [0, 1].map((c) => [U[0][c], U[1][c], U[2][c]]);
    const x = [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
    for (let r = 0; r < 3; r++) U[r][2] = x[r];
  }
  return { U, s, V };
}

/**
 * Similitudine che porta i punti P sui corrispondenti Q nel senso dei minimi quadrati
 * (Umeyama 1991). Con `soloTraslazione` scala e rotazione restano quelle di `base`.
 */
export function similitudine(P, Q, { soloTraslazione = false, base = IDENTITA } = {}) {
  const n = P.length;
  if (soloTraslazione) {
    const d = [0, 0, 0];
    for (let i = 0; i < n; i++) {
      const x = applica({ ...base, t: [0, 0, 0] }, P[i]);
      for (let k = 0; k < 3; k++) d[k] += (Q[i][k] - x[k]) / n;
    }
    return { ...base, t: d };
  }
  const mp = centroide(P);
  const mq = centroide(Q);
  let varianza = 0;
  const S = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0],
  ];
  for (let i = 0; i < n; i++) {
    const a = P[i].map((x, k) => x - mp[k]);
    const b = Q[i].map((x, k) => x - mq[k]);
    varianza += (a[0] ** 2 + a[1] ** 2 + a[2] ** 2) / n;
    for (let r = 0; r < 3; r++) for (let c = 0; c < 3; c++) S[r][c] += (b[r] * a[c]) / n;
  }
  const { U, s, V } = svd3(S);
  const D = [1, 1, det(U) * det(V) < 0 ? -1 : 1];
  const R = [0, 1, 2].map((r) =>
    [0, 1, 2].map((c) => U[r][0] * D[0] * V[c][0] + U[r][1] * D[1] * V[c][1] + U[r][2] * D[2] * V[c][2]),
  );
  const scala = (s[0] * D[0] + s[1] * D[1] + s[2] * D[2]) / varianza;
  const t = [0, 1, 2].map((r) => mq[r] - scala * (R[r][0] * mp[0] + R[r][1] * mp[1] + R[r][2] * mp[2]));
  return { R, s: scala, t };
}

/** Punto di `Q` più vicino a `x` e la sua distanza. */
export function piuVicino(x, Q) {
  let migliore = Number.POSITIVE_INFINITY;
  let punto = Q[0];
  for (const q of Q) {
    const d = (q[0] - x[0]) ** 2 + (q[1] - x[1]) ** 2 + (q[2] - x[2]) ** 2;
    if (d < migliore) [migliore, punto] = [d, q];
  }
  return { punto, distanza: Math.sqrt(migliore) };
}

/**
 * ICP a coppie di strutture: ogni punto di una struttura sorgente cerca il più vicino solo
 * nella struttura corrispondente. Parte da `iniziale` (se manca: stessi centroidi e stessa
 * dispersione) e restituisce la trasformazione con lo scarto medio, nelle unità dei punti.
 */
export function icp(coppie, { iniziale, soloTraslazione = false, iterazioni = 40 } = {}) {
  let T = iniziale;
  if (!T) {
    const P = coppie.flatMap(([p]) => p);
    const Q = coppie.flatMap(([, q]) => q);
    const [cp, cq] = [centroide(P), centroide(Q)];
    const dispersione = (punti, c) =>
      Math.sqrt(
        punti.reduce((s, p) => s + (p[0] - c[0]) ** 2 + (p[1] - c[1]) ** 2 + (p[2] - c[2]) ** 2, 0) / punti.length,
      );
    const s = dispersione(Q, cq) / dispersione(P, cp);
    T = { ...IDENTITA, s, t: [0, 1, 2].map((k) => cq[k] - s * cp[k]) };
  }
  let scarto = Number.POSITIVE_INFINITY;
  for (let it = 0; it < iterazioni; it++) {
    const P = [];
    const Q = [];
    let somma = 0;
    for (const [sorgente, destinazione] of coppie)
      for (const p of sorgente) {
        const { punto, distanza } = piuVicino(applica(T, p), destinazione);
        P.push(p);
        Q.push(punto);
        somma += distanza;
      }
    const nuovo = somma / P.length;
    T = similitudine(P, Q, { soloTraslazione, base: T });
    if (Math.abs(scarto - nuovo) < 1e-7) {
      scarto = nuovo;
      break;
    }
    scarto = nuovo;
  }
  return { T, scarto };
}
