"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, Mail, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!email || !password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const result = await signIn("credentials", { email, password, redirect: false });
      if (result?.error) {
        toast.error("Invalid email or password");
        setLoading(false);
      } else {
        window.location.href = "/";
      }
    } catch {
      toast.error("Something went wrong");
      setLoading(false);
    }
  };

  return (
    <AuthLayout title="Welcome Back" description="Sign in to your Netai account">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="email">Email</Label>
          <div className="relative mt-1">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="email" type="email" value={email} onChange={(e: any) => setEmail(e?.target?.value ?? "")} placeholder="you@example.com" className="pl-10" required />
          </div>
        </div>
        <div>
          <Label htmlFor="password">Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input id="password" type="password" value={password} onChange={(e: any) => setPassword(e?.target?.value ?? "")} placeholder="••••••••" className="pl-10" required />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={loading} loading={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Don&apos;t have an account? <Link href="/signup" className="text-primary font-medium hover:underline">Create one</Link>
      </p>
      <div className="text-center mt-3">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" /> Back to Store
        </Link>
      </div>
    </AuthLayout>
  );
}
