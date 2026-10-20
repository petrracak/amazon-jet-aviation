# Plano de design — Amazon Jet Aviation

## Assunto, público e tarefa

- **Assunto real:** sourcing e fornecimento de peças aeronáuticas dos EUA para o Brasil. Não é fretamento executivo, não é escola de aviação. O vocabulário do negócio é _part number_, condição (new, overhauled, repaired, serviceable), FAA 8130-3, rastreabilidade, prazo, hangar, AOG.
- **Público:** gestor de operação de táxi aéreo, comprador de oficina (MRO), aviação agrícola e executiva. Técnico, cético, com pressa.
- **Tarefa principal da página:** fazer a pessoa mandar um part number. Tarefa secundária: quando a aeronave está parada, chegar ao botão de AOG em um clique.

## O erro que estamos corrigindo

O site atual é o template escuro de "aviação premium": foto de jato no pôr do sol, vidro fosco, frases que servem para qualquer empresa. As três referências do cliente apontam para o contrário: claro, arejado, tipografia grande. A direção aprovada é clara **com blocos escuros pontuais**.

Mas referência de layout não é identidade. A identidade vem do assunto: **a etiqueta de peça e o balcão de peças**. É daí que saem a cor âmbar, o uso de monoespaçada em part number e a diagramação de ficha técnica.

## Cor

| Token | Hex | Papel |
|---|---|---|
| `--ink` | `#0B1B2B` | Texto, botão primário e as dobras escuras. Azul-tinta de hangar, herdado do azul-escuro da marca. |
| `--surface` | `#FFFFFF` | Fundo base. |
| `--mist` | `#EDF0F3` | Cinza-alumínio frio para alternar seções. Não é creme: creme com serifada é o clichê de página gerada. |
| `--tag` | `#E3A008` | Âmbar de etiqueta de peça (o _yellow tag_ de serviceable). Herdado do `#FFB703` da marca, escurecido para contraste em fundo claro. Marca, sublinha, numera. Nunca é fundo de botão primário. |
| `--aog` | `#C3252B` | Exclusivo de AOG. Se aparecer em outro lugar, perde a função. |
| `--signal` | `#0E4FC4` | Links e anel de foco apenas. |
| `--ink-soft` | `#5B6B7B` | Texto de apoio. |

**Decisão deliberada:** o botão primário é `--ink` sólido, não azul. Botão azul com card arredondado é o kit SaaS padrão. O âmbar fica reservado para a linguagem de etiqueta, que é o que ninguém mais no setor usa.

## Tipografia

- **Display — Archivo.** Grotesca levemente mecânica, com eixo de largura. Lembra estêncil de fuselagem e placa de hangar. Pesos 600/700, tracking fechado nos títulos grandes.
- **Texto — IBM Plex Sans.** Herança de documentação de engenharia, humanista, claramente diferente de Inter.
- **Part number — IBM Plex Mono.** Monoespaçada **só** em part number, código de formulário e referência de cotação. Aqui ela é funcional, não decorativa: distingue 0 de O e 1 de I, que é exatamente o erro que custa caro num pedido de peça. Não é usada em rótulo genérico.

Medida de linha abaixo de 75 caracteres. Escala em quinta justa a partir de 16px.

## Layout

Grade de ficha técnica: conteúdo alinhado à esquerda, 12 colunas, seções separadas por fio fino em vez de uma sequência de cards iguais. Dado que é dado (aeronaves atendidas, documentação, condições) vira tabela ou lista de definição de verdade, porque a estrutura carrega informação.

Numeração só onde existe sequência real: "Como funciona" (5 passos) e "Como funciona o AOG" (4 passos). Os 5 serviços **não** são sequência, então não levam 01/02/03.

### Hero

O elemento mais característico deste negócio não é um avião: é o part number. Então o hero abre com a **busca de peça funcionando**, não com foto. Resolve três coisas de uma vez: mostra o que a empresa faz em dois segundos, entrega a ação principal na primeira dobra e nos tira a dependência de imagens, que ainda não temos.

```
┌───────────────────────────────────────────────────────────┐
│ [logo]   Sobre  Serviços  Como funciona  Blog  Cotação    │
│                                      [AOG]    PT EN ES    │
├───────────────────────────────────────────────────────────┤
│  ▌Peças aeronáuticas dos EUA para o seu hangar no Brasil  │
│                                                           │
│  Localizamos a peça certa nos EUA                         │
│  e coordenamos a vinda até o seu hangar.                  │
│                                                           │
│  Sourcing de peças novas, overhauled, repaired e          │
│  serviceable. Você fala com um time só.                   │
│                                                           │
│  ┌──────────────────────────────────┬──────────────┐      │
│  │ Digite o part number             │  Pesquisar   │      │
│  └──────────────────────────────────┴──────────────┘      │
│   Tente LW-12417, REM40E ou 05K23037                      │
│  ┌─────────────────────────────────────────────────┐      │
│  │ LW-12417   Oil Filter Element      Lycoming  +  │      │
│  │ LW-12420   Oil Filter Element      Lycoming  +  │      │
│  └─────────────────────────────────────────────────┘      │
│                                                           │
│  [ Pedir cotação ]   Aeronave no solo? Acionar AOG →vermelho│
├───────────────────────────────────────────────────────────┤
│  Flórida │ EUA → Brasil │ Desde 2025 │ 4 condições        │  ← fio fino, não cards
└───────────────────────────────────────────────────────────┘
```

### Dobra AOG

Único bloco em `--ink` com a tarja `--aog`. É o contraste mais alto da página inteira, porque é o momento de maior urgência do cliente.

## Princípios

1. **Uma ousadia só.** A busca no hero é o elemento memorável. Todo o resto é disciplinado e quieto.
2. **Nada de prova inventada.** O diagnóstico mostrou que o site atual promete "99% de satisfação" e "maior estoque do mundo" sem fonte. A nova página só afirma o que a copy final afirma.
3. **Movimento só com motivo.** Uma sequência orquestrada na carga do hero e as transições que respondem a uma ação (abrir, adicionar à cotação, confirmar). Nada de fade-up em cada seção.
4. **Piso de qualidade sem anunciar:** responsivo até 360px, foco visível no teclado, `prefers-reduced-motion` respeitado, contraste AA.

## O que estou evitando de propósito

- Fundo creme com display serifado e acento terracota.
- Preto quase puro com um acento verde-ácido.
- Tudo picotado em cards de mesmo raio com a mesma sombra cinza.
- Rótulo em caixa alta espaçada acima de cada título, meta separada por ponto médio, seta "→" grudada no texto do botão.
