// Funcionalidades para a página de perguntas cadastradas

// Variáveis globais
let perguntasContainer = null;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando página de perguntas cadastradas...');
    
    // Verificar se estamos na página correta
    const container = document.querySelector('.container-perguntas');
    if (!container) {
        console.log('⚠️ Não estamos na página de perguntas cadastradas, ignorando inicialização');
        return;
    }
    
    console.log('✅ Página de perguntas cadastradas detectada');
    initListaPerguntas();
});

// ========== LISTA DE PERGUNTAS ==========

function initListaPerguntas() {
    perguntasContainer = document.querySelector('.pergunta-list');
    
    if (!perguntasContainer) return;
    
    carregarPerguntas();
    
    // Botão Nova Pergunta
    const btnNovaPergunta = document.querySelector('.btn-new-pergunta');
    if (btnNovaPergunta) {
        btnNovaPergunta.addEventListener('click', function() {
            // Navegar para página de cadastro
            const navLink = document.querySelector('[data-page="cadastro-perguntas"]');
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

async function carregarPerguntas() {
    if (!perguntasContainer) return;
    
    try {
        console.log('🔄 Carregando perguntas para exibição...');
        const response = await fetch('/api/perguntas');
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Perguntas carregadas:', data.perguntas.length);
            exibirPerguntas(data.perguntas);
            atualizarContador(data.total);
        } else {
            console.error('❌ Erro ao carregar perguntas:', data.message);
            mostrarMensagem('Erro ao carregar perguntas', 'erro');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar perguntas:', error);
        mostrarMensagem('Erro ao carregar perguntas', 'erro');
    }
}

function exibirPerguntas(perguntas) {
    if (!perguntasContainer) return;
    
    if (perguntas.length === 0) {
        perguntasContainer.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <p>❓ Nenhuma pergunta cadastrada ainda</p>
                <p style="font-size:0.85em;">Cadastre perguntas para vê-las aqui</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por ordem de exibição
    const perguntasOrdenadas = [...perguntas].sort((a, b) => a.ordem - b.ordem);
    
    const perguntasHTML = perguntasOrdenadas.map(pergunta => `
        <div class="pergunta-card">
            <div class="pergunta-header">
                <div class="pergunta-info">
                    <h3>${pergunta.pergunta}</h3>
                    <div class="pergunta-meta">
                        <span class="pergunta-tipo">${obterLabelTipo(pergunta.tipo)}</span>
                        <span class="pergunta-ordem">Ordem: ${pergunta.ordem}</span>
                    </div>
                </div>
            </div>
            
            ${pergunta.opcoes && pergunta.opcoes.length > 0 ? `
                <div class="pergunta-opcoes">
                    <h4>Opções de Resposta:</h4>
                    <div class="opcoes-list">
                        ${pergunta.opcoes.map(opcao => `
                            <span class="opcao-tag">${opcao}</span>
                        `).join('')}
                    </div>
                </div>
            ` : `
                <div class="pergunta-opcoes">
                    <p style="color: #7f8c8d; font-style: italic;">Resposta em texto livre</p>
                </div>
            `}
            
            <div class="pergunta-actions">
                <button class="btn-delete" onclick="excluirPergunta(${pergunta.id})">
                    <i class="fas fa-trash"></i> Excluir
                </button>
            </div>
            
            <div class="pergunta-data">
                Cadastrado em: ${new Date(pergunta.dataCadastro).toLocaleString('pt-BR')}
            </div>
        </div>
    `).join('');
    
    perguntasContainer.innerHTML = perguntasHTML;
}

function atualizarContador(total) {
    const contador = document.querySelector('.pergunta-summary p');
    if (contador) {
        contador.textContent = `${total} Pergunta${total !== 1 ? 's' : ''} Cadastrada${total !== 1 ? 's' : ''}`;
    }
}

// ========== EXCLUSÃO DE PERGUNTAS ==========

async function excluirPergunta(id) {
    if (!confirm('Tem certeza que deseja excluir esta pergunta?')) {
        return;
    }
    
    try {
        console.log('🗑️ Excluindo pergunta ID:', id);
        const response = await fetch(`/api/perguntas/${id}`, {
            method: 'DELETE'
        });
        
        const data = await response.json();
        
        if (data.success) {
            mostrarMensagem('Pergunta excluída com sucesso!', 'sucesso');
            carregarPerguntas(); // Recarregar a lista
        } else {
            mostrarMensagem(data.message || 'Erro ao excluir pergunta', 'erro');
        }
    } catch (error) {
        console.error('❌ Erro ao excluir pergunta:', error);
        mostrarMensagem('Erro ao excluir pergunta', 'erro');
    }
}

// ========== RELATÓRIO ==========

async function gerarRelatorio() {
    try {
        console.log('📊 Gerando relatório de perguntas...');
        const response = await fetch('/api/perguntas');
        const data = await response.json();
        
        if (data.success) {
            let relatorio = '========== RELATÓRIO DE PERGUNTAS DO CHATBOT ==========\n\n';
            relatorio += `Total de perguntas: ${data.total}\n`;
            relatorio += `Data: ${new Date().toLocaleString('pt-BR')}\n\n`;
            relatorio += '===========================================\n\n';
            
            // Ordenar por ordem de exibição
            const perguntasOrdenadas = [...data.perguntas].sort((a, b) => a.ordem - b.ordem);
            
            perguntasOrdenadas.forEach((pergunta, index) => {
                relatorio += `${index + 1}. ${pergunta.pergunta}\n`;
                relatorio += `   Tipo: ${obterLabelTipo(pergunta.tipo)}\n`;
                relatorio += `   Ordem no fluxo: ${pergunta.ordem}\n`;
                
                if (pergunta.opcoes && pergunta.opcoes.length > 0) {
                    relatorio += `   Opções de resposta:\n`;
                    pergunta.opcoes.forEach((opcao, i) => {
                        relatorio += `     ${i + 1}. ${opcao}\n`;
                    });
                } else {
                    relatorio += `   Tipo de resposta: Texto livre\n`;
                }
                
                relatorio += `   Data de cadastro: ${new Date(pergunta.dataCadastro).toLocaleString('pt-BR')}\n\n`;
            });
            
            relatorio += '===========================================\n';
            relatorio += 'Relatório gerado automaticamente pelo sistema de chatbot\n';
            
            // Criar e baixar arquivo
            const blob = new Blob([relatorio], { type: 'text/plain;charset=utf-8' });
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `relatorio-perguntas-${Date.now()}.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            
            mostrarMensagem('Relatório baixado com sucesso!', 'sucesso');
        } else {
            mostrarMensagem('Erro ao gerar relatório', 'erro');
        }
    } catch (error) {
        console.error('❌ Erro ao gerar relatório:', error);
        mostrarMensagem('Erro ao gerar relatório', 'erro');
    }
}

// ========== FUNÇÕES AUXILIARES ==========

// Obter label do tipo de pergunta
function obterLabelTipo(tipo) {
    const labels = {
        'multipla-escolha': 'Múltipla Escolha',
        'texto-livre': 'Texto Livre'
    };
    return labels[tipo] || tipo;
}

// Mostrar mensagem de feedback
function mostrarMensagem(mensagem, tipo = 'info') {
    // Remover mensagem anterior se existir
    const mensagemAnterior = document.querySelector('.mensagem-flutuante');
    if (mensagemAnterior) {
        mensagemAnterior.remove();
    }
    
    const div = document.createElement('div');
    div.className = `mensagem-flutuante mensagem-${tipo}`;
    div.textContent = mensagem;
    
    // Estilos da mensagem
    div.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 6px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        max-width: 400px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        animation: slideIn 0.3s ease-out;
    `;
    
    // Cores baseadas no tipo
    const cores = {
        'sucesso': '#27ae60',
        'erro': '#e74c3c',
        'info': '#3498db',
        'aviso': '#f39c12'
    };
    
    div.style.backgroundColor = cores[tipo] || cores['info'];
    
    document.body.appendChild(div);
    
    // Remover após 4 segundos
    setTimeout(() => {
        if (div.parentNode) {
            div.style.animation = 'slideOut 0.3s ease-in';
            setTimeout(() => {
                if (div.parentNode) {
                    div.remove();
                }
            }, 300);
        }
    }, 4000);
    
    // Adicionar estilos de animação se não existirem
    if (!document.querySelector('#mensagem-styles')) {
        const style = document.createElement('style');
        style.id = 'mensagem-styles';
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
    }
}
