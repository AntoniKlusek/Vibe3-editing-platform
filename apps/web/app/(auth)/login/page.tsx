"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button, Input, Card } from "@vibe3/ui";

export default function LoginPage() {
  const router = useRouter();
  const [login, setLogin] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Minimalistic test check
    if (login === "admin" && password === "admin") {
      // Simulate login success by setting a test cookie for the middleware
      document.cookie = "test-session=admin; path=/; max-age=3600";
      console.log("Login successful! Redirecting...");
      router.push("/upload");
    } else {
      setError("Nieprawidłowy login lub hasło (admin/admin)");
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center p-4 bg-background">
      <Card className="w-full max-w-md p-8 space-y-6 shadow-xl border-border/40 bg-card/60 backdrop-blur-md">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground uppercase">
            Vibe3
          </h1>
          <p className="text-xs uppercase tracking-widest text-muted-foreground opacity-60">
            Solo Creator Workspace
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="login">
              Login
            </label>
            <Input
              id="login"
              placeholder="admin"
              value={login}
              onChange={(e) => setLogin(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70" htmlFor="password">
              Hasło
            </label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {error && (
            <p className="text-sm font-medium text-destructive text-center">
              {error}
            </p>
          )}

          <Button type="submit" className="w-full font-bold" disabled={loading}>
            {loading ? "Logowanie..." : "Zaloguj się"}
          </Button>
        </form>

        <div className="text-center">
          <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold opacity-50">
            Phase: MVP testing
          </p>
        </div>
      </Card>
    </main>
  );
}
