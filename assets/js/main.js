document.addEventListener('DOMContentLoaded', () => {
    // UI Element Selectors
    const ui = {
        grid: document.getElementById('services-grid'),
        searchInput: document.getElementById('searchInput'),
        searchClearBtn: document.getElementById('searchClearBtn'),
        formatFilter: document.getElementById('formatFilter'),
        deletionFilter: document.getElementById('deletionRequiredFilter'),
        loadingMsg: document.getElementById('loadingMessage'),
        noResultsMsg: document.getElementById('noResults'),
        resultsCount: document.getElementById('resultsCount'),
        resetFiltersLink: document.getElementById('resetFiltersLink'),
        paginationContainer: document.getElementById('pagination-container'),
    };

    // Centralized Application State
    const appState = {
        allServices: [],
        filteredServices: [],
        currentPage: 1,
        itemsPerPage: 12,
        svg: {
            exportIcon: '',
            clearIcon: ''
        }
    };

    /**
     * Debounce function to limit the rate at which a function gets called.
     */
    function debounce(func, delay) {
        let timeout;
        return function(...args) {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), delay);
        };
    }

    /**
     * Fetches SVG content from a file.
     */
    async function fetchSvgIcon(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch SVG icon: ${error}`);
            return '';
        }
    }

    /**
     * Applies all current filters to the service list.
     */
    function applyFilters() {
        const searchTerm = ui.searchInput.value.toLowerCase().trim();
        const selectedFormat = ui.formatFilter.value.toLowerCase();
        const deletionRequired = ui.deletionFilter.checked;

        appState.filteredServices = appState.allServices.filter(service => {
            const matchesSearch = searchTerm === '' ||
                service.name.toLowerCase().includes(searchTerm) ||
                (service.notes && service.notes.toLowerCase().includes(searchTerm));
            const matchesFormat = selectedFormat === '' ||
                (service.formats && service.formats.some(f => f.toLowerCase() === selectedFormat));
            const matchesDeletion = !deletionRequired || service.deletionRequired;
            return matchesSearch && matchesFormat && matchesDeletion;
        });

        appState.currentPage = 1; // Reset to first page after filtering
        updateUi();
    }

    /**
     * Updates all UI components based on the current state.
     */
    function updateUi() {
        renderServicesForCurrentPage();
        renderPagination();
        updateResultsCount();
        updateResetLinkVisibility();
        updateSearchClearButtonVisibility();
    }

    /**
     * Renders the service cards for the current page.
     */
    function renderServicesForCurrentPage() {
        ui.grid.innerHTML = '';
        ui.noResultsMsg.hidden = appState.filteredServices.length > 0;

        if (appState.filteredServices.length === 0) return;

        const startIndex = (appState.currentPage - 1) * appState.itemsPerPage;
        const endIndex = startIndex + appState.itemsPerPage;
        const pageServices = appState.filteredServices.slice(startIndex, endIndex);

        pageServices.forEach((service, index) => {
            ui.grid.insertAdjacentHTML('beforeend', createServiceCardHtml(service, index));
        });
    }

    /**
     * Renders the pagination controls.
     */
    function renderPagination() {
        ui.paginationContainer.innerHTML = '';
        const pageCount = Math.ceil(appState.filteredServices.length / appState.itemsPerPage);

        if (pageCount <= 1) return;

        // Previous Button
        ui.paginationContainer.innerHTML += `
            <button class="page-item page-arrow" data-page="${appState.currentPage - 1}" ${appState.currentPage === 1 ? 'disabled' : ''}>
                &laquo;
            </button>`;

        // Page Number Buttons
        for (let i = 1; i <= pageCount; i++) {
            ui.paginationContainer.innerHTML += `
                <button class="page-item ${i === appState.currentPage ? 'active' : ''}" data-page="${i}">
                    ${i}
                </button>`;
        }

        // Next Button
        ui.paginationContainer.innerHTML += `
            <button class="page-item page-arrow" data-page="${appState.currentPage + 1}" ${appState.currentPage === pageCount ? 'disabled' : ''}>
                &raquo;
            </button>`;
    }
    
    /**
     * Updates the text showing the number of results.
     */
    function updateResultsCount() {
        const totalFiltered = appState.filteredServices.length;
        if (totalFiltered === 0) {
            ui.resultsCount.textContent = 'No services found.';
            return;
        }
        const start = (appState.currentPage - 1) * appState.itemsPerPage + 1;
        const end = Math.min(start + appState.itemsPerPage - 1, totalFiltered);
        ui.resultsCount.textContent = `Showing ${start}-${end} of ${totalFiltered} services.`;
    }

    /**
     * Manages visibility of the "Reset All Filters" link.
     */
    function updateResetLinkVisibility() {
        const isFiltered = ui.formatFilter.value || ui.deletionFilter.checked;
        ui.resetFiltersLink.hidden = !isFiltered;
    }
    
    /**
     * Manages visibility of the inline search clear button.
     */
    function updateSearchClearButtonVisibility() {
        ui.searchClearBtn.hidden = ui.searchInput.value.length === 0;
    }

    /**
     * Creates HTML for a single service card.
     */
    function createServiceCardHtml(service, index) {
        const formatsHtml = service.formats?.length
            ? `<div class="format-tags">${service.formats.map(f => `<span class="format-tag">${f.toUpperCase()}</span>`).join('')}</div>`
            : '';
        const deletionStatus = service.deletionRequired ? { class: 'required', text: 'Yes' } : { class: 'available', text: 'No' };
        const exportLinkHtml = service.exportLink
            ? `<a href="${service.exportLink}" target="_blank" rel="noopener noreferrer" class="export-button">Go to Export Page ${appState.svg.exportIcon}</a>`
            : `<span class="no-link-message">No direct link available</span>`;

        return `
            <div class="service-card" style="animation-delay: ${index * 0.05}s;">
                <h3 class="service-card-title">${service.name}</h3>
                ${formatsHtml}
                <div class="service-info">
                    <p><strong>Deletion Required:</strong> <span class="status-indicator ${deletionStatus.class}">${deletionStatus.text}</span></p>
                    <p><strong>Process Time:</strong> <span>${service.processTime || 'Varies'}</span></p>
                    <p><strong>Notes:</strong> <span>${service.notes || 'N/A'}</span></p>
                </div>
                <div class="export-actions">
                    ${exportLinkHtml}
                    ${service.lastVerifiedDate ? `<span class="last-verified">Last verified: ${service.lastVerifiedDate}</span>` : ''}
                </div>
            </div>`;
    }
    
    /**
     * Handles clicks within the pagination container using event delegation.
     */
    function handlePaginationClick(e) {
        const target = e.target.closest('.page-item');
        if (!target || target.disabled) return;
        
        const page = parseInt(target.dataset.page, 10);
        if (page !== appState.currentPage) {
            appState.currentPage = page;
            updateUi();
            ui.grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
    
    /**
     * Resets all filters to their default state.
     */
    function resetAllFilters() {
        ui.searchInput.value = '';
        ui.formatFilter.value = '';
        ui.deletionFilter.checked = false;
        applyFilters();
    }

    /**
     * Initializes the application.
     */
    async function initializeApp() {
        ui.loadingMsg.hidden = false;
        document.getElementById('currentYear').textContent = new Date().getFullYear();

        // Fetch assets concurrently
        [appState.svg.exportIcon, appState.svg.clearIcon, appState.allServices] = await Promise.all([
            fetchSvgIcon('assets/images/arrow-up-right.svg'),
            fetchSvgIcon('assets/images/input-clear.svg'),
            fetch('data/services.json').then(res => {
                if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
                return res.json();
            })
        ]);

        ui.loadingMsg.hidden = true;
        ui.searchClearBtn.innerHTML = appState.svg.clearIcon;

        // Populate format filter once
        const formats = new Set(appState.allServices.flatMap(s => s.formats || []).map(f => f.toUpperCase()));
        const sortedFormats = Array.from(formats).sort();
        sortedFormats.forEach(format => {
            ui.formatFilter.add(new Option(format, format));
        });

        // Setup initial view
        appState.filteredServices = [...appState.allServices];
        updateUi();

        // Setup Event Listeners
        ui.searchInput.addEventListener('input', debounce(applyFilters, 300));
        ui.searchInput.addEventListener('input', updateSearchClearButtonVisibility);
        ui.searchClearBtn.addEventListener('click', () => {
            ui.searchInput.value = '';
            applyFilters();
        });
        ui.formatFilter.addEventListener('change', applyFilters);
        ui.deletionFilter.addEventListener('change', applyFilters);
        ui.resetFiltersLink.addEventListener('click', (e) => {
            e.preventDefault();
            resetAllFilters();
        });
        ui.paginationContainer.addEventListener('click', handlePaginationClick);
    }

    initializeApp().catch(error => {
        console.error("Initialization failed:", error);
        ui.loadingMsg.hidden = true;
        ui.grid.innerHTML = `<p class="info-message empty-state">Error initializing the application. Please refresh the page.</p>`;
    });
});
