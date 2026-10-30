// Os numeros que aparecem no README, presos aqui. Todos sairam de
// `node ferramentas/medidor.js`; nenhum foi digitado de cabeca.

import test from 'node:test';
import assert from 'node:assert/strict';
import { medir, ATE } from '../ferramentas/medidor.js';
import { menorExpansao, contarExpansoes } from '../src/busca.js';
import { expansaoGulosa, algarismosDoMaior } from '../src/guloso.js';

test('a varredura cobre denominadores ate 100', () => {
  assert.equal(ATE, 100);
  assert.equal(medir().linhas.length, 3043);
});

test('tabela 1: nenhuma expansao invalida em 3.043 fracoes', () => {
  assert.equal(medir().invalidas, 0);
});

test('tabela 1: o guloso nunca passou de 8 termos', () => {
  const maior = Math.max(...medir().linhas.map((l) => l.guloso));
  assert.equal(maior, 8);
});

const faixas = [
  { ate: 20, fracoes: 127, otimo: 122, fatia: 96.1, pior: 1 },
  { ate: 30, fracoes: 277, otimo: 261, fatia: 94.2, pior: 1 },
  { ate: 50, fracoes: 773, otimo: 691, fatia: 89.4, pior: 2 },
  { ate: 80, fracoes: 1965, otimo: 1684, fatia: 85.7, pior: 3 },
  { ate: 100, fracoes: 3043, otimo: 2546, fatia: 83.7, pior: 5 },
];

for (const f of faixas) {
  test(`tabela 2: ate ${f.ate}, o guloso e otimo em ${f.otimo} de ${f.fracoes}`, () => {
    const faixa = medir().linhas.filter((l) => l.q <= f.ate);
    assert.equal(faixa.length, f.fracoes);
    assert.equal(faixa.filter((l) => l.excesso === 0).length, f.otimo);
    assert.ok(Math.abs((100 * f.otimo) / f.fracoes - f.fatia) < 0.05);
    assert.equal(Math.max(...faixa.map((l) => l.excesso)), f.pior);
  });
}

test('tabela 2: a fatia de acerto do guloso so CAI conforme o denominador cresce', () => {
  for (let i = 1; i < faixas.length; i++) {
    assert.ok(faixas[i].fatia < faixas[i - 1].fatia, `${faixas[i].ate} contra ${faixas[i - 1].ate}`);
  }
});

test('tabela 3: 8/97 e onde o guloso mais desperdica, com 5 termos a mais', () => {
  const { linhas } = medir();
  const pior = Math.max(...linhas.map((l) => l.excesso));
  assert.equal(pior, 5);
  const quem = linhas.filter((l) => l.excesso === pior);
  assert.equal(quem.length, 1);
  assert.equal(quem[0].p, 8);
  assert.equal(quem[0].q, 97);
  assert.equal(quem[0].guloso, 8);
  assert.equal(quem[0].minimo, 3);
});

test('tabela 4: 8/97 e tambem o maior denominador, com 150 algarismos', () => {
  const { linhas } = medir();
  const maior = Math.max(...linhas.map((l) => l.algarismos));
  assert.equal(maior, 150);
  const quem = linhas.filter((l) => l.algarismos === maior);
  assert.equal(quem.length, 1);
  assert.equal(`${quem[0].p}/${quem[0].q}`, '8/97');
});

test('tabela 5: 5/121, o caso classico', () => {
  const g = expansaoGulosa(5, 121);
  assert.equal(g.termos.length, 5);
  assert.equal(algarismosDoMaior(g.termos), 25);
  const b = menorExpansao(5, 121);
  assert.equal(b.termos.length, 3);
  assert.deepEqual(b.termos, [25n, 759n, 208725n]);
});

test('tabela 5: 31/311, onde o guloso chega a 537 algarismos', () => {
  const g = expansaoGulosa(31, 311);
  assert.equal(g.termos.length, 10);
  assert.equal(algarismosDoMaior(g.termos), 537);
  const b = menorExpansao(31, 311);
  assert.equal(b.termos.length, 4);
});

const porMinimo = { 1: 99, 2: 590, 3: 1209, 4: 919, 5: 225, 6: 1 };

for (const k of Object.keys(porMinimo).map(Number)) {
  test(`tabela 6: ${porMinimo[k]} fracoes precisam de ${k} termo(s)`, () => {
    const quantas = medir().linhas.filter((l) => l.minimo === k).length;
    assert.equal(quantas, porMinimo[k]);
  });
}

test('tabela 6: a distribuicao soma 3.043', () => {
  assert.equal(Object.values(porMinimo).reduce((a, b) => a + b, 0), 3043);
});

test('tabela 6: tres termos e o caso mais comum, com 39,7%', () => {
  const fatia = (100 * porMinimo[3]) / 3043;
  assert.ok(fatia > 39.69 && fatia < 39.74, `fatia medida: ${fatia}`);
  for (const k of [1, 2, 4, 5, 6]) assert.ok(porMinimo[k] < porMinimo[3], `k=${k}`);
});

test('tabela 6: so uma fracao em 3.043 precisa de seis termos, e e 77/79', () => {
  const seis = medir().linhas.filter((l) => l.minimo === 6);
  assert.equal(seis.length, 1);
  assert.equal(`${seis[0].p}/${seis[0].q}`, '77/79');
});

test('tabela 6: as 99 que precisam de um termo sao as unitarias', () => {
  const um = medir().linhas.filter((l) => l.minimo === 1);
  assert.equal(um.length, 99);
  for (const l of um) assert.equal(l.p, 1);
});

const expansoesMinimas = { '2/3': [2, 1], '3/7': [3, 6], '4/17': [3, 4], '5/31': [3, 5], '5/121': [3, 21] };

for (const chave of Object.keys(expansoesMinimas)) {
  const [p, q] = chave.split('/').map(Number);
  const [tamanho, quantas] = expansoesMinimas[chave];
  test(`tabela 7: ${chave} tem ${quantas} expansao(oes) de ${tamanho} termos`, () => {
    assert.equal(menorExpansao(p, q).termos.length, tamanho);
    assert.equal(contarExpansoes(p, q, tamanho), quantas);
  });
}

test('fechamento: o guloso e otimo em 2.546 das 3.043, ou 83,7%', () => {
  const { linhas } = medir();
  const otimo = linhas.filter((l) => l.excesso === 0).length;
  assert.equal(otimo, 2546);
  const fatia = (100 * otimo) / linhas.length;
  assert.ok(fatia > 83.66 && fatia < 83.70, `fatia medida: ${fatia}`);
});

test('fechamento: o guloso erra em 497 fracoes', () => {
  const { linhas } = medir();
  assert.equal(linhas.filter((l) => l.excesso > 0).length, 497);
  assert.equal(2546 + 497, 3043);
});

test('o cabecalho do README: 8/97 e 1/13 + 1/182 + 1/17654', () => {
  const b = menorExpansao(8, 97);
  assert.deepEqual(b.termos, [13n, 182n, 17654n]);
});
