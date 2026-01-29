import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required env var: ${name}`);
  }
  return value;
}

async function main() {
  const email = requireEnv("ADMIN_EMAIL");
  const plainPassword = requireEnv("ADMIN_PASSWORD");

  const firstName = process.env.ADMIN_FIRST_NAME ?? "Admin";
  const lastName = process.env.ADMIN_LAST_NAME ?? "User";

  const hashedPassword = await bcrypt.hash(plainPassword, 10);

  const admin = await prisma.user.upsert({
    where: { email },
    update: {
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN",
      isActive: true,
    },
    create: {
      email,
      password: hashedPassword,
      firstName,
      lastName,
      role: "ADMIN",
      isActive: true,
    },
    select: {
      id: true,
      email: true,
      firstName: true,
      lastName: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });

  console.log("✓ Admin upserted:");
  console.log(admin);
}

main()
  .catch((err) => {
    console.error("Failed to create admin:", err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
