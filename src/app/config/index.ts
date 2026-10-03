import "dotenv/config";

const config = {
  port: process.env.PORT || 5000,

  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || "access-secret",
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "1d",

    refreshSecret: process.env.JWT_REFRESH_SECRET || "refresh-secret",
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
  },

  bcryptSaltRounds: Number(process.env.BCRYPT_SALT_ROUNDS) || 12,
};

export default config;
