require("dotenv").config({
    path: require("path").join(__dirname, "..", ".env"),
});
const pool = require("../src/db/pool");
const { categories, items } = require("../src/db");
const slugify = require("../src/lib/slugify");

const seedData = {
    categories: [
        {
            name: "Electronics",
            description: "Electronic devices and gadgets",
            items: [
                {
                    name: "Laptop",
                    sku: "ELEC-LAP-001",
                    description: "High-performance laptop for work and gaming",
                    priceCents: 129999,
                    quantity: 15,
                    status: "active",
                    imageUrl:
                        "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400",
                },
                {
                    name: "Smartphone",
                    sku: "ELEC-PHONE-001",
                    description:
                        "Latest model smartphone with advanced features",
                    priceCents: 89999,
                    quantity: 30,
                    status: "active",
                },
                {
                    name: "Wireless Headphones",
                    sku: "ELEC-HEAD-001",
                    description: "Premium noise-cancelling headphones",
                    priceCents: 29999,
                    quantity: 25,
                    status: "active",
                },
            ],
        },
        {
            name: "Clothing",
            description: "Apparel and fashion items",
            items: [
                {
                    name: "Cotton T-Shirt",
                    sku: "CLOTH-TEE-001",
                    description: "Comfortable 100% cotton t-shirt",
                    priceCents: 1999,
                    quantity: 50,
                    status: "active",
                },
                {
                    name: "Denim Jeans",
                    sku: "CLOTH-JEAN-001",
                    description: "Classic fit denim jeans",
                    priceCents: 5999,
                    quantity: 35,
                    status: "active",
                },
                {
                    name: "Winter Jacket",
                    sku: "CLOTH-JACK-001",
                    description: "Warm winter jacket with insulation",
                    priceCents: 12999,
                    quantity: 20,
                    status: "active",
                },
            ],
        },
        {
            name: "Books",
            description: "Physical and digital books",
            items: [
                {
                    name: "Programming Guide",
                    sku: "BOOK-PROG-001",
                    description: "Complete guide to modern programming",
                    priceCents: 2999,
                    quantity: 40,
                    status: "active",
                },
                {
                    name: "Fiction Novel",
                    sku: "BOOK-FICT-001",
                    description: "Bestselling fiction novel",
                    priceCents: 1999,
                    quantity: 60,
                    status: "active",
                },
                {
                    name: "Cookbook",
                    sku: "BOOK-COOK-001",
                    description: "Collection of international recipes",
                    priceCents: 2499,
                    quantity: 25,
                    status: "active",
                },
            ],
        },
        {
            name: "Home & Garden",
            description: "Home improvement and gardening supplies",
            items: [
                {
                    name: "Garden Tools Set",
                    sku: "HOME-TOOL-001",
                    description: "Complete set of gardening tools",
                    priceCents: 4999,
                    quantity: 18,
                    status: "active",
                },
                {
                    name: "Indoor Plant",
                    sku: "HOME-PLANT-001",
                    description: "Low-maintenance indoor plant",
                    priceCents: 1499,
                    quantity: 45,
                    status: "active",
                },
            ],
        },
        {
            name: "Sports & Outdoors",
            description: "Sports equipment and outdoor gear",
            items: [
                {
                    name: "Basketball",
                    sku: "SPORT-BALL-001",
                    description: "Official size basketball",
                    priceCents: 2999,
                    quantity: 30,
                    status: "active",
                },
                {
                    name: "Yoga Mat",
                    sku: "SPORT-YOGA-001",
                    description: "Non-slip yoga mat",
                    priceCents: 2499,
                    quantity: 22,
                    status: "active",
                },
                {
                    name: "Camping Tent",
                    sku: "SPORT-TENT-001",
                    description: "4-person camping tent",
                    priceCents: 8999,
                    quantity: 12,
                    status: "active",
                },
            ],
        },
    ],
};

async function seed() {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");

        console.log("Starting seed...\n");

        // Seed categories and their items
        for (const categoryData of seedData.categories) {
            // Check if category exists by slug
            const slug = slugify(categoryData.name);
            let category = await categories.getCategoryBySlug(slug);

            if (category) {
                console.log(
                    `Category "${categoryData.name}" already exists, skipping...`
                );
            } else {
                category = await categories.createCategory({
                    name: categoryData.name,
                    description: categoryData.description,
                });
                console.log(`✅ Created category: ${category.name}`);
            }

            // Seed items for this category
            for (const itemData of categoryData.items) {
                // Check if item exists by SKU
                const existingItem = await pool.query(
                    "SELECT id FROM items WHERE sku = $1",
                    [itemData.sku]
                );

                if (existingItem.rows.length > 0) {
                    console.log(
                        `  ⏭️  Item with SKU "${itemData.sku}" already exists, skipping...`
                    );
                } else {
                    await items.createItem({
                        ...itemData,
                        categoryId: category.id,
                    });
                    console.log(`  ✅ Created item: ${itemData.name}`);
                }
            }
        }

        await client.query("COMMIT");
        console.log("\n🎉 Seed completed successfully!");
    } catch (err) {
        await client.query("ROLLBACK");
        console.error("❌ Seed failed:", err);
        throw err;
    } finally {
        client.release();
        await pool.end();
    }
}

seed()
    .then(() => {
        process.exit(0);
    })
    .catch((err) => {
        console.error("Unexpected error:", err);
        process.exit(1);
    });

