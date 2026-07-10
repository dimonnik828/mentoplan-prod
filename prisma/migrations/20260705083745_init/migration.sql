-- CreateTable
CREATE TABLE "Audit" (
    "id" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "revenue" DOUBLE PRECISION NOT NULL,
    "employees" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "auditSummary" TEXT,
    "recommendations" JSONB,
    "checklists" JSONB,
    "adResources" JSONB,

    CONSTRAINT "Audit_pkey" PRIMARY KEY ("id")
);
