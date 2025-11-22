-- Run this query to check if your user has premium access
-- Replace 'your@email.com' with your actual email

SELECT
  id,
  email,
  "aiEnabled",
  "hasPremium",
  "createdAt",
  "updatedAt"
FROM "User"
WHERE email = 'your@email.com';

-- If hasPremium is false, manually update it for testing:
-- UPDATE "User"
-- SET "hasPremium" = true, "aiEnabled" = true
-- WHERE email = 'your@email.com';
