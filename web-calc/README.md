
## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:

- **Node.js** (versão 16.0 ou superior)
  - Você pode baixar em: [https://nodejs.org/](https://nodejs.org/)
  - Para verificar se está instalado: `node --version`
- **npm** (geralmente vem junto com o Node.js)
  - Para verificar: `npm --version`

## 🚀 Instalação

### 1. Clone o repositório
```bash
git clone [URL_DO_REPOSITORIO]
cd calc-project
```

### 2. Navegue para a pasta do projeto web
```bash
cd web-calc
```

### 3. Instale as dependências
```bash
npm install
```

### 4. Execute o projeto
```bash
npm run dev
```

### 5. Acesse a aplicação
Abra seu navegador e acesse: `http://localhost:5173`

## 🎮 Funcionalidades

### Jogos Interativos:
- **Produto Cartesiano**: Explore e colete pares ordenados no plano cartesiano
- **Descubra a Função**: Deduza funções matemáticas a partir de seus gráficos
- **Decomposição Vetorial**: Aprenda sobre vetores e suas componentes
- **Teoria dos Conjuntos**: Explore operações entre conjuntos usando diagramas de Venn

### Recursos Adicionais:
- **Calculadora Científica**: Ferramenta completa para cálculos matemáticos
- **Materiais de Estudo**: Conteúdo teórico sobre os temas abordados
- **Modo Escuro/Claro**: Interface adaptável para melhor experiência

## 🛠️ Tecnologias Utilizadas

- **React 18** - Biblioteca para interfaces de usuário
- **Vite** - Ferramenta de build e desenvolvimento
- **Tailwind CSS** - Framework de estilos
- **React DnD** - Sistema de drag and drop
- **Plotly.js** - Gráficos interativos
- **Lucide React** - Ícones modernos

## 📝 Scripts Disponíveis

```bash
# Executar em modo desenvolvimento
npm run dev

# Fazer build para produção
npm run build

# Visualizar build de produção
npm run preview

# Executar linter
npm run lint
```

## Objetivo Educacional

Este projeto visa facilitar o aprendizado de conceitos matemáticos através de:
- **Interatividade**: Jogos e simulações que tornam o aprendizado envolvente
- **Visualização**: Gráficos e diagramas que ajudam na compreensão
- **Prática**: Exercícios hands-on para fixação do conteúdo
- **Feedback**: Sistema de pontuação e explicações detalhadas


## Estrutura do Projeto

```
web-calc/
├── src/
│   ├── components/
│   │   ├── games/          # Jogos interativos
│   │   └── ui/             # Componentes de interface
│   ├── App.jsx             # Componente principal
│   └── main.jsx           # Ponto de entrada
├── public/                # Arquivos estáticos
└── package.json          # Dependências e scripts
```

## Contribuição

Este projeto foi desenvolvido para fins educacionais como parte do curso de Estruturas Matemáticas. Sugestões e melhorias são sempre bem-vindas!

## Licença

Este projeto é de uso educacional e foi desenvolvido para o trabalho de Estruturas Matemáticas.

