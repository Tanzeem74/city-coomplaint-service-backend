import app from "./app.js";
import prisma from "./app/lib/prisma.js";

const port = process.env.PORT || 5000;

const main = async () => {
  try {
    await prisma.$connect();
    console.log("Database connected successfully.");

    app.listen(port, () => {
      console.log(`Server is running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to connect to database:", error);
    process.exit(1);
  }
};

main();
