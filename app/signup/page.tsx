"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { Sparkles, Mail, Lock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthLayout } from "@/components/layouts/auth-layout";

export default function SignupPage() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [loading, setLoading] = useState(false);
  const handleChange = (e: any) => setForm((p) => ({ ...(p ?? {}), [e?.target?.name ?? ""]: e?.target?.value ?? "" }));

  const handleSubmit = async (e: React.FormEvent) => {
    e?.preventDefault?.();
    if (!form.name || !form.email || !form.password) { toast.error("Please fill in all required fields"); return; }
    if (form.password !== form.confirmPassword) { toast.error("Passwords do not match"); return; }
    if ((form.password?.length ?? 0) < 6) { toast.error("Password must be at least 6 characters"); return; }
    setLoading(true);
    try {
      const res = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const data = await res.json();
      if (!res.ok) { toast.error(data?.error ?? "Signup failed"); setLoading(false); return; }
      const result = await signIn("credentials", { email: form.email, password: form.password, redirect: false });
      if (result?.error) {
        toast.error("Account created but login failed. Please sign in.");
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
    <AuthLayout title="Create Account" description="Join Netai for a beautiful shopping experience">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <div className="relative mt-1"><User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="name" name="name" value={form.name} onChange={handleChange} placeholder="Jane Doe" className="pl-10" required /></div>
        </div>
        <div>
          <Label htmlFor="email">Email *</Label>
          <div className="relative mt-1"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="you@example.com" className="pl-10" required /></div>
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <div className="relative mt-1"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="phone" name="phone" value={form.phone} onChange={handleChange} placeholder="+254 700 000 000" className="pl-10" /></div>
        </div>
        <div>
          <Label htmlFor="password">Password *</Label>
          <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="••••••••" className="pl-10" required /></div>
        </div>
        <div>
          <Label htmlFor="confirmPassword">Confirm Password *</Label>
          <div className="relative mt-1"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input id="confirmPassword" name="confirmPassword" type="password" value={form.confirmPassword} onChange={handleChange} placeholder="••••••••" className="pl-10" required /></div>
        </div>
        <Button type="submit" className="w-full" disabled={loading} loading={loading}>
          {loading ? "Creating Account..." : "Create Account"}
        </Button>
      </form>
      <p className="text-center text-sm text-muted-foreground mt-4">
        Already have an account? <Link href="/login" className="text-primary font-medium hover:underline">Sign In</Link>
      </p>
      <div className="text-center mt-3">
        <Link href="/" className="text-xs text-muted-foreground hover:text-foreground flex items-center justify-center gap-1">
          <Sparkles className="h-3 w-3" /> Back to Store
        </Link>
      </div>
    </AuthLayout>
  );
}
