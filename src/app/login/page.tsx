"use client";

import Link from "next/link";
import { Home } from 'lucide-react';

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "2rem",
      background: "#020617",
      backgroundImage: "radial-gradient(circle at top right, rgba(99, 102, 241, 0.08), transparent), radial-gradient(circle at bottom left, rgba(236, 72, 153, 0.08), transparent)"
    }}>
      <div className="glass animate-fade-in" style={{
        width: "100%",
        maxWidth: "900px",
        padding: "4rem",
        borderRadius: "32px",
        position: "relative",
        border: "1px solid rgba(255, 255, 255, 0.08)",
        background: "rgba(15, 23, 42, 0.7)",
        backdropFilter: "blur(24px)",
        boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.5)"
      }}>
        <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem" }}>
          <Link href="/" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            color: "#f8fafc",
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            padding: "0.75rem 1rem",
            borderRadius: "999px",
            textDecoration: "none",
            fontWeight: 700,
            boxShadow: "0 10px 30px rgba(0,0,0,0.15)"
          }}>
            <Home size={16} />
            Home
          </Link>
        </div>
        <div style={{ textAlign: "center", marginBottom: "3rem" }}>
          <h1 style={{ fontSize: "3rem", fontWeight: 900, marginBottom: "1rem", background: "linear-gradient(135deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Choose a login type</h1>
          <p style={{ color: "#94a3b8", fontSize: "1.1rem", maxWidth: "640px", margin: "0 auto" }}>
            Select the correct login route for your role. Admins and employees use separate login pages for role-specific access.
          </p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "1.5rem" }}>
          <Link href="/login/admin" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            textDecoration: "none",
            color: "white",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)"
          }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "1rem" }}>Admin Login</h2>
              <p style={{ color: "#c7d2fe", lineHeight: 1.8 }}>
                Login with an admin account created during signup. Admins access the management dashboard and team controls.
              </p>
            </div>
            <span style={{ marginTop: "2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#f97316", fontWeight: 800 }}>
              Continue →
            </span>
          </Link>

          <Link href="/login/employee" style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            minHeight: "220px",
            padding: "2rem",
            borderRadius: "28px",
            border: "1px solid rgba(255,255,255,0.1)",
            background: "rgba(255,255,255,0.03)",
            textDecoration: "none",
            color: "white",
            boxShadow: "0 12px 30px rgba(0, 0, 0, 0.15)"
          }}>
            <div>
              <h2 style={{ fontSize: "1.8rem", fontWeight: 900, marginBottom: "1rem" }}>Employee Login</h2>
              <p style={{ color: "#c7d2fe", lineHeight: 1.8 }}>
                Login with an employee account created during signup. Employees access their personal dashboard and attendance.
              </p>
            </div>
            <span style={{ marginTop: "2rem", display: "inline-flex", alignItems: "center", gap: "0.5rem", color: "#f97316", fontWeight: 800 }}>
              Continue →
            </span>
          </Link>
        </div>
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
