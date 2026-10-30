// O algoritmo guloso de Fibonacci (1202), tambem chamado de Fibonacci-Sylvester:
// para escrever p/q como soma de fracoes unitarias distintas, tire a MAIOR fracao
// unitaria que ainda cabe e repita com o resto.
//
//   5/6 = 1/2 + 1/3
//   3/7 = 1/3 + 1/11 + 1/231
//
// Fibonacci provou que isso sempre termina: a cada passo o numerador do resto
// diminui pelo menos um. O que ele nao prometeu foi que o resultado seria curto,
// nem que os denominadores seriam pequenos. E e ai que mora a diversao.

export function mdc(a, b) {
  let x = a < 0n ? -a : a;
  let y = b < 0n ? -b : b;
  while (y) [x, y] = [y, x % y];
  return x;
}

/** Reduz p/q. */
export function reduzir(p, q) {
  const g = mdc(p, q);
  return [p / g, q / g];
}

/** Divisao inteira para cima, com p e q positivos. */
export function teto(p, q) {
  return p % q === 0n ? p / q : p / q + 1n;
}

/**
 * A expansao gulosa de p/q.
 * @returns {{termos: bigint[], passos: number}} os denominadores, em ordem
 */
export function expansaoGulosa(p, q) {
  let [n, d] = reduzir(BigInt(p), BigInt(q));
  if (n <= 0n) throw new Error('a fracao tem de ser positiva');
  if (n >= d) throw new Error('a fracao tem de ser menor que 1');

  const termos = [];
  let passos = 0;
  while (n > 0n) {
    passos++;
    // a maior unitaria que cabe em n/d e 1/teto(d/n)
    const x = teto(d, n);
    termos.push(x);
    // n/d - 1/x = (n*x - d) / (d*x)
    [n, d] = reduzir(n * x - d, d * x);
    if (passos > 50) throw new Error(`o guloso nao terminou em 50 passos para ${p}/${q}`);
  }
  return { termos, passos };
}

/** Soma uma lista de fracoes unitarias e devolve a fracao reduzida. */
export function somarUnitarias(denominadores) {
  let n = 0n;
  let d = 1n;
  for (const x of denominadores) {
    n = n * x + d;
    d *= x;
    [n, d] = reduzir(n, d);
  }
  return [n, d];
}

/** A expansao e valida: unitarias distintas, crescentes, que somam p/q. */
export function expansaoValida(termos, p, q) {
  if (new Set(termos.map(String)).size !== termos.length) return false;
  for (let i = 1; i < termos.length; i++) if (termos[i] <= termos[i - 1]) return false;
  for (const x of termos) if (x <= 0n) return false;
  const [n, d] = somarUnitarias(termos);
  const [pp, qq] = reduzir(BigInt(p), BigInt(q));
  return n === pp && d === qq;
}

/** Quantos algarismos tem o maior denominador da expansao. */
export function algarismosDoMaior(termos) {
  if (termos.length === 0) return 0;
  return termos[termos.length - 1].toString().length;
}
