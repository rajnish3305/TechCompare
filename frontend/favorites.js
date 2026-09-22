async function loadFavorites() {
    const container = document.getElementById("favoritesContainer");
    const userData = localStorage.getItem("loggedInUser");
    // Check login
    if (!userData) {
        container.innerHTML = `
            <div class="empty-favorites">
                <h2>Please Login First</h2>
                <a href="login.html">
                    Login
                </a>
            </div>
        `;
        return;
    }
    const user = JSON.parse(userData);
    try {
        const response = await fetch(
            `https://techcompare-1.onrender.com/api/favorites/${user.id}`
        );
        const data = await response.json();
        if (!response.ok) {
            container.innerHTML = `
                <p>${data.message}</p>
            `;
            return;
        }
        if (data.favorites.length === 0) {
            container.innerHTML = `
                <div class="empty-favorites">
                    <h2>No Favorites Yet ❤️</h2>
                    <p>
                        Add products to your favorites
                        from the product page.
                    </p>
                    <a href="index.html">
                        Browse Products
                    </a>
                </div>
            `;
            return;
        }
        container.innerHTML = "";
        data.favorites.forEach(product => {
            container.innerHTML += `
                <div class="favorite-card">
                    <img
                        src="${product.image || 'https://via.placeholder.com/250'}"
                        alt="${product.name}"
                    >
                    <div class="favorite-info">
                        <h2>${product.name}</h2>
                        <p>
                            <strong>Brand:</strong>
                            ${product.brand}
                        </p>
                        <p>
                            <strong>Category:</strong>
                            ${product.category}
                        </p>
                        <p>
                            <strong>Price:</strong>
                            ₹${product.price.toLocaleString("en-IN")}
                        </p>
                        <p>
                            <strong>Rating:</strong>
                            ⭐ ${product.rating}
                        </p>
                        <button
                            onclick="removeFavorite('${product._id}')"
                        >
                            💔 Remove Favorite
                        </button>
                    </div>
                </div>
            `;
        });
    } catch (error) {
        console.log(error);
        container.innerHTML = `
            <p>Server connection failed.</p>
        `;
    }
}
async function removeFavorite(productId) {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
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
            loadFavorites();
        } else {
            alert(data.message);
        }
    } catch (error) {
        console.log(error);
        alert("Server connection failed.");
    }
}
loadFavorites();