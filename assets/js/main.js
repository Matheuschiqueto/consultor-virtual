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
            
            // Carregar produtos recentes se estiver na página de cadastro
            setTimeout(() => {
                if (document.querySelector('.recent-section') && typeof atualizarProdutosRecentes === 'function') {
                    atualizarProdutosRecentes();
                }
            }, 100);
            
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