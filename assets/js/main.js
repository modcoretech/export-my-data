document.addEventListener('DOMContentLoaded', () => {
    const servicesGrid = document.getElementById('services-grid');
    const searchInput = document.getElementById('searchInput');
    const formatFilter = document.getElementById('formatFilter');
    const deletionRequiredFilter = document.getElementById('deletionRequiredFilter');
    const loadingMessage = document.getElementById('loadingMessage');
    const noResultsMessage = document.getElementById('noResults');

    let allServices = []; // Stores the complete, unfiltered list of services

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    /**
     * Creates an HTML string for a single service card.
     * Includes lastVerifiedDate and accessibility attributes.
     * @param {Object} service - The service data object.
     * @param {number} index - The index of the service for animation delay.
     * @returns {string} The HTML string for the service card.
     */
    function createServiceCardHtml(service, index) {
        const formatsHtml = service.formats && service.formats.length > 0
            ? `<div class="flex flex-wrap gap-2 mb-4">
                ${service.formats.map(format => `<span class="bg-gray-700 text-gray-300 px-3 py-1 rounded-md text-sm font-medium border border-gray-600 hover:bg-gray-600 transition-colors duration-200">${format.toUpperCase()}</span>`).join('')}
               </div>`
            : `<div class="mb-4"><span class="bg-gray-700 text-gray-400 px-3 py-1 rounded-md text-sm font-medium border border-gray-600">N/A</span></div>`;

        const deletionStatusClass = service.deletionRequired ? 'required' : 'available';
        const deletionStatusText = service.deletionRequired ? 'Yes' : 'No';

        const exportLinkHtml = service.exportLink
            ? `<a href="${service.exportLink}" target="_blank" rel="noopener noreferrer"
                  class="inline-flex items-center px-6 py-3 bg-fuchsia-700 text-white font-semibold rounded-lg hover:bg-fuchsia-600 transition-colors duration-200 transform hover:-translate-y-1"
                  aria-label="Go to export page for ${service.name}">
                  Go to Export Page
                  <svg class="ml-2 w-5 h-5" fill="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10 6V8H16.59L4.71 19.88L6.12 21.29L18 9.41V16H20V6H10Z"/></svg>
               </a>`
            : `<span class="text-gray-400 text-sm italic">No direct link available</span>`;

        const lastVerifiedHtml = service.lastVerifiedDate
            ? `<p class="last-verified">Last verified: ${service.lastVerifiedDate}</p>`
            : '';

        return `
            <div class="service-card bg-gray-800 p-6 rounded-xl border border-gray-700 flex flex-col hover:transform hover:-translate-y-2 transition-all duration-300 relative overflow-hidden"
                 style="animation-delay: ${index * 0.05}s;"> <h3 class="text-2xl font-bold text-cyan-400 mb-4 pb-3 border-b border-gray-700">
                    ${service.name}
                </h3>
                ${formatsHtml}
                <div class="flex-grow text-gray-200 text-sm">
                    <p class="mb-2"><strong>Deletion Required:</strong>
                        <span class="status-indicator ${deletionStatusClass}" role="status">
                            ${deletionStatusText}
                        </span>
                    </p>
                    <p class="mb-2"><strong>Process Time:</strong> <span class="text-gray-300">${service.processTime || 'Varies by data volume'}</span></p>
                    <p class="mb-4"><strong>Notes:</strong> <span class="text-gray-300">${service.notes || 'No specific notes available.'}</span></p>
                </div>
                <div class="mt-auto pt-6 border-t border-gray-700 flex justify-between items-end">
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
        servicesGrid.innerHTML = ''; // Clear existing cards

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
            servicesGrid.innerHTML = `<p class="col-span-full text-center text-red-500 text-xl info-message">Error loading data. Please check your internet connection or try again later.</p>`;
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
        formatFilter.innerHTML = '<option value="">All Formats</option>';
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
