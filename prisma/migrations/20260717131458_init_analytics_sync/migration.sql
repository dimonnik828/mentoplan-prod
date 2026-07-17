-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "products" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(500) NOT NULL,

    CONSTRAINT "products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tech_cards" (
    "id" SERIAL NOT NULL,
    "card_number" VARCHAR(20) NOT NULL,
    "dish_name" TEXT NOT NULL,
    "organization_id" INTEGER,
    "approval_date" DATE,
    "application_area" VARCHAR(255),
    "portion_norm" DECIMAL(10,3) DEFAULT 1000,
    "technology" TEXT,
    "technology_source" VARCHAR(20),
    "serving_requirements" TEXT,
    "total_output_kg" DECIMAL(12,4),
    "proteins_per_100g" DECIMAL(6,1),
    "fats_per_100g" DECIMAL(6,1),
    "carbs_per_100g" DECIMAL(6,1),
    "calories_per_100g" DECIMAL(8,1),
    "note" TEXT,
    "source_page" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,
    "search_vector" tsvector,

    CONSTRAINT "tech_cards_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_ingredients" (
    "id" SERIAL NOT NULL,
    "card_id" INTEGER NOT NULL,
    "product_id" INTEGER,
    "line_number" INTEGER,
    "gross_weight_g" DECIMAL(10,3),
    "net_weight_g" DECIMAL(10,3),
    "output_g" DECIMAL(10,3),
    "gross_weight_kg" DECIMAL(10,4),
    "net_weight_kg" DECIMAL(10,4),
    "output_kg" DECIMAL(10,4),

    CONSTRAINT "card_ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audits" (
    "id" TEXT NOT NULL DEFAULT (gen_random_uuid())::text,
    "name" TEXT,
    "address" TEXT NOT NULL,
    "total_area" INTEGER,
    "hall_area" INTEGER,
    "seats" INTEGER,
    "staff_count" INTEGER,
    "avg_check" INTEGER,
    "revenue" INTEGER NOT NULL,
    "rent" INTEGER,
    "utilities" INTEGER,
    "payroll" INTEGER,
    "management_costs" INTEGER,
    "cost_of_goods" INTEGER,
    "other_expenses" INTEGER,
    "food_cost_percent" DOUBLE PRECISION,
    "payroll_percent" DOUBLE PRECISION,
    "rent_percent" DOUBLE PRECISION,
    "utilities_percent" DOUBLE PRECISION,
    "management_percent" DOUBLE PRECISION,
    "other_percent" DOUBLE PRECISION,
    "profit_percent" DOUBLE PRECISION,
    "profit_absolute" INTEGER,
    "revenue_per_employee" INTEGER,
    "revenue_per_seat" INTEGER,
    "revenue_per_sqm" INTEGER,
    "health_index" INTEGER,
    "recommendations" JSONB NOT NULL,
    "checklists" JSONB,
    "ad_resources" JSONB,
    "organization_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "categories" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "parent_id" TEXT,

    CONSTRAINT "categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ingredients" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "unit" VARCHAR(10) NOT NULL,
    "price_per_unit" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "ingredients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "session_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "path" TEXT,
    "timestamp" BIGINT,
    "data" JSONB,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "organizations_name_key" ON "organizations"("name");

-- CreateIndex
CREATE UNIQUE INDEX "products_name_key" ON "products"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tech_cards_card_number_key" ON "tech_cards"("card_number");

-- CreateIndex
CREATE UNIQUE INDEX "categories_name_key" ON "categories"("name");

-- CreateIndex
CREATE UNIQUE INDEX "ingredients_name_key" ON "ingredients"("name");

-- CreateIndex
CREATE INDEX "analytics_events_type_idx" ON "analytics_events"("type");

-- CreateIndex
CREATE INDEX "analytics_events_session_id_idx" ON "analytics_events"("session_id");

-- CreateIndex
CREATE INDEX "analytics_events_timestamp_idx" ON "analytics_events"("timestamp");

-- AddForeignKey
ALTER TABLE "categories" ADD CONSTRAINT "categories_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;
