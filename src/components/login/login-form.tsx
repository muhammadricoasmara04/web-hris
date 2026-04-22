"use client";

import { useAuth } from "@/hooks/useAuth";
import { Mail, Lock, ArrowRight, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { FormEvent, useState } from "react";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const {
    login,
    isPending,
    isError,
    errorMessage,
    successMessage,
    clearSuccessMessage,
  } = useAuth();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    clearSuccessMessage();
    login({ email, password });
  }

  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-zinc-950 p-4 font-sans selection:bg-indigo-500/30">
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-1/4 top-1/4 h-96 w-96 rounded-full bg-indigo-600/20 opacity-50 mix-blend-screen blur-3xl filter animate-pulse"></div>
        <div
          className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-fuchsia-600/20 opacity-50 mix-blend-screen blur-3xl filter animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.14),transparent_35%),radial-gradient(circle_at_bottom,rgba(217,70,239,0.14),transparent_30%)]"></div>
      </div>

      <section className="relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute left-0 top-0 h-1 w-full bg-gradient-to-r from-indigo-500 via-fuchsia-500 to-indigo-500"></div>

          <div className="mb-10 text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-emerald-400/20 bg-emerald-400/10 px-4 py-1.5 text-xs font-medium text-emerald-200">
              <ShieldCheck className="h-4 w-4" />
              Secure HRIS Access
            </div>
            <h1 className="mb-2 bg-gradient-to-br from-white to-white/60 bg-clip-text text-3xl font-bold text-transparent">
              Welcome back
            </h1>
            <p className="text-sm text-zinc-400">
              Sign in with your company account to continue
            </p>
          </div>

          <form id="login-form" className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <label htmlFor="email" className="ml-1 text-sm font-medium text-zinc-300">
                Email
              </label>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-indigo-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="name@company.com"
                  autoComplete="email"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="ml-1 flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <Link
                  href="#"
                  className="text-xs text-indigo-400 transition-colors hover:text-indigo-300"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="group relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Lock className="h-5 w-5 text-zinc-500 transition-colors group-focus-within:text-indigo-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-2xl border border-white/10 bg-black/20 py-3 pl-11 pr-4 text-white placeholder-zinc-500 transition-all focus:border-indigo-500/50 focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {isError ? (
              <div
                id="login-error"
                className="rounded-2xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200"
              >
                {errorMessage || "Terjadi kesalahan saat login."}
              </div>
            ) : null}

            {successMessage ? (
              <div
                id="login-success"
                className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-200"
              >
                {successMessage}
              </div>
            ) : null}

            <button
              id="login-submit"
              type="submit"
              disabled={isPending}
              className="group relative mt-8 flex w-full items-center justify-center gap-2 overflow-hidden rounded-2xl bg-white py-3.5 font-semibold text-zinc-950 transition-all duration-200 hover:bg-zinc-200 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <div className="absolute inset-0 h-full w-full -translate-x-full bg-gradient-to-r from-transparent via-white/50 to-transparent group-hover:animate-[shimmer_1.5s_infinite]"></div>
              {isPending ? (
                <>
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  <span>Signing In...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Don&apos;t have an account?{" "}
            <Link href="#" className="font-medium text-white transition-colors hover:text-indigo-400">
              Contact Admin
            </Link>
          </p>
        </div>
      </section>
    </main>
  );
}
