-- AlterTable
ALTER TABLE "Usuario"
ADD COLUMN "resetSenhaToken" TEXT,
ADD COLUMN "resetSenhaExpiraEm" TIMESTAMP(3);
