"use client";

import { useRouter } from "next/navigation";
import { Github, KeyRound, Mail, RotateCcw, ShieldCheck } from "lucide-react";
import { FormEvent, useState } from "react";
import { createClient } from "@/src/lib/supabase/client";
import { PublicNavbar } from "@/src/components/public-nav";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<"email" | "verify">("email");
  const [message, setMessage] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const getClient = () => {
    const client = createClient();
    if (!client) {
      setMessage("Supabase is in demo mode. You can enter the dashboard directly.");
    }
    return client;
  };

  // Step 1: Send OTP (automatically creates user or logs in existing user)
  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Please enter your email address first.");
      return;
    }

    const supabase = getClient();
    if (!supabase) {
      setStep("verify");
      setMessage("Demo mode: Enter any code or continue.");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: true,
        emailRedirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      return;
    }

    setStep("verify");
    setIsSuccess(true);
    setMessage("A verification access code has been dispatched to your email.");
  };

  // Step 2: Verify OTP
  const handleVerifyOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!code) {
      setMessage("Please enter the verification code sent to your email.");
      return;
    }

    const supabase = getClient();
    if (!supabase) {
      router.push("/dashboard");
      return;
    }

    setLoading(true);
    setMessage("");

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code.trim(),
      type: "email",
    });

    setLoading(false);

    if (error) {
      setMessage(error.message);
      setIsSuccess(false);
      return;
    }

    router.push("/dashboard");
  };

  // Social OAuth
  const social = async (provider: "google" | "github") => {
    const supabase = getClient();
    if (!supabase) {
      router.push("/dashboard");
      return;
    }
    setLoading(true);
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/dashboard`,
      },
    });
    if (error) {
      setLoading(false);
      setMessage(`${provider === "google" ? "Google" : "GitHub"} OAuth is not configured. Entering demo mode.`);
      setTimeout(() => router.push("/dashboard"), 1000);
    }
  };

  return (
    <div className="public-page-wrapper">
      {/* Unified Public Top Navbar */}
      <PublicNavbar />

      <main className="auth-page">
        <section className="auth-panel">
          <div className="auth-form">
            <div className="eyebrow" style={{ justifyContent: "center" }}>
              <ShieldCheck size={14} /> Passwordless Access
            </div>
            <h1 className="page-title" style={{ fontSize: 30, textAlign: "center" }}>
              {step === "email" ? "Welcome to GymTracker." : "Enter Verification Code."}
            </h1>
            <p className="page-subtitle" style={{ fontSize: 13, textAlign: "center" }}>
              {step === "email"
                ? "Sign in or create your free account in seconds with email code or social login."
                : `Enter the verification code sent to ${email}.`}
            </p>

            {/* Social Logins */}
            {step === "email" && (
              <>
                <div className="social-stack">
                  <button
                    className="social-button"
                    disabled={loading}
                    onClick={() => social("google")}
                  >
                    <svg width="18" height="18" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    Continue with Google
                  </button>
                  <button
                    className="social-button"
                    disabled={loading}
                    onClick={() => social("github")}
                  >
                    <Github size={18} /> Continue with GitHub
                  </button>
                </div>

                <div className="auth-divider">
                  <span>or sign in with email code</span>
                </div>
              </>
            )}

            {step === "email" ? (
              /* Step 1: Request Code */
              <form onSubmit={handleSendOtp}>
                <div className="field">
                  <label htmlFor="login-email">Email Address</label>
                  <input
                    id="login-email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@example.com"
                  />
                </div>

                {message && (
                  <div
                    className="auth-error"
                    style={
                      isSuccess
                        ? {
                            color: "var(--accent)",
                            background: "var(--accent-soft)",
                            borderColor: "rgba(16, 231, 97, 0.3)",
                          }
                        : undefined
                    }
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  style={{ width: "100%", height: 48, marginTop: 14 }}
                  disabled={loading}
                >
                  <Mail size={15} /> {loading ? "Sending Access Code..." : "Send One-Time Code"}
                </button>
              </form>
            ) : (
              /* Step 2: Verify Code */
              <form onSubmit={handleVerifyOtp}>
                <div className="field">
                  <label htmlFor="login-code">Verification Code</label>
                  <input
                    id="login-code"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    required
                    maxLength={10}
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="Enter code..."
                    style={{
                      letterSpacing: "0.2em",
                      fontSize: 22,
                      fontWeight: 800,
                      textAlign: "center",
                    }}
                  />
                </div>

                {message && (
                  <div
                    className="auth-error"
                    style={
                      isSuccess
                        ? {
                            color: "var(--accent)",
                            background: "var(--accent-soft)",
                            borderColor: "rgba(16, 231, 97, 0.3)",
                          }
                        : undefined
                    }
                  >
                    {message}
                  </div>
                )}

                <button
                  type="submit"
                  className="primary-button"
                  style={{ width: "100%", height: 48, marginTop: 14 }}
                  disabled={loading}
                >
                  <KeyRound size={15} /> {loading ? "Verifying..." : "Verify and Enter Training Space"}
                </button>

                <button
                  type="button"
                  className="ghost-button"
                  style={{ width: "100%", height: 40, marginTop: 10, fontSize: 12 }}
                  onClick={() => {
                    setStep("email");
                    setCode("");
                    setMessage("");
                  }}
                >
                  <RotateCcw size={13} /> Change email or re-send code
                </button>
              </form>
            )}

            <p className="auth-foot" style={{ textAlign: "center" }}>
              Instant access: entering your email signs in or creates an account automatically.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
