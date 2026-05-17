'use client';
import { useState } from 'react';
import CryptoJS from 'crypto-js';

const ALGOS = [
  { key: 'md5',    label: 'MD5',    bits: 128, fn: CryptoJS.MD5,    status: 'Not secure', badge: 'badge-red'   },
  { key: 'sha1',   label: 'SHA-1',  bits: 160, fn: CryptoJS.SHA1,   status: 'Weak',       badge: 'badge-amber' },
  { key: 'sha256', label: 'SHA-256',bits: 256, fn: CryptoJS.SHA256, status: 'Strong',     badge: 'badge-green' },
  { key: 'sha512', label: 'SHA-512',bits: 512, fn: CryptoJS.SHA512, status: 'Very strong',badge: 'badge-green' },
];

function computeAll(input) {
  return Object.fromEntries(ALGOS.map(a => [a.key, a.fn(input).toString()]));
}

export default function HashDemo() {
  const [text, setText]       = useState('Hello World');
  const [compare, setCompare] = useState('');
  const [hashes, setHashes]   = useState(null);

  function run() {
    setHashes({
      a: computeAll(text),
      b: compare ? computeAll(compare) : null,
    });
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        Hash functions produce a fixed-size digest from any input. They are <strong className="text-sand-900">one-way</strong>:
        you cannot reverse a hash. Even a single character change produces a completely different output
        (avalanche effect).
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl">Input</label>
          <textarea className="field h-20 resize-none" value={text}
            onChange={e => { setText(e.target.value); setHashes(null); }} />
        </div>
        <div>
          <label className="lbl">Compare with (optional — see avalanche effect)</label>
          <textarea className="field h-20 resize-none" value={compare}
            onChange={e => { setCompare(e.target.value); setHashes(null); }}
            placeholder="Slightly different text…" />
        </div>
      </div>

      <button onClick={run} className="btn-primary w-full">Compute Hashes</button>

      {hashes && (
        <div className="space-y-3">
          {ALGOS.map(({ key, label, bits, status, badge }) => {
            const ha = hashes.a[key];
            const hb = hashes.b?.[key];
            const diff = hb ? ha.split('').filter((c,i) => c !== hb[i]).length : 0;
            const collision = hb && ha === hb;

            return (
              <div key={key} className="card-sm space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sand-900 text-sm">{label}</span>
                  <span className="badge badge-gray">{bits}-bit</span>
                  <span className={badge}>{status}</span>
                  {hb && (
                    <span className={`ml-auto badge ${collision ? 'badge-red' : 'badge-green'}`}>
                      {collision ? '⚠ Collision' : `${diff}/${ha.length} chars differ`}
                    </span>
                  )}
                </div>
                <div className="font-mono text-xs break-all text-sand-700 leading-relaxed">
                  {hb
                    ? ha.split('').map((c,i) => (
                      <span key={i} className={c !== hb[i] ? 'bg-red-100 text-red-700 rounded' : ''}>{c}</span>
                    ))
                    : ha
                  }
                </div>
                {hb && (
                  <div className="font-mono text-xs break-all text-sand-400 leading-relaxed">
                    {hb.split('').map((c,i) => (
                      <span key={i} className={c !== ha[i] ? 'bg-red-100 text-red-700 rounded' : ''}>{c}</span>
                    ))}
                  </div>
                )}
              </div>
            );
          })}

          {hashes.b && (
            <div className="notice notice-info text-xs">
              <strong>Avalanche Effect:</strong> A small change in input causes roughly 50% of hash bits to change.
              Highlighted characters show differences between the two inputs' hashes.
            </div>
          )}
        </div>
      )}

      {/* Properties */}
      <div className="divider" />
      <div className="grid sm:grid-cols-3 gap-3">
        {[
          ['Pre-image Resistance','Given h, infeasible to find x such that H(x) = h'],
          ['2nd Pre-image Resistance','Given x, infeasible to find x′≠x with H(x)=H(x′)'],
          ['Collision Resistance','Infeasible to find any two inputs with the same hash'],
        ].map(([t,d]) => (
          <div key={t} className="inset-box">
            <p className="text-xs font-semibold text-sand-800 mb-1">{t}</p>
            <p className="text-xs text-sand-500">{d}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
