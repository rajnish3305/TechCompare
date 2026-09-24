let allAdminProducts = [];
let currentPage = 1;
const productsPerPage = 6;
let currentDisplayedProducts = [];

const userData = localStorage.getItem("loggedInUser");
// Check login
if (!userData) {
    alert("Please login first.");
    window.location.href = "login.html";
    throw new Error("User not logged in");
}
// Get user
const user = JSON.parse(userData);
// Check admin
if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
    throw new Error("Admin access required");
}

function logoutAdmin() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "login.html";
}

const productForm = document.getElementById("productForm");
productForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        const userData = localStorage.getItem("loggedInUser");
        if (!userData) {
            window.location.href = "login.html";
            return;
        }
        const user = JSON.parse(userData);
        const specifications = {};
        document.querySelectorAll("#specificationsContainer input").forEach(input => {
            const key = input.id.replace("spec-", "");
            const value = input.value.trim();
            if (value !== "") {
                specifications[key] = value;
            }
        }); 
        const product = {
            name: document.getElementById("productName").value.trim(),
            brand: document.getElementById("brand").value.trim(),
            category: document.getElementById("category").value,
            price: Number(document.getElementById("price").value),
            rating: Number(document.getElementById("rating").value),
            image: document.getElementById("image").value.trim(),
            specifications: specifications
        };
        try {
            const response =
                await fetch(
                    "http://localhost:5000/api/products",
                    {
                        method: "POST",
                        headers: {
                            "Content-Type":
                                "application/json"
                        },
                        body:  JSON.stringify({
                            userId: user.id,
                            ...product
                        })
                    }
                );
            const data = await response.json();
            const message = document.getElementById("productMessage");
            message.textContent = data.message;
            if (response.ok) {
                message.style.color = "green";
                productForm.reset();
                loadProducts();
            } else {
                message.style.color = "red";
            }
        } catch (error) {
            console.log(error);
            document.getElementById(
                "productMessage"
            ).textContent =
                "Server connection failed.";
        }
    }
);

const categorySelect = document.getElementById("category");
const specificationsContainer = document.getElementById("specificationsContainer");
categorySelect.addEventListener("change", function () {
    const category = this.value;
    if (category === "Smartphone") {
        specificationsContainer.innerHTML = `
            <h3>📱 Smartphone Specifications</h3>

            <input type="text" id="spec-ram" placeholder="RAM">
            <input type="text" id="spec-storage" placeholder="Storage">
            <input type="text" id="spec-processor" placeholder="Processor">
            <input type="text" id="spec-battery" placeholder="Battery">
            <input type="text" id="spec-display" placeholder="Display">
            <input type="text" id="spec-camera" placeholder="Camera">
        `;
    } else if (category === "Laptop") {
        specificationsContainer.innerHTML = `
            <h3>💻 Laptop Specifications</h3>
            <input type="text" id="spec-ram" placeholder="RAM">
            <input type="text" id="spec-storage" placeholder="Storage">
            <input type="text" id="spec-processor" placeholder="Processor">
            <input type="text" id="spec-battery" placeholder="Battery">
            <input type="text" id="spec-display" placeholder="Display">
            <input type="text" id="spec-graphics" placeholder="Graphics">
            <input type="text" id="spec-os" placeholder="Operating System">
        `;
    } else if (category === "Headphone") {
        specificationsContainer.innerHTML = `
            <h3>🎧 Headphone Specifications</h3>
            <input type="text" id="spec-battery" placeholder="Battery Life">
            <input type="text" id="spec-driver" placeholder="Driver Size">
            <input type="text" id="spec-noiseCancellation"
                   placeholder="Noise Cancellation">
            <input type="text" id="spec-connectivity"
                   placeholder="Connectivity">
            <input type="text" id="spec-weight"
                   placeholder="Weight">
        `;
    } else {
        specificationsContainer.innerHTML = "";
    }
});

async function loadProducts() {
    const container =
        document.getElementById(
            "adminProducts"
        );
    try {
        const response =
            await fetch(
                "http://localhost:5000/api/products"
            );
        const products =
            await response.json();
        allAdminProducts = products;
        updateDashboardStats();
        updateCategoryAnalytics();
        loadAdminCategories();
        showAdminProducts(allAdminProducts);
    } catch (error) {
        console.log(error);
        container.innerHTML =
            "<p>Unable to load products.</p>";
    }
}


function showAdminProducts(products) {
    const container = document.getElementById("adminProducts");
    container.innerHTML = "";
    currentDisplayedProducts = products;
    // No products
    if (products.length === 0) {
        container.innerHTML = `
            <p>
                No products found.
            </p>
        `;
        document.getElementById("pageInfo")
            .textContent = "Page 0 of 0";
        document.getElementById("prevPage")
            .disabled = true;
        document.getElementById("nextPage")
            .disabled = true;
        return;
    }
    // Pagination calculation
    const totalPages =
        Math.ceil(
            products.length / productsPerPage
        );
    // Safety check
    if (currentPage > totalPages) {
        currentPage = totalPages;
    }
    const startIndex =
        (currentPage - 1) *
        productsPerPage;
    const endIndex =
        startIndex +
        productsPerPage;
    const pageProducts =
        products.slice(
            startIndex,
            endIndex
        );
    pageProducts.forEach(product => {
        container.innerHTML += `
            <div class="admin-product-card">
            <div class="admin-product-image">
                <img
                    src="${product.image}"
                    alt="${product.name}"
                    onerror="this.src='https://via.placeholder.com/250x180?text=No+Image'"
                >
            </div>
            <div class="admin-product-info">
                <h3>
                    ${product.name}
                </h3>
                <p class="admin-brand">
                    ${product.brand}
                </p>
                <div class="admin-product-meta">
                    <span>
                        📱 ${product.category}
                    </span>
                    <span>
                        ⭐ ${product.rating}
                    </span>
                </div>
                <div class="admin-price">
                    ₹${Number(product.price)
                        .toLocaleString("en-IN")}
                </div>
                <div class="admin-specs">
                    ${
                        Object.entries(product.specifications || {})
                            .filter(([key, value]) =>
                                value !== null &&
                                value !== undefined &&
                                value !== ""
                            )
                            .map(([key, value]) => `
                                <span>
                                    <strong>${formatSpecificationName(key)}:</strong>
                                    ${value}
                                </span>
                            `)
                            .join("")
                    }
                </div>
                <div class="admin-card-buttons">
                    <button
                        class="edit-btn"
                        onclick="editProduct('${product._id}')"
                    >
                        ✏️ Edit
                    </button> 
                    <button
                        class="delete-btn"
                        onclick="deleteProduct('${product._id}')"
                    >
                        🗑️ Delete
                    </button> 
                </div>
            </div>
        </div>
        `;
    });
    // Update page information
    document.getElementById(
        "pageInfo"
    ).textContent =
        `Page ${currentPage} of ${totalPages}`;
    // Previous button
    document.getElementById(
        "prevPage"
    ).disabled =
        currentPage === 1;
    // Next button
    document.getElementById(
        "nextPage"
    ).disabled =
        currentPage === totalPages;
}

function formatSpecificationName(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase())
        .trim();
}

function editProduct(productId) {
    const product = allAdminProducts.find(product => product._id === productId);
    if (!product) {
        return;
    }
    document.getElementById(
        "editProductId"
    ).value = product._id;
    document.getElementById(
        "editProductName"
    ).value = product.name ||"";
    document.getElementById(
        "editBrand"
    ).value = product.brand ||"";
    document.getElementById(
        "editCategory"
    ).value = product.category || "";
    document.getElementById(
        "editPrice"
    ).value = product.price || "";
    document.getElementById(
        "editRating"
    ).value = product.rating || "";
    document.getElementById(
        "editImage"
    ).value = product.image || "";

    const editImagePreview = document.getElementById("editImagePreview");
    if(editImagePreview){
        if (product.image) {
            editImagePreview.src =  product.image;
            editImagePreview.style.display =
                "block";
        } else {
            editImagePreview.src = "";
            editImagePreview.style.display = "none";
        }
    }
    loadEditSpecifications(product.category,product.specifications || {});

    const modal = document.getElementById("editModal");
    if(modal){
        modal.classList.add("active");
    }else{
        console.error("EditModel not found in HTML");
    }
    
}

async function deleteProduct(productId) {
    const confirmDelete = confirm(
        "Are you sure you want to delete this product?"
    );
    if (!confirmDelete) {
        return;
    }
    try {
        const userData = localStorage.getItem("loggedInUser");
        if (!userData) {
            alert("Please login first.");
            window.location.href = "login.html";
            return;
        }
        const user = JSON.parse(userData);
        const response = await fetch(
            `http://localhost:5000/api/products/${productId}`,
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id
                })
            }
        );
        const data = await response.json();
        if (response.ok) {
            alert("Product deleted successfully!");
            // Reload products
            await loadProducts();
        } else {
            alert(data.message || "Failed to delete product.");
        }
    } catch (error) {
        console.error("Delete error:", error);
        alert("Server connection failed.");
    }
}

function closeEditModal() {
    document
        .getElementById("editModal")
        .classList.remove("active");
}

function loadEditSpecifications(category, specifications = {}) {
    const container = document.getElementById(
        "editSpecificationsContainer"
    );
    if (!container) return;
    let fields = [];
    if (category === "Smartphone") {
        fields = [
            ["ram", "RAM"],
            ["storage", "Storage"],
            ["processor", "Processor"],
            ["battery", "Battery"],
            ["display", "Display"],
            ["camera", "Camera"]
        ];
    }

    else if (category === "Laptop") {
        fields = [
            ["ram", "RAM"],
            ["storage", "Storage"],
            ["processor", "Processor"],
            ["battery", "Battery"],
            ["display", "Display"],
            ["graphics", "Graphics"],
            ["os", "Operating System"]
        ];
    }

    else if (category === "Headphone") {
        fields = [
            ["battery", "Battery Life"],
            ["driver", "Driver Size"],
            ["noiseCancellation", "Noise Cancellation"],
            ["connectivity", "Connectivity"],
            ["weight", "Weight"]
        ];
    }
    container.innerHTML = `
        <h3>Specifications</h3>
        <div class="edit-specifications-grid">
            ${fields.map(([key, label]) => `
                <input
                    type="text"
                    id="edit-spec-${key}"
                    placeholder="${label}"
                    value="${specifications[key] || ""}"
                >
            `).join("")}
        </div>
    `;
}

const editCategory = document.getElementById("editCategory");
if(editCategory){
    editCategory.addEventListener(
        "change",
        function () {
            loadEditSpecifications(
                this.value,
                {}
            );
        }
    );
}

const editProductForm = document.getElementById( "editProductForm");
editProductForm.addEventListener(
    "submit",
    async function (event) {
        event.preventDefault();
        const userData =
            localStorage.getItem(
                "loggedInUser"
            );
        if (!userData) {
            window.location.href =
                "login.html";

            return;
        }
        const user =
            JSON.parse(userData);
        const productId =
            document.getElementById(
                "editProductId"
            ).value;
        // GET DYNAMIC SPECIFICATIONS
        const specifications = {};
        document
            .querySelectorAll(
                "#editSpecificationsContainer input"
            )
            .forEach(input => {
                const key =
                    input.id.replace(
                        "edit-spec-",
                        ""
                    );
                const value =
                    input.value.trim();

                if (value !== "") {
                    specifications[key] = value;
                }
            });
        // UPDATED PRODUCT
        const updatedProduct = {
            userId: user.id,
            name:
                document.getElementById(
                    "editProductName"
                ).value.trim(),
            brand:
                document.getElementById(
                    "editBrand"
                ).value.trim(),
            category:
                document.getElementById(
                    "editCategory"
                ).value,
            price:
                Number(
                    document.getElementById(
                        "editPrice"
                    ).value
                ),
            rating:
                Number(
                    document.getElementById(
                        "editRating"
                    ).value
                ),
            image:
                document.getElementById(
                    "editImage"
                ).value.trim(),
            specifications:
                specifications
        };
        try {
            const response =
                await fetch(
                    `http://localhost:5000/api/products/${productId}`,
                    {
                        method: "PUT",
                        headers: {
                            "Content-Type": "application/json"
                        },
                        body:
                            JSON.stringify(
                                updatedProduct
                            )
                    }
                );
            const data = await response.json();
            if (response.ok) {
                alert(
                    "Product updated successfully!"
                );
                closeEditModal();
                loadProducts();
            } else {
                alert(data.message);
            }

        } catch (error) {
            console.log(error);
            alert(
                "Server connection failed."
            );
        }
    }
);

const imageInput = document.getElementById("image");
const imagePreview = document.getElementById("imagePreview");
imageInput.addEventListener(
    "input",
    function () {
        const imageUrl =
            this.value.trim();
        if (!imageUrl) {
            imagePreview.src = "";
            imagePreview.style.display =
                "none";
            return;
        }
        imagePreview.src = imageUrl;
        imagePreview.style.display =
            "block";
    }
);
imagePreview.addEventListener(
    "error",
    function () {
        this.style.display = "none";
        console.log(
            "Invalid image URL"
        );
    }
);

const editImageInput = document.getElementById("editImage");
const editImagePreview = document.getElementById("editImagePreview");
editImageInput.addEventListener(
    "input",
    function () {
        const imageUrl =
            this.value.trim();
        if (!imageUrl) {
            editImagePreview.src = "";
            editImagePreview.style.display =
                "none";
            return;
        }
        editImagePreview.src =
            imageUrl;
        editImagePreview.style.display =
            "block";
    }
);

const adminSearch = document.getElementById("adminSearch");
adminSearch.addEventListener(
    "input",
    function () {
        applyAdminFilters();
    }
);

function applyAdminFilters() {
    currentPage = 1;
    filterAndSortProducts();
}

const adminCategoryFilter = document.getElementById("adminCategoryFilter");
function loadAdminCategories() {
    if(!adminCategoryFilter){
        return;
    }
    adminCategoryFilter.innerHTML = `
        <option value="all">All Categories</option>
    `;
    const categories = allAdminProducts.map(product => product.category);
    const uniqueCategories = [...new Set(categories)];
    uniqueCategories.forEach(
        category => {
            const option = document.createElement("option");
            option.value = category.toLowerCase();
            option.textContent = category;
            adminCategoryFilter.appendChild(option);
        }
    );
}

if(adminCategoryFilter){
    adminCategoryFilter.addEventListener(
        "change",
        function () {
            applyAdminFilters();
        }
    );
}

function updateDashboardStats() {
    const totalProducts =
        allAdminProducts.length;
    const categories =
        allAdminProducts.map(
            product =>
                product.category
        );
    const uniqueCategories =
        [...new Set(categories)];
    let totalRating = 0;
    allAdminProducts.forEach(
        product => {
            totalRating +=
                Number(product.rating) || 0;
        }
    );
    const averageRating =
        totalProducts > 0
            ? (
                totalRating /
                totalProducts
              ).toFixed(1)
            : 0;
    document.getElementById(
        "totalProducts"
    ).textContent =
        totalProducts;
    document.getElementById(
        "totalCategories"
    ).textContent =
        uniqueCategories.length;
    document.getElementById(
        "averageRating"
    ).textContent =
        averageRating;
    function updateAdvancedStats() {
        if (allAdminProducts.length === 0) {
            document.getElementById(
                "averagePrice"
            ).textContent = "₹0";
            document.getElementById(
                "highestRated"
            ).textContent = "-";
            return;
        }
        // AVERAGE PRICE
        let totalPrice = 0;
        allAdminProducts.forEach(
            product => {
                totalPrice +=
                    Number(product.price) || 0;
            }
        );
        const averagePrice =
            totalPrice /
            allAdminProducts.length;
        document.getElementById(
            "averagePrice"
        ).textContent =
            "₹" +
            Math.round(
                averagePrice
            ).toLocaleString("en-IN");
        // HIGHEST RATED PRODUCT
        const highestRated =
            [...allAdminProducts].sort(
                (a, b) =>
                    Number(b.rating) -
                    Number(a.rating)
            )[0];
        document.getElementById(
            "highestRated"
        ).textContent =
            highestRated.name;
    }  
    updateAdvancedStats();  
}

const adminSort = document.getElementById("adminSort");
adminSort.addEventListener(
    "change",
    function () {
        applyAdminFilters();
    }
);

document.getElementById("prevPage")
    .addEventListener("click", function () {
        if (currentPage > 1) {
            currentPage--;
            showAdminProducts(
                currentDisplayedProducts
            );
        }
    });

document.getElementById("nextPage")
    .addEventListener("click", function () {
        const totalPages =
            Math.ceil(
                currentDisplayedProducts.length /
                productsPerPage
            );
        if (currentPage < totalPages) {
            currentPage++;
            showAdminProducts(
                currentDisplayedProducts
            );
        }
    });

function filterAndSortProducts() {
    const searchText =
        adminSearch.value
            .toLowerCase()
            .trim();
    const selectedCategory =
        adminCategoryFilter.value;
    const filteredProducts =
        allAdminProducts.filter(product => {
            const name =
                (product.name || "")
                    .toLowerCase();
            const brand =
                (product.brand || "")
                    .toLowerCase();
            const category =
                (product.category || "")
                    .toLowerCase();
            const matchesSearch =
                name.includes(searchText) ||
                brand.includes(searchText) ||
                category.includes(searchText);
            const matchesCategory =
                selectedCategory === "all" ||
                category === selectedCategory;
            return (
                matchesSearch &&
                matchesCategory
            );
        });
    let sortedProducts =
        [...filteredProducts];
    if (adminSort.value === "priceLow") {
        sortedProducts.sort(
            (a, b) => a.price - b.price
        );
    }
    else if (adminSort.value === "priceHigh") {
        sortedProducts.sort(
            (a, b) => b.price - a.price
        );
    }
    else if (adminSort.value === "ratingHigh") {
        sortedProducts.sort(
            (a, b) => b.rating - a.rating
        );
    }
    else if (adminSort.value === "nameAZ") {
        sortedProducts.sort(
            (a, b) =>
                a.name.localeCompare(b.name)
        );
    }
    showAdminProducts(sortedProducts);
}

function updateCategoryAnalytics() {
    const container =
        document.getElementById(
            "categoryAnalytics"
        );
    container.innerHTML = "";
    const categoryCount = {};
    allAdminProducts.forEach(product => {
        const category =
            product.category || "Other";
        if (categoryCount[category]) {
            categoryCount[category]++;
        } else {
            categoryCount[category] = 1;
        }
    });
    Object.entries(categoryCount)
        .forEach(([category, count]) => {
            container.innerHTML += `
                <div class="category-stat">
                    <div class="category-name">
                        ${category}
                    </div>
                    <div class="category-count">
                        ${count}
                    </div>
                </div>
            `;
        });
}

loadProducts();
