# LifeSync AI - Documentação do Projeto

Este projeto é uma aplicação de gerenciamento pessoal (Finanças e Agenda) integrada com Inteligência Artificial (Gemini 2.5 Flash).

## 📂 Estrutura de Pastas e Módulos

A aplicação segue uma arquitetura modular baseada em funcionalidades, facilitando a manutenção e escalabilidade.

```
/
├── components/          # Componentes visuais da interface
│   ├── agenda/          # MÓDULO AGENDA: Componentes específicos da agenda
│   │   ├── AgendaCalendar.tsx  # Visualização Mensal
│   │   ├── AgendaFilters.tsx   # Filtros de visualização e dados
│   │   ├── AgendaList.tsx      # Visualização em Lista
│   │   ├── AgendaWeek.tsx      # Visualização Semanal
│   │   └── EventForm.tsx       # Formulário de criação
│   ├── finance/         # MÓDULO FINANÇAS: Componentes específicos
│   │   ├── BudgetManager.tsx   # Gestão de Orçamentos/Metas
│   │   ├── FinanceCalendar.tsx # Calendário financeiro
│   │   ├── FinanceCharts.tsx   # Gráficos (Recharts)
│   │   ├── TransactionForm.tsx # Formulário de transação
│   │   └── TransactionList.tsx # Lista de transações
│   ├── AIChat.tsx       # Componente do Chatbot Flutuante
│   ├── Layout.tsx       # Estrutura principal (Sidebar + Content)
│   ├── Agenda.tsx       # Container principal da Agenda
│   ├── Finance.tsx      # Container principal de Finanças
│   └── Dashboard.tsx    # Tela inicial com visão geral
├── hooks/
│   └── useAppData.ts    # Lógica de Estado e Persistência (Custom Hook)
├── services/
│   └── geminiService.ts # Integração com Google Gemini API
├── types.ts             # Definições de Tipos TypeScript globais
└── App.tsx              # Ponto de entrada da aplicação
```

## 🧠 Módulos Principais

### 1. Núcleo (Core)
*   **App.tsx**: Orquestrador principal.
*   **Layout.tsx**: Gerencia a responsividade (Sidebar Desktop vs Menu Mobile).
*   **useAppData.ts**: Centraliza o estado da aplicação (Transações, Eventos, Categorias) e sincroniza com o `localStorage`.

### 2. Módulo de Finanças (`components/finance`)
Responsável por todo o rastreamento financeiro.
*   **Recursos**:
    *   Listagem e filtragem de transações.
    *   Gráficos de despesas por categoria e fluxo mensal.
    *   Definição de metas orçamentárias (Budget) com barras de progresso.
    *   Exportação de dados para CSV.

### 3. Módulo de Agenda (`components/agenda`)
Responsável pelo gerenciamento de tempo.
*   **Recursos**:
    *   **Tipos de Evento**: Distinção entre 'Rotina' (ex: Academia) e 'Eventos Únicos' (ex: Consulta).
    *   **Categorias**: Configuráveis (Trabalho, Pessoal, etc).
    *   **Visualizações**:
        *   *Lista*: Agrupada por dia.
        *   *Semana*: Grade horária de 7 dias.
        *   *Mês*: Calendário completo.
    *   **Filtros**: Permite cruzar dados por Tipo e Categoria.

### 4. Inteligência Artificial (`services/geminiService.ts`)
Integração com a API do Google Gemini.
*   Capacidade de adicionar transações e eventos via linguagem natural.
*   Gera resumos diários baseados na agenda do usuário.
*   Usa *Function Calling* para estruturar os dados extraídos do chat.

## 🛠 Tecnologias Utilizadas
*   **React 19**: Biblioteca de UI.
*   **Tailwind CSS**: Estilização.
*   **Recharts**: Visualização de dados.
*   **Lucide React**: Ícones.
*   **Google GenAI SDK**: Inteligência Artificial.

## 🚀 Como Executar
O projeto utiliza um arquivo `index.html` com import maps (ESM), não necessitando de bundlers complexos como Webpack para execução simples em ambiente de desenvolvimento moderno, embora um servidor local seja recomendado.
