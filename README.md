# JC LAN HOUSE - Vendas e PDV Moderno

Uma aplicação web completa com um sistema de Ponto de Venda (PDV) moderno para controle de caixa e vendas, um portfólio de produtos para clientes, e painéis dedicados para clientes e administradores.

## Tecnologias Utilizadas

- **Frontend**: React com TypeScript
- **Estilização**: Tailwind CSS
- **Backend & Banco de Dados**: Supabase
- **Roteamento**: React Router
- **Módulos**: ES Modules com `importmap`

## Configuração do Projeto

### 1. Conexão com o Supabase

As credenciais de conexão com o Supabase (URL e `anon_key`) estão definidas no arquivo `lib/supabaseClient.ts`. Em um ambiente de produção, é recomendável movê-las para variáveis de ambiente.

### 2. Estrutura do Banco de Dados

A aplicação espera que certas tabelas existam no seu projeto Supabase. É crucial que as tabelas (como `profiles`, `customers`, `portfolio_products`, etc.) e as políticas de segurança de nível de linha (RLS) sejam configuradas corretamente no painel do Supabase antes de executar a aplicação. A ausência de tabelas ou políticas incorretas causará erros.

## Estrutura do Código

- **`index.html`**: Ponto de entrada da aplicação, carrega o `importmap` e o script principal.
- **`index.tsx`**: Monta a aplicação React no elemento `#root`.
- **`App.tsx`**: Componente principal que configura os provedores de contexto e o roteamento.
- **`components/`**: Contém componentes React reutilizáveis (ícones, cards, layout, etc.).
- **`context/`**: Onde fica toda a gestão de estado global usando a Context API do React (Autenticação, Carrinho, Produtos, etc.).
- **`lib/`**: Contém o cliente Supabase e outras utilidades.
- **`pages/`**: Componentes que representam as páginas da aplicação.
- **`types.ts`**: Definições de tipos TypeScript usadas em todo o projeto.