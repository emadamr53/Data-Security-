'use client';
import { useState, useRef } from 'react';
import CryptoJS from 'crypto-js';

function truncated(str, bits) {
  return CryptoJS.MD5(str).toString().slice(0, Math.ceil(bits / 4));
}

export default function BirthdayAttack() {
  const [bits, setBits]     = useState(16);
  const [running, setRunning] = useState(false);
  const [result, setResult] = useState(null);
  const stopRef = useRef(false);

  const space    = Math.pow(2, bits);
  const expected = Math.round(1.177 * Math.sqrt(space));

  async function run() {
    setRunning(true); setResult(null); stopRef.current = false;
    const seen = new Map();
    let count = 0;
    const maxTries = Math.min(200000, space * 4);

    const found = await new Promise(resolve => {
      function step() {
        for (let i = 0; i < 800; i++) {
          if (stopRef.current || count >= maxTries) { resolve(null); return; }
          const inp = `seed_${count++}_${Math.random().toString(36).slice(2)}`;
          const h   = truncated(inp, bits);
          if (seen.has(h)) { resolve({ m1: seen.get(h), m2: inp, hash: h, n: count }); return; }
          seen.set(h, inp);
        }
        setTimeout(step, 0);
      }
      step();
    });

    if (!stopRef.current) setResult(found || { failed: true, n: count });
    setRunning(false);
  }

  return (
    <div className="space-y-5">
      <p className="text-sm text-sand-600">
        The <strong className="text-sand-900">Birthday Paradox</strong> states: finding a collision in an n-bit
        hash requires only ~√(2ⁿ) attempts — not the full 2ⁿ. This demo uses a truncated MD5
        to find two different inputs that produce the same hash.
      </p>

      <div className="grid sm:grid-cols-2 gap-5">
        <div>
          <label className="lbl">Hash size: <strong>{bits} bits</strong></label>
          <input type="range" min={8} max={32} step={2} value={bits}
            onChange={e => { setBits(+e.target.value); setResult(null); }}
            className="w-full mt-2 accent-accent" />
          <div className="flex justify-between text-xs text-sand-400 mt-1">
            <span>8 bits (fast)</span><span>32 bits (slow)</span>
          </div>
        </div>

        <div className="inset-box space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-sand-500">Hash space (2^{bits})</span>
            <span className="font-mono text-sand-800">{space.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Expected trials</span>
            <span className="font-mono text-accent font-semibold">~{expected.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Brute-force trials</span>
            <span className="font-mono text-sand-800">{space.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sand-500">Speed-up factor</span>
            <span className="font-mono text-emerald-700 font-semibold">~{Math.round(space/expected)}×</span>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={run} disabled={running} className="btn-primary">
          {running ? 'Searching…' : 'Run Birthday Attack'}
        </button>
        {running && <button onClick={() => stopRef.current = true} className="btn-danger">Stop</button>}
      </div>

      {result && (
        result.failed ? (
          <div className="notice notice-warn">
            No collision found in {result.n.toLocaleString()} attempts. Try a smaller bit size.
          </div>
        ) : (
          <div className="card-sm space-y-3">
            <div className="flex items-center gap-2">
              <span className="badge badge-green">Collision found</span>
              <span className="text-sm text-sand-600">in <strong>{result.n.toLocaleString()}</strong> attempts
                ({((result.n/space)*100).toFixed(1)}% of full space)</span>
            </div>
            <div className="grid sm:grid-cols-2 gap-2">
              {[['Input 1', result.m1],['Input 2', result.m2]].map(([l,v]) => (
                <div key={l} className="inset-box">
                  <p className="text-xs text-sand-400 mb-0.5">{l}</p>
                  <p className="font-mono text-xs text-sand-800 break-all">{v}</p>
                </div>
              ))}
            </div>
            <div className="inset-box text-center">
              <p className="text-xs text-sand-400 mb-1">Both produce {bits}-bit hash:</p>
              <p className="font-mono font-bold text-accent text-base">{result.hash}</p>
            </div>
          </div>
        )
      )}

      <div className="inset-box text-xs text-sand-600 space-y-1">
        <p className="font-semibold text-sand-700">Why this matters for security:</p>
        <p>SHA-256 (256-bit) needs ~2¹²⁸ operations to find a collision — computationally infeasible.</p>
        <p>MD5 (128-bit) needs only ~2⁶⁴ — feasible with modern hardware, which is why MD5 is broken for cryptographic use.</p>
      </div>
    </div>
  );
}
