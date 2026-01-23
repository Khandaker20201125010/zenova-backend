import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  const adminEmail = "admin@zenova.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const admin = await prisma.user.create({
      data: {
        email: adminEmail,
        name: "Admin",
        password: await bcrypt.hash("Admin@123", 12),
        role: "ADMIN",
        emailVerified: true,
      },
    });

    await prisma.subscription.create({
      data: {
        userId: admin.id,
        plan: "PROFESSIONAL",
        status: "ACTIVE",
      },
    });

    console.log("✅ Admin user created");
  } else {
    console.log("ℹ️ Admin already exists");
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
