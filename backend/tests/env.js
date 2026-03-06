// Set environment variables before any module is loaded
process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRE = '7d';
process.env.STRIPE_SECRET_KEY = 'sk_test_fake_key_for_testing_only';
process.env.STRIPE_WEBHOOK_SECRET = 'whsec_test_fake_secret';
process.env.NODE_ENV = 'test';
