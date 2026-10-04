import "dotenv/config";

const config = {
  port: process.env.PORT || 5000,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",

    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  google: {
    clientId: process.env.GOOGLE_CLIENT_ID || "",
  },

  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    successUrl:
      process.env.PAYMENT_SUCCESS_URL ||
      "http://localhost:5173/payment/success",

    cancelUrl:
      process.env.PAYMENT_CANCEL_URL || "http://localhost:5173/payment/cancel",
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};

export default config;
