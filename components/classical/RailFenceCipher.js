'use client';
import { useState } from 'react';
import { railFenceEncrypt, railFenceDecrypt } from '../../lib/classicalCiphers';

const COLORS = ['text-accent', 'text-blue-600', 'text-emerald-600', 'text-purple-600', 'text-rose-600'];
const BG     = ['bg-accent/10', 'bg-blue-50', 'bg-emerald-50', 'bg-purple-50', 'bg-rose-50'];

export default function RailFenceCipher() {
  const [text, setText]   = useState('MEETME');
  const [rails, setRails] = useState(2);
  const [out, setOut]     = useState(null);

  const clean = text.replace(/\s/g, '').toUpperCase();
  const n = Math.max(2, Math.min(5, rails));

  function buildPositions() {
    const pos = [];
    let r = 0, d = 1;
    for (let i = 0; i < clean.length; i++) {
      pos.push(r);
      if (r === 0) d = 1;
      else if (r === n - 1) d = -1;
      r += d;
    }
    return pos;
  }

  const positions = buildPositions();

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Write characters diagonally across <strong className="text-sand-900">N rails</strong>, then
        read off each rail left-to-right. The simplest transposition cipher.
      </p>

      <div className="grid sm:grid-cols-4 gap-3">
        <div className="sm:col-span-3">
          <label className="lbl">Text</label>
          <input className="field-mono" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Rails (2–5)</label>
          <input type="number" min={2} max={5} className="field"
            value={rails} onChange={e => setRails(Math.max(2, Math.min(5, parseInt(e.target.value)||2)))} />
        </div>
      </div>

      {/* Visual fence */}
      {clean.length > 0 && (
        <div className="inset-box overflow-x-auto">
          <p className="text-xs text-sand-400 mb-2 font-medium">Rail fence preview</p>
          {Array.from({ length: n }, (_, ri) => (
            <div key={ri} className="flex gap-0 min-w-max mb-0.5">
              <span className={`w-5 text-xs font-semibold ${COLORS[ri]}`}>R{ri}</span>
              {Array.from({ length: clean.length }, (_, ci) => (
                <div key={ci}
                  className={`w-7 h-6 flex items-center justify-center rounded text-xs font-mono font-semibold
                    ${positions[ci] === ri ? `${COLORS[ri]} ${BG[ri]}` : 'text-transparent'}`}>
                  {positions[ci] === ri ? clean[ci] : '·'}
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOut({ ...railFenceEncrypt(clean, n), mode: 'enc' })} className="btn-primary">Encrypt</button>
        <button onClick={() => setOut({ ...railFenceDecrypt(clean, n), mode: 'dec' })} className="btn-outline">Decrypt</button>
        <button onClick={() => { setText('MEETME'); setRails(2); setOut(null); }} className="btn-ghost btn-sm">
          Lecture example
        </button>
      </div>

      {out && (
        <div className="space-y-3">
          <div>
            <label className="lbl">{out.mode === 'enc' ? 'Ciphertext' : 'Plaintext'}</label>
            <div className="result-box text-base tracking-wider">{out.result}</div>
          </div>
          {clean === 'MEETME' && n === 2 && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> MEETME / 2 rails → <span className="font-mono">MEMETE</span> ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}
