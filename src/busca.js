// A expansao mais CURTA, achada por busca. O guloso nao entra aqui: a busca nao
// sabe o que ele respondeu, e por isso serve de juiz.
//
// Aprofundamento iterativo: tenta com 1 termo, com 2, com 3. A primeira que
// fecha ja e minima.

import { reduzir, teto, mdc } from './guloso.js';

/**
 * A menor expansao de p/q em fracoes unitarias distintas.
 * @param {number|bigint} p
 * @param {number|bigint} q
 * @param {{teto?: number}} opcoes
 * @returns {{termos: bigint[], nos: number}}
 */
export function menorExpansao(p, q, opcoes = {}) {
  const [n0, d0] = reduzir(BigInt(p), BigInt(q));
  const limiteMax = opcoes.teto ?? 6;
  let nos = 0;

  for (let limite = 1; limite <= limiteMax; limite++) {
    const atual = [];
    const anda = (n, d, faltam, minimo) => {
      nos++;
      if (n === 0n) return faltam >= 0;
      if (faltam === 0) return false;

      // a menor unitaria possivel: a maior que cabe
      const de = (() => {
        const x = teto(d, n);
        return x > minimo ? x : minimo;
      })();
      // a maior: com `faltam` termos de 1/x cada, e preciso faltam/x >= n/d
      const ate = d * BigInt(faltam) / n;

      for (let x = de; x <= ate; x++) {
        // n/d - 1/x = (n*x - d) / (d*x)
        const novoN = n * x - d;
        if (novoN < 0n) continue;
        const g = mdc(novoN === 0n ? d * x : novoN, d * x);
        const nn = novoN / g;
        const dd = (d * x) / g;
        atual.push(x);
        if (anda(nn, dd, faltam - 1, x + 1n)) return true;
        atual.pop();
      }
      return false;
    };

    if (anda(n0, d0, limite, 2n)) return { termos: atual.slice(), nos };
  }
  return { termos: [], nos };
}

/**
 * Conta TODAS as expansoes de p/q com exatamente `tamanho` termos. Serve para
 * perguntar quantas solucoes otimas existem, o que o comprimento sozinho esconde.
 */
export function contarExpansoes(p, q, tamanho) {
  const [n0, d0] = reduzir(BigInt(p), BigInt(q));
  let total = 0;
  const anda = (n, d, faltam, minimo) => {
    if (n === 0n) {
      if (faltam === 0) total++;
      return;
    }
    if (faltam === 0) return;
    const de = (() => {
      const x = teto(d, n);
      return x > minimo ? x : minimo;
    })();
    const ate = (d * BigInt(faltam)) / n;
    for (let x = de; x <= ate; x++) {
      const novoN = n * x - d;
      if (novoN < 0n) continue;
      const g = mdc(novoN === 0n ? d * x : novoN, d * x);
      anda(novoN / g, (d * x) / g, faltam - 1, x + 1n);
    }
  };
  anda(n0, d0, tamanho, 2n);
  return total;
}
