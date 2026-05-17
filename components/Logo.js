/**
 * CipherVault mark — vault arch + shield + keyhole (encryption & protection).
 */
export default function Logo({ size = 32, className = '' }) {
  const id = 'cv-logo-grad';
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={id} x1="4" y1="2" x2="28" y2="30" gradientUnits="userSpaceOnUse">
          <stop stopColor="#eda36b" />
          <stop offset="0.45" stopColor="#c2611f" />
          <stop offset="1" stopColor="#7f3f14" />
        </linearGradient>
        <linearGradient id={`${id}-shine`} x1="8" y1="4" x2="20" y2="14" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff" stopOpacity="0.35" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Container */}
      <rect width="32" height="32" rx="8" fill={`url(#${id})`} />
      <rect width="32" height="32" rx="8" fill={`url(#${id}-shine)`} />

      {/* Vault arch */}
      <path
        d="M9 14.5V12.2c0-3.2 3.1-5.7 7-5.7s7 2.5 7 5.7v2.3"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.9"
      />
      <path
        d="M8.5 14.5h15"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
        opacity="0.75"
      />

      {/* Shield body */}
      <path
        d="M16 8.2l-6.2 2.4v5.1c0 4.1 2.7 7.9 6.2 8.8 3.5-.9 6.2-4.7 6.2-8.8v-5.1L16 8.2z"
        fill="white"
        fillOpacity="0.14"
        stroke="white"
        strokeWidth="1.25"
        strokeLinejoin="round"
      />

      {/* Keyhole */}
      <circle cx="16" cy="15.8" r="1.55" fill="white" />
      <path
        d="M16 17.2v2.6"
        stroke="white"
        strokeWidth="1.35"
        strokeLinecap="round"
      />

      {/* Cipher dots (matrix hint) */}
      <circle cx="11.5" cy="20.5" r="0.65" fill="white" opacity="0.55" />
      <circle cx="14" cy="21.8" r="0.65" fill="white" opacity="0.7" />
      <circle cx="18" cy="21.8" r="0.65" fill="white" opacity="0.7" />
      <circle cx="20.5" cy="20.5" r="0.65" fill="white" opacity="0.55" />
    </svg>
  );
}
