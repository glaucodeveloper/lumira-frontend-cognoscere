# Sondagem e política idade/série — desenho inicial

O repositório `glaucodeveloper/Lumira` contém as expressões "coeficiente idade/série" e "cinco perguntas por competência". **Não contém fórmula de coeficiente**, tampouco prova de validade para classificar domínio com base na idade. A proposta do frontend não inventa essa fórmula.

A UI coleta idade (via nascimento), série e competência pretendida, formando `AgeGradeContext`. O contexto alimentará o Worker e a definição de complexidade das situações somente conforme políticas curriculares aprovadas. Sua função é a **adequação da proposta à etapa**, não a inferência automática de níveis de competência.

`referencePolicy.initialContextsPerCompetence = 5` corresponde ao parâmetro histórico da matrícula, passível de edição. Um contexto pode mobilizar múltiplas habilidades; o professor escolhe o alcance observável de cada critério. Uma questão não determina o nível de uma competência nem permite encaminhamento automático para série posterior.

A extensão antiga "duas perguntas de ajuste na série seguinte após dominante" fica registrada para estudo, mas não executada no esqueleto.

## Política institucional futura

Definir junto à instituição antes da implementação real:

- Qual referência de idade e série usar e qual data-base aplicar (considerando regras de matrícula e região).
- Qual significado matemático e pedagógico do coeficiente; se necessário, fornecer função `policy.coefficient` versionada, auditável e validada.
- Como escolher níveis de complexidade das situações sem estereotipar a idade nem reduzir compreensão a acerto.
- Como determinar cobertura e diversidade de evidências e critérios para revisão docente.
- Política de consentimento e privacidade para registros de menores.
