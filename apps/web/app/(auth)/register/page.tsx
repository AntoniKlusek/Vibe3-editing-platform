import type { Metadata } from "next";

export const metadata: Metadata = { title: "Register" };

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6 rounded-xl border bg-card p-8 shadow-sm">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">Create account</h1>
          <p className="text-sm text-muted-foreground">Start streaming with Vibe3</p>
        </div>
        {/* TODO: Replace with <AuthForm mode="register" /> */}
        <p className="text-center text-sm text-muted-foreground">Register form placeholder</p>
      </div>
    </main>
  );
}
