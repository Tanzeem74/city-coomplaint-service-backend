import "dotenv/config";
import bcrypt from "bcrypt";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not defined");
}

const adapter = new PrismaPg({
  connectionString,
});

const prisma = new PrismaClient({
  adapter,
});

const main = async () => {
  const email = process.env.ADMIN_EMAIL || "admin@cityservice.com";

  const password = process.env.ADMIN_PASSWORD || "Admin12345";

  const hashedPassword = await bcrypt.hash(password, 12);

  const admin = await prisma.user.upsert({
    where: {
      email,
    },

    update: {
      role: "ADMIN",
      status: "ACTIVE",
      isDeleted: false,
    },

    create: {
      name: "System Admin",
      email,
      password: hashedPassword,
      role: "ADMIN",
      status: "ACTIVE",
      isVerified: true,
    },
  });

  console.log("Admin created successfully");
  console.log(`Admin email: ${admin.email}`);
};

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
