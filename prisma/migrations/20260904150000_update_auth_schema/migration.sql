-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPEND');

-- AlterTable
ALTER TABLE "users" DROP COLUMN IF EXISTS "otp",
DROP COLUMN IF EXISTS "verifidStatus",
ADD COLUMN "status" "Status" NOT NULL DEFAULT 'INACTIVE',
ADD COLUMN "isVerified" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "verifiedOtp" TEXT,
ADD COLUMN "verifiedOtpExpireAt" TIMESTAMP(3),
ADD COLUMN "resetPasswordOtp" TEXT,
ADD COLUMN "resetPasswordExpireAt" TIMESTAMP(3);

-- DropEnum
DROP TYPE IF EXISTS "verifidStatus";
