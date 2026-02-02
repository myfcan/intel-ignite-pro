-- Migration: Remover tabela legada v7_debug_reports
-- Seguro: O novo V7 Diagnostic Engine não usa esta tabela

DROP TABLE IF EXISTS v7_debug_reports;