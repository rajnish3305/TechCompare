let allAdminProducts = [];
const userData = localStorage.getItem("loggedInUser");
// Check login
if (!userData) {
    alert("Please login first.");
    window.location.href = "login.html";

}
// Get user
const user = JSON.parse(userData);
// Check admin
if (user.role !== "admin") {
    alert("Access denied. Admin only.");
    window.location.href = "index.html";
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
        const product = {
            name:
                document.getElementById("productName").value,
            brand:
                document.getElementById("brand").value,
            category:
                document.getElementById("category").value,
            price:
                Number(
                    document.getElementById("price").value
                ),
            rating:
                Number(
                    document.getElementById("rating").value
                ),
            image:
                document.getElementById("image").value,
            specifications: {
                ram:
                    document.getElementById("ram").value,
                storage:
                    document.getElementById("storage").value,
                processor:
                    document.getElementById("processor").value,
                battery:
                    document.getElementById("battery").value,
                display:
                    document.getElementById("display").value,
                camera:
                    document.getElementById("camera").value
            }
        };
        try {
            const response =
                await fetch(
                    "https://techcompare-1.onrender.com/api/products",
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
            const message =
                document.getElementById(
                    "productMessage"
                );
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

async function loadProducts() {
    const container =
        document.getElementById(
            "adminProducts"
        );
    try {
        const response =
            await fetch(
                "https://techcompare-1.onrender.com/api/products"
            );
        const products =
            await response.json();
        allAdminProducts = products;
        showAdminProducts(allAdminProducts);
    } catch (error) {
        console.log(error);
        container.innerHTML =
            "<p>Unable to load products.</p>";
    }
}
loadProducts();

function showAdminProducts(products) {
    const container =
        document.getElementById(
            "adminProducts"
        );
    container.innerHTML = "";
    if (products.length === 0) {
        container.innerHTML = `
            <p>
                No products found.
            </p>
        `;
        return;
    }
    products.forEach(product => {
        container.innerHTML += `
            <div class="admin-product-card">
                <div>
                    <h3>
                        ${product.name}
                    </h3>
                    <p>
                        Brand:
                        ${product.brand}
                    </p>
                    <p>
                        Category:
                        ${product.category}
                    </p>
                    <p>
                        Price:
                        ₹${product.price.toLocaleString("en-IN")}
                    </p>
                    <p>
                        Rating:
                        ⭐ ${product.rating}
                    </p>
                </div>
                <div>
                    <button
                        onclick="editProduct('${product._id}')"
                    >
                        ✏️ Edit
                    </button>
                    <button
                        onclick="deleteProduct('${product._id}')"
                    >
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `;
    });
}

function editProduct(productId) {
    const product =
        allAdminProducts.find(
            product => product._id === productId
        );
    if (!product) {
        return;
    }
    document.getElementById(
        "editProductId"
    ).value = product._id;
    document.getElementById(
        "editProductName"
    ).value = product.name;
    document.getElementById(
        "editBrand"
    ).value = product.brand;
    document.getElementById(
        "editCategory"
    ).value = product.category;
    document.getElementById(
        "editPrice"
    ).value = product.price;
    document.getElementById(
        "editRating"
    ).value = product.rating;
    document.getElementById(
        "editImage"
    ).value = product.image || "";
    const editImagePreview = document.getElementById("editImagePreview");
    if (product.image) {
        editImagePreview.src =                product.image;
        editImagePreview.style.display =
            "block";
    } else {
        editImagePreview.src = "";
        editImagePreview.style.display =
            "none";
    }
    document.getElementById(
        "editRam"
    ).value = product.specifications?.ram || "";
    document.getElementById(
        "editStorage"
    ).value = product.specifications?.storage || "";
    document.getElementById(
        "editProcessor"
    ).value =
        product.specifications?.processor || "";
    document.getElementById(
        "editBattery"
    ).value =
        product.specifications?.battery || "";
    document.getElementById(
        "editDisplay"
    ).value =
        product.specifications?.display || "";
    document.getElementById(
        "editCamera"
    ).value =
        product.specifications?.camera || "";
    document.getElementById(
        "editModal"
    ).classList.add("active");
}

function closeEditModal() {
    document
        .getElementById("editModal")
        .classList.remove("active");
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
        const updatedProduct = {
            userId: user.id,
            name:
                document.getElementById(
                    "editProductName"
                ).value,
            brand:
                document.getElementById(
                    "editBrand"
                ).value,
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
                ).value,
            specifications: {
                ram:
                    document.getElementById(
                        "editRam"
                    ).value,
                storage:
                    document.getElementById(
                        "editStorage"
                    ).value,
                processor:
                    document.getElementById(
                        "editProcessor"
                    ).value,
                battery:
                    document.getElementById(
                        "editBattery"
                    ).value,
                display:
                    document.getElementById(
                        "editDisplay"
                    ).value,
                camera:
                    document.getElementById(
                        "editCamera"
                    ).value
            }
        };
        try {
            const response =
                await fetch(
                    `https://techcompare-1.onrender.com/api/products/${productId}`,
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

const imageInput =
    document.getElementById("image");
const imagePreview =
    document.getElementById("imagePreview");
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

const editImageInput =
    document.getElementById("editImage");
const editImagePreview =
    document.getElementById(
        "editImagePreview"
    );
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
adminSearch.addEventListener("input", function () {
    const searchText = this.value.trim().toLowerCase();

    // Agar search box empty hai
    if (searchText === "") {
        showAdminProducts(allAdminProducts);
        return;
    }

    const filteredProducts = allAdminProducts.filter(product => {
        const name = String(product.name || "").toLowerCase();
        const brand = String(product.brand || "").toLowerCase();
        const category = String(product.category || "").toLowerCase();

        return (
            name.includes(searchText) ||
            brand.includes(searchText) ||
            category.includes(searchText)
        );
    });

    // Search result display karo
    if (filteredProducts.length > 0) {
        showAdminProducts(filteredProducts);
    } else {
        document.getElementById("adminProducts").innerHTML = `
            <p>No product found for "${searchText}"</p>
        `;
    }
});