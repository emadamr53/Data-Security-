'use client';
import { useState } from 'react';
import { playfairEncrypt, playfairDecrypt, buildPlayfairMatrix } from '../../lib/classicalCiphers';

export default function PlayfairCipher() {
  const [text, setText]       = useState('MEET');
  const [keyword, setKeyword] = useState('MONARCHY');
  const [out, setOut]         = useState(null);
  const [matrix, setMatrix]   = useState(() => buildPlayfairMatrix('MONARCHY'));

  function onKeyChange(v) {
    setKeyword(v);
    if (v.trim()) setMatrix(buildPlayfairMatrix(v));
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Digram cipher using a 5×5 key matrix. Plaintext is split into pairs (I and J share one cell).
        Three rules apply based on the pair's position in the matrix.
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-3">
          <div>
            <label className="lbl">Keyword (builds the matrix)</label>
            <input className="field-mono" value={keyword} onChange={e => onKeyChange(e.target.value)} />
          </div>
          <div>
            <label className="lbl">Plaintext / Ciphertext</label>
            <input className="field-mono" value={text} onChange={e => setText(e.target.value)} />
          </div>
          <div className="flex gap-2 flex-wrap">
            <button onClick={() => setOut({ ...playfairEncrypt(text, keyword), mode: 'enc' })} className="btn-primary">Encrypt</button>
            <button onClick={() => setOut({ ...playfairDecrypt(text, keyword), mode: 'dec' })} className="btn-outline">Decrypt</button>
            <button onClick={() => { setText('MEET'); onKeyChange('MONARCHY'); setOut(null); }}
              className="btn-ghost btn-sm">Lecture example</button>
          </div>
        </div>

        {/* Matrix */}
        <div>
          <label className="lbl">5 × 5 Key Matrix</label>
          <div className="inset-box inline-block">
            {matrix.map((row, ri) => (
              <div key={ri} className="flex gap-1 mb-1 last:mb-0">
                {row.map((cell, ci) => (
                  <div key={ci} className="cell text-sand-800 text-sm">{cell}</div>
                ))}
              </div>
            ))}
          </div>
          <p className="text-xs text-sand-400 mt-2">I and J share the same cell</p>
        </div>
      </div>

      {out && (
        <div className="space-y-4">
          <div>
            <label className="lbl">{out.mode === 'enc' ? 'Ciphertext' : 'Plaintext'}</label>
            <div className="result-box text-base tracking-wider">{out.result}</div>
          </div>

          <div>
            <label className="lbl">Digram steps</label>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {out.steps.map((s, i) => (
                <div key={i} className="card-sm flex items-center justify-between gap-2">
                  <span className="font-mono font-semibold text-sand-900">{s.pair}</span>
                  <span className="text-sand-300">→</span>
                  <span className="font-mono font-semibold text-accent">{s.encrypted ?? s.decrypted}</span>
                  <span className="text-xs text-sand-400 text-right leading-tight">{s.rule}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="inset-box text-xs space-y-1 text-sand-600">
            <p className="font-semibold text-sand-700 mb-1">Playfair rules:</p>
            <p><strong className="text-sand-800">Same row →</strong> shift each letter one cell right (wrap)</p>
            <p><strong className="text-sand-800">Same column →</strong> shift each letter one cell down (wrap)</p>
            <p><strong className="text-sand-800">Rectangle →</strong> each letter moves to its row, at the other's column</p>
          </div>

          {text.toUpperCase() === 'MEET' && keyword.toUpperCase() === 'MONARCHY' && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> MEET / MONARCHY → <span className="font-mono">CLKL</span> ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}
