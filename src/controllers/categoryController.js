const { categories, items } = require("../db");

function handleError(res, err, redirect = "/categories/new") {
    console.error(err);
    return res.status(400).render("categories/form", {
        title: "Create Category",
        category: res.locals.categoryPayload || {},
        errors: ["Something went wrong. Please try again."],
        action: "create",
    });
}

exports.list = async (req, res, next) => {
    try {
        const allCategories = await categories.getAllCategories();
        res.render("Categories/index", {
            title: "Categories",
            categories: allCategories,
        });
    } catch (err) {
        next(err);
    }
};

exports.show = async (req, res, next) => {
    try {
        const category = await categories.getCategoryBySlug(req.params.slug);
        if (!category) {
            return res.status(404).render("404", {
                title: "Category Not Found",
            });
        }
        const categoryItems = await items.getItemsByCategoryId(category.id);
        res.render("categories/show", {
            title: category.name,
            category,
            items: categoryItems,
        });
    } catch (err) {
        next(err);
    }
};

exports.newForm = (req, res) => {
    res.render("categories/form", {
        title: "Create Category",
        category: {},
        errors: [],
        action: "create",
    });
};

exports.create = async (req, res) => {
    const payload = {
        name: req.body.name,
        description: req.body.description,
    };
    res.locals.categoryPayload = payload;

    if (!payload.name || !payload.name.trim()) {
        return res.status(422).render("categories/form", {
            title: "Create Category",
            category: payload,
            errors: ["Name is required."],
            action: "create",
        });
    }

    try {
        const category = await categories.createCategory(payload);
        res.redirect(`/categories/${category.slug}`);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).render("categories/form", {
                title: "Create Category",
                category: payload,
                errors: ["Category name already exists."],
                action: "create",
            });
        }
        return handleError(res, err);
    }
};

exports.editForm = async (req, res, next) => {
    try {
        const category = await categories.getCategoryBySlug(req.params.slug);
        if (!category) {
            return res
                .status(404)
                .render("404", { title: "Category Not Found" });
        }
        res.render("categories/form", {
            title: `Edit ${category.name}`,
            category,
            errors: [],
            action: "edit",
        });
    } catch (err) {
        next(err);
    }
};

exports.update = async (req, res) => {
    const payload = {
        name: req.body.name,
        description: req.body.description,
    };

    if (!payload.name || !payload.name.trim()) {
        return res.status(422).render("categories/form", {
            title: "Update Category",
            category: payload,
            errors: ["Name is required"],
            action: "edit",
        });
    }

    try {
        const categoryBySlug = await categories.getCategoryBySlug(
            req.params.slug
        );
        if (!categoryBySlug) {
            return res
                .status(404)
                .render("404", { title: "Category Not Found" });
        }

        const updated = await categories.updateCategory(
            categoryBySlug.id,
            payload
        );
        if (!updated) {
            return res.status(400).render("categories/form", {
                title: "Update Category",
                category: payload,
                errors: ["Unable to update category."],
                action: "edit",
            });
        }

        res.redirect(`/categories/${updated.slug}`);
    } catch (err) {
        if (err.code === "23505") {
            return res.status(409).render("categories/form", {
                title: "Update Category",
                category: payload,
                errors: ["Category name already exists."],
                action: "edit",
            });
        }
        return handleError(res, err, `/categories/${req.params.slug}/edit`);
    }
};

exports.destroy = async (req, res, next) => {
    try {
        const category = await categories.getCategoryBySlug(req.params.slug);
        if (!category) {
            return res
                .status(404)
                .render("404", { title: "Category Not Found" });
        }

        const categoryItems = await items.getItemsByCategoryId(category.id);
        if (categoryItems.length > 0) {
            return res.status(400).render("categories/show", {
                title: category.name,
                category,
                items: categoryItems,
                errors: [
                    "Cannot delete category with items. Reassign or delete items first.",
                ],
            });
        }
        await categories.deleteCategory(category.id);
        res.redirect("/categories");
    } catch (err) {
        next(err);
    }
};
