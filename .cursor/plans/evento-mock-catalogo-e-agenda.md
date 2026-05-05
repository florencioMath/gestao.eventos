# Plano: mock de eventos — catálogo (`ativo`) e programação por dia

## Resposta direta

**Sim, é possível fazer tudo o que foi pedido** com o âmbito combinado: mock alinhado a “exibir no portal / catálogo” independente das datas de listagem, e **horário início/fim por dia civil** em eventos multi-dia — **sem** refazer os blobs dos anexos em [`src/mocks/eventos-mock-lista.ts`](src/mocks/eventos-mock-lista.ts).

## Ficheiros a alterar (implementação futura)

| Ficheiro | O quê |
|----------|--------|
| [`src/features/eventos/types/index.ts`](src/features/eventos/types/index.ts) | Tipo opcional `EventoProgramacaoDiaDto` e `programacaoDiaria?: EventoProgramacaoDiaDto[]` em `EventoCadastroDto`; comentário em `ativo` (elegível catálogo). |
| [`src/mocks/eventos-mock-helpers.ts`](src/mocks/eventos-mock-helpers.ts) | `camposDataDeBodyEvento`: parse de `programacaoDiaria` no body; senão gerar lista de dias entre 1.º e último dia com horas (omissão: mesmo `horaInicio`/`horaFim` em todos os dias, ou 1.º dia só início e último só fim se quiserem replicar a regra actual do formulário — **definir na implementação**). Helpers para iterar dias `YYYY-MM-DD` sem UTC shift. Parsing robusto de `ativo` no PUT (evitar `Boolean("false")`). Opcional: `exibirParaCidadao` / `publicadoNoCatalogo` como alias de `ativo` só no mock. |
| [`src/mocks/eventos-mock-api.ts`](src/mocks/eventos-mock-api.ts) | POST/PUT: passar `programacaoDiaria` para o `EventoCadastroDto`; usar helper de `ativo` + aliases; GET devolve DTO completo. |
| [`src/mocks/eventos-mock-lista.ts`](src/mocks/eventos-mock-lista.ts) | **Só objectos `evento`:** acrescentar `programacaoDiaria` onde fizer sentido (ex.: evento multi-dia de exemplo); **não tocar** em `anexos` / base64. |

## O que não entra nesta fase

- Formulário, listagens e `visibilidade-evento.ts` (rótulos “Ativo” → “Exibir no catálogo”) podem ficar para depois; o mock e o DTO já preparam dados.
- Back-end Spring real (contrato definitivo) fica documentado como alvo futuro; o mock pode antecipar o campo opcional.

## Tarefas (checklist)

1. DTO: `EventoProgramacaoDiaDto` + `programacaoDiaria?` em `EventoCadastroDto`.
2. Helpers: geração/parse de programação + `ativo` robusto + aliases opcionais.
3. `eventos-mock-api.ts`: integrar helpers em POST/PUT (e respostas GET).
4. `eventos-mock-lista.ts`: editar apenas blocos JSON do **evento** (sem alterar anexos).

## Nota sobre `eventos-mock-lista.ts`

O ficheiro é grande por causa dos anexos; as alterações limitam-se a **propriedades do `evento`** (e eventualmente um evento multi-dia de demonstração com `programacaoDiaria` variada). Nenhuma reescrita dos arrays `anexos` / base64.
