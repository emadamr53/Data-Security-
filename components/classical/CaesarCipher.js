'use client';
import { useState } from 'react';
import { caesarEncrypt, caesarDecrypt } from '../../lib/classicalCiphers';

const ALPHA = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';

export default function CaesarCipher() {
  const [text, setText] = useState('HELLO');
  const [key, setKey]   = useState(4);
  const [out, setOut]   = useState(null);

  const k = ((parseInt(key) || 0) % 26 + 26) % 26;

  function loadExample() { setText('HELLO'); setKey(4); setOut(null); }

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Each letter is shifted <strong className="text-sand-900">K</strong> positions forward in the alphabet.
        <span className="ml-2 font-mono text-xs text-sand-400">C = (P + K) mod 26</span>
      </p>

      {/* Shift preview */}
      <div className="inset-box overflow-x-auto">
        <div className="flex min-w-max gap-0">
          {ALPHA.split('').map((ch, i) => (
            <div key={ch} className="flex flex-col items-center w-7">
              <span className="text-xs font-mono text-sand-400">{ch}</span>
              <span className="text-xs font-mono font-semibold text-accent mt-0.5">
                {ALPHA[(i + k) % 26]}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs text-sand-400 mt-1.5">Plain → Cipher (K = {k})</p>
      </div>

      {/* Inputs */}
      <div className="grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3">
          <label className="lbl">Plaintext / Ciphertext</label>
          <input className="field-mono" value={text} onChange={e => setText(e.target.value)} placeholder="Enter text…" />
        </div>
        <div>
          <label className="lbl">Key K (0–25)</label>
          <input type="number" min={0} max={25} className="field"
            value={key} onChange={e => setKey(Math.max(0, Math.min(25, parseInt(e.target.value) || 0)))} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOut({ ...caesarEncrypt(text, k), mode: 'enc' })} className="btn-primary">Encrypt</button>
        <button onClick={() => setOut({ ...caesarDecrypt(text, k), mode: 'dec' })} className="btn-outline">Decrypt</button>
        <button onClick={loadExample} className="btn-ghost btn-sm">Lecture example (HELLO, K=4)</button>
      </div>

      {out && (
        <div className="space-y-4">
          <div>
            <label className="lbl">{out.mode === 'enc' ? 'Ciphertext' : 'Plaintext'}</label>
            <div className="result-box text-base tracking-wider">{out.result}</div>
          </div>

          {out.steps.length > 0 && (
            <div>
              <label className="lbl">Step-by-step</label>
              <div className="inset-box overflow-auto max-h-52">
                <table className="tbl">
                  <thead>
                    <tr>
                      <th>Char</th><th>P</th><th>K</th><th>Formula</th><th>Result</th>
                    </tr>
                  </thead>
                  <tbody>
                    {out.steps.map((s, i) => (
                      <tr key={i}>
                        <td className="font-mono font-semibold">{s.char}</td>
                        <td className="font-mono">{s.p}</td>
                        <td className="font-mono text-accent">{s.k}</td>
                        <td className="font-mono text-sand-400">({s.p}+{s.k}) mod 26 = {s.c}</td>
                        <td className="font-mono font-semibold text-accent">{s.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {out.steps.length > 0 && (
            <div className="notice notice-info text-xs">
              <strong>Lecture example check:</strong> HELLO with K=4 → <span className="font-mono">LIPPS</span> ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}
