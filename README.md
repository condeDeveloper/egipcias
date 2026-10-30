# Frações egípcias: quando o método óbvio explode

Os egípcios só escreviam frações com 1 em cima. Para representar `5/6` eles
escreviam `1/2 + 1/3`. Toda fração própria tem uma representação assim, e
Fibonacci deu um método que sempre funciona: **tire a maior fração unitária que
ainda cabe, e repita**.

O método sempre termina — isso Fibonacci provou. O que ele não prometeu foi que o
resultado seria curto, nem que os denominadores caberiam na página.

```
8/97 pelo método guloso:   8 termos, e o último tem 150 algarismos
8/97 pela busca:           1/13 + 1/182 + 1/17654
```

Este repositório varre todas as frações de denominador até 100, calcula a expansão
gulosa e a mais curta, e mede a diferença. Node puro, sem dependência nenhuma, com
`BigInt` porque os denominadores saem do alcance de qualquer outra coisa.

## Os quatro achados

1. **O método guloso é ótimo em 83,7% das 3.043 frações varridas — e a taxa só
   cai conforme o denominador cresce.** É 96,1% entre as de denominador até 20,
   89,4% até 50 e 83,7% até 100. Ele erra em 497 frações.
2. **A pior é `8/97`: o guloso gasta 8 termos onde bastam 3, e chega a um
   denominador de 150 algarismos.** É a mesma fração nos dois rankings — a que
   mais desperdiça termos e a que mais explode o denominador.
3. **Em `31/311`, o guloso produz um denominador de 537 algarismos.** A expansão
   mínima tem quatro termos, o maior deles com oito algarismos: `1/11 + 1/115 +
   1/13570 + 1/46422970`.
4. **Só uma fração em 3.043 precisa de seis termos: `77/79`.** É
   `1/2 + 1/3 + 1/8 + 1/62 + 1/4524 + 1/7386184`. Três termos bastam para 39,7%
   das frações, e quatro para outros 30,2%.

## As tabelas

Tudo abaixo sai de `node ferramentas/medidor.js`, e está preso em
`testes/medidas.test.js`.

### O guloso é ótimo?

| denominador até | frações | guloso ótimo | fatia | pior excesso |
|---|---|---|---|---|
| 20 | 127 | 122 | 96,1% | 1 |
| 30 | 277 | 261 | 94,2% | 1 |
| 50 | 773 | 691 | 89,4% | 2 |
| 80 | 1.965 | 1.684 | 85,7% | 3 |
| 100 | 3.043 | 2.546 | **83,7%** | 5 |

### Onde o guloso mais desperdiça

| fração | guloso | mínimo | excesso | algarismos do maior denominador |
|---|---|---|---|---|
| 8/97 | 8 | 3 | **5** | 150 |
| 44/53 | 8 | 5 | 3 | 43 |
| 50/89 | 7 | 4 | 3 | 43 |
| 69/97 | 7 | 4 | 3 | 34 |
| 5/91 | 5 | 2 | 3 | 23 |

### Os dois casos clássicos

**5/121**

```
guloso, 5 termos:  25, 757, 763309, 873960180913, 1527612795642093418846225
mínimo, 3 termos:  25, 759, 208725
```

Repare: o guloso e o mínimo começam igual, com 25. A escolha "mais gulosa" do
segundo termo é 757; escolher **759**, ligeiramente pior naquele passo, encurta a
expansão inteira.

**31/311**

```
guloso, 10 termos, o último com 537 algarismos
mínimo,  4 termos:  11, 115, 13570, 46422970
```

### Quantos termos bastam

| mínimo de termos | quantas frações | fatia |
|---|---|---|
| 1 | 99 | 3,3% |
| 2 | 590 | 19,4% |
| 3 | **1.209** | **39,7%** |
| 4 | 919 | 30,2% |
| 5 | 225 | 7,4% |
| 6 | 1 | 0,0% |

### Quantas expansões mínimas existem

| fração | mínimo | expansões desse tamanho |
|---|---|---|
| 2/3 | 2 | 1 |
| 4/17 | 3 | 4 |
| 5/31 | 3 | 5 |
| 3/7 | 3 | 6 |
| 5/121 | 3 | **21** |

## O que as medidas me corrigiram

- **Esperava que o guloso errasse por pouco, e que a diferença fosse de um termo.**
  Até denominador 30 é mesmo assim: o pior excesso é 1. Mas em 97 o excesso chega a
  **5**, e o tamanho do erro cresce junto com o denominador. Se eu tivesse varrido
  só até 30 e escrito "erra por um termo", seria uma frase com número e mesmo
  assim errada.
- **Achei que o caso famoso `5/121` fosse o pior, porque é o que os livros
  citam.** Ele não está nem entre os cinco piores da varredura: perde em excesso
  de termos para `8/97`, `44/53`, `50/89`, `69/97` e `5/91`. O que torna `5/121`
  famoso é ser pequeno e didático, não ser extremo.
- **Escrevi os três termos de `8/97` no cabeçalho deste README de cabeça, e
  estavam errados.** Pus `1/13 + 1/1559 + 1/2435699`, que soma
  `3828939095/49364311633` e não tem nada a ver com 8/97. O certo, medido, é
  `1/13 + 1/182 + 1/17654`. O número estava a uma chamada de função de
  distância e eu digitei o que me pareceu plausível — que é exatamente o hábito
  que o arquivo de medidas existe para impedir. Agora ele está preso em teste.
- **Supus que o guloso e o mínimo divergissem desde o primeiro termo.** Em
  `5/121` os dois começam com 25, e em `31/311` os dois começam com 11 e 115
  iguais. A escolha que estraga tudo é a do passo seguinte, e por isso não dá para
  consertar o guloso olhando só o começo.

## Como está organizado

```
src/guloso.js   o algoritmo de Fibonacci, a soma de unitárias e a validação
src/busca.js    a expansão mais curta por aprofundamento iterativo, e a contagem
ferramentas/medidor.js  roda a varredura e imprime as tabelas acima
testes/         65 testes
```

Todo denominador é `BigInt`: o maior que aparece na varredura tem 150 algarismos, e
o de `31/311` tem 537. Em ponto flutuante, a soma de verificação não fecharia em
nenhum dos dois.

## Rodar

```bash
node --test testes/*.test.js   # a bateria inteira
node ferramentas/medidor.js    # recalcula todas as tabelas deste README
```

Sem `npm install`: não há dependência. Precisa de Node 18 ou mais novo.

## Licença

MIT.
