// ─── Caesar Cipher ───────────────────────────────────────────────────────────
export function caesarEncrypt(text, key) {
  const k = ((key % 26) + 26) % 26;
  const steps = [];
  const result = text.toUpperCase().split('').map((char) => {
    if (/[A-Z]/.test(char)) {
      const p = char.charCodeAt(0) - 65;
      const c = (p + k) % 26;
      steps.push({ char, p, k, c, result: String.fromCharCode(c + 65) });
      return String.fromCharCode(c + 65);
    }
    return char;
  }).join('');
  return { result, steps };
}

export function caesarDecrypt(text, key) {
  const k = ((key % 26) + 26) % 26;
  return caesarEncrypt(text, 26 - k);
}

// ─── Vigenère Cipher ─────────────────────────────────────────────────────────
export function vigenereEncrypt(text, keyword) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const key = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  if (!key.length) return { result: '', steps: [] };
  const steps = [];
  let ki = 0;
  const result = clean.split('').map((char) => {
    const p = char.charCodeAt(0) - 65;
    const k = key[ki % key.length].charCodeAt(0) - 65;
    const c = (p + k) % 26;
    steps.push({ char, keyChar: key[ki % key.length], p, k, c, result: String.fromCharCode(c + 65) });
    ki++;
    return String.fromCharCode(c + 65);
  }).join('');
  return { result, steps };
}

export function vigenereDecrypt(text, keyword) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const key = keyword.toUpperCase().replace(/[^A-Z]/g, '');
  if (!key.length) return { result: '', steps: [] };
  const steps = [];
  let ki = 0;
  const result = clean.split('').map((char) => {
    const c = char.charCodeAt(0) - 65;
    const k = key[ki % key.length].charCodeAt(0) - 65;
    const p = ((c - k) + 26) % 26;
    steps.push({ char, keyChar: key[ki % key.length], c, k, p, result: String.fromCharCode(p + 65) });
    ki++;
    return String.fromCharCode(p + 65);
  }).join('');
  return { result, steps };
}

// ─── Playfair Cipher ─────────────────────────────────────────────────────────
export function buildPlayfairMatrix(keyword) {
  const key = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const seen = new Set();
  const order = [];
  for (const c of key + 'ABCDEFGHIKLMNOPQRSTUVWXYZ') {
    if (!seen.has(c)) { seen.add(c); order.push(c); }
  }
  const matrix = [];
  for (let r = 0; r < 5; r++) matrix.push(order.slice(r * 5, r * 5 + 5));
  return matrix;
}

function playfairPosition(matrix, ch) {
  for (let r = 0; r < 5; r++)
    for (let c = 0; c < 5; c++)
      if (matrix[r][c] === ch) return [r, c];
  return [-1, -1];
}

function playfairPairs(text) {
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs = [];
  let i = 0;
  while (i < clean.length) {
    const a = clean[i];
    const b = clean[i + 1];
    if (!b) { pairs.push([a, 'X']); i++; }
    else if (a === b) { pairs.push([a, 'X']); i++; }
    else { pairs.push([a, b]); i += 2; }
  }
  return pairs;
}

export function playfairEncrypt(text, keyword) {
  const matrix = buildPlayfairMatrix(keyword);
  const pairs = playfairPairs(text);
  const steps = [];
  const result = pairs.map(([a, b]) => {
    const [ra, ca] = playfairPosition(matrix, a);
    const [rb, cb] = playfairPosition(matrix, b);
    let ea, eb, rule;
    if (ra === rb) {
      ea = matrix[ra][(ca + 1) % 5]; eb = matrix[rb][(cb + 1) % 5]; rule = 'Same row → shift right';
    } else if (ca === cb) {
      ea = matrix[(ra + 1) % 5][ca]; eb = matrix[(rb + 1) % 5][cb]; rule = 'Same column → shift down';
    } else {
      ea = matrix[ra][cb]; eb = matrix[rb][ca]; rule = 'Rectangle → swap columns';
    }
    steps.push({ pair: `${a}${b}`, encrypted: `${ea}${eb}`, rule });
    return ea + eb;
  }).join('');
  return { result, steps, matrix };
}

export function playfairDecrypt(text, keyword) {
  const matrix = buildPlayfairMatrix(keyword);
  const pairs = playfairPairs(text);
  const steps = [];
  const result = pairs.map(([a, b]) => {
    const [ra, ca] = playfairPosition(matrix, a);
    const [rb, cb] = playfairPosition(matrix, b);
    let da, db, rule;
    if (ra === rb) {
      da = matrix[ra][(ca + 4) % 5]; db = matrix[rb][(cb + 4) % 5]; rule = 'Same row → shift left';
    } else if (ca === cb) {
      da = matrix[(ra + 4) % 5][ca]; db = matrix[(rb + 4) % 5][cb]; rule = 'Same column → shift up';
    } else {
      da = matrix[ra][cb]; db = matrix[rb][ca]; rule = 'Rectangle → swap columns';
    }
    steps.push({ pair: `${a}${b}`, decrypted: `${da}${db}`, rule });
    return da + db;
  }).join('');
  return { result, steps, matrix };
}

// ─── Rail Fence Cipher ───────────────────────────────────────────────────────
export function railFenceEncrypt(text, rails) {
  const n = Math.max(2, rails);
  const fence = Array.from({ length: n }, () => []);
  let rail = 0, dir = 1;
  const positions = [];
  for (let i = 0; i < text.length; i++) {
    fence[rail].push(text[i]);
    positions.push(rail);
    if (rail === 0) dir = 1;
    else if (rail === n - 1) dir = -1;
    rail += dir;
  }
  const result = fence.map(r => r.join('')).join('');
  return { result, fence, positions };
}

export function railFenceDecrypt(text, rails) {
  const n = Math.max(2, rails);
  const len = text.length;
  const pattern = [];
  let rail = 0, dir = 1;
  for (let i = 0; i < len; i++) {
    pattern.push(rail);
    if (rail === 0) dir = 1;
    else if (rail === n - 1) dir = -1;
    rail += dir;
  }
  const indices = Array.from({ length: len }, (_, i) => i).sort((a, b) => pattern[a] - pattern[b] || a - b);
  const result = new Array(len);
  for (let i = 0; i < len; i++) result[indices[i]] = text[i];
  return { result: result.join('') };
}

// ─── Columnar Transposition ──────────────────────────────────────────────────
export function columnarEncrypt(text, key) {
  const clean = text.replace(/\s/g, '').toUpperCase();
  const numCols = key.length;
  const numRows = Math.ceil(clean.length / numCols);
  const padded = clean.padEnd(numRows * numCols, 'X');

  const grid = [];
  for (let r = 0; r < numRows; r++)
    grid.push(padded.slice(r * numCols, (r + 1) * numCols).split(''));

  const keyUpper = key.toUpperCase();
  const order = keyUpper.split('').map((c, i) => ({ c, i, num: parseInt(c) || c.charCodeAt(0) }))
    .sort((a, b) => a.num - b.num || a.i - b.i)
    .map(x => x.i);

  let result = '';
  for (const col of order)
    for (const row of grid) result += row[col] || '';

  return { result, grid, order, numCols, numRows, keyUpper };
}

export function columnarDecrypt(text, key) {
  const numCols = key.length;
  const numRows = Math.ceil(text.length / numCols);
  const keyUpper = key.toUpperCase();
  const order = keyUpper.split('').map((c, i) => ({ c, i, num: parseInt(c) || c.charCodeAt(0) }))
    .sort((a, b) => a.num - b.num || a.i - b.i)
    .map(x => x.i);

  // Build columns
  const cols = new Array(numCols);
  let idx = 0;
  for (const col of order) {
    cols[col] = text.slice(idx, idx + numRows).split('');
    idx += numRows;
  }

  let result = '';
  for (let r = 0; r < numRows; r++)
    for (let c = 0; c < numCols; c++) result += cols[c]?.[r] || '';

  return { result: result.trimEnd() };
}
