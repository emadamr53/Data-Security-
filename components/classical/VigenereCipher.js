'use client';
import { useState } from 'react';
import { vigenereEncrypt, vigenereDecrypt } from '../../lib/classicalCiphers';

export default function VigenereCipher() {
  const [text, setText]       = useState('WEAREDISCOVERED');
  const [keyword, setKeyword] = useState('DECEPTIVE');
  const [out, setOut]         = useState(null);

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Polyalphabetic cipher using a repeating keyword. Each plaintext letter is shifted by the
        corresponding key letter's alphabet position.
        <span className="ml-2 font-mono text-xs text-sand-400">C = (P + K) mod 26</span>
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl">Plaintext / Ciphertext</label>
          <input className="field-mono" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Keyword</label>
          <input className="field-mono" value={keyword} onChange={e => setKeyword(e.target.value)} placeholder="e.g. DECEPTIVE" />
        </div>
      </div>

      <div className="flex gap-2 flex-wrap">
        <button onClick={() => setOut({ ...vigenereEncrypt(text, keyword), mode: 'enc' })} className="btn-primary">Encrypt</button>
        <button onClick={() => setOut({ ...vigenereDecrypt(text, keyword), mode: 'dec' })} className="btn-outline">Decrypt</button>
        <button onClick={() => { setText('WEAREDISCOVERED'); setKeyword('DECEPTIVE'); setOut(null); }}
          className="btn-ghost btn-sm">Lecture example</button>
      </div>

      {out && (
        <div className="space-y-4">
          <div>
            <label className="lbl">{out.mode === 'enc' ? 'Ciphertext' : 'Plaintext'}</label>
            <div className="result-box text-base tracking-wider">{out.result}</div>
          </div>

          {out.steps.length > 0 && (
            <div>
              <label className="lbl">Character alignment</label>
              <div className="inset-box overflow-x-auto">
                <div className="flex gap-0 min-w-max">
                  {out.steps.map((s, i) => (
                    <div key={i} className="flex flex-col items-center w-8 border-r border-sand-100 last:border-0">
                      <span className="text-xs font-mono text-sand-500">{s.char}</span>
                      <span className="text-xs font-mono text-accent font-semibold">{s.keyChar}</span>
                      <span className="text-xs font-mono font-bold text-sand-900">{s.result}</span>
                    </div>
                  ))}
                </div>
                <div className="flex gap-3 mt-2 text-xs text-sand-400">
                  <span>Plain</span><span className="text-accent">Key</span><span className="text-sand-900 font-semibold">Cipher</span>
                </div>
              </div>
            </div>
          )}

          {out.steps.length > 0 && (
            <div>
              <label className="lbl">Step-by-step</label>
              <div className="inset-box overflow-auto max-h-52">
                <table className="tbl">
                  <thead><tr><th>P</th><th>Key</th><th>p</th><th>k</th><th>Formula</th><th>C</th></tr></thead>
                  <tbody>
                    {out.steps.map((s, i) => (
                      <tr key={i}>
                        <td className="font-mono font-semibold">{s.char}</td>
                        <td className="font-mono text-accent">{s.keyChar}</td>
                        <td className="font-mono">{s.p ?? s.c}</td>
                        <td className="font-mono text-accent">{s.k}</td>
                        <td className="font-mono text-sand-400 text-xs">({s.p ?? s.c}+{s.k}) mod 26 = {s.c ?? s.p}</td>
                        <td className="font-mono font-semibold">{s.result}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {text === 'WEAREDISCOVERED' && keyword === 'DECEPTIVE' && out.mode === 'enc' && (
            <div className="notice notice-warn text-xs">
              <strong>Note — Lecture slide typo:</strong> The slide states D=16 (it should be D=3).
              The correct standard Vigenère result is <span className="font-mono">ZICVTWQNGRZGVTW</span>.
              The lecture prints <span className="font-mono">MICVTWQNGRZGVTW</span> (only first character differs).
              Our implementation is mathematically correct.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
