# Sistema de Chatbot - Consultor Virtual

Sistema web para gestão de produtos com chatbot para recomendação personalizada.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript
- **Backend**: Node.js + Express
- **Armazenamento**: Arquivos TXT

## 📋 Instalação

1. Instale as dependências:
```bash
npm install
```

2. Execute o servidor:
```bash
npm start
```

3. Acesse: `http://localhost:3000`

## 🎯 Funcionalidades

### Produtos
- ✅ Cadastro com imagem
- ✅ Listagem e edição
- ✅ Exclusão
- ✅ Relatório em TXT

### Perguntas do Chatbot
- ✅ Cadastro de perguntas
- ✅ Múltipla escolha ou texto livre
- ✅ Ordem personalizada no fluxo
- ✅ Edição e exclusão

### Chat
- ✅ Interface conversacional
- ✅ Recomendação baseada em respostas

## 📁 Estrutura

```
chatbot/
├── assets/          # CSS e JavaScript
├── pages/           # Páginas HTML
├── data/            # Arquivos de dados
├── uploads/         # Imagens dos produtos
└── server.js        # Servidor Node.js
```

## 🔧 Comandos

- `npm start` - Inicia o servidor
- `npm run dev` - Modo desenvolvimento

## 📝 Notas

- Dados salvos em arquivos TXT
- Imagens armazenadas em `uploads/`
- Sistema cria pastas automaticamente