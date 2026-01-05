/* eslint-disable no-console */

const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

async function main() {
  // Users
  const admin = await prisma.user.upsert({
    where: { email: "admin@sms.local" },
    update: { fullName: "Admin User", role: "ADMIN", isActive: true },
    create: { email: "admin@sms.local", fullName: "Admin User", role: "ADMIN" },
  });

  const teacherUser = await prisma.user.upsert({
    where: { email: "teacher@sms.local" },
    update: { fullName: "Ananya Teacher", role: "TEACHER", isActive: true },
    create: {
      email: "teacher@sms.local",
      fullName: "Ananya Teacher",
      role: "TEACHER",
    },
  });

  const studentUser1 = await prisma.user.upsert({
    where: { email: "student1@sms.local" },
    update: { fullName: "Ravi Student", role: "STUDENT", isActive: true },
    create: {
      email: "student1@sms.local",
      fullName: "Ravi Student",
      role: "STUDENT",
    },
  });

  const studentUser2 = await prisma.user.upsert({
    where: { email: "student2@sms.local" },
    update: { fullName: "Meera Student", role: "STUDENT", isActive: true },
    create: {
      email: "student2@sms.local",
      fullName: "Meera Student",
      role: "STUDENT",
    },
  });

  // Teacher profile
  const teacher = await prisma.teacher.upsert({
    where: { userId: teacherUser.id },
    update: { employeeNo: "EMP-1001" },
    create: { userId: teacherUser.id, employeeNo: "EMP-1001" },
  });

  // Student profiles
  const student1 = await prisma.student.upsert({
    where: { userId: studentUser1.id },
    update: { admissionNo: "ADM-2001" },
    create: { userId: studentUser1.id, admissionNo: "ADM-2001" },
  });

  const student2 = await prisma.student.upsert({
    where: { userId: studentUser2.id },
    update: { admissionNo: "ADM-2002" },
    create: { userId: studentUser2.id, admissionNo: "ADM-2002" },
  });

  // Class
  const class10A = await prisma.class.upsert({
    where: { code: "10-A-2025" },
    update: {
      name: "Grade 10",
      section: "A",
      year: 2025,
      teacherId: teacher.id,
    },
    create: {
      code: "10-A-2025",
      name: "Grade 10",
      section: "A",
      year: 2025,
      teacherId: teacher.id,
    },
  });

  // Enrollments (M:N)
  await prisma.enrollment.upsert({
    where: {
      studentId_classId: { studentId: student1.id, classId: class10A.id },
    },
    update: { isActive: true },
    create: { studentId: student1.id, classId: class10A.id },
  });

  await prisma.enrollment.upsert({
    where: {
      studentId_classId: { studentId: student2.id, classId: class10A.id },
    },
    update: { isActive: true },
    create: { studentId: student2.id, classId: class10A.id },
  });

  // Attendance (one record per student per class per day)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  await prisma.attendance.upsert({
    where: {
      studentId_classId_date: {
        studentId: student1.id,
        classId: class10A.id,
        date: today,
      },
    },
    update: { status: "PRESENT" },
    create: {
      studentId: student1.id,
      classId: class10A.id,
      date: today,
      status: "PRESENT",
    },
  });

  await prisma.attendance.upsert({
    where: {
      studentId_classId_date: {
        studentId: student2.id,
        classId: class10A.id,
        date: today,
      },
    },
    update: { status: "LATE", note: "Arrived 10 minutes late" },
    create: {
      studentId: student2.id,
      classId: class10A.id,
      date: today,
      status: "LATE",
      note: "Arrived 10 minutes late",
    },
  });

  // Announcement (teacher -> class optional)
  await prisma.announcement.create({
    data: {
      title: "Unit Test on Friday",
      body: "We will have a short test on Chapters 1-3.",
      teacherId: teacher.id,
      classId: class10A.id,
    },
  });

  console.log("Seed completed:");
  console.log({
    admin: admin.email,
    teacher: teacherUser.email,
    class: class10A.code,
  });
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
