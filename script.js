import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.12.0/+esm';

const supabaseUrl = 'https://akpmbgyrnoqvgegwnciz.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcG1iZ3lybm9xdmdlZ3duY2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzE5NDAsImV4cCI6MjA1MDI0Nzk0MH0.mbN5DB16tfc_iQ6-chS2dUI7-0wc23KWQB-TcWib4t8';
const supabase = createClient('https://akpmbgyrnoqvgegwnciz.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFrcG1iZ3lybm9xdmdlZ3duY2l6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ2NzE5NDAsImV4cCI6MjA1MDI0Nzk0MH0.mbN5DB16tfc_iQ6-chS2dUI7-0wc23KWQB-TcWib4t8');

let currentCategory = "camisas";
let favorites = JSON.parse(sessionStorage.getItem('favorites')) || []; // Carrega favoritos do sessionStorage
let displayedProducts = []; // Variável para armazenar os produtos exibidos

// Função para salvar os favoritos no sessionStorage
function saveFavorites() {
    console.log("Salvando favoritos no sessionStorage", favorites); // Depuração
    sessionStorage.setItem('favorites', JSON.stringify(favorites));
}

// Verifica se os favoritos estão sendo carregados corretamente
console.log("Favoritos carregados:", favorites); // Depuração

async function fetchProducts() {
    const { data, error } = await supabase.from('produtos').select('*');
    if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
    }
    return data.map(product => ({
        id: product.id,
        name: product.nome,
        price: `R$${parseFloat(product.preco).toFixed(2)}`,
        size: product.tamanho,
        image: product.imagem_url,
        images: product.imagens_url ? product.imagens_url.split(', ') : [],
        category: product.categoria,
    }));
}

async function loadProductsByCategory(category) {
    currentCategory = category;
    const products = await fetchProducts();
    const filteredProducts = products.filter(product => product.category === category);
    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const grid = document.getElementById("productGrid");
    const message = document.getElementById("searchMessage");
    grid.innerHTML = "";

    if (products.length === 0) {
        message.textContent = "Não encontrou o que procurava? Contate-nos no instagram! @Magrin_Store";
        return;
    } else {
        message.textContent = "";
    }

    products.forEach((product) => {
        const productItem = `
            <div class="jersey-item">
                <img src="${product.images.length > 0 ? product.images[0] : product.image}" alt="${product.name}" onclick="expandImage('${product.images.length > 0 ? product.images[0] : product.image}')">
                <p><strong>Nome:</strong> ${product.name}</p>
                <p><strong>Preço:</strong> ${product.price}</p>
                <p><strong>Tamanho:</strong> ${product.size}</p>
                <button class="product-button" onclick="showProductDetails('${product.id}')">Ver Detalhes</button>
            </div>
        `;
        grid.innerHTML += productItem;
    });
}


//  caso queira o botão de volta colocar abaixo do botão de favoritos:
//  <button class="product-button" onclick="addToFavorites('${product.id}')">Adicionar aos Favoritos</button>


function searchItems(event) {
    event.preventDefault();
    const query = document.getElementById("searchInput").value.toLowerCase();
    fetchProducts().then(products => {
        const filteredProducts = products.filter(product =>
            product.name.toLowerCase().includes(query) &&
            product.category === currentCategory
        );
        displayProducts(filteredProducts);
    });
}

document.addEventListener("DOMContentLoaded", () => {
    loadProductsByCategory("camisas");
});


// *************************************************************************************
// *************************************************************************************
// *************************************************************************************
// *************************************************************************************

async function showProductDetails(productId) {
    console.log("Exibindo detalhes para o produto ID:", productId);

    // Busca os detalhes do produto no banco de dados
    const { data: product, error } = await supabase
        .from('produtos')
        .select('*')
        .eq('id', productId)
        .single();  // Garantir que traga apenas um único produto

    if (error) {
        console.error("Erro ao buscar detalhes do produto:", error);
        return;
    }

    const modal = document.getElementById("detailsModal");
    const modalContent = document.getElementById("detailsModalContent");

    if (!modal || !modalContent) {
        console.log("Modal ou conteúdo do modal não encontrado!");
        return;
    }

    let imagesHTML = "";
    if (product.imagens_url) {
        imagesHTML = ` 
            <p><strong>Imagens do Produto:</strong></p>
            <div class="images-container">
                ${product.imagens_url.split(', ').map(image => 
                    `<img src="${image}" alt="Imagem do produto" class="product-image" onclick="expandImage('${image}')">`
                ).join("")}
            </div>
        `;
    }

    const instagramMessageHTML = `
        <p><strong>Caso se interesse no produto, você pode fazer a compra pelo Instagram!</strong></p>
        <a href="https://www.instagram.com/magrin_store/" target="_blank">
            <img src="images/instagram-logo.png" alt="Instagram" class="instagram-logo">
        </a>
    `;

    modalContent.innerHTML = `
        <h2>${product.nome}</h2>
        <p><strong>Preço:</strong> R$${parseFloat(product.preco).toFixed(2)}</p>
        <p><strong>Tamanho:</strong> ${product.tamanho}</p>
        ${product.modelo ? `<p><strong>Modelo:</strong> ${product.modelo}</p>` : ""}
        ${imagesHTML}
        ${instagramMessageHTML}
        <button onclick="closeProductDetails()">Fechar</button>
    `;

    modal.style.display = "flex"; 
    console.log("Modal foi exibido, display:", modal.style.display); // Verificação do display
}



function closeProductDetails() {
    const modal = document.getElementById("detailsModal");
    modal.style.display = "none"; // Esconde o modal
}

// Função para exibir o modal de imagem
function expandImage(imageSrc) {
    const modal = document.getElementById("imageModal");
    const modalImg = document.getElementById("imageModalImg");
    modalImg.src = imageSrc;
    modal.style.display = "flex";
}

// Função para fechar o modal de imagem
function closeImageModal() {
    const modal = document.getElementById("imageModal");
    modal.style.display = "none";
}

// Adicionar evento de clique ao botão de fechar
document.getElementById("imageModalClose").onclick = closeImageModal;

// Adicionar evento de clique fora da imagem para fechar o modal
document.getElementById("imageModal").onclick = (e) => {
    if (e.target === document.getElementById("imageModal")) {
        closeImageModal();
    }
};



window.loadProductsByCategory = loadProductsByCategory;
window.searchItems = searchItems;
window.showProductDetails = showProductDetails;
window.closeProductDetails = closeProductDetails;
window.expandImage = expandImage;
window.closeImageModal = closeImageModal;
