// URL base da API
const API_URL = 'http://localhost:3000/api';

// Elementos do DOM
let formCadastro = null;
let produtosContainer = null;

// Inicializar quando o documento estiver pronto
document.addEventListener('DOMContentLoaded', function() {
    initCadastroProdutos();
    initListaProdutos();
    
    // Carregar produtos recentes ao abrir a página de cadastro
    setTimeout(() => {
        if (document.querySelector('.recent-section')) {
            atualizarProdutosRecentes();
        }
    }, 500);
});

// ========== CADASTRO DE PRODUTOS ==========

function initCadastroProdutos() {
    formCadastro = document.getElementById('formCadastroProduto');
    
    if (!formCadastro) return;
    
    formCadastro.addEventListener('submit', async function(e) {
        e.preventDefault();
        await cadastrarProduto();
    });
    
    // Botão Cancelar
    const btnCancelar = formCadastro.querySelector('.btn-secondary');
    if (btnCancelar) {
        btnCancelar.addEventListener('click', function() {
            limparFormulario();
            resetarFormularioCadastro();
            // Redirecionar para a tela inicial
            irParaTelaInicial();
        });
    }
    
    // Upload de arquivo
    const fileUploadBox = document.querySelector('.file-upload-box');
    const fileInput = formCadastro.querySelector('input[type="file"]');
    
    if (fileUploadBox && fileInput) {
        fileUploadBox.addEventListener('click', function() {
            fileInput.click();
        });
        
        fileInput.addEventListener('change', function(e) {
            const fileName = e.target.files[0]?.name;
            if (fileName) {
                fileUploadBox.querySelector('span:last-child').textContent = fileName;
            }
        });
    }
}

async function cadastrarProduto() {
    const nome = document.getElementById('nome').value;
    const descricao = document.getElementById('descricao').value;
    const imagemInput = formCadastro.querySelector('input[type="file"]');
    
    if (!nome.trim()) {
        mostrarMensagem('Por favor, preencha o nome do produto', 'erro');
        return;
    }
    
    // Verificar se está editando um produto existente
    const btnCadastrar = document.querySelector('.btn-primary');
    const produtoId = btnCadastrar.getAttribute('data-editing');
    
    const formData = new FormData();
    formData.append('nome', nome);
    formData.append('descricao', descricao);
    
    if (imagemInput.files.length > 0) {
        formData.append('imagem', imagemInput.files[0]);
    }
    
    try {
        let response;
        let url = `${API_URL}/produtos`;
        let method = 'POST';
        
        if (produtoId) {
            // Atualizar produto existente
            url = `${API_URL}/produtos/${produtoId}`;
            method = 'PUT';
        }
        
        response = await fetch(url, {
            method: method,
            body: formData
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            if (produtoId) {
                mostrarMensagem('Produto atualizado com sucesso!', 'sucesso');
                resetarFormularioCadastro();
            } else {
                mostrarMensagem('Produto cadastrado com sucesso!', 'sucesso');
            }
            
            limparFormulario();
            
            // Atualizar produtos recentes (com tratamento de erro separado)
            setTimeout(async () => {
                try {
                    await atualizarProdutosRecentes();
                } catch (err) {
                    console.warn('Erro ao atualizar produtos recentes:', err);
                }
            }, 100);
        } else {
            mostrarMensagem(data.message || 'Erro ao salvar produto', 'erro');
        }
    } catch (error) {
        console.error('Erro ao salvar produto:', error);
        mostrarMensagem('Erro ao conectar com o servidor', 'erro');
    }
}

function limparFormulario() {
    if (formCadastro) {
        formCadastro.reset();
        const fileUploadBox = document.querySelector('.file-upload-box');
        if (fileUploadBox) {
            const span = fileUploadBox.querySelector('span:last-child');
            if (span) {
                span.textContent = 'Adicionar ficheiros';
            }
        }
    }
}

async function atualizarProdutosRecentes() {
    const recentSection = document.querySelector('.recent-section');
    if (!recentSection) {
        console.log('Seção de produtos recentes não encontrada');
        return;
    }
    
    // Verificar se estamos na página de cadastro de produtos
    const isProdutosPage = document.querySelector('#formCadastroProduto') || document.querySelector('.product-list');
    if (!isProdutosPage) {
        console.log('Não estamos na página de produtos, ignorando atualização');
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/produtos`);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            const produtosRecentes = data.produtos.slice(-3).reverse();
            
            // Remover conteúdo anterior
            const oldContent = recentSection.querySelectorAll('.product-item, div[style*="text-align:center"]');
            oldContent.forEach(item => item.remove());
            
            if (produtosRecentes.length === 0) {
                // Mostrar mensagem de vazio
                const emptyMessage = `
                    <div style="text-align:center;padding:40px;color:#999;">
                        <p>📦 Nenhum produto cadastrado ainda</p>
                        <p style="font-size:0.85em;">Cadastre produtos para vê-los aqui</p>
                    </div>
                `;
                const h3 = recentSection.querySelector('h3');
                if (h3) {
                    h3.insertAdjacentHTML('afterend', emptyMessage);
                }
            } else {
                // Mostrar produtos
                const produtosHTML = produtosRecentes.map(produto => `
                    <div class="product-item">
                        <div class="product-image-placeholder">
                            ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : '📦'}
                        </div>
                        <div class="product-info">
                            <h4>${produto.nome}</h4>
                            <p>${produto.descricao || 'Sem descrição'}</p>
                        </div>
                    </div>
                `).join('');
                
                const h3 = recentSection.querySelector('h3');
                if (h3) {
                    h3.insertAdjacentHTML('afterend', produtosHTML);
                }
            }
        }
    } catch (error) {
        console.error('Erro ao atualizar produtos recentes:', error);
        // Não mostrar mensagem de erro ao usuário, apenas logar
    }
}

// ========== LISTA DE PRODUTOS ==========

function initListaProdutos() {
    produtosContainer = document.querySelector('.product-list');
    
    if (!produtosContainer) return;
    
    carregarProdutos();
    
// Botão Novo Produto
    const btnNovoProduto = document.querySelector('.btn-new-product');
    if (btnNovoProduto) {
        btnNovoProduto.addEventListener('click', function() {
            // Navegar para página de cadastro
            const navLink = document.querySelector('[data-page="cadastro-produtos"]');
            if (navLink) {
                navLink.click();
            }
        });
    }
    
    // Botão Relatório
    const btnRelatorio = document.querySelector('.btn-report');
    if (btnRelatorio) {
        btnRelatorio.addEventListener('click', async function() {
            await gerarRelatorio();
        });
    }
}

async function carregarProdutos() {
    if (!produtosContainer) return;
    
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        if (data.success) {
            renderizarProdutos(data.produtos);
            atualizarContador(data.total);
        } else {
            mostrarMensagem('Erro ao carregar produtos', 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        produtosContainer.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <p>⚠️ Erro ao conectar com o servidor</p>
                <p style="font-size:0.9em;">Certifique-se de que o servidor Node.js está rodando</p>
            </div>
        `;
    }
}

function renderizarProdutos(produtos) {
    if (produtos.length === 0) {
        produtosContainer.innerHTML = `
            <div style="text-align:center;padding:40px;color:#666;">
                <p>📦 Nenhum produto cadastrado</p>
                <p style="font-size:0.9em;">Clique em "Novo Produto" para cadastrar</p>
            </div>
        `;
        return;
    }
    
    const produtosHTML = produtos.map(produto => {
        const descricaoFormatada = (produto.descricao || 'Sem descrição').replace(/\n/g, '<br>');
        return `
        <div class="product-item" data-id="${produto.id}">
            <div class="product-content">
                <div class="product-image-placeholder">
                    ${produto.imagem ? `<img src="${produto.imagem}" alt="${produto.nome}" style="width:100%;height:100%;object-fit:cover;border-radius:4px;">` : '📦'}
                </div>
                <div class="product-info">
                    <h4>${produto.nome}</h4>
                    <p>${descricaoFormatada}</p>
                </div>
            </div>
            <div class="item-actions">
                <button class="btn btn-edit" onclick="editarProduto(${produto.id})">Editar</button>
                <button class="btn btn-delete" onclick="excluirProduto(${produto.id})">Excluir</button>
            </div>
        </div>
        `;
    }).join('');
    
    produtosContainer.innerHTML = produtosHTML;
}

function atualizarContador(total) {
    const contador = document.querySelector('.product-summary p');
    if (contador) {
        contador.textContent = `${total} Produto${total !== 1 ? 's' : ''} Cadastrado${total !== 1 ? 's' : ''}`;
    }
}

async function excluirProduto(id) {
    if (!confirm('Tem certeza que deseja excluir este produto?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/produtos/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensagem('Produto excluído com sucesso!', 'sucesso');
            carregarProdutos();
        } else {
            mostrarMensagem(data.message || 'Erro ao excluir produto', 'erro');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao conectar com o servidor', 'erro');
    }
}

async function editarProduto(id) {
    try {
        // Buscar dados do produto
        const response = await fetch(`${API_URL}/produtos/${id}`);
        const data = await response.json();
        
        if (data.success) {
            const produto = data.produto;
            
            // Navegar para a tela de cadastro
            const navLink = document.querySelector('[data-page="cadastro-produtos"]');
            if (navLink) {
                navLink.click();
                
                // Aguardar a página carregar e então preencher o formulário
                setTimeout(() => {
                    preencherFormularioEdicao(produto);
                }, 300);
            }
        } else {
            mostrarMensagem('Produto não encontrado', 'erro');
        }
    } catch (error) {
        console.error('Erro ao buscar produto:', error);
        mostrarMensagem('Erro ao carregar produto para edição', 'erro');
    }
}

async function gerarRelatorio() {
    try {
        const response = await fetch(`${API_URL}/produtos`);
        const data = await response.json();
        
        if (data.success) {
            let relatorio = '========== RELATÓRIO DE PRODUTOS ==========\n\n';
            relatorio += `Total de produtos: ${data.total}\n`;
            relatorio += `Data: ${new Date().toLocaleString('pt-BR')}\n\n`;
            relatorio += '===========================================\n\n';
            
            data.produtos.forEach((produto, index) => {
                relatorio += `${index + 1}. ${produto.nome}\n`;
                relatorio += `   Descrição: ${produto.descricao || 'Sem descrição'}\n`;
                relatorio += `   Data de cadastro: ${new Date(produto.dataCadastro).toLocaleString('pt-BR')}\n`;
                relatorio += `   Imagem: ${produto.imagem || 'Sem imagem'}\n\n`;
            });
            
            relatorio += '===========================================\n';
            
            // Criar e baixar arquivo
            const blob = new Blob([relatorio], { type: 'text/plain' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-produtos-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            mostrarMensagem('Relatório gerado com sucesso!', 'sucesso');
        }
    } catch (error) {
        console.error('Erro:', error);
        mostrarMensagem('Erro ao gerar relatório', 'erro');
    }
}

// ========== FUNÇÕES AUXILIARES ==========

function preencherFormularioEdicao(produto) {
    // Preencher campos do formulário
    const nomeInput = document.getElementById('nome');
    const descricaoInput = document.getElementById('descricao');
    
    if (nomeInput) nomeInput.value = produto.nome || '';
    if (descricaoInput) descricaoInput.value = produto.descricao || '';
    
    // Atualizar título da seção
    const headerTitulo = document.querySelector('.new-product-header h2');
    if (headerTitulo) {
        headerTitulo.textContent = 'Editar produto';
    }
    
    const headerDescricao = document.querySelector('.new-product-header p');
    if (headerDescricao) {
        headerDescricao.textContent = `Editando: ${produto.nome}`;
    }
    
    // Atualizar botões
    const btnCadastrar = document.querySelector('.btn-primary');
    if (btnCadastrar) {
        btnCadastrar.textContent = 'Atualizar';
        btnCadastrar.setAttribute('data-editing', produto.id);
    }
    
    const btnCancelar = document.querySelector('.btn-secondary');
    if (btnCancelar) {
        btnCancelar.textContent = 'Cancelar Edição';
        btnCancelar.setAttribute('data-editing', produto.id);
    }
    
    // Mostrar imagem atual se existir
    const fileUploadBox = document.querySelector('.file-upload-box');
    if (fileUploadBox && produto.imagem) {
        const span = fileUploadBox.querySelector('span:last-child');
        if (span) {
            span.textContent = `Imagem atual: ${produto.imagem.split('/').pop()}`;
        }
    }
    
    mostrarMensagem(`Editando produto: ${produto.nome}`, 'info');
}

function resetarFormularioCadastro() {
    // Restaurar título da seção
    const headerTitulo = document.querySelector('.new-product-header h2');
    if (headerTitulo) {
        headerTitulo.textContent = 'Novo produto';
    }
    
    const headerDescricao = document.querySelector('.new-product-header p');
    if (headerDescricao) {
        headerDescricao.textContent = 'Adicione um novo produto';
    }
    
    // Restaurar botão de cadastrar
    const btnCadastrar = document.querySelector('.btn-primary');
    if (btnCadastrar) {
        btnCadastrar.textContent = 'Cadastrar';
        btnCadastrar.removeAttribute('data-editing');
    }
    
    // Restaurar botão cancelar
    const btnCancelar = document.querySelector('.btn-secondary');
    if (btnCancelar) {
        btnCancelar.textContent = 'Cancelar';
        btnCancelar.removeAttribute('data-editing');
    }
}

function irParaTelaInicial() {
    // Limpar o conteúdo atual
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
        pageContent.innerHTML = `
            <div class="content-header">
                <h1>Bem-vindo ao Sistema</h1>
            </div>
            <p>Selecione uma opção no menu lateral para começar.</p>
        `;
    }
    
    // Remover classe active de todos os links do menu
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    
    // Atualizar título da página
    document.title = 'Sistema de Gestão - Chatbot';
    
    // Mostrar mensagem informativa
    mostrarMensagem('Operação cancelada', 'info');
}

function mostrarMensagem(mensagem, tipo = 'info') {
    // Criar elemento de notificação
    const notificacao = document.createElement('div');
    notificacao.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        color: white;
        font-weight: bold;
        z-index: 10000;
        animation: slideIn 0.3s ease;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    `;
    
    const cores = {
        sucesso: '#38A852',
        erro: '#D03131',
        info: '#000080'
    };
    
    notificacao.style.backgroundColor = cores[tipo] || cores.info;
    notificacao.textContent = mensagem;
    
    document.body.appendChild(notificacao);
    
    setTimeout(() => {
        notificacao.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notificacao);
        }, 300);
    }, 3000);
}

// Adicionar animações CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

