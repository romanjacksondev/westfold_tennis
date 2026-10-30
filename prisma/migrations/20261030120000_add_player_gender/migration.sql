-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE');

-- AlterTable (existing players are male)
ALTER TABLE "Player" ADD COLUMN "gender" "Gender" NOT NULL DEFAULT 'MALE';
ALTER TABLE "Player" ALTER COLUMN "gender" DROP DEFAULT;
