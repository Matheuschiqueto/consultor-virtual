// Sistema de Chat - Carregamento dinâmico de perguntas
let perguntasChat = [];
let perguntaAtual = 0;
let respostasUsuario = {};

// Inicializar o chat quando a página for carregada
function initChat() {
    console.log('🤖 Inicializando chat...');
    carregarPerguntasParaChat();
}

// Carregar perguntas ordenadas para o chat
async function carregarPerguntasParaChat() {
    try {
        console.log('📡 Carregando perguntas para o chat...');
        const response = await fetch('/api/perguntas');
        const result = await response.json();
        
        if (result.success) {
            // Ordenar perguntas pela ordem definida
            perguntasChat = result.perguntas.sort((a, b) => a.ordem - b.ordem);
            console.log('✅ Perguntas carregadas e ordenadas:', perguntasChat);
            
            // Limpar chat e preparar para iniciar conversa
            limparChat();
        } else {
            console.error('❌ Erro ao carregar perguntas:', result.message);
            exibirMensagemErro('Erro ao carregar perguntas do chatbot');
        }
    } catch (error) {
        console.error('❌ Erro ao carregar perguntas:', error);
        exibirMensagemErro('Erro de conexão ao carregar perguntas');
    }
}

// Limpar o chat
function limparChat() {
    const chatContainer = document.querySelector('.chat-container');
    if (chatContainer) {
        // Manter apenas o header e limpar as mensagens
        const header = chatContainer.querySelector('.content-header');
        chatContainer.innerHTML = '';
        if (header) {
            chatContainer.appendChild(header);
        }
        
        // Adicionar container para mensagens
        const messagesContainer = document.createElement('div');
        messagesContainer.className = 'messages-container';
        chatContainer.appendChild(messagesContainer);
        
        // Adicionar área de input
        const inputArea = document.createElement('div');
        inputArea.className = 'input-area';
        inputArea.innerHTML = `
            <input type="text" placeholder="Digite sua resposta..." id="chatInput" style="display: none;">
            <button class="btn btn-primary" id="btnIniciarChat" style="display: block;">Iniciar Conversa</button>
        `;
        chatContainer.appendChild(inputArea);
        
        // Configurar eventos
        configurarEventosChat();
    }
}

// Configurar eventos do chat
function configurarEventosChat() {
    const btnIniciarChat = document.getElementById('btnIniciarChat');
    const chatInput = document.getElementById('chatInput');
    
    if (btnIniciarChat) {
        btnIniciarChat.addEventListener('click', () => {
            btnIniciarChat.style.display = 'none';
            chatInput.style.display = 'block';
            chatInput.focus();
            perguntaAtual = 0;
            exibirProximaPergunta();
        });
    }
    
    if (chatInput) {
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                processarRespostaTexto(chatInput.value.trim());
                chatInput.value = '';
            }
        });
    }
}

// Exibir próxima pergunta
function exibirProximaPergunta() {
    if (perguntaAtual >= perguntasChat.length) {
        exibirResumoFinal();
        return;
    }
    
    const pergunta = perguntasChat[perguntaAtual];
    console.log(`📝 Exibindo pergunta ${perguntaAtual + 1}:`, pergunta);
    
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message';
    messageDiv.innerHTML = `
        <div class="bot-icon">🤖</div>
        <div class="message-content">
            <p>${pergunta.pergunta}</p>
            ${pergunta.tipo === 'multipla-escolha' ? gerarBotoesOpcoes(pergunta.opcoes) : ''}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Configurar eventos dos botões de opção
    if (pergunta.tipo === 'multipla-escolha') {
        configurarBotoesOpcoes(messageDiv, pergunta.opcoes);
    }
    
    // Scroll para a última mensagem
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Gerar botões de opção
function gerarBotoesOpcoes(opcoes) {
    if (!opcoes || opcoes.length === 0) return '';
    
    const opcoesHtml = opcoes.map(opcao => 
        `<button class="btn btn-option" data-opcao="${opcao}">${opcao}</button>`
    ).join('');
    
    return `<div class="option-buttons">${opcoesHtml}</div>`;
}

// Configurar eventos dos botões de opção
function configurarBotoesOpcoes(messageDiv, opcoes) {
    const botoes = messageDiv.querySelectorAll('.btn-option');
    botoes.forEach(botao => {
        botao.addEventListener('click', () => {
            const opcaoSelecionada = botao.getAttribute('data-opcao');
            
            // Marcar botão como selecionado
            botoes.forEach(b => b.classList.remove('selected'));
            botao.classList.add('selected');
            
            // Desabilitar todos os botões após seleção
            botoes.forEach(b => {
                b.disabled = true;
                b.style.opacity = '0.6';
                b.style.cursor = 'not-allowed';
            });
            
            // Processar resposta
            setTimeout(() => {
                processarRespostaOpcao(opcaoSelecionada);
            }, 500);
        });
    });
}

// Processar resposta de múltipla escolha
function processarRespostaOpcao(resposta) {
    const pergunta = perguntasChat[perguntaAtual];
    respostasUsuario[pergunta.id] = resposta;
    
    console.log(`✅ Resposta registrada para pergunta ${pergunta.id}:`, resposta);
    
    // Exibir a resposta do usuário como mensagem
    exibirRespostaUsuario(resposta);
    
    perguntaAtual++;
    setTimeout(() => {
        exibirProximaPergunta();
    }, 1000);
}

// Processar resposta de texto livre
function processarRespostaTexto(resposta) {
    if (!resposta) return;
    
    const pergunta = perguntasChat[perguntaAtual];
    
    // Verificar se é pergunta de múltipla escolha
    if (pergunta.tipo === 'multipla-escolha') {
        // Exibir a resposta digitada pelo usuário primeiro
        exibirRespostaUsuario(resposta);
        
        // Depois mostrar mensagem orientando a escolher uma opção
        setTimeout(() => {
            exibirMensagemOrientacao(pergunta);
        }, 500);
        return;
    }
    
    // Se for pergunta de texto livre, processar normalmente
    respostasUsuario[pergunta.id] = resposta;
    
    // Exibir resposta do usuário
    exibirRespostaUsuario(resposta);
    
    console.log(`✅ Resposta de texto registrada para pergunta ${pergunta.id}:`, resposta);
    
    perguntaAtual++;
    setTimeout(() => {
        exibirProximaPergunta();
    }, 1000);
}

// Exibir mensagem de orientação para múltipla escolha
function exibirMensagemOrientacao(pergunta) {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    // Desabilitar botões da pergunta original
    desabilitarBotoesPerguntaAnterior();
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message orientacao-message';
    messageDiv.innerHTML = `
        <div class="bot-icon">🤖</div>
        <div class="message-content">
            <p><strong>Por favor, escolha uma das opções abaixo:</strong></p>
            <p>Esta pergunta requer que você selecione uma das alternativas disponíveis.</p>
            ${gerarBotoesOpcoes(pergunta.opcoes)}
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Configurar eventos dos botões de opção
    configurarBotoesOpcoes(messageDiv, pergunta.opcoes);
    
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Desabilitar botões da pergunta anterior
function desabilitarBotoesPerguntaAnterior() {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    // Encontrar todos os botões de opção que não estão desabilitados
    const todosBotoes = messagesContainer.querySelectorAll('.btn-option:not(:disabled)');
    
    todosBotoes.forEach(botao => {
        botao.disabled = true;
        botao.style.opacity = '0.6';
        botao.style.cursor = 'not-allowed';
    });
}

// Exibir resposta do usuário
function exibirRespostaUsuario(resposta) {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message user-message';
    messageDiv.innerHTML = `
        <div class="user-icon">👤</div>
        <div class="message-content">
            <p>${resposta}</p>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Função auxiliar para escapar HTML (segurança)
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Exibir resumo final
async function exibirResumoFinal() {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    // Mostrar mensagem de carregamento
    const loadingDiv = document.createElement('div');
    loadingDiv.className = 'chat-message bot-message loading-message';
    loadingDiv.innerHTML = `
        <div class="bot-icon">🤖</div>
        <div class="message-content">
            <p><strong>Processando suas respostas...</strong></p>
            <p>Estamos analisando suas necessidades para recomendar a melhor máquina para você.</p>
            <div class="loading-spinner">
                <div class="spinner"></div>
            </div>
        </div>
    `;
    messagesContainer.appendChild(loadingDiv);
    loadingDiv.scrollIntoView({ behavior: 'smooth' });
    
    // Chamar API para obter recomendação
    try {
        const response = await fetch('/api/recomendar-produto', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                respostas: respostasUsuario
            })
        });
        
        const resultado = await response.json();
        
        // Debug: verificar o que foi retornado
        console.log('📊 Resultado da API:', resultado);
        console.log('📋 Regras recebidas:', resultado.regras);
        
        // Remover mensagem de carregamento
        loadingDiv.remove();
        
        if (resultado.success) {
            // Buscar informações do produto recomendado
            let produtoInfo = null;
            try {
                const produtosResponse = await fetch('/api/produtos');
                const produtosData = await produtosResponse.json();
                if (produtosData.success) {
                    produtoInfo = produtosData.produtos.find(p => 
                        p.nome.toLowerCase().includes(resultado.produto.toLowerCase()) ||
                        resultado.produto.toLowerCase().includes(p.nome.toLowerCase())
                    );
                }
            } catch (error) {
                console.log('Não foi possível buscar informações do produto:', error);
            }
            
            // Exibir resumo com recomendação
            const messageDiv = document.createElement('div');
            messageDiv.className = 'chat-message bot-message final-message';
            
            // Formatar descrição do produto
            const descricaoFormatada = produtoInfo && produtoInfo.descricao 
                ? produtoInfo.descricao.replace(/\\n/g, '\n').replace(/\n\n+/g, '\n').trim()
                : '';
            
            messageDiv.innerHTML = `
                <div class="bot-icon">🤖</div>
                <div class="message-content">
                    <div class="cabecalho-recomendacao">
                        <div class="badge-recomendacao">Recomendação Personalizada</div>
                        <h2>Máquina Recomendada</h2>
                        <p class="subtitulo-recomendacao">Com base na análise das suas necessidades, nossa inteligência artificial identificou a solução ideal para você.</p>
                    </div>
                    
                    <div class="recomendacao-produto">
                        <div class="produto-header">
                            <div class="produto-titulo-wrapper">
                                <h3 class="produto-nome">${escapeHtml(resultado.produto)}</h3>
                                <span class="badge-ia">Recomendado por IA</span>
                            </div>
                        </div>
                        
                        ${produtoInfo ? `
                            <div class="produto-detalhes">
                                ${produtoInfo.imagem ? `
                                    <div class="produto-imagem-wrapper">
                                        <img src="${escapeHtml(produtoInfo.imagem)}" alt="${escapeHtml(produtoInfo.nome)}" class="produto-imagem">
                                    </div>
                                ` : ''}
                                
                                ${descricaoFormatada ? `
                                    <div class="produto-descricao-wrapper">
                                        <h4 class="descricao-titulo">Sobre o Produto</h4>
                                        <p class="produto-descricao">${escapeHtml(descricaoFormatada)}</p>
                                    </div>
                                ` : ''}
                            </div>
                        ` : `
                            <div class="produto-sem-info">
                                <p>Informações detalhadas sobre este produto estarão disponíveis em breve.</p>
                            </div>
                        `}
                    </div>
                    
                    ${resultado.regras && Array.isArray(resultado.regras) && resultado.regras.length > 0 ? `
                        <div class="regras-decisao">
                            <div class="regras-header">
                                <h4>🎯 Por que esta máquina foi escolhida?</h4>
                                <p class="regras-subtitulo">As seguintes características foram determinantes na recomendação:</p>
                            </div>
                            <div class="regras-lista">
                                ${resultado.regras.map((regra, index) => `
                                    <div class="regra-item ${regra.importancia === 'alta' ? 'regra-alta' : ''}">
                                        <div class="regra-numero">${index + 1}</div>
                                        <div class="regra-conteudo">
                                            <div class="regra-pergunta">
                                                <span class="regra-icon">${regra.importancia === 'alta' ? '⭐' : '✓'}</span>
                                                <span class="regra-texto">${escapeHtml(regra.pergunta)}</span>
                                                ${regra.importancia === 'alta' ? '<span class="badge-importancia">Determinante</span>' : ''}
                                            </div>
                                            <div class="regra-resposta">${escapeHtml(regra.resposta)}</div>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    ` : `
                        <div class="regras-decisao" style="background: #fff3cd; border-color: #ffc107;">
                            <div class="regras-header">
                                <h4>ℹ️ Informação sobre a Recomendação</h4>
                                <p class="regras-subtitulo">As regras de decisão não estão disponíveis no momento.</p>
                            </div>
                        </div>
                    `}
                    
                    <div class="acoes-finais">
                        <button class="btn btn-primary btn-nova-consulta" onclick="reiniciarChat()">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">Nova Consulta</span>
                        </button>
                    </div>
                </div>
            `;
            
            messagesContainer.appendChild(messageDiv);
            messageDiv.scrollIntoView({ behavior: 'smooth' });
        } else {
            // Exibir erro mas ainda mostrar resumo
            exibirResumoComErro(resultado.message);
        }
    } catch (error) {
        console.error('❌ Erro ao obter recomendação:', error);
        // Remover mensagem de carregamento
        loadingDiv.remove();
        // Exibir resumo sem recomendação
        exibirResumoComErro('Não foi possível obter a recomendação da IA. Verifique se o serviço está rodando.');
    }
    
    // Esconder input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.style.display = 'none';
    }
}

// Exibir resumo com erro (fallback)
function exibirResumoComErro(mensagemErro) {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message final-message';
    messageDiv.innerHTML = `
        <div class="bot-icon">🤖</div>
        <div class="message-content">
            <div class="cabecalho-recomendacao">
                <h2>Obrigado pela sua Consulta</h2>
            </div>
            <div class="error-notification">
                <span class="error-icon">⚠️</span>
                <p class="error-message">${mensagemErro}</p>
            </div>
            <p class="mensagem-fallback">Com base nas suas respostas, podemos recomendar os produtos mais adequados para você. Entre em contato conosco para obter uma recomendação personalizada.</p>
            <div class="acoes-finais">
                <button class="btn btn-primary btn-nova-consulta" onclick="reiniciarChat()">
                    <span class="btn-icon">🔄</span>
                    <span class="btn-text">Nova Consulta</span>
                </button>
            </div>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    messageDiv.scrollIntoView({ behavior: 'smooth' });
}

// Reiniciar chat
function reiniciarChat() {
    perguntaAtual = 0;
    respostasUsuario = {};
    limparChat();
    
    const btnIniciarChat = document.getElementById('btnIniciarChat');
    if (btnIniciarChat) {
        btnIniciarChat.style.display = 'block';
    }
}

// Exibir mensagem de erro
function exibirMensagemErro(mensagem) {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message error-message';
    messageDiv.innerHTML = `
        <div class="bot-icon">⚠️</div>
        <div class="message-content">
            <p>${mensagem}</p>
            <button class="btn btn-primary" onclick="initChat()">Tentar Novamente</button>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
}

// Inicializar quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    // Verificar se estamos na página de chat
    if (document.querySelector('.chat-container')) {
        initChat();
    }
});

// Exportar funções para uso global
window.initChat = initChat;
window.reiniciarChat = reiniciarChat;
