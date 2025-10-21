const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

const app = express();
const PORT = 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('.')); // Servir arquivos estáticos

// Configuração do multer para upload de imagens
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadsDir = path.join(__dirname, 'uploads');
        if (!fs.existsSync(uploadsDir)) {
            fs.mkdirSync(uploadsDir, { recursive: true });
        }
        cb(null, uploadsDir);
    },
    filename: function (req, file, cb) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Arquivo TXT para armazenar produtos
const PRODUTOS_FILE = path.join(__dirname, 'data', 'produtos.txt');
const DATA_DIR = path.join(__dirname, 'data');

// Criar diretório data se não existir
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Criar arquivo produtos.txt se não existir
if (!fs.existsSync(PRODUTOS_FILE)) {
    fs.writeFileSync(PRODUTOS_FILE, '', 'utf8');
}

// Função para ler produtos do arquivo TXT
function lerProdutos() {
    try {
        const data = fs.readFileSync(PRODUTOS_FILE, 'utf8');
        if (!data.trim()) {
            return [];
        }
        
        const linhas = data.trim().split('\n');
        const produtos = linhas.map(linha => {
            const [id, nome, descricao, imagem, dataCadastro] = linha.split('|');
            return {
                id: parseInt(id),
                nome: nome || '',
                descricao: (descricao || '').replace(/\\n/g, '\n'),
                imagem: imagem || '',
                dataCadastro: dataCadastro || new Date().toISOString()
            };
        });
        return produtos;
    } catch (error) {
        console.error('Erro ao ler produtos:', error);
        return [];
    }
}

// Função para salvar produtos no arquivo TXT
function salvarProdutos(produtos) {
    try {
        const linhas = produtos.map(p => 
            `${p.id}|${p.nome}|${(p.descricao || '').replace(/\n/g, '\\n')}|${p.imagem}|${p.dataCadastro}`
        );
        fs.writeFileSync(PRODUTOS_FILE, linhas.join('\n'), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar produtos:', error);
        return false;
    }
}

// Rotas da API

// GET - Listar todos os produtos
app.get('/api/produtos', (req, res) => {
    try {
        const produtos = lerProdutos();
        res.json({
            success: true,
            total: produtos.length,
            produtos: produtos
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar produtos',
            error: error.message
        });
    }
});

// GET - Buscar produto por ID
app.get('/api/produtos/:id', (req, res) => {
    try {
        const produtos = lerProdutos();
        const produto = produtos.find(p => p.id === parseInt(req.params.id));
        
        if (produto) {
            res.json({
                success: true,
                produto: produto
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar produto',
            error: error.message
        });
    }
});

// POST - Criar novo produto
app.post('/api/produtos', upload.single('imagem'), (req, res) => {
    try {
        console.log('📝 Recebendo requisição de cadastro de produto...');
        console.log('📋 Dados recebidos:', { nome: req.body.nome, descricao: req.body.descricao });
        
        const produtos = lerProdutos();
        
        // Gerar novo ID
        const novoId = produtos.length > 0 
            ? Math.max(...produtos.map(p => p.id)) + 1 
            : 1;
        
        // Caminho da imagem (se foi enviada)
        const imagemPath = req.file 
            ? `/uploads/${req.file.filename}` 
            : '';
        
        const novoProduto = {
            id: novoId,
            nome: req.body.nome || '',
            descricao: req.body.descricao || '',
            imagem: imagemPath,
            dataCadastro: new Date().toISOString()
        };
        
        produtos.push(novoProduto);
        
        if (salvarProdutos(produtos)) {
            console.log('✅ Produto cadastrado com sucesso! ID:', novoId);
            res.status(201).json({
                success: true,
                message: 'Produto cadastrado com sucesso',
                produto: novoProduto
            });
        } else {
            console.error('❌ Erro ao salvar produto no arquivo');
            res.status(500).json({
                success: false,
                message: 'Erro ao salvar produto'
            });
        }
    } catch (error) {
        console.error('❌ Erro ao criar produto:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar produto',
            error: error.message
        });
    }
});

// PUT - Atualizar produto
app.put('/api/produtos/:id', upload.single('imagem'), (req, res) => {
    try {
        const produtos = lerProdutos();
        const index = produtos.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        // Atualizar campos
        produtos[index].nome = req.body.nome || produtos[index].nome;
        produtos[index].descricao = req.body.descricao || produtos[index].descricao;
        
        // Se nova imagem foi enviada, atualizar
        if (req.file) {
            produtos[index].imagem = `/uploads/${req.file.filename}`;
        }
        
        if (salvarProdutos(produtos)) {
            res.json({
                success: true,
                message: 'Produto atualizado com sucesso',
                produto: produtos[index]
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar produto'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar produto',
            error: error.message
        });
    }
});

// DELETE - Excluir produto
app.delete('/api/produtos/:id', (req, res) => {
    try {
        const produtos = lerProdutos();
        const index = produtos.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Produto não encontrado'
            });
        }
        
        const produtoRemovido = produtos.splice(index, 1)[0];
        
        if (salvarProdutos(produtos)) {
            res.json({
                success: true,
                message: 'Produto excluído com sucesso',
                produto: produtoRemovido
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao excluir produto'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir produto',
            error: error.message
        });
    }
});

// Servir imagens da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Arquivo de dados: ${PRODUTOS_FILE}`);
});

