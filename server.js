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

// Arquivos TXT para armazenar dados
const PRODUTOS_FILE = path.join(__dirname, 'data', 'produtos.txt');
const PERGUNTAS_FILE = path.join(__dirname, 'data', 'perguntas.txt');
const DATA_DIR = path.join(__dirname, 'data');

// Criar diretório data se não existir
if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Criar arquivos de dados se não existirem
if (!fs.existsSync(PRODUTOS_FILE)) {
    fs.writeFileSync(PRODUTOS_FILE, '', 'utf8');
}

if (!fs.existsSync(PERGUNTAS_FILE)) {
    fs.writeFileSync(PERGUNTAS_FILE, '', 'utf8');
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

// Função para ler perguntas do arquivo TXT
function lerPerguntas() {
    try {
        const data = fs.readFileSync(PERGUNTAS_FILE, 'utf8');
        if (!data.trim()) {
            return [];
        }
        
        const linhas = data.trim().split('\n');
        const perguntas = linhas.map(linha => {
            const [id, pergunta, tipo, ordem, opcoes, dataCadastro] = linha.split('|');
            return {
                id: parseInt(id),
                pergunta: pergunta || '',
                tipo: tipo || 'multipla-escolha',
                ordem: parseInt(ordem) || 1,
                opcoes: opcoes ? JSON.parse(opcoes) : [],
                dataCadastro: dataCadastro || new Date().toISOString()
            };
        });
        return perguntas;
    } catch (error) {
        console.error('Erro ao ler perguntas:', error);
        return [];
    }
}

// Função para salvar perguntas no arquivo TXT
function salvarPerguntas(perguntas) {
    try {
        const linhas = perguntas.map(p => 
            `${p.id}|${p.pergunta}|${p.tipo}|${p.ordem}|${JSON.stringify(p.opcoes)}|${p.dataCadastro}`
        );
        fs.writeFileSync(PERGUNTAS_FILE, linhas.join('\n'), 'utf8');
        return true;
    } catch (error) {
        console.error('Erro ao salvar perguntas:', error);
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

// ===== ROTAS DA API PARA PERGUNTAS =====

// GET - Listar todas as perguntas
app.get('/api/perguntas', (req, res) => {
    try {
        const perguntas = lerPerguntas();
        res.json({
            success: true,
            total: perguntas.length,
            perguntas: perguntas
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao listar perguntas',
            error: error.message
        });
    }
});

// GET - Buscar pergunta por ID
app.get('/api/perguntas/:id', (req, res) => {
    try {
        const perguntas = lerPerguntas();
        const pergunta = perguntas.find(p => p.id === parseInt(req.params.id));
        
        if (pergunta) {
            res.json({
                success: true,
                pergunta: pergunta
            });
        } else {
            res.status(404).json({
                success: false,
                message: 'Pergunta não encontrada'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao buscar pergunta',
            error: error.message
        });
    }
});

// POST - Criar nova pergunta
app.post('/api/perguntas', (req, res) => {
    try {
        console.log('📝 Recebendo requisição de cadastro de pergunta...');
        console.log('📋 Dados recebidos:', req.body);
        
        const perguntas = lerPerguntas();
        
        // Verificar se a ordem já existe
        const ordemExistente = perguntas.find(p => p.ordem === parseInt(req.body.ordem));
        if (ordemExistente) {
            return res.status(400).json({
                success: false,
                message: `A ordem ${req.body.ordem} já está sendo usada pela pergunta: "${ordemExistente.pergunta}". Escolha uma ordem diferente.`
            });
        }
        
        // Gerar novo ID
        const novoId = perguntas.length > 0 
            ? Math.max(...perguntas.map(p => p.id)) + 1 
            : 1;
        
        const novaPergunta = {
            id: novoId,
            pergunta: req.body.pergunta || '',
            tipo: req.body.tipo || 'multipla-escolha',
            ordem: parseInt(req.body.ordem) || 1,
            opcoes: req.body.opcoes || [],
            dataCadastro: new Date().toISOString()
        };
        
        perguntas.push(novaPergunta);
        
        if (salvarPerguntas(perguntas)) {
            console.log('✅ Pergunta cadastrada com sucesso! ID:', novoId);
            res.status(201).json({
                success: true,
                message: 'Pergunta cadastrada com sucesso',
                pergunta: novaPergunta
            });
        } else {
            console.error('❌ Erro ao salvar pergunta no arquivo');
            res.status(500).json({
                success: false,
                message: 'Erro ao salvar pergunta'
            });
        }
    } catch (error) {
        console.error('❌ Erro ao criar pergunta:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao criar pergunta',
            error: error.message
        });
    }
});

// PUT - Atualizar pergunta
app.put('/api/perguntas/:id', (req, res) => {
    try {
        const perguntas = lerPerguntas();
        const index = perguntas.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pergunta não encontrada'
            });
        }
        
        // Verificar se a nova ordem já existe (exceto para a própria pergunta)
        if (req.body.ordem) {
            const novaOrdem = parseInt(req.body.ordem);
            const ordemExistente = perguntas.find(p => p.ordem === novaOrdem && p.id !== parseInt(req.params.id));
            if (ordemExistente) {
                return res.status(400).json({
                    success: false,
                    message: `A ordem ${novaOrdem} já está sendo usada pela pergunta: "${ordemExistente.pergunta}". Escolha uma ordem diferente.`
                });
            }
        }
        
        // Atualizar campos
        perguntas[index].pergunta = req.body.pergunta || perguntas[index].pergunta;
        perguntas[index].tipo = req.body.tipo || perguntas[index].tipo;
        perguntas[index].ordem = parseInt(req.body.ordem) || perguntas[index].ordem;
        perguntas[index].opcoes = req.body.opcoes || perguntas[index].opcoes;
        
        if (salvarPerguntas(perguntas)) {
            res.json({
                success: true,
                message: 'Pergunta atualizada com sucesso',
                pergunta: perguntas[index]
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao atualizar pergunta'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao atualizar pergunta',
            error: error.message
        });
    }
});

// DELETE - Excluir pergunta
app.delete('/api/perguntas/:id', (req, res) => {
    try {
        const perguntas = lerPerguntas();
        const index = perguntas.findIndex(p => p.id === parseInt(req.params.id));
        
        if (index === -1) {
            return res.status(404).json({
                success: false,
                message: 'Pergunta não encontrada'
            });
        }
        
        const perguntaRemovida = perguntas.splice(index, 1)[0];
        
        if (salvarPerguntas(perguntas)) {
            res.json({
                success: true,
                message: 'Pergunta excluída com sucesso',
                pergunta: perguntaRemovida
            });
        } else {
            res.status(500).json({
                success: false,
                message: 'Erro ao excluir pergunta'
            });
        }
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Erro ao excluir pergunta',
            error: error.message
        });
    }
});

// ===== ROTAS DA API PARA IA/PREDIÇÃO =====

// POST - Obter recomendação de produto baseado nas respostas
app.post('/api/recomendar-produto', async (req, res) => {
    try {
        const respostas = req.body.respostas; // { perguntaId: resposta, ... }
        
        if (!respostas || typeof respostas !== 'object') {
            return res.status(400).json({
                success: false,
                message: 'Respostas não fornecidas ou formato inválido'
            });
        }
        
        // Carregar perguntas para mapear IDs para textos
        const perguntas = lerPerguntas();
        
        // Mapear respostas do formato do chat para o formato esperado pela IA
        const respostasFormatadas = {};
        
        // Criar um mapa de perguntas por ordem
        const perguntasPorOrdem = {};
        perguntas.forEach(p => {
            perguntasPorOrdem[p.ordem] = p;
        });
        
        // Mapear cada resposta
        Object.keys(respostas).forEach(perguntaId => {
            const pergunta = perguntas.find(p => p.id == perguntaId);
            if (pergunta) {
                respostasFormatadas[pergunta.pergunta] = respostas[perguntaId];
            }
        });
        
        // Verificar se todas as perguntas foram respondidas
        const perguntasObrigatorias = [
            'Para qual finalidade pretende usar o moedor?',
            'Quantos quilos precisa moer por minuto?',
            'Qual é a voltagem que pretende utilizar?',
            'O que irá moer?',
            'Prefere modelo mais fácil de limpar?',
            'Ruído é um fator importante?',
            'O espaço físico é limitado?',
            'Qual é a faixa de orçamento?',
            'Deseja função de remoagem?',
            'Potência desejada'
        ];
        
        const perguntasFaltando = perguntasObrigatorias.filter(
            p => !respostasFormatadas[p]
        );
        
        if (perguntasFaltando.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'Nem todas as perguntas foram respondidas',
                perguntasFaltando: perguntasFaltando
            });
        }
        
        // Preparar dados para enviar ao serviço Python
        const dadosParaIA = {
            finalidade: respostasFormatadas['Para qual finalidade pretende usar o moedor?'],
            quantidade: respostasFormatadas['Quantos quilos precisa moer por minuto?'],
            voltagem: respostasFormatadas['Qual é a voltagem que pretende utilizar?'],
            tipo_material: respostasFormatadas['O que irá moer?'],
            facil_limpeza: respostasFormatadas['Prefere modelo mais fácil de limpar?'],
            ruido_importante: respostasFormatadas['Ruído é um fator importante?'],
            espaco_limitado: respostasFormatadas['O espaço físico é limitado?'],
            orcamento: respostasFormatadas['Qual é a faixa de orçamento?'],
            remoagem: respostasFormatadas['Deseja função de remoagem?'],
            potencia: respostasFormatadas['Potência desejada']
        };
        
        // Chamar serviço Python via HTTP
        const pythonServiceUrl = process.env.PYTHON_SERVICE_URL || 'http://localhost:5000';
        
        try {
            // Usar http/https nativo do Node.js
            const http = require('http');
            const parsedUrl = new URL(`${pythonServiceUrl}/predict`);
            const postData = JSON.stringify(dadosParaIA);
            
            const resultado = await new Promise((resolve, reject) => {
                const options = {
                    hostname: parsedUrl.hostname,
                    port: parsedUrl.port || 5000,
                    path: parsedUrl.pathname,
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Content-Length': Buffer.byteLength(postData)
                    }
                };
                
                const req = http.request(options, (response) => {
                    let data = '';
                    response.on('data', (chunk) => { data += chunk; });
                    response.on('end', () => {
                        try {
                            const resultado = JSON.parse(data);
                            console.log('📊 Resultado do serviço Python:', JSON.stringify(resultado, null, 2));
                            resolve(resultado);
                        } catch (e) {
                            reject(new Error(`Erro ao parsear resposta: ${e.message}`));
                        }
                    });
                });
                
                req.on('error', (error) => {
                    reject(error);
                });
                
                req.write(postData);
                req.end();
            });
            
            if (resultado.success) {
                res.json({
                    success: true,
                    produto: resultado.produto,
                    regras: resultado.regras || [],
                    respostas: respostasFormatadas
                });
            } else {
                res.status(500).json({
                    success: false,
                    message: resultado.message || 'Erro ao obter recomendação'
                });
            }
        } catch (error) {
            console.error('❌ Erro ao chamar serviço Python:', error);
            res.status(500).json({
                success: false,
                message: 'Erro ao conectar com o serviço de IA. Certifique-se de que o serviço Python está rodando.',
                error: error.message
            });
        }
        
    } catch (error) {
        console.error('❌ Erro ao processar recomendação:', error);
        res.status(500).json({
            success: false,
            message: 'Erro ao processar recomendação',
            error: error.message
        });
    }
});

// Servir imagens da pasta uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🚀 Servidor rodando em http://localhost:${PORT}`);
    console.log(`📁 Arquivo de produtos: ${PRODUTOS_FILE}`);
    console.log(`📁 Arquivo de perguntas: ${PERGUNTAS_FILE}`);
    console.log(`🤖 Serviço de IA esperado em: ${process.env.PYTHON_SERVICE_URL || 'http://localhost:5000'}`);
});

