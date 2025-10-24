// Funcionalidades para a tela de cadastro de perguntas

// Variáveis globais
let perguntasCadastradas = [];
let proximoId = 1;

// Inicialização quando a página carrega
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM carregado - Inicializando página de perguntas...');
    
    // Verificar se estamos na página de perguntas
    const formPerguntas = document.getElementById('formCadastroPergunta');
    if (!formPerguntas) {
        console.log('⚠️ Não estamos na página de perguntas, ignorando inicialização');
        return;
    }
    
    console.log('✅ Página de perguntas detectada');
    
    // Aguardar um pouco para garantir que o conteúdo foi carregado
    setTimeout(() => {
        console.log('🔧 Inicializando página de perguntas...');
        
        if (configurarEventos()) {
            atualizarInterfaceTipo();
            carregarPerguntas();
            console.log('✅ Página de perguntas inicializada com sucesso');
        } else {
            console.error('❌ Falha ao configurar eventos da página de perguntas');
        }
        
        // Teste adicional após inicialização
        setTimeout(() => {
            console.log('🧪 Teste pós-inicialização...');
            testeExibicaoPerguntas();
        }, 2000);
    }, 500);
});

// Configurar eventos do formulário
function configurarEventos() {
    const form = document.getElementById('formCadastroPergunta');
    const tipoSelect = document.getElementById('tipo');
    
    if (form) {
        form.addEventListener('submit', cadastrarPergunta);
        console.log('Evento de submit configurado para o formulário de perguntas');
    } else {
        console.error('Formulário de perguntas não encontrado');
        return false;
    }
    
    if (tipoSelect) {
        tipoSelect.addEventListener('change', atualizarInterfaceTipo);
        console.log('Evento de change configurado para o tipo de pergunta');
    } else {
        console.error('Select de tipo não encontrado');
        return false;
    }
    
    return true;
}

// Atualizar interface baseada no tipo de pergunta
function atualizarInterfaceTipo() {
    const tipoSelect = document.getElementById('tipo');
    if (!tipoSelect) {
        console.error('Elemento tipo não encontrado');
        return;
    }
    
    const tipo = tipoSelect.value;
    const opcoesContainer = document.getElementById('opcoes-container');
    const opcoesRequired = document.getElementById('opcoes-required');
    const opcaoInputs = document.querySelectorAll('.opcao-input');
    
    if (tipo === 'texto-livre') {
        if (opcoesContainer) opcoesContainer.style.display = 'none';
        if (opcoesRequired) opcoesRequired.style.display = 'none';
        
        // Remover required dos inputs de opção quando for texto livre
        opcaoInputs.forEach(input => {
            input.removeAttribute('required');
        });
    } else {
        if (opcoesContainer) opcoesContainer.style.display = 'block';
        if (opcoesRequired) opcoesRequired.style.display = 'inline';
        
        // Adicionar required nos inputs de opção quando for múltipla escolha
        opcaoInputs.forEach(input => {
            input.setAttribute('required', 'required');
        });
    }
}

// Adicionar nova opção de resposta
function adicionarOpcao() {
    const opcoesList = document.getElementById('opcoes-list');
    const tipoSelect = document.getElementById('tipo');
    const tipo = tipoSelect ? tipoSelect.value : 'multipla-escolha';
    
    const novaOpcao = document.createElement('div');
    novaOpcao.className = 'opcao-item';
    
    // Só adicionar required se for múltipla escolha
    const requiredAttr = tipo === 'multipla-escolha' ? 'required' : '';
    
    novaOpcao.innerHTML = `
        <input type="text" placeholder="Digite uma opção de resposta..." class="opcao-input" ${requiredAttr}>
        <button type="button" class="btn-remove-opcao" onclick="removerOpcao(this)">
            <i class="fas fa-trash"></i>
        </button>
    `;
    opcoesList.appendChild(novaOpcao);
    
    // Focar no novo input
    const novoInput = novaOpcao.querySelector('.opcao-input');
    novoInput.focus();
}

// Remover opção de resposta
function removerOpcao(botao) {
    const opcaoItem = botao.closest('.opcao-item');
    const opcoesList = document.getElementById('opcoes-list');
    
    // Não permitir remover se só há uma opção
    if (opcoesList.children.length > 1) {
        opcaoItem.remove();
    } else {
        alert('Deve haver pelo menos uma opção de resposta.');
    }
}

// Cadastrar nova pergunta
async function cadastrarPergunta(event) {
    event.preventDefault();
    
    console.log('Iniciando cadastro de pergunta...');
    
    const pergunta = document.getElementById('pergunta').value.trim();
    const tipo = document.getElementById('tipo').value;
    const ordem = document.getElementById('ordem').value;
    
    // Validações obrigatórias
    if (!pergunta) {
        mostrarMensagem('Por favor, digite a pergunta.', 'erro');
        document.getElementById('pergunta').focus();
        return;
    }
    
    if (!ordem || ordem < 1) {
        mostrarMensagem('Por favor, informe a ordem no fluxo (número maior que 0).', 'erro');
        document.getElementById('ordem').focus();
        return;
    }
    
    // Verificar se a ordem já existe
    const ordemExistente = perguntasCadastradas.find(p => p.ordem === parseInt(ordem));
    if (ordemExistente) {
        mostrarMensagem(`A ordem ${ordem} já está sendo usada pela pergunta: "${ordemExistente.pergunta}". Escolha uma ordem diferente.`, 'erro');
        document.getElementById('ordem').focus();
        return;
    }
    
    // Coletar opções de resposta
    const opcoes = [];
    if (tipo === 'multipla-escolha') {
        const opcaoInputs = document.querySelectorAll('.opcao-input');
        opcaoInputs.forEach(input => {
            const valor = input.value.trim();
            if (valor) {
                opcoes.push(valor);
            }
        });
        
        if (opcoes.length === 0) {
            mostrarMensagem('Por favor, adicione pelo menos uma opção de resposta.', 'erro');
            const primeiroInput = document.querySelector('.opcao-input');
            if (primeiroInput) primeiroInput.focus();
            return;
        }
    }
    
    // Preparar dados da pergunta
    const dadosPergunta = {
        pergunta: pergunta,
        tipo: tipo,
        ordem: parseInt(ordem),
        opcoes: opcoes,
        dataCadastro: new Date().toISOString()
    };
    
    console.log('Dados da pergunta:', dadosPergunta);
    
    try {
        const response = await fetch('/api/perguntas', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(dadosPergunta)
        });
        
        const result = await response.json();
        console.log('Resposta do servidor:', result);
        
        if (result.success) {
            mostrarMensagem('Pergunta cadastrada com sucesso!', 'sucesso');
            limparFormulario();
            carregarPerguntas();
        } else {
            mostrarMensagem('Erro ao cadastrar pergunta: ' + result.message, 'erro');
        }
    } catch (error) {
        console.error('Erro ao cadastrar pergunta:', error);
        mostrarMensagem('Erro ao cadastrar pergunta. Tente novamente.', 'erro');
    }
}

// Limpar formulário
function limparFormulario() {
    document.getElementById('formCadastroPergunta').reset();
    document.getElementById('tipo').value = 'multipla-escolha';
    
    // Resetar opções considerando o tipo atual
    const opcoesList = document.getElementById('opcoes-list');
    const tipoSelect = document.getElementById('tipo');
    const tipo = tipoSelect ? tipoSelect.value : 'multipla-escolha';
    
    // Só adicionar required se for múltipla escolha
    const requiredAttr = tipo === 'multipla-escolha' ? 'required' : '';
    
    opcoesList.innerHTML = `
        <div class="opcao-item">
            <input type="text" placeholder="Digite uma opção de resposta..." class="opcao-input" ${requiredAttr}>
            <button type="button" class="btn-remove-opcao" onclick="removerOpcao(this)">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    atualizarInterfaceTipo();
    atualizarSugestaoOrdem();
}

// Carregar perguntas cadastradas - versão corrigida
function carregarPerguntas() {
    console.log('🔄 CARREGANDO PERGUNTAS - INÍCIO DA FUNÇÃO');
    
    fetch('/api/perguntas')
        .then(response => {
            console.log('📡 Status da resposta:', response.status);
            console.log('📡 Response ok:', response.ok);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            return response.json();
        })
        .then(result => {
            console.log('📡 Resposta da API completa:', result);
            
            if (result.success) {
                perguntasCadastradas = result.perguntas || [];
                console.log('✅ Perguntas carregadas:', perguntasCadastradas.length);
                console.log('📋 Dados das perguntas:', perguntasCadastradas);
                
                // Forçar exibição
                console.log('🎯 Chamando exibirPerguntasRecentes...');
                exibirPerguntasRecentes();
                atualizarSugestaoOrdem();
            } else {
                console.error('❌ Erro ao carregar perguntas:', result.message);
            }
        })
        .catch(error => {
            console.error('❌ Erro ao carregar perguntas:', error);
            console.error('❌ Stack trace:', error.stack);
            console.error('❌ Error name:', error.name);
            console.error('❌ Error message:', error.message);
        });
}

// Exibir perguntas recentes
function exibirPerguntasRecentes() {
    console.log('🔍 Exibindo perguntas recentes...', perguntasCadastradas.length, 'perguntas');
    
    const container = document.getElementById('perguntas-recentes');
    
    if (!container) {
        console.error('❌ Container de perguntas recentes não encontrado');
        return;
    }
    
    console.log('✅ Container encontrado:', container);
    
    if (perguntasCadastradas.length === 0) {
        console.log('📝 Nenhuma pergunta cadastrada, exibindo mensagem vazia');
        container.innerHTML = `
            <div style="text-align:center;padding:40px;color:#999;">
                <p>❓ Nenhuma pergunta cadastrada ainda</p>
                <p style="font-size:0.85em;">Cadastre perguntas para vê-las aqui</p>
            </div>
        `;
        return;
    }
    
    // Ordenar por ordem de exibição
    const perguntasOrdenadas = [...perguntasCadastradas].sort((a, b) => a.ordem - b.ordem);
    
    // Mostrar apenas as 5 mais recentes
    const perguntasRecentes = perguntasOrdenadas.slice(0, 5);
    
    const perguntasHTML = perguntasRecentes.map(pergunta => `
        <div class="pergunta-card">
            <div class="pergunta-header">
                <h4>${pergunta.pergunta}</h4>
                <span class="pergunta-ordem">#${pergunta.ordem}</span>
            </div>
            <div class="pergunta-info">
                <span class="pergunta-tipo">${obterLabelTipo(pergunta.tipo)}</span>
                ${pergunta.opcoes && pergunta.opcoes.length > 0 ? `
                    <span class="pergunta-opcoes-count">${pergunta.opcoes.length} opções</span>
                ` : ''}
            </div>
        </div>
    `).join('');
    
    console.log('📝 HTML gerado:', perguntasHTML);
    container.innerHTML = perguntasHTML;
    console.log('✅ HTML inserido no container');
}

// Sugerir próxima ordem disponível
function sugerirProximaOrdem() {
    if (perguntasCadastradas.length === 0) {
        return 1;
    }
    
    const ordensExistentes = perguntasCadastradas.map(p => p.ordem).sort((a, b) => a - b);
    let proximaOrdem = 1;
    
    for (let ordem of ordensExistentes) {
        if (ordem === proximaOrdem) {
            proximaOrdem++;
        } else {
            break;
        }
    }
    
    return proximaOrdem;
}

// Obter label do tipo de pergunta
function obterLabelTipo(tipo) {
    const labels = {
        'multipla-escolha': 'Múltipla Escolha',
        'texto-livre': 'Texto Livre'
    };
    return labels[tipo] || tipo;
}

// Função de teste para debug
function testeExibicaoPerguntas() {
    console.log('🧪 TESTE: Verificando exibição de perguntas...');
    console.log('📊 Perguntas cadastradas:', perguntasCadastradas.length);
    console.log('📋 Dados das perguntas:', perguntasCadastradas);
    
    const container = document.getElementById('perguntas-recentes');
    console.log('🎯 Container encontrado:', !!container);
    
    if (container) {
        console.log('📦 Conteúdo atual do container:', container.innerHTML);
    }
    
    // Forçar exibição
    exibirPerguntasRecentes();
}

// Função para forçar recarregamento das perguntas
async function forcarRecarregamentoPerguntas() {
    console.log('🔄 FORÇANDO recarregamento das perguntas...');
    await carregarPerguntas();
}

// Atualizar placeholder da ordem com sugestão
function atualizarSugestaoOrdem() {
    const ordemInput = document.getElementById('ordem');
    if (ordemInput) {
        const proximaOrdem = sugerirProximaOrdem();
        ordemInput.placeholder = proximaOrdem.toString();
        ordemInput.title = `Sugestão: ${proximaOrdem}. Ordens existentes: ${perguntasCadastradas.map(p => p.ordem).join(', ')}`;
    }
}

// Preencher próxima ordem automaticamente
function preencherProximaOrdem() {
    const ordemInput = document.getElementById('ordem');
    if (ordemInput) {
        const proximaOrdem = sugerirProximaOrdem();
        ordemInput.value = proximaOrdem;
        ordemInput.focus();
        mostrarMensagem(`Ordem ${proximaOrdem} preenchida automaticamente`, 'info');
    }
}

// Função para editar pergunta (futura implementação)
function editarPergunta(id) {
    console.log('Editar pergunta:', id);
    // Implementar edição futuramente
}

// Função para excluir pergunta (futura implementação)
function excluirPergunta(id) {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
        console.log('Excluir pergunta:', id);
        // Implementar exclusão futuramente
    }
}

// Função para mostrar mensagens
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

// Adicionar animações CSS se não existirem
if (!document.querySelector('#perguntas-animations')) {
    const style = document.createElement('style');
    style.id = 'perguntas-animations';
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

// Função alternativa simples para teste
function carregarPerguntasSimples() {
    console.log('🧪 TESTE SIMPLES: Iniciando carregamento...');
    
    fetch('/api/perguntas')
        .then(response => {
            console.log('🧪 TESTE SIMPLES: Resposta recebida:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('🧪 TESTE SIMPLES: Dados recebidos:', data);
            if (data.success) {
                perguntasCadastradas = data.perguntas || [];
                console.log('🧪 TESTE SIMPLES: Perguntas carregadas:', perguntasCadastradas.length);
                exibirPerguntasRecentes();
            }
        })
        .catch(error => {
            console.error('🧪 TESTE SIMPLES: Erro:', error);
        });
}
