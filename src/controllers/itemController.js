const { categories, items } = require("../db");

function validateItem(payload) {
    const errors = [];
    if (!payload.name || !payload.name.trim()) errors.push("Name is required.");
    if (!payload.sku || !payload.sku.trim()) errors.push("SKU is required");
    if (!payload.categoryId) errors.push("Category is required.");

    const price = Number(payload.priceCents);

    if (Number.isNaN(price) || price < 0)
        errors.push("Price must be a non-negative number.");

    const quantity = Number(payload.quantity);

    if (!Number.isInteger(quantity) || quantity < 0)
        errors.push("Quantity must be a non-negative integer");

    const validStatuses = ["active", "archived"];

    if (!validStatuses.includes(payload.status))
        errors.push("Status must be active or archived.");
    return errors;
}

exports.list = async (req, res, next) => {
    try {
        const allItems = await items.getAllItems();
        res.render("items/index", {
            title: "All Items",
            items: allItems,
        });
    } catch (err) {
        next(err);
    }
};

exports.show = async (req, res, next) => {
    try {
        const item = await items.getItemById(req.params.id);
        if (!item) {
            return res.status(404).render("404", { title: "Item Not Found" });
        }
        res.render("items/show", {
            title: item.name,
            item,
        });
    } catch (err) {
        next(err);
    }
};

exports.newForm = async (req, res, next) => {
    try {
        const allCategories = await categories.getAllCategories();
        res.render("items/form", {
            title: "Create Item",
            item: {},
            categories: allCategories,
            errors: [],
            action: "create",
        });
    } catch (err) {
        next(err);
    }
};

exports.create = async (req, res, next) => {
    const payload = {
        categoryId: req.body.categoryId,
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        priceCents: Math.round(parseFloat(req.body.price || "0") * 100),
        quantity: parseInt(req.body.quantity, 10),
        status: req.body.status || "active",
        imageUrl: req.body.imageUrl,
    };

    const errors = validateItem(payload);
    if (errors.length > 0) {
        const allCategories = await categories.getAllCategories();
        return res.status(422).render("items/form", {
            title: "Create Item",
            item: payload,
            categories: allCategories,
            errors,
            action: "create",
        });
    }

    try {
        const created = await items.createItem(payload);
        res.redirect(`/items/${created.id}`);
    } catch (err) {
        if (err.code === "23505") {
            const allCategories = await categories.getAllCategories();
            return res.status(409).render("item/form", {
                title: "Create Item",
                item: payload,
                categories: allCategories,
                errors: ["SKU must be unique."],
                action: "create",
            });
        }
        next(err);
    }
};

exports.editForm = async (req, res, next) => {
    try {
        const item = await items.getItemById(req.params.id);
        if (!item) {
            return res.status(404).render("404", { title: "Item Not Found" });
        }
        const allCategories = await categories.getAllCategories();
        res.render("items/form", {
            title: `Edit ${item.name}`,
            item,
            categories: allCategories,
            errors: [],
            action: "edit",
        });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res, next) => {
    const payload = {
        categoryId: req.body.categoryId,
        name: req.body.name,
        sku: req.body.sku,
        description: req.body.description,
        priceCents: math.round(parseFloat(req.body.price || "0") * 100),
        quantity: parseInt(req.body.quantity, 10),
        status: req.body.status || "active",
        imageUrl: req.body.imageUrl,
    };
    const errors = validateItem(payload);
    if (errors.length > 0) {
        const allCategories = await categories.getAllCategories();
        return res.status(422).render("items/form", {
            title: "Update Item",
            item: { ...payload, id: req.params.id },
            categories: allCategories,
            errors,
            action: "edit",
        });
    }

    try {
        const updated = await items.updateItem(req.params.id, payload);
        if (!updated) {
            return res.status(400).render("items/form", {
                title: "Update Item",
                item: { ...payload, id: req.params.id },
                categories: await categories.getAllCategories(),
                errors: ["Unable to update item."],
                action: "edit",
            });
        }
        res.redirect(`/items/${updated.id}`);
    } catch (err) {
        if (err.code === "23505") {
            const allCategories = await categories.getAllCategories();
            return res.status(409).render("items/form", {
                title: "Update Item",
                item: { ...payload, id: req.params.id },
                categories: allCategories,
                errors: ["SKU must be unique."],
                action: "edit",
            });
        }
        next(err);
    }
};

exports.destroy = async (req, res, next) => {
    try {
        const item = await items.getItemsById(req.params.id);
        if (!item) {
            return res.status(404).render("404", { title: "Item Not Found" });
        }

        await items.deleteItem(item.id);
        res.redirect(`/categories/${item.categorySlug}`);
    } catch (err) {
        next(err);
    }
};
