import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Create admin user
  const adminPassword = await bcrypt.hash("admin123", 10);
  const admin = await prisma.user.upsert({
    where: { email: "admin@sms.local" },
    update: {},
    create: {
      email: "admin@sms.local",
      password: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      isActive: true,
    },
  });

  // Create sample teacher
  const teacherPassword = await bcrypt.hash("teacher123", 10);
  const teacher = await prisma.user.upsert({
    where: { email: "teacher@sms.local" },
    update: {},
    create: {
      email: "teacher@sms.local",
      password: teacherPassword,
      firstName: "John",
      lastName: "Doe",
      role: "TEACHER",
      isActive: true,
    },
  });

  // Create sample students
  const studentPassword = await bcrypt.hash("student123", 10);
  const student1 = await prisma.user.upsert({
    where: { email: "student1@sms.local" },
    update: {},
    create: {
      email: "student1@sms.local",
      password: studentPassword,
      firstName: "Alice",
      lastName: "Smith",
      role: "STUDENT",
      isActive: true,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { email: "student2@sms.local" },
    update: {},
    create: {
      email: "student2@sms.local",
      password: studentPassword,
      firstName: "Bob",
      lastName: "Johnson",
      role: "STUDENT",
      isActive: true,
    },
  });

  // Create sample project
  const project = await prisma.project.create({
    data: {
      title: "Web Development Course",
      description: "Learn modern web development with Next.js",
      status: "ACTIVE",
      startDate: new Date(),
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      createdBy: teacher.id,
    },
  });

  // Create sample tasks
  const task1 = await prisma.task.create({
    data: {
      title: "Setup Development Environment",
      description: "Install Node.js and Next.js",
      status: "COMPLETED",
      priority: 1,
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      createdBy: teacher.id,
      assignedTo: student1.id,
    },
  });

  const task2 = await prisma.task.create({
    data: {
      title: "Build Todo Application",
      description: "Create a simple todo app with React",
      status: "IN_PROGRESS",
      priority: 2,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
      projectId: project.id,
      createdBy: teacher.id,
      assignedTo: student2.id,
    },
  });

  console.log("✓ Database seeded successfully");
  console.log(`✓ Created admin: ${admin.email}`);
  console.log(`✓ Created teacher: ${teacher.email}`);
  console.log(`✓ Created students: ${student1.email}, ${student2.email}`);
  console.log(`✓ Created project: ${project.title}`);
  console.log(`✓ Created tasks: ${task1.title}, ${task2.title}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
