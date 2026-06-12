"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";

interface LoginFormProps {
  role: "ADMIN" | "EMPLOYEE";
  title: string;
  description: string;
}

export default function LoginForm({ role, title, description }: LoginFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (role === "ADMIN" && data.user.role !== "ADMIN") {
        throw new Error("This page is for admin login only. Please use the employee login page.");
      }

      if (role === "EMPLOYEE" && data.user.role !== "EMPLOYEE") {
        throw new Error("This page is for employee login only. Please use the admin login page.");
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "ADMIN") {
        router.push("/admin/dashboard");
      } else {
        router.push("/employee/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "#020617",
      backgroundImage: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.05), transparent), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.05), transparent)"
    }}>
      <div className="glass animate-fade-in" style={{
        width: "100%",
        maxWidth: "480px",
        padding: "4rem 3.5rem",
        borderRadius: "32px",
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ textAlign: "center", marginBottom: "3.5rem", marginTop: "1rem" }}>
          <h1 style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: "0.75rem", background: "linear-gradient(135deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", letterSpacing: "-1px" }}>{title}</h1>
          <p style={{ color: "#94a3b8", fontWeight: 500, fontSize: "1.1rem" }}>{description}</p>
        </div>

        {error && (
          <div style={{ padding: "1rem 1.25rem", marginBottom: "2.5rem", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.2)", borderRadius: "14px", color: "#ef4444", fontSize: "0.9rem", fontWeight: 600, display: "flex", alignItems: "center", gap: "0.75rem" }}>
            <span style={{ fontSize: "1.2rem" }}>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "1.75rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.75rem", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Email Address</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                <Mail size={18} />
              </div>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="name@company.com"
                style={{
                  width: "100%",
                  padding: "1.1rem 1.25rem 1.1rem 3.5rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              />
            </div>
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.75rem", color: "#94a3b8", fontSize: "0.75rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1.5px" }}>Password</label>
            <div style={{ position: "relative" }}>
              <div style={{ position: "absolute", left: "1.25rem", top: "50%", transform: "translateY(-50%)", color: "#64748b" }}>
                <Lock size={18} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="••••••••"
                style={{
                  width: "100%",
                  padding: "1.1rem 3.5rem 1.1rem 3.5rem",
                  borderRadius: "16px",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  background: "rgba(255, 255, 255, 0.03)",
                  color: "white",
                  fontSize: "1rem",
                  outline: "none",
                  transition: "all 0.2s ease"
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1.25rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "#64748b",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  padding: 0
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "-0.75rem" }}>
            <a href="/forgot-password" style={{ color: "#c084fc", fontSize: "0.85rem", textDecoration: "none", fontWeight: 800 }}>Forgot Password?</a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1.1rem",
              background: "linear-gradient(to right, #f97316, #ea580c)",
              color: "white",
              border: "none",
              borderRadius: "16px",
              fontSize: "1.1rem",
              fontWeight: 800,
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.2s ease",
              boxShadow: "0 10px 20px rgba(249, 115, 22, 0.2)",
              marginTop: "1rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "0.75rem"
            }}
          >
            {loading ? "Verifying..." : <>Sign In <ArrowRight size={20} /></>}
          </button>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "0.75rem" }}>
            <a
              href="/signup"
              style={{
                color: "#fff",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                padding: "0.6rem 1rem",
                borderRadius: "12px",
                textDecoration: "none",
                fontWeight: 800,
                fontSize: "0.95rem",
                display: "inline-block"
              }}
            >
              New here? Sign Up
            </a>
          </div>
        </form>
      </div>
      <style dangerouslySetInnerHTML={{
        __html: `
          @keyframes fade-in { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
          .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
        `
      }} />
    </div>
  );
}
