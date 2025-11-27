# RATONAUT 🐹🚀

**RATONAUT** (anteriormente StepFlow) é um sistema de telemetria avançada e monitoramento de saúde focado em pequenos roedores (hamsters, gerbils, ratos). O aplicativo simula e monitora métricas de corrida em roda, estabilidade biomecânica e oferece um assistente virtual inteligente para cuidados com o pet.

![Status do Projeto](https://img.shields.io/badge/Status-Desenvolvimento-green)
![Tech](https://img.shields.io/badge/Tech-React_%7C_TypeScript_%7C_Gemini_AI-blue)

---

## 📱 Funcionalidades

### 1. 🏎️ HUD de Telemetria (Flow)
Monitoramento em tempo real da atividade na roda de exercício:
- **Velocidade da Roda**: Medida em m/s.
- **Cadência (PPS)**: "Paws Per Second" (Patas por segundo).
- **Aceleração**: Força G exercida.
- **Feedback Sensorial**: Alertas sonoros (chirps) e hápticos (vibração) baseados em metas de performance.
- **Gráficos**: Visualização de velocidade em tempo real com `Recharts`.

### 2. ⚖️ Monitor de Estabilidade
Sistema de análise biomecânica simulada:
- **Bubble Level Digital**: Visualização do centro de massa do roedor.
- **Detector de Vibração**: Alerta visual ("UNSTABLE") quando a vibração do eixo Z ultrapassa 2.2g.
- **Simetria**: Cálculo percentual de simetria de passada.
- **Análise via IA**: O Google Gemini analisa os dados brutos dos sensores para gerar relatórios de marcha e saúde.

### 3. 🧠 AI Coach (Treinador Virtual)
Chatbot integrado com especialistas virtuais em roedores:
- **Modos de IA**: 
    - *Fast Tips* (Gemini Flash Lite)
    - *Deep Analysis* (Gemini Pro Thinking Mode)
    - *Vet Search* (Google Search Grounding)
    - *Pet Stores* (Google Maps Integration)
- **TTS (Text-to-Speech)**: O assistente pode "falar" as respostas.

### 4. 🔬 Laboratório (Lab)
Ferramentas de análise multimídia:
- **Squeak Log**: Upload e transcrição de áudios do habitat.
- **Gait Check**: Upload de vídeos para análise de comportamento e movimento via visão computacional do Gemini.

### 5. 📝 Perfil do Roedor
Gerenciamento de dados do "piloto":
- Definição de Espécie, Peso (g) e Idade (meses).
- Definição de metas de velocidade e cadência.
- Configuração de preferências de feedback.

---

## 🛠️ Tecnologias Utilizadas

O projeto foi construído utilizando uma stack moderna de Frontend e Inteligência Artificial:

*   **Core**: [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
*   **Estilização**: [Tailwind CSS](https://tailwindcss.com/) (via CDN para leveza)
*   **IA & ML**: [Google GenAI SDK](https://www.npmjs.com/package/@google/genai) (Gemini 2.5 Flash, Gemini 3 Pro)
*   **Visualização de Dados**: [Recharts](https://recharts.org/)
*   **Ícones**: [Lucide React](https://lucide.dev/)
*   **Fontes**: Inter (Google Fonts)

---

## 🚀 Como Executar Localmente

Para rodar este projeto em sua máquina local, você precisará ter o [Node.js](https://nodejs.org/) instalado.

### Pré-requisitos

1.  Uma chave de API do Google Gemini (obtenha em [Google AI Studio](https://aistudio.google.com/)).

### Passo a Passo

1.  **Clone o repositório** (ou baixe os arquivos):
    ```bash
    git clone https://github.com/seu-usuario/ratonaut.git
    cd ratonaut
    ```

2.  **Instale as dependências**:
    *Nota: Este projeto foi estruturado para rodar em ambientes sandbox sem bundler complexo, mas para rodar localmente recomenda-se usar Vite.*
    
    Crie um `package.json` básico se não houver:
    ```bash
    npm create vite@latest . -- --template react-ts
    npm install
    npm install @google/genai lucide-react recharts
    ```

3.  **Configuração de Ambiente**:
    Crie um arquivo `.env` na raiz do projeto e adicione sua chave de API:
    ```env
    VITE_API_KEY=sua_chave_aqui_sem_aspas
    ```
    *Nota: No código fornecido, a chave é esperada em `process.env.API_KEY`. Se usar Vite, altere para `import.meta.env.VITE_API_KEY` ou configure o `define` no `vite.config.ts`.*

4.  **Execute o projeto**:
    ```bash
    npm run dev
    ```

5.  **Acesse**:
    Abra seu navegador em `http://localhost:5173` (ou a porta indicada).

---

## 📂 Estrutura de Arquivos

```
/
├── components/
│   ├── AICoach.tsx       # Interface de Chat com Gemini
│   ├── Analysis.tsx      # Upload e análise de mídia
│   ├── Dashboard.tsx     # HUD principal e simulação física
│   ├── Navigation.tsx    # Barra de navegação inferior
│   ├── Profile.tsx       # Configurações do usuário/roedor
│   └── Stability.tsx     # Monitor de estabilidade e vibração
├── services/
│   └── geminiService.ts  # Camada de abstração da API do Google GenAI
├── App.tsx               # Roteamento e Layout principal
├── index.tsx             # Ponto de entrada
├── types.ts              # Definições de Tipos TypeScript
└── metadata.json         # Metadados da aplicação
```

---

## ⚠️ Notas Importantes

*   **Simulação**: Como smartphones não cabem dentro de rodas de hamster, o modo "HUD" utiliza uma simulação matemática baseada em física para gerar dados realistas de teste para fins de demonstração da interface.
*   **Permissões**: O app solicitará permissão de microfone e geolocalização para as funcionalidades de mapas e análise de áudio.

---

Desenvolvido com 🐹 por RATONAUT Team.
