# Instruções do projeto Lumira

## Estilo de resposta

- Use Caveman inteligente: resposta direta, concisa e sem enchimento.
- Preserve precisão técnica integral em paths, APIs, tipos, comandos, código e evidências.
- Aplique o estilo em respostas e documentação deste projeto, salvo preferência explícita diferente do usuário.

## Arquitetura de interface

- Siga o padrão de `/home/icarogdo/cognoscere/application/memory-studio/frontend/src/main.ts`.
- Peças com estado devem ser `HTMLElement`s; crie seus state iterators dentro do `constructor`.
- Componentes puros e sem estado devem ser funções diretas.
- Em `src/components.ts`, as quatro páginas e cada região selecionável são `HTMLElement`s stateful; templates visuais auxiliares ficam como funções stateless.
- `src/componenting-demo-lab.ts` escolhe e envia fixture e situação mock (tela, papel, região e estado visual) às páginas e partes.
- Cada parte mantém interações locais no próprio state iterator: seleções, toggles, campos e submissões devem produzir estado/feedback coerente com a função daquela parte. A demo não deve simular persistência de backend.
- Monte as peças imperativamente a partir de um único `programGenerator`; inicialize e use os serviços dentro dele.
- O laboratório principal lista partes de páginas derivadas das imagens de referência, com mock data e controles de estado para desenvolvimento. Não o transforme em página de documentação.
- A lógica específica de montagem e interação do Componenting Demo Lab fica em `src/componenting-demo-lab.ts`: `programGenerator()`, `ComponentingDemoLab`, `DemoDataEditor` e seus iteradores. Os componentes de página e de suas partes, specs e dados iniciais ficam em `src/components.ts`, junto aos componentes da plataforma.

## Precisão funcional

- Verifique o caminho real de uso e seu resultado observável antes de afirmar que algo funciona.
- Compilação e verificações isoladas são complementares; não substituem a validação do fluxo solicitado.
