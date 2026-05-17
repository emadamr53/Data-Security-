'use client';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import HashDemo from '../../components/hash/HashDemo';
import BirthdayAttack from '../../components/hash/BirthdayAttack';

export default function HashPage() {
  const [active, setActive] = useState('hash');

  return (
    <div className="min-h-screen bg-sand-100">
      <Navigation />
      <div className="page-wrap">
        <div className="mb-8">
          <p className="text-xs text-sand-400 font-medium mb-1">Lecture 6</p>
          <h1 className="text-2xl font-black text-sand-950 mb-1">Hash Functions</h1>
          <p className="text-sm text-sand-500">
            One-way functions that map any input to a fixed-size digest. Used for data integrity, password storage, and digital signatures.
          </p>
        </div>

        <div className="tab-bar">
          {[['hash','Hash Functions'],['birthday','Birthday Attack']].map(([id,label]) => (
            <button key={id} onClick={() => setActive(id)}
              className={`tab ${active === id ? 'tab-active' : ''}`}>{label}</button>
          ))}
        </div>

        <div className="card mb-6">
          {active === 'hash' ? <HashDemo /> : <BirthdayAttack />}
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div className="card-sm">
            <p className="text-xs font-semibold text-sand-700 mb-2">Hash vs Encryption</p>
            <table className="tbl text-xs">
              <thead><tr><th>Hash</th><th>Encryption</th></tr></thead>
              <tbody>
                {[['One-way','Two-way'],['No key','Requires key'],['Fixed output size','Output ≈ input size'],['Integrity','Confidentiality']].map(([h,e])=>(
                  <tr key={h}><td>{h}</td><td>{e}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-sm">
            <p className="text-xs font-semibold text-sand-700 mb-2">Algorithm comparison</p>
            <table className="tbl text-xs">
              <thead><tr><th>Algorithm</th><th>Output</th><th>Status</th></tr></thead>
              <tbody>
                {[['MD5','128-bit','❌ Broken'],['SHA-1','160-bit','⚠ Weak'],['SHA-256','256-bit','✅ Secure'],['SHA-512','512-bit','✅ Secure']].map(([a,b,c])=>(
                  <tr key={a}><td className="font-mono">{a}</td><td className="font-mono">{b}</td><td>{c}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
