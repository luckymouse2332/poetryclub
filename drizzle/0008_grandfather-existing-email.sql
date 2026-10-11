-- Apply before enabling requireEmailVerification. Existing credential accounts
-- used password login before email verification existed; keep that contract.
-- Accounts created after this migration remain unverified until their OTP is used.
UPDATE "user" AS existing_user
SET email_verified = true
WHERE existing_user.email_verified = false
  AND EXISTS (
    SELECT 1
    FROM "account" AS credential_account
    WHERE credential_account.user_id = existing_user.id
      AND credential_account.provider_id = 'credential'
      AND credential_account.password IS NOT NULL
  );
