document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.getElementById('services-grid');
    const searchInput = document.getElementById('searchInput');
    const formatFilter = document.getElementById('formatFilter');
    const deletionRequiredFilter = document.getElementById('deletionRequiredFilter');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResults');

    let allServices = []; // To store the original fetched data

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    async function fetchServices() {
        loadingMessage.style.display = 'block';
        servicesGrid.innerHTML = ''; // Clear previous content

        try {
            const response = await fetch('data/services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allServices = await response.json();
            populateFormatFilter(allServices);
            applyFilters(); // Initial render after fetching
        } catch (error) {
            console.error('Failed to fetch services:', error);
            servicesGrid.innerHTML = `<p class="info-message error-message">Error loading data. Please try again later.</p>`;
            loadingMessage.style.display = 'none';
        }
    }

    function populateFormatFilter(services) {
        const formats = new Set();
        services.forEach(service => {
            if (service.formats && Array.isArray(service.formats)) {
                service.formats.forEach(format => formats.add(format.toUpperCase()));
            }
        });
        const sortedFormats = Array.from(formats).sort();
        formatFilter.innerHTML = '<option value="">All Formats</option>'; // Reset
        sortedFormats.forEach(format => {
            const option = document.createElement('option');
            option.value = format;
            option.textContent = format;
            formatFilter.appendChild(option);
        });
    }

    function renderServices(servicesToRender) {
        servicesGrid.innerHTML = ''; // Clear existing cards
        loadingMessage.style.display = 'none'; // Hide loading message

        if (servicesToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }

        servicesToRender.forEach(service => {
            const serviceCard = document.createElement('div');
            serviceCard.classList.add('service-card');

            const formatsHtml = service.formats && Array.isArray(service.formats)
                ? `<div class="format-tags">${service.formats.map(format => `<span class="format-tag">${format.toUpperCase()}</span>`).join('')}</div>`
                : '<div class="format-tags"><span class="format-tag">N/A</span></div>';

            const exportLinkHtml = service.exportLink
                ? `<div class="export-link"><a href="${service.exportLink}" target="_blank" rel="noopener noreferrer">Go to Export Page &rarr;</a></div>`
                : '<div class="export-link"><span class="info-message">No direct link available</span></div>';

            serviceCard.innerHTML = `
                <h3>${service.name}</h3>
                ${formatsHtml}
                <p><strong>Deletion Required:</strong> ${service.deletionRequired ? 'Yes' : 'No'}</p>
                <p><strong>Process Time:</strong> ${service.processTime || 'Varies'}</p>
                <p><strong>Notes:</strong> ${service.notes || 'No specific notes.'}</p>
                ${exportLinkHtml}
            `;
            servicesGrid.appendChild(serviceCard);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedFormat = formatFilter.value.toLowerCase();
        const deletionRequired = deletionRequiredFilter.checked;

        const filteredServices = allServices.filter(service => {
            const nameMatch = service.name.toLowerCase().includes(searchTerm);
            const notesMatch = (service.notes && service.notes.toLowerCase().includes(searchTerm));
            const matchesSearch = nameMatch || notesMatch;

            const matchesFormat = selectedFormat === '' ||
                                  (service.formats && service.formats.some(format => format.toLowerCase() === selectedFormat));

            const matchesDeletionRequirement = !deletionRequired || service.deletionRequired;

            return matchesSearch && matchesFormat && matchesDeletionRequirement;
        });
        renderServices(filteredServices);
    }

    // Event Listeners
    searchInput.addEventListener('input', applyFilters);
    formatFilter.addEventListener('change', applyFilters);
    deletionRequiredFilter.addEventListener('change', applyFilters);

    // Initial data fetch
    fetchServices();
});
