<<<<<<< HEAD
# Sistema de Chatbot - Consultor Virtual

Sistema web para gestão de produtos com consultor virtual (chatbot) para recomendação de produtos.

## 🚀 Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (Vanilla)
- **Backend**: Node.js + Express
- **Banco de Dados**: Arquivo TXT (Sistema de arquivos)
- **Upload**: Multer

## 📋 Pré-requisitos

- Node.js (versão 14 ou superior)
- npm ou yarn

## 🔧 Instalação

1. Clone o repositório ou baixe os arquivos

2. Instale as dependências:
```bash
npm install
```

## ▶️ Como Executar

1. Inicie o servidor backend:
```bash
npm start
```

Ou em modo desenvolvimento (com auto-reload):
```bash
npm run dev
```

2. Abra o navegador e acesse:
```
http://localhost:3000
```

## 📁 Estrutura do Projeto

```
chatbot/
├── assets/
│   ├── css/
│   │   ├── main.css
│   │   ├── cadastro-produtos.css
│   │   ├── produtos-cadastrados.css
│   │   └── chat.css
│   └── js/
│       ├── main.js
│       └── produtos.js
├── pages/
│   ├── cadastro-produtos.html
│   ├── produtos-cadastrados.html
│   └── chat.html
├── data/
│   └── produtos.txt (gerado automaticamente)
├── uploads/ (gerado automaticamente)
├── server.js
├── package.json
└── index.html
```

## 🎯 Funcionalidades

### ✅ Implementadas
- [x] Cadastro de produtos com nome, descrição e imagem
- [x] Upload de imagens
- [x] Listagem de produtos
- [x] Exclusão de produtos
- [x] Produtos recentes (últimos 3)
- [x] Geração de relatório em TXT
- [x] Sistema de arquivos TXT para armazenamento
- [x] Interface responsiva

### 🚧 Em Desenvolvimento
- [ ] Edição de produtos
- [ ] Sistema de perguntas do chatbot
- [ ] Algoritmo de recomendação
- [ ] Gerenciamento de perguntas

## 📡 API Endpoints

### Produtos

- `GET /api/produtos` - Lista todos os produtos
- `GET /api/produtos/:id` - Busca produto por ID
- `POST /api/produtos` - Cria novo produto
- `PUT /api/produtos/:id` - Atualiza produto
- `DELETE /api/produtos/:id` - Exclui produto

### Formato dos Dados (produtos.txt)

```
ID|NOME|DESCRIÇÃO|IMAGEM|DATA_CADASTRO
1|Moedor Doméstico|Ideal para uso caseiro|/uploads/123456.jpg|2024-10-21T10:30:00.000Z
2|Moedor Profissional|Para restaurantes|/uploads/789012.jpg|2024-10-21T11:45:00.000Z
```

## 🎨 Páginas

1. **Cadastro de Produtos**: Formulário para adicionar novos produtos
2. **Produtos Cadastrados**: Lista todos os produtos com opções de editar/excluir
3. **Chat (Consultor Virtual)**: Interface conversacional para recomendação

## 🔒 Observações

- Os dados são salvos em arquivo TXT (`data/produtos.txt`)
- As imagens são armazenadas na pasta `uploads/`
- O sistema cria automaticamente as pastas necessárias
- Não há autenticação (adicionar em versões futuras)

## 🐛 Troubleshooting

**Erro: "Erro ao conectar com o servidor"**
- Certifique-se de que o servidor Node.js está rodando (`npm start`)
- Verifique se a porta 3000 está disponível

**Erro ao fazer upload de imagem**
- Verifique as permissões da pasta `uploads/`
- Certifique-se de que o servidor tem permissão de escrita

## 📝 Licença

Este projeto é de uso educacional.

=======
# consultor-virtual
Chatbot bot especilista, em indicar o melhor produto para o cliente de acordo com suas necessidades.
>>>>>>> c94524b27abebaaa4e13e488ee9964bdad12077f
