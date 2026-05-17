'use client';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import { gcdSteps, modArithmetic, isPrime, primeFactorization, primesUpTo, fermatTest } from '../../lib/numberTheory';

export default function NumberTheoryPage() {
  const [active, setActive] = useState('gcd');

  return (
    <div className="min-h-screen bg-sand-100">
      <Navigation />
      <div className="page-wrap">
        <div className="mb-8">
          <p className="text-xs text-sand-400 font-medium mb-1">Lectures 7 & 8</p>
          <h1 className="text-2xl font-black text-sand-950 mb-1">Number Theory</h1>
          <p className="text-sm text-sand-500">
            Mathematical foundations of public-key cryptography. GCD, modular arithmetic, and prime numbers
            underlie RSA and Diffie-Hellman.
          </p>
        </div>

        <div className="tab-bar">
          {[['gcd','GCD Calculator'],['modular','Modular Arithmetic'],['prime','Prime Checker'],['factorization','Factorization']].map(([id,label]) => (
            <button key={id} onClick={() => setActive(id)}
              className={`tab ${active === id ? 'tab-active' : ''}`}>{label}</button>
          ))}
        </div>

        <div className="card">
          {active === 'gcd'          && <GCDTab />}
          {active === 'modular'      && <ModularTab />}
          {active === 'prime'        && <PrimeTab />}
          {active === 'factorization'&& <FactorizationTab />}
        </div>
      </div>
    </div>
  );
}

/* ─── GCD ────────────────────────────────────────────────────────────────────── */
function GCDTab() {
  const [a, setA] = useState(408);
  const [b, setB] = useState(595);
  const [res, setRes] = useState(null);

  const examples = [[408,595],[270,192],[48,18],[56,98]];

  function compute(x=a, y=b) {
    setA(x); setB(y);
    setRes(gcdSteps(parseInt(x)||0, parseInt(y)||0));
  }

  return (
    <div className="space-y-5">
      <h2 className="section-h">GCD — Euclidean Algorithm</h2>
      <p className="text-sm text-sand-600">
        Repeatedly replace (a, b) with (b, a mod b) until remainder = 0.
        The last non-zero remainder is the GCD.
        <span className="ml-2 font-mono text-xs text-sand-400">gcd(a,b) = gcd(b, a mod b)</span>
      </p>

      <div className="flex flex-wrap gap-2">
        {examples.map(([x,y]) => (
          <button key={`${x}-${y}`} onClick={() => compute(x,y)} className="btn-ghost btn-sm font-mono">
            gcd({x}, {y})
          </button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div>
          <label className="lbl">A</label>
          <input type="number" className="field" value={a} onChange={e => setA(e.target.value)} />
        </div>
        <div>
          <label className="lbl">B</label>
          <input type="number" className="field" value={b} onChange={e => setB(e.target.value)} />
        </div>
        <button onClick={() => compute()} className="btn-primary">Compute GCD</button>
      </div>

      {res && (
        <div className="space-y-4">
          <div className="inset-box text-center">
            <p className="text-xs text-sand-400 mb-1">GCD({a}, {b}) =</p>
            <p className="text-3xl font-black text-accent">{res.gcd}</p>
          </div>

          <div>
            <label className="lbl">Euclidean steps</label>
            <table className="tbl">
              <thead>
                <tr><th>#</th><th>a</th><th>÷ b</th><th>Quotient</th><th>Remainder</th><th>Equation</th></tr>
              </thead>
              <tbody>
                {res.steps.map((s,i) => (
                  <tr key={i} className={i === res.steps.length-1 ? 'bg-emerald-50' : ''}>
                    <td className="text-sand-400">{i+1}</td>
                    <td className="font-mono">{s.a}</td>
                    <td className="font-mono">{s.b}</td>
                    <td className="font-mono">{s.quotient}</td>
                    <td className={`font-mono font-semibold ${s.remainder===0 ? 'text-emerald-600' : ''}`}>
                      {s.remainder}
                    </td>
                    <td className="font-mono text-xs text-sand-400">
                      {s.a} = {s.quotient}×{s.b} + {s.remainder}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(a==408||a==595) && (b==595||b==408) && res.gcd===17 && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> GCD(408, 595) = <strong>17</strong> ✓
              (4 steps: 595÷408→rem 187, 408÷187→rem 34, 187÷34→rem 17, 34÷17→rem 0)
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ─── Modular Arithmetic ─────────────────────────────────────────────────────── */
function ModularTab() {
  const [A, setA] = useState(14);
  const [B, setB] = useState(17);
  const [C, setC] = useState(5);
  const [op, setOp] = useState('+');
  const [res, setRes] = useState(null);

  const ops = [['+','Addition'],['-','Subtraction'],['*','Multiplication'],['^','Exponentiation']];

  function compute() { setRes(modArithmetic(+A||0, +B||0, Math.max(1,+C||1), op)); }

  const opSymbol = { '+':'+', '-':'−', '*':'×', '^':'^' };

  return (
    <div className="space-y-5">
      <h2 className="section-h">Modular Arithmetic</h2>
      <p className="text-sm text-sand-600">
        Two numbers are equivalent mod n if they differ by a multiple of n.
        Modular arithmetic is the foundation of modern public-key cryptography.
      </p>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 items-end">
        <div>
          <label className="lbl">A</label>
          <input type="number" className="field" value={A} onChange={e=>setA(e.target.value)} />
        </div>
        <div>
          <label className="lbl">Operation</label>
          <select className="field" value={op} onChange={e=>setOp(e.target.value)}>
            {ops.map(([k,v])=><option key={k} value={k}>{k}  ({v})</option>)}
          </select>
        </div>
        <div>
          <label className="lbl">B</label>
          <input type="number" className="field" value={B} onChange={e=>setB(e.target.value)} />
        </div>
        <div>
          <label className="lbl">mod C</label>
          <input type="number" min={1} className="field" value={C} onChange={e=>setC(Math.max(1,+e.target.value||1))} />
        </div>
        <button onClick={compute} className="btn-primary">Calculate</button>
      </div>

      {res && (
        <div className="space-y-4">
          <div className="inset-box text-center">
            <p className="text-xs text-sand-400 mb-1 font-mono">({A} {opSymbol[op]} {B}) mod {C} =</p>
            <p className="text-3xl font-black text-accent">{res.directResult}</p>
          </div>

          <div className="inset-box space-y-2 font-mono text-sm">
            <p className="text-xs font-sans font-semibold text-sand-700">Step-by-step (method 2: reduce first)</p>
            <p><span className="text-sand-400">{A} mod {C} =</span> <span className="text-accent font-semibold">{res.aC}</span></p>
            <p><span className="text-sand-400">{B} mod {C} =</span> <span className="text-accent font-semibold">{res.bC}</span></p>
            <p><span className="text-sand-400">({res.aC} {opSymbol[op]} {res.bC}) mod {C} =</span> <span className="text-emerald-700 font-bold">{res.stepsResult}</span></p>
          </div>

          {A==14 && B==17 && C==5 && op=='+' && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> (14 + 17) mod 5 = 31 mod 5 = <strong>1</strong> ✓
            </div>
          )}

          <div className="grid sm:grid-cols-2 gap-2 text-xs font-mono">
            {ops.map(([k]) => (
              <div key={k} className={`inset-box ${op===k ? 'border-accent' : ''}`}>
                <p className={`font-bold mb-0.5 ${op===k ? 'text-accent' : 'text-sand-700'}`}>{k === '^' ? 'Aᴮ mod C' : `(A ${k} B) mod C`}</p>
                <p className="text-sand-400 font-sans text-xs leading-snug">
                  {k==='+'  && '= (A mod C + B mod C) mod C'}
                  {k==='-'  && '= (A mod C − B mod C) mod C'}
                  {k==='*'  && '= (A mod C × B mod C) mod C'}
                  {k==='^'  && '= (A mod C)ᴮ mod C'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Prime Checker ──────────────────────────────────────────────────────────── */
function PrimeTab() {
  const [n, setN]     = useState(17);
  const [res, setRes] = useState(null);
  const [limit, setLimit] = useState(50);
  const [sieve, setSieve] = useState(null);

  function check() {
    const r = isPrime(parseInt(n)||0);
    const f = fermatTest(2, parseInt(n)||2);
    setRes({ ...r, fermat: f });
  }

  return (
    <div className="space-y-5">
      <h2 className="section-h">Prime Number Checker</h2>
      <p className="text-sm text-sand-600">
        A prime has exactly two divisors: 1 and itself. Primes are central to RSA, which relies on the
        difficulty of factoring large numbers into their prime factors.
      </p>

      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="lbl">Number</label>
          <input type="number" min={2} className="field" value={n} onChange={e=>setN(e.target.value)} />
        </div>
        <button onClick={check} className="btn-primary">Check</button>
      </div>

      <div className="flex flex-wrap gap-2">
        {[2,3,7,17,97,100,561].map(x => (
          <button key={x} onClick={() => { setN(x); setRes(null); }} className="btn-ghost btn-sm font-mono">{x}</button>
        ))}
      </div>

      {res && (
        <div className="space-y-3">
          <div className={`inset-box text-center border-2 ${res.prime ? 'border-emerald-300' : 'border-red-300'}`}>
            <p className="text-4xl font-black text-sand-900 mb-1">{n}</p>
            <p className={`text-lg font-bold ${res.prime ? 'text-emerald-600' : 'text-red-600'}`}>
              {res.prime ? '✓ Prime' : '✗ Composite'}
            </p>
            <p className="text-xs text-sand-500 mt-1">{res.reason}</p>
          </div>

          {parseInt(n) > 2 && res.fermat && (
            <div className="inset-box text-sm">
              <p className="text-xs font-semibold text-sand-700 mb-1">Fermat's Little Theorem (a = 2)</p>
              <p className="font-mono text-xs">
                2^({parseInt(n)}-1) mod {n} = 2^{parseInt(n)-1} mod {n} ={' '}
                <span className={res.fermat.result===1 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold'}>
                  {res.fermat.result}
                </span>
              </p>
              <p className="text-xs text-sand-400 mt-1">
                If result = 1 and p prime → consistent with Fermat: a^(p-1) ≡ 1 (mod p)
              </p>
            </div>
          )}

          {n==17 && res.prime && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> 17 is prime (no divisors between 2 and √17 ≈ 4) ✓
            </div>
          )}
        </div>
      )}

      {/* Sieve */}
      <div className="divider" />
      <div className="inset-box space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <p className="text-xs font-semibold text-sand-700">Sieve of Eratosthenes up to</p>
          <input type="number" min={10} max={200} className="field w-20 py-1.5 text-xs"
            value={limit} onChange={e=>setLimit(Math.min(200,Math.max(10,+e.target.value||50)))} />
          <button onClick={() => setSieve(primesUpTo(limit))} className="btn-outline btn-sm">Show primes</button>
        </div>
        {sieve && (
          <div>
            <div className="flex flex-wrap gap-1 max-h-28 overflow-y-auto">
              {Array.from({length:limit-1},(_,i)=>i+2).map(num => (
                <div key={num}
                  className={`w-9 h-8 flex items-center justify-center text-xs font-mono rounded border
                    ${sieve.includes(num)
                      ? 'border-accent/40 bg-accent/10 text-accent font-semibold'
                      : 'border-sand-200 text-sand-300'}`}>
                  {num}
                </div>
              ))}
            </div>
            <p className="text-xs text-sand-400 mt-2">
              {sieve.length} primes found up to {limit}: {sieve.slice(0,12).join(', ')}{sieve.length>12?'…':''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Prime Factorization ────────────────────────────────────────────────────── */
function FactorizationTab() {
  const [n, setN]   = useState(360);
  const [res, setRes] = useState(null);

  function compute(x=n) {
    setN(x);
    setRes(primeFactorization(parseInt(x)||2));
  }

  const grouped = res?.factors.reduce((acc,f)=>{acc[f]=(acc[f]||0)+1;return acc;},{});

  return (
    <div className="space-y-5">
      <h2 className="section-h">Prime Factorization</h2>
      <p className="text-sm text-sand-600">
        Every integer ≥ 2 can be uniquely written as a product of primes (Fundamental Theorem of Arithmetic).
        RSA security relies on the difficulty of factoring large numbers.
      </p>

      <div className="flex flex-wrap gap-2">
        {[12,60,360,1001,2310,9999].map(x => (
          <button key={x} onClick={()=>compute(x)} className="btn-ghost btn-sm font-mono">{x}</button>
        ))}
      </div>

      <div className="grid sm:grid-cols-3 gap-3 items-end">
        <div className="sm:col-span-2">
          <label className="lbl">Number (max 999999)</label>
          <input type="number" min={2} max={999999} className="field" value={n} onChange={e=>setN(e.target.value)} />
        </div>
        <button onClick={()=>compute()} className="btn-primary">Factorize</button>
      </div>

      {res && res.factors.length > 0 && (
        <div className="space-y-4">
          <div className="inset-box text-center">
            <p className="text-xs text-sand-400 mb-2">{n} =</p>
            <p className="text-2xl font-black font-mono text-accent">
              {Object.entries(grouped).map(([p,e],i)=>(
                <span key={p}>
                  {i>0 && <span className="text-sand-400 mx-1">×</span>}
                  {p}{e>1 && <sup className="text-lg">{e}</sup>}
                </span>
              ))}
            </p>
            <p className="text-xs text-sand-400 font-mono mt-1">= {res.factors.join(' × ')}</p>
          </div>

          <div>
            <label className="lbl">Division steps</label>
            <table className="tbl">
              <thead><tr><th>#</th><th>n</th><th>Divide by</th><th>Result</th></tr></thead>
              <tbody>
                {res.steps.map((s,i)=>(
                  <tr key={i}>
                    <td className="text-sand-400">{i+1}</td>
                    <td className="font-mono">{s.current}</td>
                    <td className="font-mono text-accent font-semibold">{s.divisor}</td>
                    <td className="font-mono">{s.quotient}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {(n==360||String(n)=='360') && (
            <div className="notice notice-ok text-xs">
              <strong>Lecture example check:</strong> 360 = 2³ × 3² × 5 = [2,2,2,3,3,5] ✓
            </div>
          )}
        </div>
      )}
    </div>
  );
}
