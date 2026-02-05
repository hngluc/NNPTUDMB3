// API URL
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');
const tableContainerEl = document.getElementById('table-container');
const productTableBodyEl = document.getElementById('product-table-body');
const productCountEl = document.getElementById('product-count');
const modalImageEl = document.getElementById('modalImage');
const imageModalLabelEl = document.getElementById('imageModalLabel');

// Fetch products from API
async function fetchProducts() {
    try {
        showLoading();

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        displayProducts(products);

    } catch (error) {
        showError(`Không thể tải dữ liệu sản phẩm: ${error.message}`);
        console.error('Error fetching products:', error);
    }
}

// Show loading spinner
function showLoading() {
    loadingEl.classList.remove('d-none');
    errorEl.classList.add('d-none');
    tableContainerEl.classList.add('d-none');
}

// Show error message
function showError(message) {
    loadingEl.classList.add('d-none');
    errorEl.classList.remove('d-none');
    tableContainerEl.classList.add('d-none');
    errorMessageEl.textContent = message;
}

// Display products in table
function displayProducts(products) {
    loadingEl.classList.add('d-none');
    errorEl.classList.add('d-none');
    tableContainerEl.classList.remove('d-none');

    // Clear existing content
    productTableBodyEl.innerHTML = '';

    // Update product count
    productCountEl.textContent = products.length;

    // Create table rows
    products.forEach((product, index) => {
        const row = createProductRow(product, index);
        productTableBodyEl.appendChild(row);
    });
}

// Create a table row for a product
function createProductRow(product, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.03}s`;

    // ID Column
    const idCell = document.createElement('td');
    idCell.className = 'text-center';
    idCell.innerHTML = `<span class="id-badge">${product.id}</span>`;

    // Title Column
    const titleCell = document.createElement('td');
    titleCell.innerHTML = `<span class="product-title" title="${escapeHtml(product.title)}">${escapeHtml(product.title)}</span>`;

    // Price Column
    const priceCell = document.createElement('td');
    priceCell.className = 'text-end';
    priceCell.innerHTML = `<span class="price-badge">$${formatPrice(product.price)}</span>`;

    // Category Column
    const categoryCell = document.createElement('td');
    categoryCell.innerHTML = createCategoryBadge(product.category);

    // Images Column
    const imagesCell = document.createElement('td');
    imagesCell.innerHTML = createImageGallery(product.images, product.title);

    // Append all cells
    row.appendChild(idCell);
    row.appendChild(titleCell);
    row.appendChild(priceCell);
    row.appendChild(categoryCell);
    row.appendChild(imagesCell);

    return row;
}

// Create category badge HTML
function createCategoryBadge(category) {
    if (!category) {
        return '<span class="badge bg-secondary">N/A</span>';
    }

    const categoryColors = {
        'Clothes': 'bg-info',
        'Electronics': 'bg-warning',
        'Furniture': 'bg-success',
        'Shoes': 'bg-danger',
        'Miscellaneous': 'bg-secondary'
    };

    const colorClass = categoryColors[category.name] || 'bg-primary';
    const categoryImage = category.image || '';

    return `
        <span class="category-badge ${colorClass} text-white">
            ${categoryImage ? `<img src="${categoryImage}" alt="${escapeHtml(category.name)}" class="category-icon" onerror="this.style.display='none'">` : ''}
            ${escapeHtml(category.name || 'N/A')}
        </span>
    `;
}

// Create image gallery HTML
function createImageGallery(images, productTitle) {
    if (!images || images.length === 0) {
        return '<span class="text-muted"><i class="bi bi-image"></i> Không có ảnh</span>';
    }

    // Show max 3 images
    const displayImages = images.slice(0, 3);

    const imagesHtml = displayImages.map((image, index) => {
        // Clean the image URL (remove brackets if present)
        const cleanUrl = cleanImageUrl(image);

        return `
            <img 
                src="${cleanUrl}" 
                alt="${escapeHtml(productTitle)} - Image ${index + 1}" 
                class="product-thumbnail"
                data-bs-toggle="modal" 
                data-bs-target="#imageModal"
                onclick="showImageInModal('${cleanUrl}', '${escapeHtml(productTitle)}')"
                onerror="this.src='https://via.placeholder.com/60x60?text=No+Image'"
            >
        `;
    }).join('');

    return `<div class="image-gallery">${imagesHtml}</div>`;
}

// Clean image URL (remove brackets and quotes if present)
function cleanImageUrl(url) {
    if (typeof url !== 'string') return 'https://via.placeholder.com/60x60?text=No+Image';

    // Remove brackets and quotes
    let cleanUrl = url.replace(/[\[\]"']/g, '');

    // Trim whitespace
    cleanUrl = cleanUrl.trim();

    // Validate URL
    if (!cleanUrl.startsWith('http')) {
        return 'https://via.placeholder.com/60x60?text=No+Image';
    }

    return cleanUrl;
}

// Show image in modal
function showImageInModal(imageUrl, productTitle) {
    modalImageEl.src = imageUrl;
    imageModalLabelEl.textContent = productTitle;
}

// Format price with commas
function formatPrice(price) {
    if (typeof price !== 'number') return '0.00';
    return price.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

// Escape HTML to prevent XSS
function escapeHtml(text) {
    if (!text) return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', function () {
    fetchProducts();
});
