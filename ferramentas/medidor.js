#!/usr/bin/env node
// O medidor: roda as varreduras e imprime as tabelas que vao para o README.
// Nenhum numero do README e digitado a mao; todos saem daqui.

import { expansaoGulosa, expansaoValida, algarismosDoMaior, mdc } from '../src/guloso.js';
import { menorExpansao, contarExpansoes } from '../src/busca.js';

const br = (x) => x.toLocaleString('pt-BR');

export const ATE = 100;

let guardado = null;

/** Varre todas as fracoes p/q irredutiveis com 0 < p < q <= ATE. */
export function medir() {
  if (guardado) return guardado;
  const linhas = [];
  let invalidas = 0;

  for (let q = 2; q <= ATE; q++) {
    for (let p = 1; p < q; p++) {
      if (mdc(BigInt(p), BigInt(q)) !== 1n) continue;
      const g = expansaoGulosa(p, q);
      const b = menorExpansao(p, q);
      if (!expansaoValida(g.termos, p, q)) invalidas++;
      if (b.termos.length > 0 && !expansaoValida(b.termos, p, q)) invalidas++;
      linhas.push({
        p,
        q,
        guloso: g.termos.length,
        minimo: b.termos.length,
        excesso: g.termos.length - b.termos.length,
        algarismos: algarismosDoMaior(g.termos),
        termosGulosos: g.termos,
        termosMinimos: b.termos,
        nos: b.nos,
      });
    }
  }
  guardado = { linhas, invalidas };
  return guardado;
}

function imprimir() {
  const { linhas, invalidas } = medir();

  console.log('\n== Tabela 1: o guloso termina sempre? ==');
  console.log('  Fibonacci provou que sim. Aqui esta medido.');
  console.log('  fracoes varridas | expansoes invalidas | maior numero de termos');
  const maisTermos = Math.max(...linhas.map((l) => l.guloso));
  console.log(
    `  ${br(linhas.length).padStart(16)} | ${String(invalidas).padStart(19)} | ${maisTermos}`
  );
  if (invalidas > 0) {
    console.error('EXPANSAO INVALIDA ENCONTRADA');
    process.exit(1);
  }

  console.log('\n== Tabela 2: o guloso e otimo? ==');
  console.log('  denominador ate | fracoes | guloso otimo | fatia | pior excesso');
  for (const ate of [20, 30, 50, 80, 100]) {
    const faixa = linhas.filter((l) => l.q <= ate);
    const otimo = faixa.filter((l) => l.excesso === 0).length;
    const pior = Math.max(...faixa.map((l) => l.excesso));
    console.log(
      `  ${String(ate).padStart(15)} | ${br(faixa.length).padStart(7)} | ${br(otimo).padStart(12)} | ${((100 * otimo) / faixa.length).toFixed(1)}% | ${pior}`
    );
  }

  console.log('\n== Tabela 3: onde o guloso mais desperdica termos ==');
  console.log('  fracao | guloso | minimo | excesso | algarismos do maior denominador');
  const porExcesso = linhas.slice().sort((a, b) => b.excesso - a.excesso || b.algarismos - a.algarismos);
  for (const l of porExcesso.slice(0, 8)) {
    console.log(
      `  ${(l.p + '/' + l.q).padStart(6)} | ${String(l.guloso).padStart(6)} | ${String(l.minimo).padStart(6)} | ${String(l.excesso).padStart(7)} | ${l.algarismos}`
    );
  }

  console.log('\n== Tabela 4: onde o guloso explode o denominador ==');
  console.log('  fracao | termos | algarismos do maior denominador | minimo tem');
  const porTamanho = linhas.slice().sort((a, b) => b.algarismos - a.algarismos);
  for (const l of porTamanho.slice(0, 8)) {
    console.log(
      `  ${(l.p + '/' + l.q).padStart(6)} | ${String(l.guloso).padStart(6)} | ${String(l.algarismos).padStart(30)} | ${l.minimo} termos`
    );
  }

  console.log('\n== Tabela 5: os dois casos classicos ==');
  for (const [p, q] of [[5, 121], [31, 311]]) {
    const g = expansaoGulosa(p, q);
    const b = menorExpansao(p, q);
    console.log(`  ${p}/${q}:`);
    console.log(`    guloso, ${g.termos.length} termos, maior com ${algarismosDoMaior(g.termos)} algarismos`);
    if (algarismosDoMaior(g.termos) <= 30) console.log(`      ${g.termos.join(', ')}`);
    else console.log(`      ${g.termos.slice(0, 4).join(', ')}, ... e mais ${g.termos.length - 4}`);
    console.log(`    minimo, ${b.termos.length} termos: ${b.termos.join(', ')}`);
    if (!expansaoValida(g.termos, p, q) || !expansaoValida(b.termos, p, q)) process.exit(1);
  }

  console.log('\n== Tabela 6: quantos termos bastam ==');
  console.log('  minimo de termos | quantas fracoes | fatia');
  const porMinimo = new Map();
  for (const l of linhas) porMinimo.set(l.minimo, (porMinimo.get(l.minimo) || 0) + 1);
  for (const k of [...porMinimo.keys()].sort((a, b) => a - b)) {
    console.log(
      `  ${String(k).padStart(16)} | ${br(porMinimo.get(k)).padStart(15)} | ${((100 * porMinimo.get(k)) / linhas.length).toFixed(1)}%`
    );
  }

  const seisTermos = linhas.filter((l) => l.minimo === 6);
  for (const l of seisTermos) {
    console.log(
      `  a unica que precisa de ${l.minimo}: ${l.p}/${l.q} = 1/${l.termosMinimos.join(' + 1/')}`
    );
  }

  console.log('\n== Tabela 7: quantas expansoes minimas existem ==');
  console.log('  fracao | minimo | expansoes com esse tamanho');
  for (const [p, q] of [[2, 3], [3, 7], [4, 17], [5, 31], [5, 121]]) {
    const b = menorExpansao(p, q);
    console.log(
      `  ${(p + '/' + q).padStart(6)} | ${String(b.termos.length).padStart(6)} | ${br(contarExpansoes(p, q, b.termos.length))}`
    );
  }

  console.log('\n== Fechamento ==');
  const otimo = linhas.filter((l) => l.excesso === 0).length;
  console.log(`  fracoes varridas ................ ${br(linhas.length)}`);
  console.log(`  expansoes invalidas ............. ${invalidas}`);
  console.log(`  guloso otimo em ................. ${br(otimo)} (${((100 * otimo) / linhas.length).toFixed(1)}%)`);
  console.log(`  pior excesso de termos .......... ${Math.max(...linhas.map((l) => l.excesso))}`);
  console.log(`  maior denominador do guloso ..... ${Math.max(...linhas.map((l) => l.algarismos))} algarismos`);
  console.log('');
}

if (process.argv[1]?.endsWith('medidor.js')) imprimir();
