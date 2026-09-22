const User = require("../models/User");

async function adminMiddleware(req, res, next) {
    try {
        const { userId } = req.body;
        if (!userId) {
            return res.status(401).json({
                message: "User ID is required"
            });
        }
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({
                message: "User not found"
            });
        }
        if (user.role !== "admin") {
            return res.status(403).json({
                message: "Access denied. Admin only."
            });
        }
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Server error"
        });
    }
}
module.exports = adminMiddleware;