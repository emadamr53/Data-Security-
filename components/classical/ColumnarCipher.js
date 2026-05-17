'use client';
import { useState } from 'react';
import { columnarEncrypt, columnarDecrypt } from '../../lib/classicalCiphers';

export default function ColumnarCipher() {
  // Lecture: "attack postponed until two am" (no spaces) = ATTACKPOSTPONEDUNTILTWOAM
  const [text, setText] = useState('ATTACKPOSTPONEDUNTILTWOAM');
  const [key, setKey]   = useState('4312567');
  const [out, setOut]   = useState(null);

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Write plaintext row-by-row in a grid, then read columns in the order given by the numeric key.
      </p>

      <div className="grid sm:grid-cols-3 gap-3">
        <div className="sm:col-span-2">
          <label className="lbl">Text</label>
          <input className="field-mono" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Key (numeric or word)</label>
          <input className="field-mono" value={key} onChange={e => setKey(e.target.value)} />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOut({ ...columnarEncrypt(text, key), mode: 'enc' })} className="btn-primary">Encrypt</button>
        <button onClick={() => setOut({ ...columnarDecrypt(text, key), mode: 'dec' })} className="btn-outline">Decrypt</button>
        <button onClick={() => { setText('ATTACKPOSTPONEDUNTILTWOAM'); setKey('4312567'); setOut(null); }}
          className="btn-ghost btn-sm">Lecture example</button>
      </div>

      {out && (
        <div className="space-y-4">
          <div>
            <label className="lbl">{out.mode === 'enc' ? 'Ciphertext' : 'Plaintext'}</label>
            <div className="result-box text-base tracking-wider">{out.result}</div>
          </div>

          {out.grid && (
            <div>
              <label className="lbl">Grid — key {out.keyUpper} (read columns in order: {out.order?.map(i => out.keyUpper?.[i]).join('→')})</label>
              <div className="inset-box overflow-x-auto">
                {/* Key header */}
                <div className="flex gap-1 mb-1">
                  <div className="w-6" />
                  {out.keyUpper?.split('').map((k, ci) => (
                    <div key={ci}
                      className={`cell text-xs font-bold ${
                        out.mode === 'enc' ? 'cell-hi' : 'bg-sand-200 text-sand-700 border-sand-200'
                      }`}>
                      {k}
                    </div>
                  ))}
                </div>
                {/* Rows */}
                {out.grid?.map((row, ri) => (
                  <div key={ri} className="flex gap-1 mb-1">
                    <div className="w-6 text-xs text-sand-400 flex items-center">{ri + 1}</div>
                    {row.map((cell, ci) => (
                      <div key={ci} className="cell text-sand-800">{cell}</div>
                    ))}
                  </div>
                ))}
              </div>
            </div>
          )}

          {text.replace(/\s/g,'').toUpperCase() === 'ATTACKPOSTPONEDUNTILTWOAM' && key === '4312567' && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> ATTACKPOSTPONEDUNTILTWOAM / 4312567 → <span className="font-mono">TTNAAPTMTSUOAODWCOIXKNLXPETX</span> ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}
