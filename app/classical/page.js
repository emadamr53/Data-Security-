'use client';
import { useState } from 'react';
import Navigation from '../../components/Navigation';
import CaesarCipher from '../../components/classical/CaesarCipher';
import VigenereCipher from '../../components/classical/VigenereCipher';
import PlayfairCipher from '../../components/classical/PlayfairCipher';
import RailFenceCipher from '../../components/classical/RailFenceCipher';
import ColumnarCipher from '../../components/classical/ColumnarCipher';

const tabs = [
  { id: 'caesar',   label: 'Caesar',    kind: 'Monoalphabetic', component: CaesarCipher   },
  { id: 'vigenere', label: 'Vigenère',  kind: 'Polyalphabetic', component: VigenereCipher },
  { id: 'playfair', label: 'Playfair',  kind: 'Polyalphabetic', component: PlayfairCipher },
  { id: 'rail',     label: 'Rail Fence',kind: 'Transposition',  component: RailFenceCipher},
  { id: 'columnar', label: 'Columnar',  kind: 'Transposition',  component: ColumnarCipher },
];

const kindBadge = {
  Monoalphabetic: 'badge-blue',
  Polyalphabetic: 'badge-amber',
  Transposition:  'badge-green',
};

export default function ClassicalPage() {
  const [active, setActive] = useState('caesar');
  const tab = tabs.find(t => t.id === active);

  return (
    <div className="min-h-screen bg-sand-100">
      <Navigation />
      <div className="page-wrap">
        {/* Header */}
        <div className="mb-8">
          <p className="text-xs text-sand-400 font-medium mb-1">Lecture 2</p>
          <h1 className="text-2xl font-black text-sand-950 mb-1">Classical Ciphers</h1>
          <p className="text-sm text-sand-500">
            Pre-computer encryption. Substitution ciphers replace letters; transposition ciphers rearrange them.
          </p>
        </div>

        {/* Tabs */}
        <div className="tab-bar">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setActive(t.id)}
              className={`tab ${active === t.id ? 'tab-active' : ''}`}>
              {t.label}
            </button>
          ))}
        </div>

        {/* Panel */}
        <div className="card">
          <div className="flex items-center gap-3 mb-5">
            <h2 className="font-bold text-sand-900 text-base">{tab.label} Cipher</h2>
            <span className={kindBadge[tab.kind]}>{tab.kind}</span>
          </div>
          <tab.component />
        </div>

        {/* Reference */}
        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <div className="card-sm">
            <p className="text-xs font-semibold text-sand-700 mb-1">Substitution Ciphers</p>
            <p className="text-xs text-sand-500 leading-relaxed">
              Replace each plaintext letter with another based on a key. Monoalphabetic ciphers (Caesar)
              use one fixed mapping; polyalphabetic ciphers (Vigenère, Playfair) use multiple mappings,
              making frequency analysis harder.
            </p>
          </div>
          <div className="card-sm">
            <p className="text-xs font-semibold text-sand-700 mb-1">Transposition Ciphers</p>
            <p className="text-xs text-sand-500 leading-relaxed">
              Rearrange letters without replacing them. The same letters appear in both plaintext and
              ciphertext, just in a different order. Multiple passes increase security significantly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
