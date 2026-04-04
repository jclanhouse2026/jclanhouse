
-- Este script insere os serviços padrão na página de Serviços se a tabela estiver vazia.
-- Copie e cole este código no SQL Editor do seu projeto Supabase e execute.

DO $$
BEGIN
   IF NOT EXISTS (SELECT 1 FROM public.service_settings) THEN
      INSERT INTO public.service_settings (icon, title, description, link) VALUES
      ('BookIcon', 'Caderneta de Saúde', 'Cadernetas personalizadas com capa dura e laminação protetora.', '/caderneta'),
      ('GraduationCapIcon', 'Adesivos Escolares', 'Kits completos de adesivos à prova d''água para material escolar.', '/temas-escolares'),
      ('SparklesIcon', 'Adesivos Premium', 'Adesivos personalizados com recorte especial para festas e produtos.', '/adesivos-personalizados'),
      ('WalletIcon', 'Cartões de Visita', 'Cartões profissionais com acabamento de alta qualidade para sua marca.', '/cartoes-de-visita'),
      ('ReceiptIcon', 'Panfletos e Flyers', 'Divulgue seu negócio com panfletos de cores vivas e design impactante.', '/panfletos'),
      ('PrinterIcon', 'Impressão Smart', 'Impressões rápidas com cálculo de custo inteligente e várias opções de papel.', '/impressao'),
      ('DocumentTextIcon', 'Construtor de Currículo', 'Crie um currículo profissional em minutos com nossos modelos.', '/curriculo');
   END IF;
END $$;
