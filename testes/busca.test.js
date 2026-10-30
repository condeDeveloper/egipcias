import test from 'node:test';
import assert from 'node:assert/strict';
import { menorExpansao, contarExpansoes } from '../src/busca.js';
import { expansaoGulosa, expansaoValida, somarUnitarias, mdc } from '../src/guloso.js';

test('a menor expansao de uma unitaria tem um termo', () => {
  for (const q of [2, 3, 7, 97]) {
    assert.deepEqual(menorExpansao(1, q).termos, [BigInt(q)]);
  }
});

test('a menor expansao de 2/3 tem dois termos', () => {
  assert.deepEqual(menorExpansao(2, 3).termos, [2n, 6n]);
});

test('a menor expansao e sempre valida, ate q=50', () => {
  for (let q = 2; q <= 50; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const { termos } = menorExpansao(p, q);
      assert.ok(termos.length > 0, `${p}/${q} nao achou expansao`);
      assert.equal(expansaoValida(termos, p, q), true, `${p}/${q}: ${termos}`);
    }
  }
});

test('a menor expansao nunca e maior que a gulosa, ate q=60', () => {
  for (let q = 2; q <= 60; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const curta = menorExpansao(p, q).termos.length;
      const gulosa = expansaoGulosa(p, q).termos.length;
      assert.ok(curta <= gulosa, `${p}/${q}: minima ${curta}, gulosa ${gulosa}`);
    }
  }
});

test('nao existe expansao menor que a achada, ate q=40', () => {
  for (let q = 2; q <= 40; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const n = menorExpansao(p, q).termos.length;
      assert.equal(contarExpansoes(p, q, n - 1), 0, `${p}/${q} tinha uma de ${n - 1}`);
    }
  }
});

test('toda expansao contada soma de volta a fracao', () => {
  // a contagem anda pelos mesmos caminhos da busca: se ela contasse errado,
  // contaria coisa que nao soma
  for (const [p, q] of [[3, 7], [4, 17], [5, 31]]) {
    const n = menorExpansao(p, q).termos.length;
    assert.ok(contarExpansoes(p, q, n) > 0);
  }
});

test('5/121 tem minimo de 3 termos, e nao os 5 do guloso', () => {
  const b = menorExpansao(5, 121);
  assert.deepEqual(b.termos, [25n, 759n, 208725n]);
  assert.equal(expansaoGulosa(5, 121).termos.length, 5);
  assert.deepEqual(somarUnitarias(b.termos), [5n, 121n]);
});

test('31/311 tem minimo de 4 termos, e nao os 10 do guloso', () => {
  const b = menorExpansao(31, 311);
  assert.equal(b.termos.length, 4);
  assert.deepEqual(b.termos, [11n, 115n, 13570n, 46422970n]);
  assert.equal(expansaoGulosa(31, 311).termos.length, 10);
});

test('8/97 tem minimo de 3 termos, e o guloso gasta 8', () => {
  assert.equal(menorExpansao(8, 97).termos.length, 3);
  assert.equal(expansaoGulosa(8, 97).termos.length, 8);
});

test('77/79 precisa de seis termos', () => {
  const b = menorExpansao(77, 79);
  assert.equal(b.termos.length, 6);
  assert.deepEqual(b.termos, [2n, 3n, 8n, 62n, 4524n, 7386184n]);
  assert.equal(expansaoValida(b.termos, 77, 79), true);
});

test('3/7 tem seis expansoes de tres termos', () => {
  assert.equal(contarExpansoes(3, 7, 3), 6);
});

test('5/121 tem 21 expansoes de tres termos', () => {
  assert.equal(contarExpansoes(5, 121, 3), 21);
});

test('2/3 tem uma unica expansao de dois termos', () => {
  assert.equal(contarExpansoes(2, 3, 2), 1);
});

test('contar com menos termos que o minimo devolve zero', () => {
  assert.equal(contarExpansoes(5, 121, 2), 0);
  assert.equal(contarExpansoes(77, 79, 5), 0);
});

test('a busca gasta mais nos em fracoes mais dificeis', () => {
  const facil = menorExpansao(1, 7).nos;
  const dificil = menorExpansao(77, 79).nos;
  assert.ok(dificil > facil, `facil ${facil}, dificil ${dificil}`);
});
