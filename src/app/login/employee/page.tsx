"use client";

import Link from "next/link";
import { Home } from 'lucide-react';
import LoginForm from "@/components/LoginForm";

export default function EmployeeLoginPage() {
  return (
    <div>
      <div style={{ minHeight: "100vh", background: "#020617", backgroundImage: "radial-gradient(circle at top left, rgba(99, 102, 241, 0.12), transparent 22%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.1), transparent 18%)" }}>
        <div style={{ position: "absolute", top: "2rem", left: "2rem" }}>
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
            fontWeight: 700
          }}>
            <Home size={16} />
            Home
          </Link>
        </div>
        <LoginForm
          role="EMPLOYEE"
          title="Employee Login"
          description="Use the email and password for your employee account created during signup."
        />
      </div>
    </div>
  );
}
