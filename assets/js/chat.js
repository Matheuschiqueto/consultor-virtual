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

// Exibir resumo final
function exibirResumoFinal() {
    const messagesContainer = document.querySelector('.messages-container');
    if (!messagesContainer) return;
    
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-message bot-message final-message';
    messageDiv.innerHTML = `
        <div class="bot-icon">🤖</div>
        <div class="message-content">
            <p><strong>Obrigado pelas suas respostas!</strong></p>
            <p>Com base nas suas respostas, podemos recomendar os produtos mais adequados para você.</p>
            <div class="resumo-respostas">
                <h4>Resumo das suas respostas:</h4>
                <ul>
                    ${Object.entries(respostasUsuario).map(([perguntaId, resposta]) => {
                        const pergunta = perguntasChat.find(p => p.id == perguntaId);
                        return `<li><strong>${pergunta?.pergunta}:</strong> ${resposta}</li>`;
                    }).join('')}
                </ul>
            </div>
            <button class="btn btn-primary" onclick="reiniciarChat()">Nova Consulta</button>
        </div>
    `;
    
    messagesContainer.appendChild(messageDiv);
    
    // Esconder input
    const chatInput = document.getElementById('chatInput');
    if (chatInput) {
        chatInput.style.display = 'none';
    }
    
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
