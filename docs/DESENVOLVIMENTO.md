# Registro de desenvolvimento inicial

**Projeto:** Lumira - frontend TypeScript
**Data de registro:** 18 de outubro de 2026
**Estado:** protótipo local validado em build e testes; sem implantação de backend.

## Objetivo

Documentar a estrutura visual e técnica inicial da plataforma Lumira, preservar os PDFs de referência utilizados e manter no próprio projeto as telas visuais recebidas com o pacote inicial. O frontend é baseado no esqueleto Cognoscere; o laboratório monta a demonstração, e `program()` fica reservado à aplicação completa, servindo também como API `LumiraSystem` no demo.

## Decisões de estrutura

- `index.html` carrega `src/componenting-demo-lab.ts`, cujo `programGenerator()` é o único ponto imperativo de montagem e mantém o `LumiraSystem` vivo pelo generator.
- `programGenerator()` ordena a montagem e passa o modo ao `program()`. No demo, o `ComponentingDemoLab` fornece uma única página stateful como renderer completo; `program()` fornece a API de operações sem controlar a renderização.
- Sem parâmetro, o generator monta as partes de página do laboratório; `?presentation=application` reserva o renderer e os eventos de `program()` para a plataforma inteira. `?mode=worker` escolhe o contrato Workers na plataforma, ainda dependente de backend implantado.
- `src/main.ts` é somente um reexport de `componenting-demo-lab.ts`; ele não cria outro gateway nem outra montagem.
- `src/componenting-demo-lab.ts` contém o `programGenerator()`, os elementos stateful e a lógica de interação e montagem da demo. `src/components.ts` contém os componentes de página e suas partes, specs e dados iniciais, além dos componentes da plataforma.
- `src/program.ts` concentra estado de sessão, regras de domínio, configurações e implementação dos gateways dentro de `program()`. A função instancia o gateway selecionado quando o generator a inicia.

## Mapa funcional inicial

| Área | Rotas ou ponto de entrada | Escopo demonstrado |
|---|---|---|
| Entrada | `/`, `/acesso` | apresentação pública e seleção de perfil demonstrativo |
| Professor | `/professor/inicio`, `/professor/materias`, `/professor/monitor` | início, matérias, contratos e revisão de atividades |
| Sondagem | `/professor/sondagem`, `/aluno/sondagem` | contexto idade/série, plano de sondagem e perguntas de referência |
| Aprendizagem | `/aluno/atividade`, `/professor/evidencias`, `/cursos` | atividade, respostas, evidências e conteúdo |
| Comunidade | `/social`, `/social/eventos/:id`, `/perfil` | fórum, calendário, eventos e perfil |
| Administração | `/admin` | superfície administrativa inicial |

As rotas descrevem o protótipo e não equivalem à implementação de um produto conectado a serviços reais.

## Sondagem e idade/série

A interface apresenta idade, série e diferença etária como contexto para planejar a sondagem. O material consultado não define uma fórmula validada para o coeficiente idade/série. Por isso, o código não inventa um coeficiente, não classifica domínio automaticamente e não recomenda mudança de série a partir da idade. A regra matemática e os critérios pedagógicos ficam pendentes de política institucional versionada e revisão docente.

## Execução e validação

Requisitos: Node.js 20 ou superior. Na pasta do projeto `~/Lumira_Frontend_Cognoscere/`:

```sh
npm ci
npm run dev -- --host 127.0.0.1 --port 42225
```

Abra `http://127.0.0.1:42225/` para a página demo de partes. Use `http://127.0.0.1:42225/?presentation=application` para a aplicação completa.

Validação registrada neste ambiente: `npm run build` concluiu com sucesso; a verificação TypeScript estrita passou; os 12 testes passaram; Vite gerou `dist/`. Os dados do gateway padrão são fictícios e vivem em memória. Não há autenticação real, banco de dados ou inferência de IA conectada.

## Telas e materiais preservados

`docs/telas/` contém as três telas de referência que já acompanhavam o pacote frontend: mapa do site, perfil personalizável e comunidade/calendário. São referências visuais iniciais, não capturas da execução atual. Os PDFs originais e de projeto foram copiados para `docs/referencias/iniciais/`; a estrutura visual e os requisitos também estão em `docs/original-ux/`.

Mesmo com o Vite ativo em `localhost:42225`, o Codex Browser deste ambiente não conseguiu abrir o processo: a aba e o servidor têm interfaces loopback isoladas. Por isso, as imagens preservadas são identificadas como referências de entrada, sem serem apresentadas como capturas de runtime.

## Estrutura da documentação

```text
docs/
  DESENVOLVIMENTO.md
  ESTRUTURA_TELAS_COMPONENTES_PROGRAM.md
  DOCUMENTACAO_TECNICA.pdf
  ARQUITETURA.md
  ENDPOINTS.md
  POLITICA_NIVELAMENTO.md
  APRESENTACAO_TECNICA.md
  telas/
  referencias/iniciais/
  original-ux/
```

## Próximas decisões técnicas

1. Definir com a instituição a política idade/série, data-base, finalidade e validação do coeficiente.
2. Implementar e versionar os endpoints Workers, persistência, autenticação e controle de acesso.
3. Validar acessibilidade, estados responsivos e critérios de aceite com usuários docentes e estudantes.
4. Fazer capturas de runtime após disponibilizar um navegador que compartilhe o servidor local ou uma rota de prévia autorizada.
