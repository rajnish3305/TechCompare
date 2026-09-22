const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcryptjs");
const adminMiddleware = require("./middleware/adminMiddleware");

require("dotenv").config();

const Product = require("./models/Product");
const User = require("./models/User");

const app = express();

app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((error) => {
        console.log("MongoDB Error:", error);
    });

app.get("/", (req, res) => {
    res.send("TechCompare Backend Running");
});

app.post("/api/register", async (req, res) => {
    try {
        const { name, email, password } = req.body;
        // Check all fields
        if (!name || !email || !password) {
            return res.status(400).json({
                message: "All fields are required"
            });
        }
        // Check if email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                message: "Email already registered"
            });
        }
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        // Create new user
        const newUser = new User({
            name,
            email,
            password: hashedPassword
        });
        // Save user in MongoDB
        await newUser.save();
        res.status(201).json({ message:"Registration successful"});
    } catch (error) {
        console.log(error);
        res.status(500).json({message: "Server error"});
    }
});

app.post("/api/login", async (req, res) => {
    try {
        const { email, password } = req.body;
        // Check fields
        if (!email || !password) {
            return res.status(400).json({
                message: "Email and password are required"
            });
        }
        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        // Compare password
        const isPasswordCorrect =
            await bcrypt.compare(
                password,
                user.password
            );
        if (!isPasswordCorrect) {
            return res.status(401).json({
                message: "Invalid email or password"
            });
        }
        // Login successful
        res.status(200).json({
            message: "Login successful",
           user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.post("/api/favorites", async (req, res) => {
    try {
        const { userId, productId } = req.body;
        // Check required data
        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required"
            });
        }
        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        // Check if product is already favorite
        if (user.favorites.includes(productId)) {
            return res.status(400).json({
                message: "Product already in favorites"
            });
        }
        // Add product to favorites
        user.favorites.push(productId);
        // Save user
        await user.save();
        res.status(200).json({
            message: "Product added to favorites"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.delete("/api/favorites", async (req, res) => {
    try {
        const { userId, productId } = req.body;
        if (!userId || !productId) {
            return res.status(400).json({
                message: "User ID and Product ID are required"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        user.favorites =
            user.favorites.filter(
                id => id.toString() !== productId
            );
        await user.save();
        res.status(200).json({
            message: "Product removed from favorites"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/favorites/:userId", async (req, res) => {
    try {
        const { userId } = req.params;
        const user = await User.findById(userId)
            .populate("favorites");
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        res.status(200).json({
            favorites: user.favorites
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
});

app.get("/api/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (error) {
        res.status(500).json({
            message: "Error fetching products"
        });
    }
});

// admin dashboard
app.post(
    "/api/products",
    adminMiddleware,
    async (req, res) => {
    try {
        const {userId,...productData} = req.body;
        const product = new Product(req.body);
        await product.save();
        res.status(201).json({
            message: "Product added successfully",
            product: product
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Error adding product"
        });
    }
});

app.put(
    "/api/products/:id",
    adminMiddleware,
    async (req, res) => {
        try {
            const {userId,...productData} = req.body;

            const product =
                await Product.findByIdAndUpdate(
                    req.params.id,
                    productData,
                    {
                        new: true,
                        runValidators: true
                    }
                );
            if (!product) {
                return res.status(404).json({
                    message:
                        "Product not found"
                });
            }
            res.status(200).json({
                message:
                    "Product updated successfully",
                product: product
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message:
                    "Error updating product"
            });
        }
    }
);
app.delete(
    "/api/products/:id",
    adminMiddleware,
    async (req, res) => {
        try {
            const product =
                await Product.findByIdAndDelete(
                    req.params.id
                );
            if (!product) {
                return res.status(404).json({
                    message: "Product not found"
                });

            }
            res.status(200).json({
                message:
                    "Product deleted successfully"
            });
        } catch (error) {
            console.log(error);
            res.status(500).json({
                message:
                    "Error deleting product"
            });
        }
    }
);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});