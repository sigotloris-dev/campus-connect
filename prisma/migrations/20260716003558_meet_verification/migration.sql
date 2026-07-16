-- AlterTable
ALTER TABLE "Match" ADD COLUMN     "metAt" TIMESTAMP(3),
ADD COLUMN     "verifyCode" TEXT,
ADD COLUMN     "verifyCodeBy" TEXT,
ADD COLUMN     "verifyCodeExp" TIMESTAMP(3);
