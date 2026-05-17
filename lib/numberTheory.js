// ─── GCD (Euclidean Algorithm) ───────────────────────────────────────────────
export function gcdSteps(a, b) {
  a = Math.abs(Math.floor(a));
  b = Math.abs(Math.floor(b));
  // Ensure larger is first so step 1 matches the standard lecture presentation
  if (a < b) [a, b] = [b, a];
  const steps = [];
  while (b !== 0) {
    const quotient = Math.floor(a / b);
    const remainder = a % b;
    steps.push({ a, b, quotient, remainder });
    a = b;
    b = remainder;
  }
  return { gcd: a, steps };
}

// ─── Modular Arithmetic ──────────────────────────────────────────────────────
export function modArithmetic(A, B, C, op) {
  const aC = ((A % C) + C) % C;
  const bC = ((B % C) + C) % C;
  let directResult, stepsResult;

  switch (op) {
    case '+':
      directResult = ((A + B) % C + C) % C;
      stepsResult = (aC + bC) % C;
      break;
    case '-':
      directResult = ((A - B) % C + C) % C;
      stepsResult = ((aC - bC) % C + C) % C;
      break;
    case '*':
      directResult = ((A * B) % C + C) % C;
      stepsResult = (aC * bC) % C;
      break;
    case '^':
      directResult = modPow(A, B, C);
      stepsResult = modPow(aC, B, C);
      break;
    default:
      directResult = 0; stepsResult = 0;
  }
  return { directResult, stepsResult, aC, bC };
}

function modPow(base, exp, mod) {
  if (mod === 1) return 0;
  let result = 1;
  base = ((base % mod) + mod) % mod;
  while (exp > 0) {
    if (exp % 2 === 1) result = (result * base) % mod;
    exp = Math.floor(exp / 2);
    base = (base * base) % mod;
  }
  return result;
}

// ─── Prime Checker ───────────────────────────────────────────────────────────
export function isPrime(n) {
  n = Math.abs(Math.floor(n));
  if (n < 2) return { prime: false, reason: `${n} < 2, not prime` };
  if (n === 2) return { prime: true, divisors: [], reason: '2 is the only even prime' };
  if (n % 2 === 0) return { prime: false, divisors: [2], reason: `${n} is even (divisible by 2)` };
  const divisors = [];
  for (let i = 3; i <= Math.sqrt(n); i += 2) {
    if (n % i === 0) divisors.push(i);
  }
  if (divisors.length > 0) return { prime: false, divisors, reason: `Divisible by ${divisors[0]}` };
  return { prime: true, divisors: [], reason: `${n} has no divisors between 2 and √${n}≈${Math.floor(Math.sqrt(n))}` };
}

export function primesUpTo(limit) {
  const sieve = new Array(limit + 1).fill(true);
  sieve[0] = sieve[1] = false;
  for (let i = 2; i * i <= limit; i++)
    if (sieve[i]) for (let j = i * i; j <= limit; j += i) sieve[j] = false;
  return sieve.reduce((acc, val, i) => val ? [...acc, i] : acc, []);
}

// ─── Prime Factorization ─────────────────────────────────────────────────────
export function primeFactorization(n) {
  n = Math.abs(Math.floor(n));
  if (n < 2) return { factors: [], steps: [] };
  const factors = [];
  const steps = [];
  let current = n;
  for (let p = 2; p * p <= current; p++) {
    while (current % p === 0) {
      factors.push(p);
      steps.push({ divisor: p, quotient: current / p, current });
      current = current / p;
    }
  }
  if (current > 1) {
    factors.push(current);
    steps.push({ divisor: current, quotient: 1, current, last: true });
  }
  return { factors, steps, n };
}

// ─── Fermat's Little Theorem ─────────────────────────────────────────────────
export function fermatTest(a, p) {
  const result = modPow(a, p - 1, p);
  return { result, isPrime: result === 1, a, p };
}
