CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS categories (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    name text NOT NULL UNIQUE,
    slug text NOT NULL UNIQUE,
    description text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS items (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id uuid NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
    name text NOT NULL,
    sku text NOT NULL UNIQUE,
    description text,
    price_cents integer NOT NULL CHECK (price_cents >= 0),
    quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active','archived')),
    image_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);
