-- CreateTable
CREATE TABLE "TTK" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "number" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ingredients" JSONB NOT NULL,
    "technology" TEXT NOT NULL,
    "presentation" TEXT,
    "storage" TEXT,
    "quality" TEXT,
    "proteins" DOUBLE PRECISION,
    "fats" DOUBLE PRECISION,
    "carbs" DOUBLE PRECISION,
    "calories" DOUBLE PRECISION,
    "engineer" TEXT,
    "responsible" TEXT,

    CONSTRAINT "TTK_pkey" PRIMARY KEY ("id")
);
