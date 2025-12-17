import Image from "next/image";
import config from "./config";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-between py-32 px-16 bg-white dark:bg-black sm:items-start">
        <Image
          className="dark:invert"
          src="/next.svg"
          alt="Next.js logo"
          width={100}
          height={20}
          priority
        />

        {/* Environment Information Display */}
        <div className="w-full mb-8 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-zinc-900 dark:to-zinc-800 rounded-lg border border-blue-200 dark:border-zinc-700">
          <h2 className="text-xl font-bold mb-4 text-blue-900 dark:text-blue-300">
            🌍 Environment Configuration
          </h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Environment:
              </span>
              <span
                className={`px-3 py-1 rounded-full font-medium ${
                  config.appEnv === "production"
                    ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    : config.appEnv === "staging"
                    ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"
                    : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                }`}
              >
                {config.appEnv.toUpperCase()}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                App Name:
              </span>
              <span className="text-zinc-600 dark:text-zinc-400">
                {config.appName}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                API URL:
              </span>
              <span className="text-zinc-600 dark:text-zinc-400 font-mono text-xs">
                {config.apiUrl}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="font-semibold text-zinc-700 dark:text-zinc-300">
                Debug Mode:
              </span>
              <span
                className={
                  config.enableDebug
                    ? "text-green-600 dark:text-green-400"
                    : "text-red-600 dark:text-red-400"
                }
              >
                {config.enableDebug ? "✅ Enabled" : "❌ Disabled"}
              </span>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left">
          <h1 className="max-w-xs text-3xl font-semibold leading-10 tracking-tight text-black dark:text-zinc-50">
            🏫 School Management System
          </h1>
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            A production-ready Next.js application demonstrating
            enterprise-level DevOps practices including multi-environment
            configuration, secure secrets management, and automated CI/CD
            pipelines.
          </p>
          <div className="flex gap-4 mt-4">
            <a
              href="https://github.com"
              className="px-6 py-3 bg-black dark:bg-white text-white dark:text-black rounded-lg font-medium hover:opacity-80 transition-opacity"
            >
              View on GitHub
            </a>
            <a
              href="/api/health"
              className="px-6 py-3 bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-white rounded-lg font-medium hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              API Health Check
            </a>
          </div>
        </div>

        <div className="flex flex-col items-center gap-6 text-center sm:items-start sm:text-left mt-8">
          <p className="max-w-md text-lg leading-8 text-zinc-600 dark:text-zinc-400">
            Looking for documentation? Check out the{" "}
            <a
              href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Templates
            </a>{" "}
            or the{" "}
            <a
              href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
              className="font-medium text-zinc-950 dark:text-zinc-50"
            >
              Learning
            </a>{" "}
            center.
          </p>
        </div>
        <div className="flex flex-col gap-4 text-base font-medium sm:flex-row">
          <a
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-foreground px-5 text-background transition-colors hover:bg-[#383838] dark:hover:bg-[#ccc] md:w-[158px]"
            href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Image
              className="dark:invert"
              src="/vercel.svg"
              alt="Vercel logomark"
              width={16}
              height={16}
            />
            Deploy Now
          </a>
          <a
            className="flex h-12 w-full items-center justify-center rounded-full border border-solid border-black/[.08] px-5 transition-colors hover:border-transparent hover:bg-black/[.04] dark:border-white/[.145] dark:hover:bg-[#1a1a1a] md:w-[158px]"
            href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
            target="_blank"
            rel="noopener noreferrer"
          >
            Documentation
          </a>
        </div>
      </main>
    </div>
  );
}
