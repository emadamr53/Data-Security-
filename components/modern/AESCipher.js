'use client';
import { useState } from 'react';
import CryptoJS from 'crypto-js';

/* Partial AES S-box (first 64 entries for display) */
const SBOX = [
  0x63,0x7c,0x77,0x7b,0xf2,0x6b,0x6f,0xc5,0x30,0x01,0x67,0x2b,0xfe,0xd7,0xab,0x76,
  0xca,0x82,0xc9,0x7d,0xfa,0x59,0x47,0xf0,0xad,0xd4,0xa2,0xaf,0x9c,0xa4,0x72,0xc0,
  0xb7,0xfd,0x93,0x26,0x36,0x3f,0xf7,0xcc,0x34,0xa5,0xe5,0xf1,0x71,0xd8,0x31,0x15,
  0x04,0xc7,0x23,0xc3,0x18,0x96,0x05,0x9a,0x07,0x12,0x80,0xe2,0xeb,0x27,0xb2,0x75,
  0x09,0x83,0x2c,0x1a,0x1b,0x6e,0x5a,0xa0,0x52,0x3b,0xd6,0xb3,0x29,0xe3,0x2f,0x84,
  0x53,0xd1,0x00,0xed,0x20,0xfc,0xb1,0x5b,0x6a,0xcb,0xbe,0x39,0x4a,0x4c,0x58,0xcf,
  0xd0,0xef,0xaa,0xfb,0x43,0x4d,0x33,0x85,0x45,0xf9,0x02,0x7f,0x50,0x3c,0x9f,0xa8,
  0x51,0xa3,0x40,0x8f,0x92,0x9d,0x38,0xf5,0xbc,0xb6,0xda,0x21,0x10,0xff,0xf3,0xd2,
  0xcd,0x0c,0x13,0xec,0x5f,0x97,0x44,0x17,0xc4,0xa7,0x7e,0x3d,0x64,0x5d,0x19,0x73,
  0x60,0x81,0x4f,0xdc,0x22,0x2a,0x90,0x88,0x46,0xee,0xb8,0x14,0xde,0x5e,0x0b,0xdb,
  0xe0,0x32,0x3a,0x0a,0x49,0x06,0x24,0x5c,0xc2,0xd3,0xac,0x62,0x91,0x95,0xe4,0x79,
  0xe7,0xc8,0x37,0x6d,0x8d,0xd5,0x4e,0xa9,0x6c,0x56,0xf4,0xea,0x65,0x7a,0xae,0x08,
  0xba,0x78,0x25,0x2e,0x1c,0xa6,0xb4,0xc6,0xe8,0xdd,0x74,0x1f,0x4b,0xbd,0x8b,0x8a,
  0x70,0x3e,0xb5,0x66,0x48,0x03,0xf6,0x0e,0x61,0x35,0x57,0xb9,0x86,0xc1,0x1d,0x9e,
  0xe1,0xf8,0x98,0x11,0x69,0xd9,0x8e,0x94,0x9b,0x1e,0x87,0xe9,0xce,0x55,0x28,0xdf,
  0x8c,0xa1,0x89,0x0d,0xbf,0xe6,0x42,0x68,0x41,0x99,0x2d,0x0f,0xb0,0x54,0xbb,0x16,
];

const HEX = '0123456789abcdef';

export default function AESCipher() {
  const [text, setText]   = useState('Hello World AES!');
  const [key, setKey]     = useState('MySecretKey12345');
  const [ks, setKs]       = useState(128);
  const [out, setOut]     = useState('');
  const [mode, setMode]   = useState(null);
  const [err, setErr]     = useState('');
  const [showSbox, setShowSbox] = useState(false);

  const keyLen = ks === 128 ? 16 : ks === 192 ? 24 : 32;
  const rounds = ks === 128 ? 10 : ks === 192 ? 12 : 14;

  function run(m) {
    setErr('');
    try {
      const k  = CryptoJS.enc.Utf8.parse(key.padEnd(keyLen,'0').slice(0,keyLen));
      const iv = CryptoJS.enc.Hex.parse('00000000000000000000000000000000');
      if (m === 'enc') {
        setOut(CryptoJS.AES.encrypt(text, k, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 }).toString());
      } else {
        const dec = CryptoJS.AES.decrypt(text, k, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
        setOut(dec.toString(CryptoJS.enc.Utf8) || '⚠ Decryption failed — check key / input format');
      }
      setMode(m);
    } catch (e) { setErr(e.message); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center gap-3 mb-1">
        <h2 className="section-h mb-0">AES Cipher</h2>
        <span className="badge badge-green">Industry standard</span>
        <span className="badge badge-gray">{ks}-bit · {rounds} rounds</span>
      </div>

      <p className="text-sm text-sand-600">
        Substitution-Permutation Network (2001). Operates on a 4×4 byte state matrix through
        SubBytes → ShiftRows → MixColumns → AddRoundKey per round.
      </p>

      <div className="grid sm:grid-cols-2 gap-3">
        <div>
          <label className="lbl">Plaintext (enc) / Base64 (dec)</label>
          <textarea className="field h-20 resize-none" value={text} onChange={e => setText(e.target.value)} />
        </div>
        <div className="space-y-3">
          <div>
            <label className="lbl">Key ({keyLen} chars / {ks} bits)</label>
            <input className="field-mono" value={key} onChange={e => setKey(e.target.value)} />
            <p className="text-xs text-sand-400 mt-1">CBC mode · zero IV · padded/trimmed to {keyLen} chars</p>
          </div>
          <div>
            <label className="lbl">Key size</label>
            <div className="flex gap-2">
              {[128,192,256].map(s => (
                <button key={s} onClick={() => setKs(s)}
                  className={`flex-1 py-1.5 rounded-lg text-xs font-semibold border transition-colors
                    ${ks===s ? 'bg-accent text-white border-accent' : 'bg-white text-sand-600 border-sand-300 hover:border-sand-400'}`}>
                  {s}-bit
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button onClick={() => run('enc')} className="btn-primary">Encrypt</button>
        <button onClick={() => run('dec')} className="btn-outline">Decrypt</button>
      </div>

      {err && <div className="notice notice-error">{err}</div>}
      {out && (
        <div>
          <label className="lbl">{mode === 'enc' ? 'Ciphertext (Base64)' : 'Plaintext'}</label>
          <div className="result-box">{out}</div>
        </div>
      )}

      <div className="divider" />

      {/* Round structure */}
      <div>
        <p className="text-xs font-semibold text-sand-700 mb-3">
          AES round structure ({ks}-bit → {rounds} rounds)
        </p>
        <div className="inset-box overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max text-xs font-medium flex-wrap">
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded px-3 py-1.5 text-center">
              AddRoundKey<br /><span className="text-blue-400 text-xs font-normal">initial</span>
            </div>
            <span className="text-sand-300">→ × {rounds-1}</span>
            <div className="bg-purple-50 border border-purple-200 text-purple-700 rounded px-3 py-1.5 text-center">
              SubBytes<br /><span className="text-purple-400 text-xs font-normal">S-Box lookup</span>
            </div>
            <span className="text-sand-300">→</span>
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-3 py-1.5 text-center">
              ShiftRows<br /><span className="text-emerald-400 text-xs font-normal">cyclic shift</span>
            </div>
            <span className="text-sand-300">→</span>
            <div className="bg-amber-50 border border-amber-200 text-amber-700 rounded px-3 py-1.5 text-center">
              MixColumns<br /><span className="text-amber-400 text-xs font-normal">GF(2⁸)</span>
            </div>
            <span className="text-sand-300">→</span>
            <div className="bg-blue-50 border border-blue-200 text-blue-700 rounded px-3 py-1.5 text-center">
              AddRoundKey<br /><span className="text-blue-400 text-xs font-normal">XOR subkey</span>
            </div>
            <span className="text-sand-300">→ final</span>
            <div className="bg-red-50 border border-red-200 text-red-700 rounded px-3 py-1.5 text-center leading-tight">
              SubBytes<br />ShiftRows<br />AddRoundKey
            </div>
          </div>
        </div>
      </div>

      {/* S-Box */}
      <div>
        <button onClick={() => setShowSbox(v=>!v)} className="btn-ghost btn-sm text-xs">
          {showSbox ? '▲ Hide' : '▼ Show'} AES S-Box
        </button>
        {showSbox && (
          <div className="mt-3 inset-box overflow-x-auto">
            <p className="text-xs text-sand-400 mb-2">S-Box — byte (row | col) maps to substituted byte</p>
            <div className="font-mono text-xs">
              <div className="flex gap-0 mb-1">
                <div className="w-8" />
                {HEX.split('').map(h => <div key={h} className="w-7 text-center text-sand-400">{h}</div>)}
              </div>
              {Array.from({length:16},(_,r)=>(
                <div key={r} className="flex gap-0">
                  <div className="w-8 text-sand-400 text-right pr-1.5">{r.toString(16)}</div>
                  {Array.from({length:16},(_,c)=>(
                    <div key={c} className="w-7 text-center py-0.5 text-xs text-sand-700 hover:bg-accent hover:text-white rounded transition-colors cursor-default">
                      {SBOX[r*16+c].toString(16).padStart(2,'0')}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
