let allProducts = [];
let compareProducts = [];
let favoriteProductIds = new Set();
fetch("http://localhost:5000/api/products")
    .then(response => response.json())
    .then(products => {
        allProducts = products;
        showProducts(allProducts);
    })
    .catch(error => {
        console.error("Error:", error);
    });
function showProducts(products) {
    const container = document.getElementById("products");
    container.innerHTML = "";
    products.forEach(product => {
        const isFavorite = favoriteProductIds.has(product._id);
        const specs = product.specifications || {};
        // Dynamic specifications
        let specificationHTML = "";
        Object.entries(specs).forEach(([key, value]) => {
            // Empty/null values skip
            if (
                value === null ||
                value === undefined ||
                value === ""
            ) {
                return;
            }
            // camelCase / snake_case ko readable name mein convert
            const label = key
                .replace(/([A-Z])/g, " $1")
                .replace(/[_-]/g, " ")
                .replace(/\b\w/g, letter => letter.toUpperCase());
            specificationHTML += `
                <p>
                    <strong>${label}:</strong>
                    ${value}
                </p>
            `;
        });
        container.innerHTML += `
            <div class="product-card">
                <img 
                    src="${product.image || ''}" 
                    alt="${product.name || 'Product'}"
                >
                <h2>${product.name || 'N/A'}</h2>
                <p>
                    <strong>Brand:</strong>
                    ${product.brand || 'N/A'}
                </p>
                <p>
                    <strong>Category:</strong>
                    ${product.category || 'N/A'}
                </p>
                <p>
                    <strong>Price:</strong>
                    ₹${Number(product.price || 0).toLocaleString("en-IN")}
                </p>
                <p>
                    <strong>Rating:</strong>
                    ⭐ ${product.rating ?? 'N/A'}
                </p>
                <hr>
                <div class="product-specifications">
                    ${specificationHTML}
                </div>
                <button 
                    class="favorite-button"
                    id="favorite-${product._id}"
                    onclick="toggleFavorite('${product._id}')"
                >
                    <span class="favorite-icon">
                    ${isFavorite ? "❤️":"🤍"}
                    </span> Favorite
                </button>
                <button
                    onclick="addToCompare('${product._id}')"
                    ${compareProducts.some(
                        p => p._id === product._id
                    ) ? "disabled" : ""}
                >
                    ${
                        compareProducts.some(
                            p => p._id === product._id
                        )
                        ? "✓ Added"
                        : "Add to Compare"
                    }
                </button>
            </div>
        `;
    });
}

function filterProducts() {
    const searchText = document.getElementById("searchInput").value.toLowerCase();
    const selectedCategory = document.getElementById("categoryFilter").value;
    const filteredProducts = allProducts.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchText) || product.brand.toLowerCase().includes(searchText) || product.category.toLowerCase().includes(searchText);
        const matchesCategory =  selectedCategory === "All" || product.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });
    showProducts(filteredProducts);
}
document.getElementById("searchInput")
    .addEventListener("input", filterProducts);
document.getElementById("categoryFilter")
    .addEventListener("change", filterProducts);

// ye function theme change ke liya hai
function toggleTheme() {
    document.body.classList.toggle("dark");
    const button = document.getElementById("themeToggle");
    if (document.body.classList.contains("dark")) {
        button.innerHTML = "☀️";
    } else {
        button.innerHTML = "🌙";
    }
}

// compare product 
function addToCompare(productId) {
    const product = allProducts.find(
        p => p._id === productId
    );
    if (!product) {
        return;
    }
    // Check duplicate
    if (compareProducts.some(
        p => p._id === productId
    )) {
        alert("Product already added!");
        return;
    }
    // Maximum 4 products
    if (compareProducts.length >= 4) {
        alert("You can compare maximum 4 products.");
        return;
    }
    // Add product
    compareProducts.push(product);
    updateCompareBox();
}

function updateCompareBox() {
    const container = document.getElementById("compareList");
    const count = document.getElementById("compareCount");
    count.textContent = compareProducts.length;
    container.innerHTML = "";
    compareProducts.forEach(product => {
        container.innerHTML += `
            <div class="compare-item">
                <span>
                    ${product.name}
                </span>
                <button onclick="removeFromCompare('${product._id}')"> ✕ </button>
            </div>
        `;
    });
    // Refresh product buttons
    showProducts(
        allProducts.filter(product => {
            const searchInput = document.getElementById("searchInput");
            const categoryFilter = document.getElementById("categoryFilter");
            if (!searchInput || !categoryFilter) {
                return true;
            }
            const searchText = searchInput.value.toLowerCase();
            const selectedCategory = categoryFilter.value;
            const matchesSearch = product.name.toLowerCase().includes(searchText) || product.brand.toLowerCase().includes(searchText) || product.category.toLowerCase().includes(searchText);

            const matchesCategory = selectedCategory === "All" || product.category === selectedCategory;

            return matchesSearch && matchesCategory;
        })
    );
}

function removeFromCompare(productId) {
    compareProducts =
        compareProducts.filter(
            product => product._id !== productId
        );
    updateCompareBox();
}

function showComparison() {
    if (compareProducts.length < 2) {
        alert("Please select at least 2 products.");
        return;
    }
    const container = document.getElementById("comparisonTable");
    // STEP 1: Collect ALL specification keys
    const specificationKeys = new Set();
    compareProducts.forEach(product => {
        const specs = product.specifications || {};
        Object.keys(specs).forEach(key => {
            specificationKeys.add(key);
        });
    });
    const allSpecificationKeys = [...specificationKeys];
    // STEP 2: Create table
    let table = `
        <h2>Product Comparison</h2>
        <div class="table-container">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Specification</th>
    `;
    // Product names
    compareProducts.forEach(product => {
        table += `
            <th>
                ${product.name || "N/A"}
            </th>
        `;
    });
    table += `
                    </tr>
                </thead>
                <tbody>
    `;
    // STEP 3: Price
    table += createComparisonRow(
        "Price",
        compareProducts.map(product => {
            if (
                product.price === undefined ||
                product.price === null ||
                product.price === ""
            ) {
                return "N/A";
            }
            return "₹" +
                Number(product.price).toLocaleString("en-IN");
        }),
        "lower"
    );
    // STEP 4: Rating
    table += createComparisonRow(
        "Rating",
        compareProducts.map(product => {
            if (
                product.rating === undefined ||
                product.rating === null ||
                product.rating === ""
            ) {
                return "N/A";
            }
            return "⭐ " + product.rating;
        }),
        "higher"
    );
    // STEP 5: ALL dynamic specifications
    allSpecificationKeys.forEach(key => {
        const values = compareProducts.map(product => {
            const specs = product.specifications || {};
            const value = specs[key];
            // Product me specification nahi hai
            if (
                value === undefined ||
                value === null ||
                value === ""
            ) {
                return "N/A";
            }
            return value;
        });
        // Decide whether numeric comparison
        const lowerKey = key.toLowerCase();
        let comparisonType = "none";
        // Higher value generally considered better
        if (
            lowerKey.includes("ram") ||
            lowerKey.includes("storage") ||
            lowerKey.includes("battery") ||
            lowerKey.includes("camera") ||
            lowerKey.includes("driver")
        ) {
            comparisonType = "higher";
        }
        // Lower weight generally better
        else if (
            lowerKey.includes("weight")
        ) {
            comparisonType = "lower";
        }
        // Add row
        table += createComparisonRow(
            formatSpecificationName(key),
            values,
            comparisonType
        );
    });
    // STEP 6: Close table
    table += `
                </tbody>
            </table>
        </div>
    `;
    // Show table
    container.innerHTML = table;
    // Show recommendations
    showRecommendations();
}

function createComparisonRow(title, values, better = "none") {
    // Convert values to numbers where possible
    const numbers = values.map(value => {
        if (
            value === null ||
            value === undefined ||
            value === "N/A"
        ) {
            return NaN;
        }
        const match = String(value)
            .replace(/,/g, "")
            .match(/[\d.]+/);
        return match ? parseFloat(match[0]) : NaN;
    });
    // Find best value only when comparison
    // is meaningful
    let bestValue = null;
    if (
        better === "higher" ||
        better === "lower"
    ) {
        const validNumbers = numbers.filter(number => !isNaN(number));
        if (validNumbers.length > 0) {
            if (better === "higher") {
                bestValue = Math.max(...validNumbers);
            } else {
                bestValue = Math.min(...validNumbers);
            }
        }
    }
     // Create table row    
    let row = `
        <tr>
            <th>
                ${title}
            </th>
    `;
    values.forEach((value, index) => {
        const isBest =
            bestValue !== null &&
            !isNaN(numbers[index]) &&
            numbers[index] === bestValue;
        row += `
            <td class="${isBest ? "best-value" : ""}">
                ${value}
            </td>
        `;
    });
    row += `
        </tr>
    `;
    return row;
}

function formatSpecificationName(key) {
    return key
        .replace(/([A-Z])/g, " $1")
        .replace(/[_-]/g, " ")
        .replace(/\b\w/g, letter => letter.toUpperCase())
        .trim();
}

function showRecommendations() {
    const container = document.getElementById("recommendationSection");
    if (!container) {
        return;
    }
    if (compareProducts.length < 2) {
        container.innerHTML = "";
        return;
    }
    // Get categories
    const categories = [
        ...new Set(
            compareProducts
                .map(product => product.category)
                .filter(Boolean)
        )
    ];
    // Check whether all selected products belong to same category
    const sameCategory = categories.length === 1;
    // Common recommendations
    const productsWithPrice = compareProducts.filter(
        product =>
            product.price !== undefined &&
            product.price !== null &&
            product.price !== ""
    );
    const productsWithRating = compareProducts.filter(
        product =>
            product.rating !== undefined &&
            product.rating !== null &&
            product.rating !== ""
    );
    const lowestPrice =
        productsWithPrice.length > 0
            ? [...productsWithPrice].sort(
                (a, b) => Number(a.price) - Number(b.price)
            )[0]
            : null;
    const highestRating =
        productsWithRating.length > 0
            ? [...productsWithRating].sort(
                (a, b) => Number(b.rating) - Number(a.rating)
            )[0]
            : null;
    let insights = "";
    // MIXED CATEGORY
    if (!sameCategory) {
        insights = `
            ${
                lowestPrice
                    ? `
                    <div class="insight-card">
                        <h3>💰 Lowest Price</h3>
                        <p>${lowestPrice.name}</p>
                        <strong>
                            ₹${Number(
                                lowestPrice.price
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>
                    `
                    : ""
            }
            ${
                highestRating
                    ? `
                    <div class="insight-card">
                        <h3>⭐ Highest Rated</h3>
                        <p>${highestRating.name}</p>
                        <strong>
                            ⭐ ${highestRating.rating}
                        </strong>
                    </div>
                    `
                    : ""
            }
        `;
    }
    // SAME CATEGORY
    else {
        const category = categories[0];
        let highestRam = null;
        let highestStorage = null;
        let highestBattery = null;
        // 📱 PHONE
        if (category === "Smartphone") {
            const ramProducts = compareProducts.filter(
                product =>
                    product.specifications?.ram
            );
            const batteryProducts = compareProducts.filter(
                product =>
                    product.specifications?.battery
            );
            highestRam =
                ramProducts.length > 0
                    ? [...ramProducts].sort(
                        (a, b) =>
                            parseFloat(
                                b.specifications.ram
                            ) -
                            parseFloat(
                                a.specifications.ram
                            )
                    )[0]
                    : null;
            highestBattery =
                batteryProducts.length > 0
                    ? [...batteryProducts].sort(
                        (a, b) =>
                            parseFloat(
                                b.specifications.battery
                            ) -
                            parseFloat(
                                a.specifications.battery
                            )
                    )[0]
                    : null;
        }
        // 💻 LAPTOP
        if (category === "Laptop") {
            const ramProducts = compareProducts.filter(
                product =>
                    product.specifications?.ram
            );
            const storageProducts = compareProducts.filter(
                product =>
                    product.specifications?.storage
            );
            highestRam =
                ramProducts.length > 0
                    ? [...ramProducts].sort(
                        (a, b) =>
                            parseFloat(
                                b.specifications.ram
                            ) -
                            parseFloat(
                                a.specifications.ram
                            )
                    )[0]
                    : null;
            highestStorage =
                storageProducts.length > 0
                    ? [...storageProducts].sort(
                        (a, b) =>
                            parseFloat(
                                b.specifications.storage
                            ) -
                            parseFloat(
                                a.specifications.storage
                            )
                    )[0]
                    : null;
        }
        // 🎧 HEADPHONE
        if (category === "Headphone") {
            const batteryProducts = compareProducts.filter(
                product =>
                    product.specifications?.battery
            );
            highestBattery =
                batteryProducts.length > 0
                    ? [...batteryProducts].sort(
                        (a, b) =>
                            parseFloat(
                                b.specifications.battery
                            ) -
                            parseFloat(
                                a.specifications.battery
                            )
                    )[0]
                    : null;
        }
        insights = `
            ${
                lowestPrice
                    ? `
                    <div class="insight-card">
                        <h3>💰 Lowest Price</h3>
                        <p>${lowestPrice.name}</p>
                        <strong>
                            ₹${Number(
                                lowestPrice.price
                            ).toLocaleString("en-IN")}
                        </strong>
                    </div>
                    `
                    : ""
            }
            ${
                highestRating
                    ? `
                    <div class="insight-card">
                        <h3>⭐ Highest Rated</h3>
                        <p>${highestRating.name}</p>
                        <strong>
                            ⭐ ${highestRating.rating}
                        </strong>
                    </div>
                    `
                    : ""
            }
            ${
                highestRam
                    ? `
                    <div class="insight-card">
                        <h3>🧠 Highest RAM</h3>
                        <p>${highestRam.name}</p>
                        <strong>
                            ${highestRam.specifications.ram}
                        </strong>
                    </div>
                    `
                    : ""
            }
            ${
                highestStorage
                    ? `
                    <div class="insight-card">
                        <h3>💾 Highest Storage</h3>
                        <p>${highestStorage.name}</p>
                        <strong>
                            ${highestStorage.specifications.storage}
                        </strong>
                    </div>
                    `
                    : ""
            }

            ${
                highestBattery
                    ? `
                    <div class="insight-card">
                        <h3>🔋 Highest Battery</h3>
                        <p>${highestBattery.name}</p>
                        <strong>
                            ${highestBattery.specifications.battery}
                        </strong>
                    </div>
                    `
                    : ""
            }
        `;
    }

    container.innerHTML = `
        <div class="recommendation-box">
            <h2>🤖 Comparison Insights</h2>

            <div class="insight-grid">
                ${insights}
            </div>
        </div>
    `;
}

function getNumber(value) {
    return parseFloat(String(value).replace(/[^0-9.]/g, "")) || 0;
}


function checkLogin() {
    const userArea =
        document.getElementById("userArea");
    if (!userArea) {
        return;
    }
    const user =
        JSON.parse(
            localStorage.getItem("loggedInUser")
        );
    if (user) {
        userArea.innerHTML = `
            <span>
                Welcome, ${user.name} 👋
            </span>
            <button onclick="logout()">
                Logout
            </button>
        `;
    } else {
        userArea.innerHTML = `
            <a href="login.html">
                Login
            </a>
            <a href="register.html">
                Register
            </a>
        `;
    }
}
checkLogin();

function logout() {
    localStorage.removeItem("loggedInUser");
    window.location.href = "index.html";
}

// add to favorites
async function addToFavorites(productId) {
    const userData = localStorage.getItem("loggedInUser");
    // Check login
    if (!userData) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userData);
    try {
        const response = await fetch(
            "http://localhost:5000/api/favorites",
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId: productId
                })
            }
        );
        const data = await response.json();
        if (response.ok) {
            alert("❤️ Product added to favorites!");
            return true;
        } else {
            alert(data.message);
            return false;
        }
    } catch (error) {
        console.log(error);
        alert("Server connection failed.");
    }
}

async function removeFromFavorites(productId) {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
        alert("Please login first.");
        window.location.href = "login.html";
        return;
    }
    const user = JSON.parse(userData);
    try {
        const response = await fetch(
            "http://localhost:5000/api/favorites",
            {
                method: "DELETE",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    userId: user.id,
                    productId: productId
                })
            }
        );
        const data = await response.json();
        if (response.ok) {
            alert("💔 Product removed from favorites!");
            return true;
        } else {
            alert(data.message);
            return false;
        }
    } catch (error) {
        console.log(error);
        alert("Server connection failed.");
    }
}

async function toggleFavorite(productId) {
    const userData = localStorage.getItem("loggedInUser");
    if(!userData){
        alert("Please login first.");
        window.location.href="login.html";
        return;
    }
    const button = document.getElementById(`favorite-${productId}`);

    if (!button) return;

    const icon = button.querySelector(".favorite-icon");

    // Check current state
    const isFavorite = button.classList.contains("favorited");

    if (isFavorite) {
        const sucess = await removeFromFavorites(productId);
        if(sucess){
            favoriteProductIds.delete(productId);
            icon.textContent = "🤍";
        }
        
    } else {
        const sucess = await addToFavorites(productId);
        if(sucess){
            favoriteProductIds.add(productId);
            icon.textContent = "❤️";
        }
    }
}

async function loadFavorites() {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
        favoriteProductIds = new Set();
        return;
    }
    const user = JSON.parse(userData);
    try {
        const response = await fetch(
            `http://localhost:5000/api/favorites/${user.id}`
        );
        if (!response.ok) {
            return;
        }
        const data = await response.json();
        const favorites = data.favorites || [];
        favoriteProductIds = new Set(
            favorites.map(favorite => {
                // populated product
                if (favorite._id) {
                    return favorite._id;
                }
                // if favorite is an object containing productId
                if (favorite.productId?._id) {
                    return favorite.productId._id;
                }
                // if productId is just an ID
                return favorite.productId;
            })
        );
    } catch (error) {
        console.error("Error loading favorites:", error);
    }
}

async function loadProducts() {
    try {
        // First load user's favorites
        await loadFavorites();
        const response = await fetch(
            "http://localhost:5000/api/products"
        );
        const products = await response.json();
        allProducts = products;
        showProducts(allProducts);
    } catch (error) {
        console.error("Error:", error);
    }
}
loadProducts();