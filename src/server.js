require("dotenv").config();
const express = require("express");
const methodOverride = require("method-override");
const path = require("path");

const categoryRoutes = require("./routes/categoryRoutes");
const itemRoutes = require("./routes/itemRoutes");
const { title } = require("process");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static files
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", async (req, res, next) => {
    try {
        const { categories } = require("./db");
        const allCategories = await categories.getAllCategories();
        res.render("home", {
            title: "Inventory Home",
            categories: allCategories,
        });
    } catch (err) {
        next(err);
    }
});

app.use("/categories", categoryRoutes);
app.use("/items", itemRoutes);

// Simple 404
app.use((req, res) => {
    res.status(404).render("404", { title: "Not Found" });
});

// Error handler
app.use((err, req, res, next) => {
    console.error(err);
    res.status(500).render("500", { title: "Server Error" });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
