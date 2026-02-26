# Sprint H — persistência forense em runs `failed`

## Problema observado
Em produção, parte das execuções com status `failed` (especialmente `AUDIT_GATE_FAILED` e falhas em caminhos de erro) não persistia `meta.releaseForensicReport` em `pipeline_executions.output_data`.

## Correção aplicada
- Bump de versão do pipeline para `v7-vv-1.1.5-forensic-persist`.
- Padronização de persistência de metadados forenses em **3 caminhos de falha**:
  1. `AUDIT_GATE_FAILED` (HTTP != 200)
  2. `AUDIT_GATE_FAILED` por indisponibilidade do audit service (`unreachable`)
  3. `catch` global do pipeline
- Em todos os casos acima, `output_data.meta` passa a incluir:
  - `auditGate`
  - `releaseForensicReport`
  - metadados de contrato e erro canônico

## Validação pós-deploy
Use `docs/audits/sprint-h-forensic-persist-validation.sql`.
Objetivo: confirmar que runs `failed` novas não ficam sem `releaseForensicReport`.
