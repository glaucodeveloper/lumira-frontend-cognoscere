# Sondagem e política idade/série — desenho inicial

O repositório `glaucodeveloper/Lumira` contém as expressões "coeficiente idade/série" e "cinco perguntas por competência". **Não contém fórmula de coeficiente**, tampouco prova de validade para classificar domínio com base na idade. A proposta do frontend não inventa essa fórmula.

A política de produto representa idade, série e competência em `AgeGradeContext`. A tela de demonstração atual recebe idade em anos e série no cadastro inicial. Esse contexto só deve orientar a adequação das situações conforme políticas curriculares aprovadas; não deve inferir automaticamente níveis de competência.

`referencePolicy.initialContextsPerCompetence = 5` corresponde ao parâmetro histórico da matrícula, passível de edição. Um contexto pode mobilizar múltiplas habilidades; o professor escolhe o alcance observável de cada critério. Uma questão não determina o nível de uma competência nem permite encaminhamento automático para série posterior.

A demonstração da matrícula usa uma única competência de Ciências da Natureza, com cinco questões e uma barra que soma 20 pontos por alternativa esperada. Essa pontuação serve só para mostrar estado dinâmico do questionário; não é coeficiente idade/série, nota, classificação de domínio ou decisão de matrícula. Idade e série rotulam a combinação contextual e não alteram automaticamente dificuldade ou gabarito.

A extensão antiga "duas perguntas de ajuste na série seguinte após dominante" fica registrada para estudo, mas não executada no esqueleto.

## Política institucional futura

Definir junto à instituição antes da implementação real:

- Qual referência de idade e série usar e qual data-base aplicar (considerando regras de matrícula e região).
- Qual significado matemático e pedagógico do coeficiente; se necessário, fornecer função `policy.coefficient` versionada, auditável e validada.
- Como escolher níveis de complexidade das situações sem estereotipar a idade nem reduzir compreensão a acerto.
- Como determinar cobertura e diversidade de evidências e critérios para revisão docente.
- Política de consentimento e privacidade para registros de menores.
