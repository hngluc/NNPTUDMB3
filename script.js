// API URL
const API_URL = 'https://api.escuelajs.co/api/v1/products';

// Store all products for search
let allProducts = [];
let filteredProducts = [];

// Pagination variables
let currentPage = 1;
let itemsPerPage = 10;

// Sorting variables
let sortColumn = null; // 'title' or 'price'
let sortDirection = 'asc'; // 'asc' or 'desc'

// DOM Elements
const loadingEl = document.getElementById('loading');
const errorEl = document.getElementById('error');
const errorMessageEl = document.getElementById('error-message');
const tableContainerEl = document.getElementById('table-container');
const productTableBodyEl = document.getElementById('product-table-body');
const productCountEl = document.getElementById('product-count');
const modalImageEl = document.getElementById('modalImage');
const imageModalLabelEl = document.getElementById('imageModalLabel');
const searchInputEl = document.getElementById('searchInput');
const clearSearchEl = document.getElementById('clearSearch');
const searchResultEl = document.getElementById('searchResult');

// Pagination DOM Elements
const itemsPerPageEl = document.getElementById('itemsPerPage');
const paginationEl = document.getElementById('pagination');
const showingStartEl = document.getElementById('showing-start');
const showingEndEl = document.getElementById('showing-end');

// Export DOM Element
const exportCsvEl = document.getElementById('exportCsv');

// Product Detail Modal DOM Elements
const productDetailModal = document.getElementById('productDetailModal');
const detailImagesEl = document.getElementById('detailImages');
const detailIdEl = document.getElementById('detailId');
const detailTitleEl = document.getElementById('detailTitle');
const detailPriceEl = document.getElementById('detailPrice');
const detailCategoryEl = document.getElementById('detailCategory');
const detailDescriptionEl = document.getElementById('detailDescription');
const viewModeEl = document.getElementById('viewMode');
const editModeEl = document.getElementById('editMode');
const viewModeButtonsEl = document.getElementById('viewModeButtons');
const editModeButtonsEl = document.getElementById('editModeButtons');
const updateLoadingEl = document.getElementById('updateLoading');
const btnEditProductEl = document.getElementById('btnEditProduct');
const btnCancelEditEl = document.getElementById('btnCancelEdit');
const btnSaveProductEl = document.getElementById('btnSaveProduct');
const editProductIdEl = document.getElementById('editProductId');
const editTitleEl = document.getElementById('editTitle');
const editPriceEl = document.getElementById('editPrice');
const editDescriptionEl = document.getElementById('editDescription');

// Current selected product
let currentProduct = null;

// Fetch products from API
async function fetchProducts() {
    try {
        showLoading();

        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const products = await response.json();
        allProducts = products; // Store all products for search
        filteredProducts = products; // Initialize filtered products
        currentPage = 1;
        displayProducts();

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

// Display products in table with pagination
function displayProducts() {
    loadingEl.classList.add('d-none');
    errorEl.classList.add('d-none');
    tableContainerEl.classList.remove('d-none');

    // Clear existing content
    productTableBodyEl.innerHTML = '';

    // Calculate pagination
    const totalProducts = filteredProducts.length;
    const totalPages = Math.ceil(totalProducts / itemsPerPage);

    // Ensure current page is valid
    if (currentPage > totalPages) currentPage = totalPages;
    if (currentPage < 1) currentPage = 1;

    // Get products for current page
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, totalProducts);
    const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

    // Update product count and showing info
    productCountEl.textContent = totalProducts;
    showingStartEl.textContent = totalProducts > 0 ? startIndex + 1 : 0;
    showingEndEl.textContent = endIndex;

    // Create table rows
    paginatedProducts.forEach((product, index) => {
        const row = createProductRow(product, index);
        productTableBodyEl.appendChild(row);
    });

    // Render pagination
    renderPagination(totalPages);
}

// Render pagination buttons
function renderPagination(totalPages) {
    paginationEl.innerHTML = '';

    if (totalPages <= 1) return;

    // Previous button
    const prevLi = document.createElement('li');
    prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
    prevLi.innerHTML = `<a class="page-link" href="#" aria-label="Previous"><i class="bi bi-chevron-left"></i></a>`;
    prevLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage > 1) goToPage(currentPage - 1);
    });
    paginationEl.appendChild(prevLi);

    // Page numbers
    const maxVisiblePages = 5;
    let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    if (endPage - startPage + 1 < maxVisiblePages) {
        startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // First page + ellipsis
    if (startPage > 1) {
        paginationEl.appendChild(createPageItem(1));
        if (startPage > 2) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationEl.appendChild(ellipsis);
        }
    }

    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
        paginationEl.appendChild(createPageItem(i));
    }

    // Last page + ellipsis
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            const ellipsis = document.createElement('li');
            ellipsis.className = 'page-item disabled';
            ellipsis.innerHTML = '<span class="page-link">...</span>';
            paginationEl.appendChild(ellipsis);
        }
        paginationEl.appendChild(createPageItem(totalPages));
    }

    // Next button
    const nextLi = document.createElement('li');
    nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
    nextLi.innerHTML = `<a class="page-link" href="#" aria-label="Next"><i class="bi bi-chevron-right"></i></a>`;
    nextLi.addEventListener('click', (e) => {
        e.preventDefault();
        if (currentPage < totalPages) goToPage(currentPage + 1);
    });
    paginationEl.appendChild(nextLi);
}

// Create a page item
function createPageItem(pageNum) {
    const li = document.createElement('li');
    li.className = `page-item ${pageNum === currentPage ? 'active' : ''}`;
    li.innerHTML = `<a class="page-link" href="#">${pageNum}</a>`;
    li.addEventListener('click', (e) => {
        e.preventDefault();
        goToPage(pageNum);
    });
    return li;
}

// Go to specific page
function goToPage(page) {
    currentPage = page;
    displayProducts();
    initTooltips();
    // Scroll to top of table
    tableContainerEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Create a table row for a product
function createProductRow(product, index) {
    const row = document.createElement('tr');
    row.style.animationDelay = `${index * 0.03}s`;
    row.classList.add('clickable-row');
    row.setAttribute('data-product-id', product.id);

    // Add tooltip with description on hover
    const description = product.description || 'Không có mô tả';
    row.setAttribute('data-bs-toggle', 'tooltip');
    row.setAttribute('data-bs-placement', 'top');
    row.setAttribute('data-bs-html', 'true');
    row.setAttribute('title', `<strong>Mô tả:</strong><br>${escapeHtml(description)}`);

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

// Initialize Bootstrap tooltips
function initTooltips() {
    // Dispose existing tooltips first
    const existingTooltips = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    existingTooltips.forEach(function (el) {
        const tooltip = bootstrap.Tooltip.getInstance(el);
        if (tooltip) {
            tooltip.dispose();
        }
    });

    // Initialize new tooltips
    const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]');
    tooltipTriggerList.forEach(function (tooltipTriggerEl) {
        new bootstrap.Tooltip(tooltipTriggerEl, {
            container: 'body',
            trigger: 'hover'
        });
    });
}

// Handle search input
function handleSearch() {
    const searchTerm = searchInputEl.value.toLowerCase().trim();

    if (searchTerm === '') {
        // If search is empty, show all products
        filteredProducts = allProducts;
        searchResultEl.classList.add('d-none');
    } else {
        // Filter products by title
        filteredProducts = allProducts.filter(product =>
            product.title.toLowerCase().includes(searchTerm)
        );

        // Show search result count
        searchResultEl.classList.remove('d-none');
        searchResultEl.textContent = `Tìm thấy ${filteredProducts.length} sản phẩm`;
    }

    // Reset to first page when searching
    currentPage = 1;
    displayProducts();

    // Re-initialize tooltips after updating the table
    initTooltips();
}

// Clear search
function clearSearch() {
    searchInputEl.value = '';
    searchResultEl.classList.add('d-none');
    filteredProducts = allProducts;
    currentPage = 1;
    sortColumn = null; // Reset sorting when clearing search
    displayProducts();
    updateSortIcons();
    initTooltips();
    searchInputEl.focus();
}

// Sort products by column
function sortProducts(column) {
    // Toggle direction if same column, otherwise set to ascending
    if (sortColumn === column) {
        sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
        sortColumn = column;
        sortDirection = 'asc';
    }

    // Sort the filtered products
    filteredProducts.sort((a, b) => {
        let valueA, valueB;

        if (column === 'title') {
            valueA = (a.title || '').toLowerCase();
            valueB = (b.title || '').toLowerCase();
        } else if (column === 'price') {
            valueA = a.price || 0;
            valueB = b.price || 0;
        }

        let comparison = 0;
        if (valueA > valueB) comparison = 1;
        else if (valueA < valueB) comparison = -1;

        return sortDirection === 'desc' ? -comparison : comparison;
    });

    // Reset to first page and update display
    currentPage = 1;
    displayProducts();
    updateSortIcons();
    initTooltips();
}

// Update sort icons in table headers
function updateSortIcons() {
    const sortableHeaders = document.querySelectorAll('.sortable');

    sortableHeaders.forEach(header => {
        const icon = header.querySelector('.sort-icon');
        const column = header.getAttribute('data-sort');

        if (column === sortColumn) {
            icon.className = sortDirection === 'asc'
                ? 'bi bi-sort-up sort-icon active'
                : 'bi bi-sort-down sort-icon active';
        } else {
            icon.className = 'bi bi-arrow-down-up sort-icon';
        }
    });
}

// Export current view to CSV
function exportToCsv() {
    if (filteredProducts.length === 0) {
        alert('Không có dữ liệu để xuất!');
        return;
    }

    // CSV Headers
    const headers = ['ID', 'Title', 'Price', 'Category', 'Description'];

    // Build CSV content
    const csvRows = [];

    // Add header row
    csvRows.push(headers.join(','));

    // Add data rows
    filteredProducts.forEach(product => {
        const row = [
            product.id,
            `"${escapeCsvValue(product.title)}"`,
            product.price,
            `"${escapeCsvValue(product.category?.name || 'N/A')}"`,
            `"${escapeCsvValue(product.description || '')}"`
        ];
        csvRows.push(row.join(','));
    });

    // Create CSV string with BOM for Excel compatibility
    const BOM = '\uFEFF';
    const csvContent = BOM + csvRows.join('\n');

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');

    // Generate filename with timestamp
    const timestamp = new Date().toISOString().slice(0, 19).replace(/[:.]/g, '-');
    link.setAttribute('href', url);
    link.setAttribute('download', `products_${timestamp}.csv`);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Cleanup
    URL.revokeObjectURL(url);
}

// Escape CSV value to handle special characters
function escapeCsvValue(value) {
    if (!value) return '';
    // Replace double quotes with two double quotes and remove line breaks
    return String(value)
        .replace(/"/g, '""')
        .replace(/\r?\n/g, ' ');
}

// Show product detail in modal
function showProductDetail(productId) {
    // Find the product by ID
    currentProduct = allProducts.find(p => p.id === productId);

    if (!currentProduct) {
        console.error('Product not found:', productId);
        return;
    }

    // Reset to view mode
    switchToViewMode();

    // Populate detail view
    detailIdEl.textContent = `ID: ${currentProduct.id}`;
    detailTitleEl.textContent = currentProduct.title || 'N/A';
    detailPriceEl.textContent = `$${formatPrice(currentProduct.price)}`;
    detailCategoryEl.innerHTML = createCategoryBadge(currentProduct.category);
    detailDescriptionEl.textContent = currentProduct.description || 'Không có mô tả';

    // Populate images carousel
    detailImagesEl.innerHTML = '';
    const images = currentProduct.images || [];

    if (images.length > 0) {
        images.forEach((image, index) => {
            const cleanUrl = cleanImageUrl(image);
            const carouselItem = document.createElement('div');
            carouselItem.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            carouselItem.innerHTML = `
                <img src="${cleanUrl}" alt="${escapeHtml(currentProduct.title)} - Image ${index + 1}" 
                     onerror="this.src='https://via.placeholder.com/400x300?text=No+Image'">
            `;
            detailImagesEl.appendChild(carouselItem);
        });
    } else {
        detailImagesEl.innerHTML = `
            <div class="carousel-item active">
                <img src="https://via.placeholder.com/400x300?text=No+Image" alt="No Image">
            </div>
        `;
    }

    // Show the modal
    const modal = new bootstrap.Modal(productDetailModal);
    modal.show();
}

// Switch to edit mode
function switchToEditMode() {
    viewModeEl.classList.add('d-none');
    editModeEl.classList.remove('d-none');
    viewModeButtonsEl.classList.add('d-none');
    editModeButtonsEl.classList.remove('d-none');
    updateLoadingEl.classList.add('d-none');

    // Populate edit form with current product data
    editProductIdEl.value = currentProduct.id;
    editTitleEl.value = currentProduct.title || '';
    editPriceEl.value = currentProduct.price || 0;
    editDescriptionEl.value = currentProduct.description || '';
}

// Switch to view mode
function switchToViewMode() {
    viewModeEl.classList.remove('d-none');
    editModeEl.classList.add('d-none');
    viewModeButtonsEl.classList.remove('d-none');
    editModeButtonsEl.classList.add('d-none');
    updateLoadingEl.classList.add('d-none');
}

// Update product via API
async function updateProduct() {
    const productId = editProductIdEl.value;
    const updatedData = {
        title: editTitleEl.value.trim(),
        price: parseFloat(editPriceEl.value),
        description: editDescriptionEl.value.trim(),
        categoryId: currentProduct.category?.id || null // Include categoryId
    };

    // Validate
    if (!updatedData.title) {
        showToast('Vui lòng nhập tên sản phẩm!', 'danger');
        return;
    }

    if (updatedData.price < 0 || isNaN(updatedData.price)) {
        showToast('Giá sản phẩm không hợp lệ!', 'danger');
        return;
    }

    // Show loading
    viewModeEl.classList.add('d-none');
    editModeEl.classList.add('d-none');
    viewModeButtonsEl.classList.add('d-none');
    editModeButtonsEl.classList.add('d-none');
    updateLoadingEl.classList.remove('d-none');

    try {
        const response = await fetch(`${API_URL}/${productId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updatedData)
        });

        // Handle different error status codes
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));

            // Handle 500 error - API may not allow updating some products
            if (response.status === 500) {
                throw new Error('Server không thể xử lý yêu cầu. Một số sản phẩm có thể không cho phép cập nhật.');
            } else if (response.status === 400) {
                throw new Error(errorData.message || 'Dữ liệu không hợp lệ');
            } else if (response.status === 404) {
                throw new Error('Không tìm thấy sản phẩm');
            } else {
                throw new Error(`Lỗi HTTP: ${response.status}`);
            }
        }

        const result = await response.json();

        // Update the product in our local arrays
        const updateInArray = (arr) => {
            const index = arr.findIndex(p => p.id === parseInt(productId));
            if (index !== -1) {
                arr[index] = { ...arr[index], ...updatedData };
            }
        };

        updateInArray(allProducts);
        updateInArray(filteredProducts);

        // Update current product
        currentProduct = { ...currentProduct, ...updatedData };

        // Refresh the display
        displayProducts();
        initTooltips();

        // Update detail view and switch back to view mode
        detailTitleEl.textContent = currentProduct.title;
        detailPriceEl.textContent = `$${formatPrice(currentProduct.price)}`;
        detailDescriptionEl.textContent = currentProduct.description || 'Không có mô tả';

        switchToViewMode();

        // Show success message
        showToast('Cập nhật sản phẩm thành công!', 'success');

    } catch (error) {
        console.error('Error updating product:', error);
        showToast(error.message || 'Lỗi khi cập nhật sản phẩm', 'danger');
        switchToEditMode();
    }
}

// Show toast notification
function showToast(message, type = 'success') {
    // Create toast container if not exists
    let toastContainer = document.querySelector('.toast-container');
    if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.className = 'toast-container';
        document.body.appendChild(toastContainer);
    }

    // Create toast element
    const toastId = 'toast-' + Date.now();
    const iconClass = type === 'success' ? 'bi-check-circle' : (type === 'warning' ? 'bi-exclamation-circle' : 'bi-exclamation-triangle');
    const textClass = type === 'warning' ? 'text-dark' : 'text-white';
    const btnCloseClass = type === 'warning' ? '' : 'btn-close-white';

    const toastHtml = `
        <div id="${toastId}" class="toast align-items-center ${textClass} bg-${type} border-0" role="alert" aria-live="assertive" aria-atomic="true">
            <div class="d-flex">
                <div class="toast-body">
                    <i class="bi ${iconClass} me-2"></i>
                    ${message}
                </div>
                <button type="button" class="btn-close ${btnCloseClass} me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
            </div>
        </div>
    `;

    toastContainer.insertAdjacentHTML('beforeend', toastHtml);

    const toastElement = document.getElementById(toastId);
    const toast = new bootstrap.Toast(toastElement, { autohide: true, delay: 3000 });
    toast.show();

    // Remove toast element after hidden
    toastElement.addEventListener('hidden.bs.toast', () => {
        toastElement.remove();
    });
}

// Initialize the dashboard
document.addEventListener('DOMContentLoaded', async function () {
    await fetchProducts();
    initTooltips();

    // Add search event listeners
    if (searchInputEl) {
        searchInputEl.addEventListener('input', handleSearch);
        searchInputEl.addEventListener('keyup', function (e) {
            if (e.key === 'Escape') {
                clearSearch();
            }
        });
    }

    if (clearSearchEl) {
        clearSearchEl.addEventListener('click', clearSearch);
    }

    // Add items per page event listener
    if (itemsPerPageEl) {
        itemsPerPageEl.addEventListener('change', function () {
            itemsPerPage = parseInt(this.value);
            currentPage = 1;
            displayProducts();
            initTooltips();
        });
    }

    // Add sort event listeners
    const sortableHeaders = document.querySelectorAll('.sortable');
    sortableHeaders.forEach(header => {
        header.addEventListener('click', function () {
            const column = this.getAttribute('data-sort');
            sortProducts(column);
        });
    });

    // Add export CSV event listener
    if (exportCsvEl) {
        exportCsvEl.addEventListener('click', exportToCsv);
    }

    // Add Product Detail Modal event listeners
    if (btnEditProductEl) {
        btnEditProductEl.addEventListener('click', switchToEditMode);
    }

    if (btnCancelEditEl) {
        btnCancelEditEl.addEventListener('click', switchToViewMode);
    }

    if (btnSaveProductEl) {
        btnSaveProductEl.addEventListener('click', updateProduct);
    }

    // Add click event for table rows to show product detail
    productTableBodyEl.addEventListener('click', function (e) {
        const row = e.target.closest('tr.clickable-row');
        if (row && !e.target.closest('.product-thumbnail')) {
            const productId = parseInt(row.getAttribute('data-product-id'));
            showProductDetail(productId);
        }
    });

    // Reset modal to view mode when closed
    if (productDetailModal) {
        productDetailModal.addEventListener('hidden.bs.modal', function () {
            switchToViewMode();
        });
    }
});
