export async function GET() {
  const dbUrl = process.env.DATABASE_URL;

  return new Response(
    JSON.stringify({
      message: "Server-side env variable accessed",
      dbConfigured: !!dbUrl,
    }),
    { status: 200 }
  );
}
