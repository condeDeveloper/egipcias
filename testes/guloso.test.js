import test from 'node:test';
import assert from 'node:assert/strict';
import {
  mdc, reduzir, teto, expansaoGulosa, somarUnitarias, expansaoValida, algarismosDoMaior,
} from '../src/guloso.js';

test('mdc e reducao', () => {
  assert.equal(mdc(12n, 18n), 6n);
  assert.deepEqual(reduzir(4n, 6n), [2n, 3n]);
  assert.deepEqual(reduzir(7n, 13n), [7n, 13n]);
});

test('teto divide para cima', () => {
  assert.equal(teto(7n, 2n), 4n);
  assert.equal(teto(6n, 2n), 3n);
  assert.equal(teto(1n, 3n), 1n);
});

test('a expansao de 5/6 e 1/2 mais 1/3', () => {
  assert.deepEqual(expansaoGulosa(5, 6).termos, [2n, 3n]);
});

test('a expansao de 3/7 e a classica de Fibonacci', () => {
  assert.deepEqual(expansaoGulosa(3, 7).termos, [3n, 11n, 231n]);
});

test('uma fracao que ja e unitaria sai com um termo so', () => {
  for (const q of [2, 3, 5, 11, 97]) {
    assert.deepEqual(expansaoGulosa(1, q).termos, [BigInt(q)]);
  }
});

test('a fracao reduz antes de expandir', () => {
  assert.deepEqual(expansaoGulosa(2, 4).termos, [2n]);
  assert.deepEqual(expansaoGulosa(10, 12).termos, [2n, 3n]);
});

test('fracao nao positiva ou maior que 1 e erro', () => {
  assert.throws(() => expansaoGulosa(0, 5));
  assert.throws(() => expansaoGulosa(-1, 5));
  assert.throws(() => expansaoGulosa(5, 5));
  assert.throws(() => expansaoGulosa(7, 5));
});

test('somarUnitarias devolve a fracao reduzida', () => {
  assert.deepEqual(somarUnitarias([2n, 3n]), [5n, 6n]);
  assert.deepEqual(somarUnitarias([3n, 11n, 231n]), [3n, 7n]);
  assert.deepEqual(somarUnitarias([2n]), [1n, 2n]);
});

test('a expansao gulosa sempre soma de volta a fracao, ate q=60', () => {
  for (let q = 2; q <= 60; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const { termos } = expansaoGulosa(p, q);
      assert.deepEqual(somarUnitarias(termos), [BigInt(p), BigInt(q)], `${p}/${q}`);
    }
  }
});

test('a expansao gulosa tem denominadores estritamente crescentes', () => {
  for (let q = 2; q <= 60; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const { termos } = expansaoGulosa(p, q);
      for (let i = 1; i < termos.length; i++) {
        assert.ok(termos[i] > termos[i - 1], `${p}/${q}: ${termos}`);
      }
    }
  }
});

test('a expansao gulosa nunca repete denominador', () => {
  for (let q = 2; q <= 60; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const { termos } = expansaoGulosa(p, q);
      assert.equal(new Set(termos.map(String)).size, termos.length, `${p}/${q}`);
    }
  }
});

test('o guloso termina sempre, ate q=100', () => {
  // Fibonacci provou: o numerador do resto cai pelo menos um a cada passo.
  // Se a prova falhasse, expansaoGulosa lancaria em 50 passos.
  for (let q = 2; q <= 100; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const { passos, termos } = expansaoGulosa(p, q);
      assert.ok(passos <= 10, `${p}/${q} gastou ${passos} passos`);
      assert.equal(passos, termos.length);
    }
  }
});

test('expansaoValida recusa denominador repetido', () => {
  assert.equal(expansaoValida([2n, 2n], 1, 1), false);
});

test('expansaoValida recusa lista fora de ordem', () => {
  assert.equal(expansaoValida([3n, 2n], 5, 6), false);
});

test('expansaoValida recusa soma errada', () => {
  assert.equal(expansaoValida([2n, 4n], 5, 6), false);
});

test('expansaoValida aceita a expansao certa', () => {
  assert.equal(expansaoValida([2n, 3n], 5, 6), true);
  assert.equal(expansaoValida([3n, 11n, 231n], 3, 7), true);
});

test('o guloso de 5/121 chega a um denominador de 25 algarismos', () => {
  const { termos } = expansaoGulosa(5, 121);
  assert.equal(termos.length, 5);
  assert.equal(algarismosDoMaior(termos), 25);
  assert.equal(termos[4], 1527612795642093418846225n);
  assert.equal(expansaoValida(termos, 5, 121), true);
});

test('o guloso de 31/311 chega a um denominador de 537 algarismos', () => {
  const { termos } = expansaoGulosa(31, 311);
  assert.equal(termos.length, 10);
  assert.equal(algarismosDoMaior(termos), 537);
  assert.equal(expansaoValida(termos, 31, 311), true);
});

test('esses denominadores nao caberiam em Number', () => {
  const { termos } = expansaoGulosa(5, 121);
  const maior = termos[termos.length - 1];
  assert.ok(maior > 2n ** 53n);
  assert.notEqual(BigInt(Number(maior)), maior);
});
