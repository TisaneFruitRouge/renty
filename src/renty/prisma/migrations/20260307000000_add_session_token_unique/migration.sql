-- Make session.token required and unique
DELETE FROM "session" WHERE token IS NULL;
ALTER TABLE "session" ALTER COLUMN "token" SET NOT NULL;
CREATE UNIQUE INDEX IF NOT EXISTS "session_token_key" ON "session"("token");
