// Define the ServiceCard component
const ServiceCard = {
    props: ['service'],
    template: `
        <div class="service-card">
            <h3>{{ service.name }}</h3>
            <div class="format-tags">
                <span v-if="service.formats && service.formats.length > 0" v-for="format in service.formats" :key="format" class="format-tag">{{ format.toUpperCase() }}</span>
                <span v-else class="format-tag">N/A</span>
            </div>
            <div class="service-card-info">
                <p><strong>Deletion Required:</strong>
                    <span :class="['status-indicator', service.deletionRequired ? 'required' : 'available']">
                        {{ service.deletionRequired ? 'Yes' : 'No' }}
                    </span>
                </p>
                <p><strong>Process Time:</strong> {{ service.processTime || 'Varies by data volume' }}</p>
                <p><strong>Notes:</strong> {{ service.notes || 'No specific notes available.' }}</p>
            </div>
            <div class="export-action">
                <a v-if="service.exportLink" :href="service.exportLink" target="_blank" rel="noopener noreferrer">
                    Go to Export Page
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M10 6V8H16.59L4.71 19.88L6.12 21.29L18 9.41V16H20V6H10Z"/></svg>
                </a>
                <span v-else class="info-message-small">No direct link available</span>
            </div>
        </div>
    `,
    data() {
        return {
            // Data specific to this component, if any
        };
    }
};

// Create the Vue app instance
const app = Vue.createApp({
    components: {
        ServiceCard // Register the component
    },
    data() {
        return {
            allServices: [],        // Stores the complete, unfiltered list of services
            filteredServices: [],   // Stores the services currently displayed based on filters
            searchTerm: '',
            selectedFormat: '',
            deletionRequired: false,
            loading: true,          // Initial loading state
            availableFormats: [],   // Dynamically populated unique formats for the filter
            currentYear: new Date().getFullYear()
        };
    },
    methods: {
        async fetchServices() {
            this.loading = true; // Set loading to true at the start of fetch
            try {
                const response = await fetch('data/services.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.allServices = await response.json(); // Store all services
                this.populateAvailableFormats(this.allServices);
                this.applyFilters(); // Apply filters immediately after fetching
            } catch (error) {
                console.error('Failed to fetch services:', error);
                this.allServices = []; // Ensure allServices is empty on error
                this.filteredServices = []; // Clear services on error
                // You might want to display a user-friendly error message here
            } finally {
                this.loading = false; // Always set loading to false when done (success or error)
            }
        },
        populateAvailableFormats(services) {
            const formats = new Set();
            services.forEach(service => {
                if (service.formats && Array.isArray(service.formats)) {
                    service.formats.forEach(format => formats.add(format.toUpperCase()));
                }
            });
            this.availableFormats = Array.from(formats).sort();
        },
        applyFilters() {
            // IMPORTANT: Filter 'allServices', not 'filteredServices'
            let filtered = this.allServices.filter(service => {
                const searchLower = this.searchTerm.toLowerCase();
                const matchesSearch = service.name.toLowerCase().includes(searchLower) ||
                                      (service.notes && service.notes.toLowerCase().includes(searchLower));

                const matchesFormat = this.selectedFormat === '' ||
                                      (service.formats && service.formats.some(f => f.toLowerCase() === this.selectedFormat.toLowerCase()));

                const matchesDeletionRequirement = !this.deletionRequired || service.deletionRequired;

                return matchesSearch && matchesFormat && matchesDeletionRequirement;
            });

            this.filteredServices = filtered; // Update the displayed services
        }
    },
    mounted() {
        this.fetchServices(); // Initiate data fetch when the app component is mounted
    }
});

// Mount the Vue app to the #app element in index.html
app.mount('#app');
