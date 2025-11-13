const pool = require("../pool");

const mapItem = (row) => ({
    id: row.id,
    categoryId: row.category_id,
    categoryName: row.categoryName ?? null,
    categorySlug: row.category_slug ?? null,
    name: row.name,
    sku: row.sku,
    description: row.description,
    priceCents: row.price_cents,
    quantity: row.quantity,
    status: row.status,
    imageUrl: row.imageurl,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

async function getAllItems() {
    const { rows } = await pool.query(
        `
        SELECT i.*, c.name AS category_name, c.slug AS category_slug
        FROM items i
        JOIN categories c ON i.category_id = c.id
        ORDER BY i.name ASC
        `
    );
    return rows.map(mapItem);
}

async function getItemsByCategoryId(categoryId) {
    const { rows } = await pool.query(
        `
        SELECT i.*, c.name AS category_name, c.slug AS category_slug
        FROM items i
        JOIN categories c ON i.category_id = c.id
        WHERE category_id = $1
        ORDER BY i.name ASC
        `,
        [categoryId]
    );
    return rows.map(mapItem);
}

async function getItemById(id) {
    const { rows } = await pool.query(
        `
        SELECT i.*, c.name AS category_name, c.slug AS category_slug
        FROM items i
        JOIN categories c ON  i.category_id = c.id
        WHERE i.id = $1
        LIMIT 1
        `,
        [id]
    );
    return rows[0] ? mapItem(rows[0]) : null;
}

async function createItem({
    categoryId,
    name,
    sku,
    description,
    priceCents,
    quantity,
    status,
    imageUrl,
}) {
    const { rows } = await pool.query(
        `INSERT INTO items
        (category_id, name, sku, description, price_cents, quantity, status, image_url)
        VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
        `,
        [
            categoryId,
            name.trim(),
            sku.trim(),
            description || null,
            priceCents,
            quantity,
            status || "active",
            imageUrl || null,
        ]
    );
    return mapItem(rows[0]);
}

async function updateItem(id, fields) {
    const {
        categoryId,
        name,
        sku,
        description,
        priceCents,
        quantity,
        status,
        imageUrl,
    } = fields;

    const { rows } = await pool.query(
        `
        UPDATE items
        SET category_id = $1,
                name = $2,
                sku = $3,
                description = $4,
                price_cents = $5,
                quantity= $6,
                status = $7,
                image_url = $8,
                updated_at = now()
        WHERE id = $9
        RETURNING *
        `,
        [
            categoryId,
            name.trim(),
            sku.trim(),
            description || null,
            priceCents,
            quantity,
            status,
            imageUrl || null,
            id,
        ]
    );

    return rows[0] ? mapItem(rows[0]) : null;
}

async function deleteItem(id) {
    const { rowCount } = await pool.query("DELETE FROM items WHERE id = $1", [
        id,
    ]);
    return rowCount > 0;
}

module.exports = {
    getAllItems,
    getItemsByCategoryId,
    getItemById,
    createItem,
    updateItem,
    deleteItem,
};
