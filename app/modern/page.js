'use client';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import DESCipher from '../../components/modern/DESCipher';
import AESCipher from '../../components/modern/AESCipher';

const comparison = [
  { f: 'Year',            des: '1977',                 aes: '2001' },
  { f: 'Block size',      des: '64 bits',              aes: '128 bits' },
  { f: 'Key size',        des: '56 bits (effective)',  aes: '128 / 192 / 256 bits' },
  { f: 'Rounds',          des: '16',                   aes: '10 / 12 / 14' },
  { f: 'Structure',       des: 'Feistel Network',      aes: 'Substitution-Permutation' },
  { f: 'Security today',  des: 'Deprecated',           aes: 'Industry standard' },
];

export default function ModernPage() {
  const [active, setActive] = useState('des');

  return (
    <div className="min-h-screen bg-sand-100">
      <Navigation />
      <div className="page-wrap">
        <div className="mb-8">
          <p className="text-xs text-sand-400 font-medium mb-1">Lectures 3 & 4</p>
          <h1 className="text-2xl font-black text-sand-950 mb-1">Block Ciphers</h1>
          <p className="text-sm text-sand-500">
            Symmetric encryption for computers. DES uses a Feistel structure; AES uses a Substitution-Permutation Network.
          </p>
        </div>

        <div className="tab-bar">
          {[['des','DES'],['aes','AES']].map(([id,label]) => (
            <button key={id} onClick={() => setActive(id)}
              className={`tab ${active === id ? 'tab-active' : ''}`}>{label}</button>
          ))}
        </div>

        <div className="card mb-6">
          {active === 'des' ? <DESCipher /> : <AESCipher />}
        </div>

        {/* Comparison table */}
        <div className="card">
          <h3 className="section-h">DES vs AES</h3>
          <table className="tbl">
            <thead>
              <tr>
                <th>Feature</th>
                <th className="text-red-600">DES</th>
                <th className="text-emerald-600">AES</th>
              </tr>
            </thead>
            <tbody>
              {comparison.map(r => (
                <tr key={r.f}>
                  <td className="text-sand-500 font-medium">{r.f}</td>
                  <td className="font-mono text-sm">{r.des}</td>
                  <td className="font-mono text-sm">{r.aes}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
