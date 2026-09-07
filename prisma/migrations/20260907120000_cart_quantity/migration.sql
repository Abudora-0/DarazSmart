-- Cart items gain a quantity so a signed-in cart can round-trip across devices.

-- 1. Collapse any pre-existing duplicate (userId, productId) rows before the
--    unique index below can reject them. Keeps the oldest row of each pair.
DELETE FROM "CartItem" a
USING "CartItem" b
WHERE a."userId" IS NOT NULL
  AND a."userId" = b."userId"
  AND a."productId" = b."productId"
  AND (a."addedAt" > b."addedAt" OR (a."addedAt" = b."addedAt" AND a."id" > b."id"));

-- 2. Additive, with a default, so existing rows stay valid.
ALTER TABLE "CartItem" ADD COLUMN IF NOT EXISTS "quantity" INTEGER NOT NULL DEFAULT 1;

-- 3. Null userIds (anonymous carts) are distinct in Postgres, so this only
--    constrains signed-in rows.
CREATE UNIQUE INDEX IF NOT EXISTS "CartItem_userId_productId_key"
  ON "CartItem"("userId", "productId");
