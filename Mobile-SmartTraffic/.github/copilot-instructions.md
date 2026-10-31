# SmartTraffic Mobile — instruções para o Copilot

## Stack
- Expo + React Native + TypeScript + Expo Router. Nunca gere HTML/div nem CSS web.
- O app é somente escuro (dark-only). Não crie variantes de tema claro.

## Design system
- Fonte única: `@/constants/theme` (`src/constants/theme.ts`). Não invente cores, fontes, tamanhos nem raios.
- Cores: `AppColors` (superfícies, texto, ação), `StatusColors` (câmera, chamado, prioridade) e `ChartColors` (gráficos).
- Tipografia: espalhe `Type.*` no estilo do texto. Michroma (`Fonts.brand`) só para a marca; todo o resto é Outfit.
- Espaçamento, grade e formas: `Spacing`, `Layout`, `Radius`, `BorderWidth`, `Sizes`.
- Nunca escreva `#hex`, `rgb(`, `fontFamily` ou `fontSize` literais fora de `theme.ts`.
- Alvos de toque com no mínimo `Sizes.minTouch` (44). Margem lateral das telas: `Layout.screenMargin`.
- Status e prioridade nunca só por cor: sempre ponto/ícone + texto.
- Se faltar um token, proponha adicioná-lo ao `theme.ts`; não crie um valor solto no componente.

## Componentes e telas
- Telas Figma: antes de codar, chame get_design_context e get_screenshot do frame indicado.
- Reutilize componentes de `src/components`; crie novos só se não existir equivalente.
- Estados (vazio, erro, carregando) são variantes do mesmo componente, não telas novas.

## Dados e regras de negócio
- Dados: use `services/contracts`; telas nunca chamam fetch direto.
- Rótulos: contagem por quadro = "detectados agora"; nunca "fila" nem "veículos únicos".
- Dados fictícios devem aparecer marcados como demonstrativos.
- O app é de monitoramento: não implementar comando remoto de semáforos.
- Textos da interface em português do Brasil.