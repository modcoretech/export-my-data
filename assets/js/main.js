document.addEventListener('DOMContentLoaded', () => {
    const servicesTableBody = document.getElementById('servicesTableBody');
    const searchInput = document.getElementById('searchInput');
    const formatFilter = document.getElementById('formatFilter');
    const deletionRequiredFilter = document.getElementById('deletionRequiredFilter');
    const noResultsMessage = document.getElementById('noResults');

    let allServices = []; // To store the original fetched data

    // Set current year in footer
    document.getElementById('currentYear').textContent = new Date().getFullYear();

    async function fetchServices() {
        try {
            const response = await fetch('data/services.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            allServices = await response.json();
            populateFormatFilter(allServices);
            renderServices(allServices);
        } catch (error) {
            console.error('Failed to fetch services:', error);
            servicesTableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: red;">Error loading data. Please try again later.</td></tr>`;
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
        servicesTableBody.innerHTML = ''; // Clear existing rows
        if (servicesToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }

        servicesToRender.forEach(service => {
            const row = document.createElement('tr');

            const formatsHtml = service.formats && Array.isArray(service.formats)
                ? service.formats.map(format => `<span class="format-tag">${format.toUpperCase()}</span>`).join('')
                : 'N/A';

            const exportLink = service.exportLink
                ? `<a href="${service.exportLink}" target="_blank" rel="noopener noreferrer">Link</a>`
                : 'N/A';

            row.innerHTML = `
                <td>${service.name}</td>
                <td>${formatsHtml}</td>
                <td>${service.deletionRequired ? 'Yes' : 'No'}</td>
                <td>${service.processTime || 'Varies'}</td>
                <td>${exportLink}</td>
                <td>${service.notes || 'N/A'}</td>
            `;
            servicesTableBody.appendChild(row);
        });
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedFormat = formatFilter.value.toLowerCase();
        const deletionRequired = deletionRequiredFilter.checked;

        const filteredServices = allServices.filter(service => {
            const matchesSearch = service.name.toLowerCase().includes(searchTerm) ||
                                 (service.notes && service.notes.toLowerCase().includes(searchTerm));

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
