# Cambios del producto

Este archivo registra cambios funcionales o hitos de implementación, no el contexto completo de decisiones. Para ello consulte [project-log.md](project-log.md).

## Added

- Catálogo público básico: portada, productos destacados, catálogo por categorías, detalle por presentación y carrito informativo. Implementado localmente; pendiente validación manual.
- Despliegue continuo del frontend en GitHub Pages desde `main`, con compatibilidad para la subruta del repositorio, enlaces directos y retornos de Supabase Auth.

## Changed

- El flujo compartido usa Supabase remoto para datos, autenticación, Storage, migraciones y pruebas pgTAP; Docker local deja de ser un requisito del trabajo diario.

## Fixed

- Sin entradas.

## Removed

- Sin entradas.
