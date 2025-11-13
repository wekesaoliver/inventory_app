const pool = require("../pool");
const slugify = require("../../lib/slugify");

const mapCategory = (row) => ({
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    itemCount: row.item_count ?? null,
});

async function getAllCategories() {
    const { rows } = await pool.query(
        `SELECT c.*, COUNT(i.id) AS item_count
        FROM categories c
        LEFT JOIN items i ON i.category_id = c.id
        GROUP BY c.id
        ORDER BY c.name ASC
        `
    );
    return rows.map(mapCategory);
}

async function getCategoryBySlug(slug) {
    const { rows } = await pool.query(
        `
        SELECT c.*, COUNT(i.id) AS item_count
        FROM categories c
        LEFT JOIN items i ON i.category_id = c.id
        WHERE c.slug = $1
        GROUP BY c.id
        LIMIT 1
        `,
        [slug]
    );
    return rows[0] ? mapCategory(rows[0]) : null;
}

async function createCategory({ name, description }) {
    const slug = slugify(name);
    const { rows } = await pool.query(
        `
        INSERT INTO categories (name, slug, description)
        VALUES ($1, $2, $3)
        RETURNING *
        `,
        [name.trim(), slug, description || null]
    );
    return mapCategory(rows[0]);
}

async function updateCategory(id, { name, description }) {
    const slug = slugify(name);
    const { rows } = await pool.query(
        `
        UPDATE categories
        SET name = $1,
            slug = $2,
            description = $3,
            updated_at = now()
        WHERE id = $4
        RETURNING *
        `,
        [name.trim(), slug, description || null, id]
    );
    return rows[0] ? mapCategory(rows[0]) : null;
}

async function deleteCategory(id) {
    const { rowCount } = await pool.query(
        "DELETE FROM categories WHERE id = $1",
        [id]
    );
    return rowCount > 0;
}

module.exports = {
    getAllCategories,
    getCategoryBySlug,
    createCategory,
    updateCategory,
    deleteCategory,
};
