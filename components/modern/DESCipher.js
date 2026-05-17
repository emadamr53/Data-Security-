'use client';
import { useState } from 'react';
import CryptoJS from 'crypto-js';

const STEPS = [
  'Initial Permutation (IP) — reorder 64-bit plaintext bits',
  'Split into L₀ (32 bits) and R₀ (32 bits)',
  '16 Feistel rounds: Lₙ = Rₙ₋₁, Rₙ = Lₙ₋₁ ⊕ F(Rₙ₋₁, Kₙ)',
  'F function: Expand R to 48 bits → XOR with round key → 8 S-boxes → P-box',
  'Swap L₁₆ and R₁₆, apply Inverse Permutation (IP⁻¹)',
  'Output: 64-bit ciphertext',
];

export default function DESCipher() {
  const [text, setText] = useState('Hello World');
  const [key, setKey]   = useState('SecretKy');
  const [out, setOut]   = useState('');
  const [mode, setMode] = useState(null);
  const [err, setErr]   = useState('');

  function run(m) {
    setErr('');
    try {
      const k  = CryptoJS.enc.Utf8.parse(key.padEnd(8,'0').slice(0,8));
      const iv = CryptoJS.enc.Utf8.parse('00000000');
      if (m === 'enc') {
        setOut(CryptoJS.DES.encrypt(text, k, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString());
      } else {
        const dec = CryptoJS.DES.decrypt(text, k, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        setOut(dec.toString(CryptoJS.enc.Utf8) || '⚠ Decryption failed — check key / input format');
      }
      setMode(m);
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="section-h mb-0">DES Cipher</h2>
        <span className="badge badge-red">Deprecated</span>
      </div>

      <p className="text-sm text-sand-600">
        Feistel-based block cipher (1977). Encrypts 64-bit blocks with a 56-bit effective key in 16 rounds.
        Vulnerable to brute force; replaced by AES in 2001.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl">Plaintext (enc) / Base64 (dec)</label>
          <textarea className="field h-20 resize-none" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Key (8 characters / 64 bits, 56-bit effective)</label>
          <input className="field-mono" value={key} onChange={e => setKey(e.target.value)} maxLength={8} />
          <p className="text-xs text-sand-400 mt-1">CBC mode · zero IV · padded/trimmed to 8 chars</p>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => run('enc')} className="btn-primary">Encrypt</button>
        <button onClick={() => run('dec')} className="btn-outline">Decrypt</button>
      </div>

      {err && <div className="notice notice-error">{err}</div>}

      {out && (
        <div>
          <label className="lbl">{mode === 'enc' ? 'Ciphertext (Base64)' : 'Plaintext'}</label>
          <div className="result-box">{out}</div>
        </div>
      )}

      <div className="divider" />

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <p className="text-xs font-semibold text-sand-700 mb-2">Key parameters</p>
          <table className="tbl">
            <tbody>
              {[['Block size','64 bits'],['Key input','64 bits (8 bytes)'],['Effective key','56 bits'],['Rounds','16'],['Structure','Feistel'],['Status','Deprecated']].map(([k,v])=>(
                <tr key={k}><td className="text-sand-500">{k}</td><td className="font-mono text-xs">{v}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          <p className="text-xs font-semibold text-sand-700 mb-2">Encryption steps</p>
          <ol className="space-y-1.5">
            {STEPS.map((s,i) => (
              <li key={i} className="flex gap-2 text-xs text-sand-600">
                <span className="step-num shrink-0">{i+1}</span>
                <span>{s}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </div>
  );
}
