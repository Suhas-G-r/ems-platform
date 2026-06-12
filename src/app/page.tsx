"use client";

import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Users,
  CalendarCheck,
  ClipboardCheck,
  Rocket,
  Building2,
  Globe,
  UserCheck,
  TrendingUp,
  Workflow,
  ShieldCheck,
  BarChart3
} from 'lucide-react';

export default function Home() {
  return (
    <div style={{ minHeight: "100vh", position: "relative", overflowX: "hidden", backgroundColor: "#020617", backgroundImage: "radial-gradient(circle at top left, rgba(99, 102, 241, 0.18), transparent 22%), radial-gradient(circle at bottom right, rgba(236, 72, 153, 0.14), transparent 22%), radial-gradient(circle at center, rgba(255, 255, 255, 0.04), transparent 25%)" }}>
      {/* Starry Background Layers */}
      <div className="stars-container">
        <div id="stars"></div>
        <div id="stars2"></div>
        <div id="stars3"></div>
      </div>

      <Navbar />

      {/* Hero Section */}
      <main style={{ paddingTop: "10rem", textAlign: "center", paddingBottom: "10rem", position: "relative", zIndex: 1 }}>
        <div className="animate-fade-in" style={{ padding: "0 2rem" }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "0.5rem",
            background: "rgba(99, 102, 241, 0.15)",
            border: "1px solid rgba(99, 102, 241, 0.3)",
            padding: "0.5rem 1.5rem",
            borderRadius: "100px",
            color: "#818cf8",
            fontSize: "0.9rem",
            fontWeight: 700,
            marginBottom: "3rem"
          }}>
            <ShieldCheck size={16} /> Enterprise-Grade Workforce Intelligence
          </div>

          <h1 style={{
            fontSize: "6rem",
            fontWeight: 900,
            lineHeight: 1,
            marginBottom: "2rem",
            background: "linear-gradient(to bottom, #fff 0%, #c084fc 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            maxWidth: "1000px",
            margin: "0 auto 2rem auto"
          }}>
            Intelligent Workforce. Effortless Control.
          </h1>
          <p style={{ fontSize: "1.4rem", color: "#94a3b8", maxWidth: "700px", margin: "0 auto 4rem auto", lineHeight: 1.6 }}>
            A unified platform to manage attendance and assignments—designed for clarity, built for scale.
          </p>

          <div style={{ display: "flex", gap: "1.5rem", justifyContent: "center" }}>
            <Link href="/signup" style={{
              padding: "1.2rem 3.5rem",
              background: "linear-gradient(to right, #f97316, #ea580c)",
              color: "white",
              borderRadius: "14px",
              fontSize: "1.2rem",
              fontWeight: 800,
              textDecoration: "none",
              boxShadow: "0 10px 20px rgba(249, 115, 22, 0.3)"
            }}>
              Get Started
            </Link>
            <Link href="/explore" style={{
              padding: "1.2rem 3.5rem",
              background: "linear-gradient(to right, rgba(255,255,255,0.08), rgba(255,255,255,0.02))",
              border: "1px solid rgba(255,255,255,0.15)",
              color: "white",
              borderRadius: "14px",
              fontSize: "1.2rem",
              fontWeight: 700,
              textDecoration: "none"
            }}>
              Explore →
            </Link>
          </div>
        </div>

        {/* Why Choose Section */}
        <section style={{ marginTop: "12rem" }}>
          <h2 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "1.5rem" }}>Why Choose EMS?</h2>
          <p style={{ fontSize: "1.2rem", color: "#94a3b8", marginBottom: "5rem" }}>Cutting-edge features designed for the modern workplace.</p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "2.5rem",
            maxWidth: "1200px",
            margin: "0 auto",
            padding: "0 2rem"
          }}>
            {[
              {
                title: "Role-Based Dashboards",
                desc: "Separate interfaces for Admins and Employees. Admins assign tasks and approve requests while employees track their personal progress.",
                icon: <Users size={32} color="#c084fc" />,
                border: "rgba(192, 132, 252, 0.2)",
                bg: "rgba(192, 132, 252, 0.05)"
              },
              {
                title: "Smart Attendance",
                desc: "Interactive graphs and correction requests for leave, WFH, or missed punches. Real-time tracking with detailed visual analytics.",
                icon: <CalendarCheck size={32} color="#f97316" />,
                border: "rgba(249, 115, 22, 0.2)",
                bg: "rgba(249, 115, 22, 0.05)"
              },
              {
                title: "Task Execution",
                desc: "Efficient project delegation. Admins assign daily tasks while employees update status and track completion in real-time.",
                icon: <ClipboardCheck size={32} color="#22c55e" />,
                border: "rgba(34, 197, 94, 0.2)",
                bg: "rgba(34, 197, 94, 0.05)"
              }
            ].map((f, i) => (
              <div key={i} className="glass" style={{
                padding: "3rem",
                borderRadius: "32px",
                textAlign: "left",
                border: `1px solid ${f.border}`,
                background: f.bg
              }}>
                <div style={{
                  width: "60px",
                  height: "60px",
                  borderRadius: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  background: "rgba(255,255,255,0.03)",
                  marginBottom: "2rem"
                }}>
                  {f.icon}
                </div>
                <h3 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "1.5rem" }}>{f.title}</h3>
                <p style={{ color: "#94a3b8", lineHeight: 1.7, fontSize: "1.1rem" }}>{f.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Built for Modern Teams Section */}
        <div style={{ marginTop: "15rem" }}>
          <h2 style={{ fontSize: "3.5rem", fontWeight: 900, marginBottom: "1rem" }}>Built for Modern Teams</h2>
          <p style={{ fontSize: "1.4rem", color: "#94a3b8", maxWidth: "800px", margin: "0 auto 6rem auto", lineHeight: 1.6 }}>
            Designed to simplify workforce management across organizations of all sizes.
          </p>

          <div style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(350px, 1fr))",
            gap: "2rem",
            maxWidth: "1400px",
            margin: "0 auto",
            padding: "0 2rem"
          }}>
            {[
              {
                title: "Startups",
                subtitle: "🚀 Startups",
                desc: "Scale your team operations effortlessly. Manage attendance, assign tasks, and track productivity from day one without complex setup.",
                icon: <Rocket size={24} />,
                color: "#f59e0b"
              },
              {
                title: "SMEs",
                subtitle: "🏢 Small & Medium Enterprises",
                desc: "Streamline HR processes with structured role-based access, leave management, and real-time visibility into team performance.",
                icon: <Building2 size={24} />,
                color: "#6366f1"
              },
              {
                title: "Remote Teams",
                subtitle: "🌍 Remote & Hybrid Teams",
                desc: "Monitor attendance, manage work-from-home requests, and ensure accountability with centralized dashboards and analytics.",
                icon: <Globe size={24} />,
                color: "#10b981"
              },
              {
                title: "HR Departments",
                subtitle: "👩‍💼 HR Departments",
                desc: "Simplify approvals, monitor employee records, and generate insights that support better workforce planning decisions.",
                icon: <UserCheck size={24} />,
                color: "#ec4899"
              },
              {
                title: "Growing Orgs",
                subtitle: "📈 Growing Organizations",
                desc: "Built to scale with your company. Add new roles, departments, and workflows without disrupting existing operations.",
                icon: <TrendingUp size={24} />,
                color: "#8b5cf6"
              }
            ].map((card, i) => (
              <div key={i} className="glass" style={{
                padding: "2.5rem",
                borderRadius: "28px",
                textAlign: "left",
                border: "1px solid rgba(255,255,255,0.05)",
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                background: "rgba(15, 23, 42, 0.3)",
                transition: "transform 0.3s ease"
              }}>
                <div style={{
                  width: "48px",
                  height: "48px",
                  borderRadius: "14px",
                  background: `${card.color}15`,
                  color: card.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}>
                  {card.icon}
                </div>
                <div>
                  <h4 style={{ color: card.color, fontSize: "0.85rem", fontWeight: 800, textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: "0.5rem" }}>{card.subtitle}</h4>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 800, marginBottom: "1rem" }}>{card.title}</h3>
                  <p style={{ color: "#94a3b8", lineHeight: 1.6, fontSize: "1rem" }}>{card.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{
        __html: `
        .stars-container {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          z-index: 0;
          pointer-events: none;
          overflow: hidden;
        }

        #stars {
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: 1788px 676px #fff, 367px 1734px #fff, 1343px 156px #fff, 1283px 1142px #fff, 1062px 378px #fff, 1395px 467px #fff, 1017px 1891px #fff, 137px 1114px #fff, 1767px 1403px #fff, 1543px 11px #fff, 1078px 181px #fff, 1189px 1574px #fff, 1697px 1551px #fff, 439px 472px #fff, 1491px 677px #fff, 1364px 599px #fff, 34px 382px #fff, 1221px 1584px #fff, 1266px 1499px #fff;
          animation: animStar 50s linear infinite;
        }
        #stars:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 1px;
          height: 1px;
          background: transparent;
          box-shadow: inherit;
        }

        #stars2 {
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: 1925px 1320px #fff, 693px 1778px #fff, 1016px 711px #fff, 1171px 563px #fff, 661px 1919px #fff, 1610px 44px #fff, 1275px 140px #fff, 1208px 1802px #fff, 1473px 1587px #fff;
          animation: animStar 100s linear infinite;
        }
        #stars2:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 2px;
          height: 2px;
          background: transparent;
          box-shadow: inherit;
        }

        #stars3 {
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: 200px 981px #fff, 1731px 521px #fff, 132px 1039px #fff, 1888px 1547px #fff, 899px 1226px #fff, 1887px 580px #fff, 1548px 1092px #fff, 1626px 689px #fff;
          animation: animStar 150s linear infinite;
        }
        #stars3:after {
          content: " ";
          position: absolute;
          top: 2000px;
          width: 3px;
          height: 3px;
          background: transparent;
          box-shadow: inherit;
        }

        @keyframes animStar {
          from { transform: translateY(0px); }
          to { transform: translateY(-2000px); }
        }
      `}} />
    </div>
  );
}

