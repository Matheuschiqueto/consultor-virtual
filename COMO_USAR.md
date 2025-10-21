# 🚀 Como Usar o Sistema

## ✅ Sistema Funcionando!

O servidor backend está rodando e o sistema está 100% funcional!

## 📍 Acesso

Abra seu navegador e acesse:
```
http://localhost:3000
```

## 🎯 Funcionalidades Disponíveis

### 1️⃣ Cadastrar Produtos

1. Clique em **"Cadastro Produtos"** no menu lateral
2. Preencha os campos:
   - **Nome**: Nome do produto (obrigatório)
   - **Descrição**: Descrição detalhada (opcional)
   - **Imagem**: Clique em "Adicionar ficheiros" para fazer upload (opcional)
3. Clique em **"Cadastrar"**
4. ✅ O produto será salvo automaticamente no arquivo `data/produtos.txt`
5. Veja o produto aparecer na seção "Adicionados recentemente"

### 2️⃣ Visualizar Produtos Cadastrados

1. Clique em **"Produtos Cadastrados"** no menu lateral
2. Veja todos os produtos cadastrados
3. Cada produto mostra:
   - Imagem (se foi cadastrada)
   - Nome
   - Descrição
   - Botões de **Editar** e **Excluir**

### 3️⃣ Excluir Produtos

1. Na tela "Produtos Cadastrados"
2. Clique no botão **"Excluir"** do produto desejado
3. Confirme a exclusão
4. ✅ O produto será removido do arquivo TXT

### 4️⃣ Gerar Relatório

1. Na tela "Produtos Cadastrados"
2. Clique no botão **"Relatório produtos (.txt)"** (botão verde)
3. Um arquivo TXT será baixado automaticamente com todos os produtos

### 5️⃣ Chat (Consultor Virtual)

1. Clique em **"Chat"** no menu lateral
2. Visualize a interface do chatbot
3. (Em desenvolvimento: sistema de recomendação)

## 💾 Onde os Dados são Salvos?

### Produtos
- **Arquivo**: `data/produtos.txt`
- **Formato**: `ID|NOME|DESCRIÇÃO|CAMINHO_IMAGEM|DATA`

Exemplo:
```
1|Moedor Doméstico X|Ideal para uso caseiro|/uploads/123456.jpg|2024-10-21T10:30:00.000Z
2|Moedor Profissional Y|Para restaurantes|/uploads/789012.jpg|2024-10-21T11:45:00.000Z
```

### Imagens
- **Pasta**: `uploads/`
- Cada imagem recebe um nome único com timestamp

## 🔍 Testando o Sistema

### Teste 1: Cadastrar Produto Simples
1. Vá em "Cadastro Produtos"
2. Nome: "Moedor Teste"
3. Descrição: "Produto de teste"
4. Clique em "Cadastrar"
5. ✅ Deve aparecer mensagem de sucesso

### Teste 2: Cadastrar com Imagem
1. Vá em "Cadastro Produtos"
2. Preencha nome e descrição
3. Clique em "Adicionar ficheiros" e selecione uma imagem
4. Clique em "Cadastrar"
5. ✅ Imagem aparecerá nos produtos recentes

### Teste 3: Listar Produtos
1. Vá em "Produtos Cadastrados"
2. ✅ Deve mostrar todos os produtos cadastrados
3. ✅ Contador deve mostrar quantidade correta

### Teste 4: Excluir Produto
1. Em "Produtos Cadastrados"
2. Clique em "Excluir" em algum produto
3. Confirme
4. ✅ Produto desaparece da lista

### Teste 5: Gerar Relatório
1. Em "Produtos Cadastrados"
2. Clique em "Relatório produtos (.txt)"
3. ✅ Arquivo TXT deve ser baixado

## 🐛 Solucionando Problemas

### "Erro ao conectar com o servidor"
**Solução**: O servidor Node.js não está rodando
```bash
cd /home/matheus/Documentos/chatbot
node server.js
```

### Produtos não aparecem
**Solução**: Verifique se o arquivo existe
```bash
cat data/produtos.txt
```

### Erro ao fazer upload
**Solução**: Verifique permissões
```bash
chmod 755 uploads/
```

## 📊 Estrutura dos Dados

### API Response - Lista de Produtos
```json
{
  "success": true,
  "total": 2,
  "produtos": [
    {
      "id": 1,
      "nome": "Moedor X",
      "descricao": "Descrição...",
      "imagem": "/uploads/123456.jpg",
      "dataCadastro": "2024-10-21T10:30:00.000Z"
    }
  ]
}
```

## 🎨 Notificações do Sistema

O sistema mostra notificações coloridas:
- 🟢 **Verde**: Sucesso (produto cadastrado, excluído, etc.)
- 🔴 **Vermelho**: Erro (falha ao salvar, conectar, etc.)
- 🔵 **Azul**: Informação (funções em desenvolvimento)

## ⚡ Dicas de Uso

1. **Sempre preencha o nome** do produto (é obrigatório)
2. **Descrições detalhadas** ajudam a identificar produtos
3. **Use imagens** para melhor visualização
4. **Gere relatórios** regularmente para backup
5. **Teste a API** diretamente em `http://localhost:3000/api/produtos`

## 🔄 Próximos Passos

- [ ] Implementar edição de produtos
- [ ] Sistema de perguntas do chatbot
- [ ] Algoritmo de recomendação
- [ ] Múltiplas imagens por produto
- [ ] Categorias de produtos
- [ ] Busca e filtros

---

**Sistema desenvolvido e funcionando! 🎉**

Para qualquer dúvida, verifique o arquivo `README.md` ou os logs do servidor.

