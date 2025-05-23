document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.getElementById('services-grid');
    const searchInput = document.getElementById('searchInput');
    const formatFilter = document.getElementById('formatFilter');
    const deletionRequiredFilter = document.getElementById('deletionRequiredFilter');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResults');

    let allServices = []; // Stores the complete, unfiltered list of services
    let exportIconSvg = ''; // Will store the SVG content for the export icon

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    // Function to fetch SVG content
    async function fetchSvgIcon(filePath) {
        try {
            const response = await fetch(filePath);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.text();
        } catch (error) {
            console.error(`Failed to fetch SVG icon from ${filePath}:`, error);
            // Fallback: A simple square icon if SVG fails to load
            return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"><rect x="4" y="4" width="16" height="16" rx="2"/></svg>';
        }
    }

    /**
     * Creates an HTML string for a single service card.
     * Includes lastVerifiedDate and accessibility attributes.
     * @param {Object} service - The service data object.
     * @param {number} index - The index of the service for animation delay.
     * @returns {string} The HTML string for the service card.
     */
    function createServiceCardHtml(service, index) {
        const formatsHtml = service.formats && service.formats.length > 0
            ? `<div class="format-tags">
                ${service.formats.map(format => `<span class="format-tag">${format.toUpperCase()}</span>`).join('')}
               </div>`
            : `<div class="format-tags"><span class="format-tag">N/A</span></div>`;

        const deletionStatusClass = service.deletionRequired ? 'required' : 'available';
        const deletionStatusText = service.deletionRequired ? 'Yes' : 'No';

        const exportLinkHtml = service.exportLink
            ? `<a href="${service.exportLink}" target="_blank" rel="noopener noreferrer"
                  class="export-button"
                  aria-label="Go to export page for ${service.name}">
                  Go to Export Page
                  ${exportIconSvg}
               </a>`
            : `<span class="no-link-message">No direct link available</span>`;

        const lastVerifiedHtml = service.lastVerifiedDate
            ? `<span class="last-verified">Last verified: ${service.lastVerifiedDate}</span>`
            : '';

        return `
            <div class="service-card" style="animation-delay: ${index * 0.05}s;">
                <h3 class="service-card-title">${service.name}</h3>
                ${formatsHtml}
                <div class="service-info">
                    <p><strong>Deletion Required:</strong>
                        <span class="status-indicator ${deletionStatusClass}" role="status">
                            ${deletionStatusText}
                        </span>
                    </p>
                    <p><strong>Process Time:</strong> <span>${service.processTime || 'Varies by data volume'}</span></p>
                    <p><strong>Notes:</strong> <span>${service.notes || 'No specific notes available.'}</span></p>
                </div>
                <div class="export-actions">
                    ${exportLinkHtml}
                    ${lastVerifiedHtml}
                </div>
            </div>
        `;
    }

    /**
     * Fetches service data from the JSON file.
     */
    async function fetchServices() {
        loadingMessage.classList.remove('hidden'); // Show loading message
        noResultsMessage.classList.add('hidden'); // Ensure no results message is hidden
        servicesGrid.innerHTML = ''; // Clear existing cards

        // Fetch SVG icon first
        exportIconSvg = await fetchSvgIcon('assets/images/arrow-up-right.svg');

        try {
            const response = await fetch('data/services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allServices = await response.json();
            populateFormatFilter(allServices);
            applyFilters(); // Apply initial filters after fetching
        } catch (error) {
            console.error('Failed to fetch services:', error);
            servicesGrid.innerHTML = `<p class="info-message empty-state">Error loading data. Please check your internet connection or try again later.</p>`;
        } finally {
            loadingMessage.classList.add('hidden'); // Hide loading message
        }
    }

    /**
     * Populates the format filter dropdown with unique formats.
     * @param {Array} services - The array of service objects.
     */
    function populateFormatFilter(services) {
        const formats = new Set();
        services.forEach(service => {
            if (service.formats && Array.isArray(service.formats)) {
                service.formats.forEach(format => formats.add(format.toUpperCase()));
            }
        });
        const sortedFormats = Array.from(formats).sort();

        // Clear existing options, keep "All Formats"
        formatFilter.innerHTML = '<option value="">All Data Formats</option>';
        sortedFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format;
            formatFilter.appendChild(option);
        });
    }

    /**
     * Filters and renders service cards based on current filter settings.
     */
    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedFormat = formatFilter.value.toLowerCase();
        const deletionRequired = deletionRequiredFilter.checked;

        const filtered = allServices.filter(service => {
            const nameMatch = service.name.toLowerCase().includes(searchTerm);
            const notesMatch = (service.notes && service.notes.toLowerCase().includes(searchTerm));
            const matchesSearch = nameMatch || notesMatch;

            const matchesFormat = selectedFormat === '' ||
                                  (service.formats && service.formats.some(format => format.toLowerCase() === selectedFormat));

            const matchesDeletionRequirement = !deletionRequired || service.deletionRequired;

            return matchesSearch && matchesFormat && matchesDeletionRequirement;
        });

        renderServices(filtered);
    }

    /**
     * Renders the given list of services to the grid.
     * @param {Array} servicesToRender - The services to display.
     */
    function renderServices(servicesToRender) {
        servicesGrid.innerHTML = ''; // Clear current display
        noResultsMessage.classList.add('hidden'); // Hide no results message initially

        if (servicesToRender.length === 0) {
            noResultsMessage.classList.remove('hidden');
        } else {
            servicesToRender.forEach((service, index) => {
                servicesGrid.insertAdjacentHTML('beforeend', createServiceCardHtml(service, index));
            });
        }
    }

    // Event Listeners for filters
    searchInput.addEventListener('input', applyFilters);
    formatFilter.addEventListener('change', applyFilters);
    deletionRequiredFilter.addEventListener('change', applyFilters);

    // Initial data fetch on page load
    fetchServices();
});
