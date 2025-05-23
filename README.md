# Export My Data

![Export My Data Logo/Banner (Optional)](assets/images/logo.png) A lightweight, open-source project by the **Modcore Team** that provides a public archive of data export options for online services. Empowering users by making data portability information easily accessible.

## 🧩 Core Concept

In an age where our digital lives are intertwined with countless online services, understanding how to manage and export our data is more crucial than ever. "Export My Data" aims to be your go-to resource for answering critical questions about your data's portability:

* **Which services let users export their data?**
* **What formats are offered?** (e.g., JSON, ZIP, CSV)
* **Is account deletion required first?**
* **How long does the process typically take?**
* **Direct links** to the export pages.
* **Optional notes** (e.g., "must verify email", "only via app").

Our goal is to make this information transparent, easy to find, and continuously updated by the community.

## ✨ Features

* **Comprehensive Data:** Detailed information for a growing list of online services.
* **Clear & Concise:** Answers key questions about data export without jargon.
* **Direct Links:** Quick access to the exact export pages for each service.
* **Search & Filter:** Easily find services or filter by format and other criteria.
* **Open Source:** Community-driven project; contributions are highly encouraged!
* **Performance-Optimized:** Hosted on GitHub Pages for blazing-fast load times.
* **Super-Nicely Usable UI/UX:** Designed for intuitive navigation and readability.

## 🚀 Getting Started

To get a local copy up and running, follow these simple steps.

### Prerequisites

You just need a web browser!

### Installation

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/modcoretech/export-my-data.git](https://github.com/modcoretech/export-my-data.git)
    ```
2.  **Navigate to the project directory:**
    ```bash
    cd export-my-data
    ```
3.  **Open `index.html`:**
    Simply open the `index.html` file in your preferred web browser.

    Alternatively, you can set up a local web server (e.g., using Python's `http.server` or Node.js's `live-server`) for a more robust development experience, especially if you encounter CORS issues with `file://` protocol.

    ```bash
    # Using Python (if installed)
    python -m http.server
    ```
    Then open `http://localhost:8000` in your browser.

## 👨‍💻 Contributing

We welcome contributions from everyone! Whether it's adding new services, updating existing information, improving the UI/UX, or fixing bugs, your help is valuable.

1.  **Fork the repository.**
2.  **Create your feature branch:** `git checkout -b feature/AmazingFeature`
3.  **Add or update data:** Modify `data/services.json` with new service information.
4.  **Improve code:** Make changes to `index.html`, `assets/css/style.css`, or `assets/js/main.js`.
5.  **Commit your changes:** `git commit -m 'Add some AmazingFeature'`
6.  **Push to the branch:** `git push origin feature/AmazingFeature`
7.  **Open a Pull Request.**

Please ensure your contributions adhere to the existing data structure and coding style.

## 📄 Data Structure (`data/services.json`)

Each entry in `services.json` should follow this structure:

```json
{
    "name": "Service Name",
    "formats": ["FORMAT1", "FORMAT2"],
    "deletionRequired": true/false,
    "processTime": "Estimate (e.g., 'Minutes', 'Hours', 'Days', 'Weeks', 'Varies')",
    "exportLink": "[https://direct.link.to.export.page/](https://direct.link.to.export.page/)",
    "notes": "Optional additional information (e.g., 'requires email verification', 'only via mobile app')"
}
