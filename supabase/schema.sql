-- ============================================================
-- PLAYBOOK DWV — Schema Completo + Seed Data
-- Executar no Supabase SQL Editor (F5)
-- ============================================================

-- ==================== TABELAS ====================

CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('master', 'user')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL CHECK (category IN ('estudo', 'venda')),
  type TEXT NOT NULL CHECK (type IN ('pdf', 'video', 'link')),
  created_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS material_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_id UUID NOT NULL REFERENCES materials(id) ON DELETE CASCADE,
  label TEXT NOT NULL DEFAULT 'Link principal',
  url TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==================== ÍNDICES ====================

CREATE INDEX IF NOT EXISTS idx_materials_category ON materials(category);
CREATE INDEX IF NOT EXISTS idx_materials_type ON materials(type);
CREATE INDEX IF NOT EXISTS idx_materials_created_by ON materials(created_by);
CREATE INDEX IF NOT EXISTS idx_material_links_material ON material_links(material_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- ==================== TRIGGERS ====================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER trg_materials_updated
  BEFORE UPDATE ON materials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ==================== RLS ====================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_links ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "profiles_select" ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_update_own" ON profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "profiles_insert" ON profiles FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master')
    OR id = auth.uid()
  );
CREATE POLICY "profiles_delete_master" ON profiles FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));

-- Materials
CREATE POLICY "materials_select" ON materials FOR SELECT TO authenticated USING (true);
CREATE POLICY "materials_insert_master" ON materials FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));
CREATE POLICY "materials_update_master" ON materials FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));
CREATE POLICY "materials_delete_master" ON materials FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));

-- Material Links
CREATE POLICY "links_select" ON material_links FOR SELECT TO authenticated USING (true);
CREATE POLICY "links_insert_master" ON material_links FOR INSERT TO authenticated
  WITH CHECK (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));
CREATE POLICY "links_update_master" ON material_links FOR UPDATE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));
CREATE POLICY "links_delete_master" ON material_links FOR DELETE TO authenticated
  USING (EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'master'));

-- ==================== AUTO-CREATE PROFILE ====================

CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'user')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ==================== SEED: MATERIAIS ====================

INSERT INTO materials (id, title, description, category, type) VALUES
-- VENDA
('a0000000-0000-0000-0000-000000000001', 'Plano Assessoria Comercial DWV',
 'Documento completo com os planos de assessoria comercial DWV, incluindo valores, escopo de serviços, SLA de atendimento e comparativo entre modalidades. Ideal para apresentação ao incorporador durante reunião de fechamento.',
 'venda', 'pdf'),

('a0000000-0000-0000-0000-000000000002', 'Operadora de Parcerias — Proposta Comercial',
 'Material de proposta da Operadora de Parcerias DWV: inclui ativação, valores mensais, cases de sucesso (Torresani +114.6%, Benx +144.44%, Bach +44.7%) e escopo completo do BPO comercial.',
 'venda', 'pdf'),

('a0000000-0000-0000-0000-000000000003', 'Diagnóstico Comercial — Fórmula de Aceleração',
 'Ferramenta interativa que calcula TE (Taxa de Engajamento), ΔC (Delta por Milhão) e Nc (Corretores Necessários) a partir dos dados do incorporador. Gera automaticamente as 3 rotas estratégicas para atingimento de meta.',
 'venda', 'link'),

('a0000000-0000-0000-0000-000000000006', 'Tese de Investimento Imobiliário — Gerador',
 'Ferramenta que monta automaticamente a apresentação de tese de investimento para corretores: compara retorno imobiliário vs CDI/Selic com dados históricos do Banco Central.',
 'venda', 'link'),

('a0000000-0000-0000-0000-000000000009', 'Dashboard Operadora de Parcerias',
 'Painel de gestão exclusivo para Operadoras de Parcerias DWV. Permite acompanhar performance do portfólio de incorporadoras, monitorar KPIs de engajamento, distribuição de carteiras e funil de propostas.',
 'venda', 'link'),

('a0000000-0000-0000-0000-000000000010', 'Landing Page DWV — Material de Venda',
 'Página institucional da DWV utilizada como material de apoio em reuniões comerciais. Apresenta posicionamento, diferenciais, cases de sucesso e depoimentos.',
 'venda', 'link'),

('a0000000-0000-0000-0000-000000000013', 'Dashboard Gestão de Parcerias — Visão Executivo',
 'Painel executivo com visão consolidada: funil de propostas, ranking de corretores, métricas por carteira, metas e alertas de gap. Usado em reuniões com incorporadoras.',
 'venda', 'link'),

('a0000000-0000-0000-0000-000000000019', 'A Engenharia de Parcerias — Nova Jornada Comercial',
 'Apresentação estratégica de venda DWV com 12 slides: dilema House vs Parcerias, custo da centralização, visão DWV, fluxo Diagnóstico→Meta→Estratégia→Execução, estudo de caso e CTA.',
 'venda', 'pdf'),

('a0000000-0000-0000-0000-000000000020', 'Proposta Comercial — Operadora de Parcerias + Software',
 'Proposta comercial completa de 9 páginas para fechamento: dores do incorporador (queda VGV, equipe sobrecarregada, falta de ROI), dados de mercado, cases de sucesso, 8 entregas DWV, Segredos Imobiliários, pricing (R$5.800 ativação + 12x R$4.297 crédito ou 12x R$4.774 boleto) e passos do processo. Material principal do Closer para envio pós-reunião.',
 'venda', 'pdf'),

-- ESTUDO
('a0000000-0000-0000-0000-000000000004', 'Playbook Comercial DWV',
 'Guia completo da metodologia comercial DWV: funil SDR→Embaixador→Closer, scripts de abordagem, objeções frequentes, framework de qualificação e métricas de performance.',
 'estudo', 'pdf'),

('a0000000-0000-0000-0000-000000000005', 'Treinamento: Matriz de Maturidade do Corretor',
 'Vídeo-aula sobre a segmentação Ouro/Prata/Bronze da base de corretores. Ensina a identificar o estágio de cada corretor e as rotinas de ativação para transição entre níveis.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000007', 'Treinamento: CS e Estratégia de Upsell',
 'Material de estudo sobre a atuação do CS na DWV: como identificar sinais de dados ruins como gatilho de medo, técnica de ancoragem e estratégia de upsell para Operadora.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000008', 'Tabela Zero — Manual de Operação',
 'Documento que explica o conceito e operação da Tabela Zero: acesso pré-lançamento exclusivo para corretores Ouro, regras de visibilidade no mapa do app e impacto estratégico.',
 'estudo', 'pdf'),

('a0000000-0000-0000-0000-000000000011', 'Jornada da Incorporadora DWV',
 'Material interativo de estudo que mapeia toda a jornada do incorporador dentro do ecossistema DWV: desde o primeiro contato até a maturidade operacional com Operadora dedicada.',
 'estudo', 'link'),

('a0000000-0000-0000-0000-000000000012', 'Playbook de Formação — Operadora de Parcerias',
 'Guia completo de formação para novas Operadoras DWV. Cobre metodologia de gestão do canal, operação do CRM, rotinas de ativação Bronze→Prata→Ouro, relatórios de BI e SLA.',
 'estudo', 'link'),

('a0000000-0000-0000-0000-000000000014', '3 Pilares DWV — Treinamento',
 'Vídeo de treinamento que apresenta os 3 pilares fundamentais da metodologia DWV. Conteúdo essencial para alinhamento conceitual de toda a equipe.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000015', 'Treinamento Pipefy — Construtoras e Corretores',
 'Treinamento completo sobre a operação do CRM Pipefy no contexto DWV: Parte 1 visão Construtoras, Parte 2 visão Corretores. Material obrigatório para novos colaboradores e Operadoras.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000016', 'Treinamento BI DWV',
 'Vídeo de capacitação sobre o módulo de Business Intelligence da plataforma DWV. Ensina a interpretar dashboards de performance, indicadores de engajamento e métricas de ativação.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000017', 'Kickoff — Imersão e Treinamento Estratégico DWV',
 'Material completo do Kickoff DWV: PDF de Imersão Estratégica com framework conceitual e vídeo de Treinamento Estratégico com aplicação prática. Referência para onboarding.',
 'estudo', 'video'),

('a0000000-0000-0000-0000-000000000018', 'A Jornada da Incorporação — Do Terreno à Venda',
 'Treinamento completo sobre o ciclo de vida da incorporação imobiliária. Aulas online e presencial + PDFs de apoio cobrindo história da incorporação até comercialização.',
 'estudo', 'video');

-- ==================== SEED: LINKS ====================

INSERT INTO material_links (material_id, label, url, sort_order) VALUES
-- 9: Dashboard Operadora
('a0000000-0000-0000-0000-000000000009', 'Dashboard Operadora de Parcerias',
 'https://dashboard-operadora-de-parcerias.vercel.app/', 0),

-- 10: Landing Page
('a0000000-0000-0000-0000-000000000010', 'Landing Page DWV',
 'https://dwv-landing.vercel.app/', 0),

-- 11: Jornada Incorporadora
('a0000000-0000-0000-0000-000000000011', 'Jornada da Incorporadora',
 'https://jornadaincorporadora.vercel.app/', 0),

-- 12: Playbook Formação
('a0000000-0000-0000-0000-000000000012', 'Playbook Formação Operadora',
 'https://playbookoperadoradeparcerias.vercel.app/', 0),

-- 13: Dashboard Gestão
('a0000000-0000-0000-0000-000000000013', 'Dashboard Gestão de Parcerias',
 'https://dwv-gestao-parcerias.vercel.app/executivo?id=exec5&gestor=true', 0),

-- 14: 3 Pilares (1 link)
('a0000000-0000-0000-0000-000000000014', '3 Pilares DWV',
 'https://drive.google.com/file/d/1SwWEXDY3YOLcW-Fj8mKpymH1_nZC02MY/view?usp=sharing', 0),

-- 15: Pipefy (2 links)
('a0000000-0000-0000-0000-000000000015', 'Parte 1 — Pipefy Construtoras',
 'https://drive.google.com/file/d/12T1zE9aE6QwWBQz_yonawhB1PxKl6Y2q/view?usp=sharing', 0),
('a0000000-0000-0000-0000-000000000015', 'Parte 2 — Pipefy Corretores',
 'https://drive.google.com/file/d/1vB0eFacLPHSqLfdJ83joAY6Fm07pAWdk/view?usp=sharing', 1),

-- 16: BI DWV (1 link)
('a0000000-0000-0000-0000-000000000016', 'Treinamento BI DWV',
 'https://drive.google.com/file/d/18L1s5CKL9lfJODI5XcmXm8KwkdEkoA2m/view?usp=sharing', 0),

-- 17: Kickoff (2 links)
('a0000000-0000-0000-0000-000000000017', 'PDF — Imersão Estratégica DWV',
 'https://drive.google.com/file/d/1YtoTUsP2qPzVozn0I3S6kBqe0BwOBACQ/view?usp=sharing', 0),
('a0000000-0000-0000-0000-000000000017', 'Vídeo — Treinamento Estratégico DWV',
 'https://drive.google.com/file/d/1dIsehtAxlBxREDiBzrFxlNBXW2Rvd5Oy/view?usp=sharing', 1),

-- 18: Jornada Incorporação (4 links)
('a0000000-0000-0000-0000-000000000018', 'Aula Online — A Jornada da Incorporação',
 'https://drive.google.com/file/d/14AeBNOU7brccL6EY4mc1x2SxL-2_74iM/view?usp=sharing', 0),
('a0000000-0000-0000-0000-000000000018', 'PDF — A Jornada da Incorporação: Do Terreno à Venda',
 'https://drive.google.com/file/d/17_pvRkAA5lknfvpixtRzzjpUyvilwYSt/view?usp=sharing', 1),
('a0000000-0000-0000-0000-000000000018', 'PDF — A História da Incorporação',
 'https://drive.google.com/file/d/1ZiR1MvG3waGiGImRIzXlK8fqr74h9ey9/view?usp=sharing', 2),
('a0000000-0000-0000-0000-000000000018', 'Aula Presencial — História + Jornada da Incorporação',
 'https://drive.google.com/file/d/1bPGyvCdOqGnNqJRod0GUEBs98mWY18Y0/view?usp=sharing', 3);

-- ==================== FIM ====================
-- Após executar, crie o usuário master no Supabase Auth:
-- Email: admin@dwv.com.br
-- Metadata: {"name": "Admin DWV", "role": "master"}
