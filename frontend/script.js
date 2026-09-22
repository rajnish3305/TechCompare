let allProducts = [];
let compareProducts = [];
fetch("https://techcompare-1.onrender.com/api/products")

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
        container.innerHTML += `
            <div class="product-card">
                <img src="${product.image}" alt="${product.name}">
                <h2>${product.name}</h2>
                <p><strong>Brand:</strong> ${product.brand}</p>
                <p><strong>Category:</strong> ${product.category}</p>
                <p><strong>Price:</strong> ₹${product.price.toLocaleString("en-IN")}</p>
                <p><strong>Rating:</strong> ⭐ ${product.rating}</p>
                <hr>
                <p><strong>RAM:</strong> ${product.specifications.ram}</p>
                <p><strong>Storage:</strong> ${product.specifications.storage}</p>
                <p><strong>Processor:</strong> ${product.specifications.processor}</p>
                <p><strong>Battery:</strong> ${product.specifications.battery}</p>
                <button class="favorite-button"
                    onclick="addToFavorites('${product._id}')">❤️ Favorite
                </button>
                <button onclick="addToCompare('${product._id}')" ${compareProducts.some(p => p._id === product._id) ? "disabled" : ""}>
                    ${compareProducts.some(p => p._id === product._id) ? "✓ Added" : "Add to Compare"}
                </button>
            </div>
        `;
    });
}
// product ko search ke liye 
// Search + Category Filter

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

// function showComparison() {
//     if (compareProducts.length < 2) {
//         alert("Please select at least 2 products.");
//         return;
//     }
//     const container =  document.getElementById("comparisonTable");
//     let table = `
//         <h2>Product Comparison</h2>
//         <div class="table-container">
//         <table>
//             <thead>
//                 <tr>
//                     <th>Specification</th>
//     `;
//     // Product names
//     compareProducts.forEach(product => {
//         table += `
//             <th>${product.name}</th>
//         `;
//     });
//     table += `
//                 </tr>
//             </thead>
//             <tbody>
//     `;
//     // Price
//     table += createComparisonRow(
//         "Price",
//         compareProducts.map(product =>
//             "₹" + product.price.toLocaleString("en-IN")
//         )
//     );
//     // Rating
//     table += createComparisonRow(
//         "Rating",
//         compareProducts.map(product =>
//             "⭐ " + product.rating
//         )
//     );
//     // RAM
//     table += createComparisonRow(
//         "RAM",
//         compareProducts.map(product =>
//             product.specifications.ram
//         )
//     );
//     // Storage
//     table += createComparisonRow(
//         "Storage",
//         compareProducts.map(product =>
//             product.specifications.storage
//         )
//     );
//     // Processor
//     table += createComparisonRow(
//         "Processor",
//         compareProducts.map(product =>
//             product.specifications.processor
//         )
//     );
//     // Battery
//     table += createComparisonRow(
//         "Battery",
//         compareProducts.map(product =>
//             product.specifications.battery
//         )
//     );
//     // Display
//     table += createComparisonRow(
//         "Display",
//         compareProducts.map(product =>
//             product.specifications.display
//         )
//     );
//     // Camera
//     table += createComparisonRow(
//         "Camera",
//         compareProducts.map(product =>
//             product.specifications.camera
//         )
//     );
//     table += `
//             </tbody>
//         </table>
//         </div>
//     `;
//     container.innerHTML = table;
// }

function showComparison() {
    // At least 2 products required
    if (compareProducts.length < 2) {
        alert("Please select at least 2 products.");
        return;
    }
    const container = document.getElementById("comparisonTable");
    let table = `
        <h2>Product Comparison</h2>
        <div class="table-container">
            <table class="comparison-table">
                <thead>
                    <tr>
                        <th>Specification</th>
    `;
    // Product Names
    compareProducts.forEach(product => {
        table += `
            <th>
                ${product.name}
            </th>
        `;
    });
    table += `
                    </tr>
                </thead>
                <tbody>
    `;
    // Price
    // Lower price = Better
    table += createComparisonRow(
        "Price",
        compareProducts.map(product =>
            "₹" + product.price.toLocaleString("en-IN")
        ),
        "lower"
    );
    // Rating
    // Higher rating = Better
    table += createComparisonRow(
        "Rating",
        compareProducts.map(product =>
            "⭐ " + product.rating
        ),
        "higher"
    );
    // RAM
    // Higher RAM = Better
    table += createComparisonRow(
        "RAM",
        compareProducts.map(product =>
            product.specifications.ram
        ),
        "higher"
    );
    // Storage
    // Higher Storage = Better
    table += createComparisonRow(
        "Storage",
        compareProducts.map(product =>
            product.specifications.storage
        ),
        "higher"
    );
    // Processor
    // Processor Score = Better
    table += createComparisonRow(
        "Processor",
        compareProducts.map(product => {
            const processor = product.specifications.processor || "N/A";
            const score = product.specifications.processorScore;
            return score !== undefined ? `${processor} (${score})` : processor;
        }),
        "processor"
    );
    // Battery
    // Higher Battery = Better
    table += createComparisonRow(
        "Battery",
        compareProducts.map(product =>
            product.specifications.battery
        ),
        "higher"
    );
    // Display
    // Higher Display Size = Better
    table += createComparisonRow(
        "Display",
        compareProducts.map(product =>
            product.specifications.display
        ),
        "higher"
    );
    // Camera
    // Higher MP = Better
    table += createComparisonRow(
        "Camera",
        compareProducts.map(product =>
            product.specifications.camera
        ),
        "higher"
    );
    // Close Table
    table += `
                </tbody>
            </table>
        </div>
    `;
    // Show table on page
    container.innerHTML = table;
    showRecommendations();
}

// function createComparisonRow(title, values) {
//     let row = `
//         <tr>
//             <th>${title}</th>
//     `;
//     values.forEach(value => {
//         row += `
//             <td>${value}</td>
//         `;
//     });
//     row += `
//         </tr>
//     `;
//     return row;
// }

function createComparisonRow(title, values, better = "higher") {
    // Values se number extract karo
    const numbers = values.map(value => {
        const match = String(value).replace(/,/g, "").match(/[\d.]+/);
        return match ? parseFloat(match[0]) : NaN;
    });
    // Sirf valid numbers
    const validNumbers = numbers.filter(number => !isNaN(number));
    let bestValue = null;
    // Best value calculate karo
    if (validNumbers.length > 0) {
        if (better === "lower") {
            bestValue = Math.min(...validNumbers);
        } 
        else {
            bestValue = Math.max(...validNumbers);
        }
    }
    let row = `
        <tr>
            <th>${title}</th>
    `;
    // Har product ka cell
    values.forEach((value, index) => {
        const isBest = !isNaN(numbers[index]) && numbers[index] === bestValue;
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

function showRecommendations() {
    const container =
        document.getElementById("recommendationSection");
    if (!container) {
        return;
    }
    if (compareProducts.length < 2) {
        container.innerHTML = "";
        return;
    }
    // Lowest Price
    const lowestPrice =
        [...compareProducts].sort(
            (a, b) => a.price - b.price
        )[0];
    // Highest Rating
    const highestRating =
        [...compareProducts].sort(
            (a, b) => b.rating - a.rating
        )[0];
    // Highest RAM
    const highestRam =
        [...compareProducts].sort(
            (a, b) => getNumber(a.specifications.ram)
                   - getNumber(b.specifications.ram)
        )[compareProducts.length - 1];
    // Highest Battery
    const highestBattery =
        [...compareProducts].sort(
            (a, b) => getNumber(a.specifications.battery)
                   - getNumber(b.specifications.battery)
        )[compareProducts.length - 1];
    container.innerHTML = `

        <div class="recommendation-box">
            <h2>🤖 Comparison Insights</h2>
            <div class="insight-grid">
                <div class="insight-card">
                    <h3>💰 Lowest Price</h3>
                    <p>${lowestPrice.name}</p>
                    <strong>
                        ₹${lowestPrice.price.toLocaleString("en-IN")}
                    </strong>
                </div>
                <div class="insight-card">
                    <h3>⭐ Highest Rated</h3>
                    <p>${highestRating.name}</p>
                    <strong>
                        ⭐ ${highestRating.rating}
                    </strong>
                </div>
                <div class="insight-card">
                    <h3>💾 Highest RAM</h3>
                    <p>${highestRam.name}</p>
                    <strong>
                        ${highestRam.specifications.ram}
                    </strong>
                </div>
                <div class="insight-card">
                    <h3>🔋 Highest Battery</h3>
                    <p>${highestBattery.name}</p>
                    <strong>
                        ${highestBattery.specifications.battery}
                    </strong>
                </div>
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
            "https://techcompare-1.onrender.com/api/favorites",
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
        } else {
            alert(data.message);
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
            "https://techcompare-1.onrender.com/api/favorites",
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
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log(error);
        alert("Server connection failed.");
    }
}