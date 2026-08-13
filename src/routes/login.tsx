import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { Scissors, LogIn } from "lucide-react";
import { motion } from "framer-motion";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Admin Sign in · Barber Lab" }, { name: "robots", content: "noindex" }] }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Auth bypassed per request — go straight into admin.
    setTimeout(() => navigate({ to: "/admin" }), 400);
  };

  return (
    <main className="min-h-screen grid place-items-center bg-background text-foreground p-6">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md border border-border/60 bg-card/40 p-8 md:p-10 backdrop-blur"
      >
        <Link to="/" className="flex items-center gap-2 justify-center mb-8">
          <Scissors size={16} className="text-primary" />
          <span className="font-display tracking-[0.28em] text-sm">BARBER·LAB</span>
        </Link>
        <h1 className="font-display text-3xl md:text-4xl text-center">Admin sign in</h1>
        <p className="mt-2 text-center text-xs text-muted-foreground">
          Auth is currently bypassed · any credentials work in dev.
        </p>

        <div className="mt-8 space-y-4">
          <label className="block">
            <span className="eyebrow mb-2 block">Email</span>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)}
              className="input w-full" placeholder="admin@barberlab.ca" />
          </label>
          <label className="block">
            <span className="eyebrow mb-2 block">Password</span>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
              className="input w-full" placeholder="••••••••" />
          </label>
        </div>

        <button type="submit" disabled={loading}
          className="mt-8 w-full flex items-center justify-center gap-2 border border-primary bg-primary text-primary-foreground py-3 text-[11px] uppercase tracking-[0.32em] disabled:opacity-60">
          <LogIn size={14}/> {loading ? "Signing in…" : "Sign in"}
        </button>

        <p className="mt-6 text-center text-[10px] uppercase tracking-[0.28em] text-muted-foreground">
          <Link to="/" className="hover:text-primary">Back to site</Link>
        </p>
      </motion.form>
    </main>
  );
}
