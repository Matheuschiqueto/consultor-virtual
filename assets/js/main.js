// Elementos do DOM
const menuToggle = document.getElementById('menuToggle');
const sidebar = document.querySelector('.sidebar');
const mainContent = document.querySelector('.main-content');
const pageContent = document.getElementById('pageContent');
const navLinks = document.querySelectorAll('.nav-link');

// Toggle do menu mobile
menuToggle?.addEventListener('click', () => {
    sidebar.classList.toggle('active');
});

// Navegação SPA (Single Page Application)
navLinks.forEach(link => {
    link.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = link.getAttribute('data-page');
        
        // Remove classe active de todos os links
        navLinks.forEach(l => l.classList.remove('active'));
        // Adiciona classe active ao link clicado
        link.classList.add('active');

        try {
            // Carrega o conteúdo da página
            const response = await fetch(link.href);
            const html = await response.text();
            
            // Extrai o conteúdo principal (dentro do body)
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            const content = doc.body.innerHTML;
            
            // Atualiza o conteúdo
            pageContent.innerHTML = content;
            
            // Atualiza o título da página
            document.title = doc.title;
            
            // Fecha o menu mobile após a navegação
            sidebar.classList.remove('active');
            
            // Reinicializar funcionalidades após carregar nova página
            if (typeof initCadastroProdutos === 'function') {
                initCadastroProdutos();
            }
            if (typeof initListaProdutos === 'function') {
                initListaProdutos();
            }
            
            // Carregar perguntas se estivermos na página de perguntas
            if (page === 'cadastro-perguntas') {
                console.log('🔄 Main.js: Carregando página de perguntas...');
                setTimeout(() => {
                    // Verificar se as funções existem antes de chamar
                    if (typeof configurarEventos === 'function') {
                        console.log('✅ Main.js: Chamando configurarEventos()');
                        configurarEventos();
                    }
                    if (typeof atualizarInterfaceTipo === 'function') {
                        console.log('✅ Main.js: Chamando atualizarInterfaceTipo()');
                        atualizarInterfaceTipo();
                    }
                    if (typeof carregarPerguntas === 'function') {
                        console.log('✅ Main.js: Chamando carregarPerguntas()');
                        console.log('🔍 Main.js: Função carregarPerguntas existe:', typeof carregarPerguntas);
                        console.log('🔍 Main.js: Função carregarPerguntas:', carregarPerguntas.toString().substring(0, 100));
                        
                        try {
                            console.log('🔄 Main.js: ANTES de chamar carregarPerguntas()');
                            const resultado = carregarPerguntas();
                            console.log('🔄 Main.js: DEPOIS de chamar carregarPerguntas(), resultado:', resultado);
                            console.log('✅ Main.js: carregarPerguntas() chamada com sucesso');
                        } catch (error) {
                            console.error('❌ Main.js: Erro ao chamar carregarPerguntas():', error);
                            console.error('❌ Main.js: Stack trace:', error.stack);
                        }
                    } else {
                        console.error('❌ Main.js: Função carregarPerguntas não encontrada');
                    }
                    
                    // Teste adicional após 1 segundo
                    setTimeout(() => {
                        console.log('🧪 Main.js: Teste adicional após 1 segundo...');
                        if (typeof testeExibicaoPerguntas === 'function') {
                            testeExibicaoPerguntas();
                        }
                        
                        // Teste com função simples
                        if (typeof carregarPerguntasSimples === 'function') {
                            console.log('🧪 Main.js: Testando função simples...');
                            carregarPerguntasSimples();
                        }
                    }, 1000);
                }, 300);
            }
            
            // Carregar lista de perguntas se estivermos na página de perguntas cadastradas
            if (page === 'perguntas-cadastradas') {
                console.log('🔄 Main.js: Carregando página de perguntas cadastradas...');
                setTimeout(() => {
                    if (typeof initListaPerguntas === 'function') {
                        console.log('✅ Main.js: Chamando initListaPerguntas()');
                        initListaPerguntas();
                    } else {
                        console.error('❌ Main.js: Função initListaPerguntas não encontrada');
                    }
                }, 300);
            }
            
            // Carregar produtos recentes se estiver na página de cadastro de produtos
            setTimeout(() => {
                if (document.querySelector('.recent-section') && typeof atualizarProdutosRecentes === 'function') {
                    // Só atualizar se estivermos na página de produtos
                    const isProdutosPage = document.querySelector('#formCadastroProduto') || document.querySelector('.product-list');
                    if (isProdutosPage) {
                        atualizarProdutosRecentes();
                    }
                }
            }, 100);
            
            // Inicializar chat se estivermos na página de chat
            if (page === 'chat') {
                console.log('🤖 Main.js: Carregando página de chat...');
                setTimeout(() => {
                    if (typeof initChat === 'function') {
                        console.log('✅ Main.js: Chamando initChat()');
                        initChat();
                    } else {
                        console.error('❌ Main.js: Função initChat não encontrada');
                    }
                }, 300);
            }
            
        } catch (error) {
            console.error('Erro ao carregar a página:', error);
            pageContent.innerHTML = '<p>Erro ao carregar o conteúdo. Tente novamente.</p>';
        }
    });
});

// Marca o link ativo com base na URL atual
function setActiveLink() {
    const currentPath = window.location.pathname;
    navLinks.forEach(link => {
        if (link.href.includes(currentPath)) {
            link.classList.add('active');
        }
    });
}

// Inicializa o link ativo
setActiveLink();