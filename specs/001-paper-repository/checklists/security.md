# Checklist: Security Requirements Quality

**Purpose**: Validar que los requisitos de seguridad y protección de datos estén completos y sean medibles para `001-paper-repository`.
**Created**: 2026-01-20

## Requirement Completeness
- [ ] CHK001 - ¿Están definidas las expectativas de autenticación y autorización para operaciones que mutan datos (añadir, borrar)? [Completeness, Gap, Assumption]
- [ ] CHK002 - ¿Se especifican requisitos de validación y sanitización de entradas (DOI, URL, texto libre) para prevenir inyección y data corruption? [Completeness, Tasks T060]

## Requirement Clarity
- [ ] CHK003 - ¿Están definidos requisitos de protección de datos para información sensible (si se almacena algún dato sensible) y políticas de retención? [Clarity, Gap]
- [ ] CHK004 - ¿Está clara la política frente a abuso/rate limiting de APIs externas y abuso desde clientes (DoS protection)? [Clarity, Plan §Technical Context, Tasks T032]

## Requirement Consistency
- [ ] CHK005 - ¿Son consistentes los requisitos de validación entre frontend y backend (formatos, límites de tamaño, sanitización)? [Consistency, Tasks T040/T060]

## Acceptance Criteria Quality
- [ ] CHK006 - ¿Hay criterios claros y medibles para validar que sanitización y validación cumplen (ej. lista de reglas de validación y ejemplos válidos/ inválidos)? [Measurability, Gap]
- [ ] CHK007 - ¿Está definida la reacción esperada ante incidentes de seguridad (breach response, notificación) y sus SLAs? [Measurability, Gap]

## Scenario Coverage
- [ ] CHK008 - ¿Están definidos requisitos para manejar entradas malformadas, ataques de inyección, y respuestas tóxicas de APIs externas? [Coverage, Gap, Spec §Edge Cases]

## Non-Functional Requirements
- [ ] CHK009 - ¿Está definida la política de backups y su protección (acceso, cifrado si aplica)? [NFR, Ambiguity, Tasks T011/T012]
- [ ] CHK010 - ¿Se describen requisitos de logging seguro (no incluir datos sensibles en logs) y retención? [NFR, Gap]

## Dependencies & Assumptions
- [ ] CHK011 - ¿Está documentada la asunción de "single-user" y su efecto en requisitos de seguridad (por ejemplo, ausencia de multi-tenancy controls)? [Assumption, Plan §Constitution Check]

---

**Notes**: Esta checklist no pregunta si el código implementa controles, sino si los requisitos piden esos controles y los definen de forma verificable.