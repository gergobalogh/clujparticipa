process.env.ADMIN_SECRET = "test-admin-secret-12345";
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  "postgresql://clujparticipa:clujparticipa@localhost:55432/clujparticipa_test";
process.env.AUTH_SECRET = "test-auth-secret";
process.env.AUTH_URL = "http://localhost:3000";
process.env.NEXT_PUBLIC_APP_URL = "http://localhost:3000";
process.env.CLOUDFLARE_ACCOUNT_ID = "test-account-id";
process.env.CLOUDFLARE_IMAGES_API_TOKEN = "test-api-token";
process.env.RESEND_API_KEY = "";
process.env.RESEND_FROM_EMAIL = "noreply@test.clujparticipa.digital";
process.env.GOOGLE_ID ??= "test-google-id";
process.env.GOOGLE_SECRET ??= "test-google-secret";
process.env.FACEBOOK_ID ??= "test-fb-id";
process.env.FACEBOOK_SECRET ??= "test-fb-secret";
