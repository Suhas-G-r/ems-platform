import { useState, useEffect } from "react";
import Link from "next/link";

export default function Footer() {
    const [year, setYear] = useState<number | string>("");

    useEffect(() => {
        setYear(new Date().getFullYear());
    }, []);

    return (
        <footer style={{
            padding: "8rem 5rem 4rem 5rem",
            background: "linear-gradient(to bottom, transparent, rgba(2, 6, 23, 0.95))",
            position: "relative",
            overflow: "hidden"
        }}>
            <div className="container" style={{ position: "relative", zIndex: 1 }}>
                {/* Main Footer Card */}
                <div style={{
                    background: "rgba(255, 255, 255, 0.02)",
                    backdropFilter: "blur(20px)",
                    borderRadius: "40px",
                    border: "1px solid rgba(255, 255, 255, 0.05)",
                    padding: "4rem",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    textAlign: "center",
                    marginBottom: "4rem"
                }}>
                    <div style={{ fontSize: "2.5rem", fontWeight: 900, color: "#c084fc", letterSpacing: "-1.5px", marginBottom: "1.5rem" }}>
                        EMS
                    </div>
                    <p style={{ color: "#94a3b8", maxWidth: "600px", lineHeight: 1.8, fontSize: "1.1rem", marginBottom: "3rem" }}>
                        Redefining workforce efficiency through Artificial Intelligence. Join the movement towards a smarter, more productive workplace.
                    </p>

                    {/* Quick Navigation Links */}
                    <div style={{ display: "flex", gap: "3rem", marginBottom: "3rem" }}>
                        {["Home", "About", "Contact", "Privacy", "Terms"].map((link) => (
                            <Link
                                key={link}
                                href={link === "Home" ? "/" : `/${link.toLowerCase()}`}
                                style={{
                                    color: "white",
                                    textDecoration: "none",
                                    fontWeight: 600,
                                    fontSize: "0.95rem",
                                    opacity: 0.6,
                                    transition: "opacity 0.3s"
                                }}
                                onMouseOver={(e) => e.currentTarget.style.opacity = "1"}
                                onMouseOut={(e) => e.currentTarget.style.opacity = "0.6"}
                            >
                                {link}
                            </Link>
                        ))}
                    </div>

                    {/* Premium Social Icons Integrated */}
                    <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
                        {/* Twitter / X */}
                        <a href="#" style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255, 255, 255, 0.03)", backdropFilter: "blur(8px)", border: "1px solid rgba(255, 255, 255, 0.1)", transition: "all 0.3s" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="white"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" /></svg>
                        </a>
                        {/* LinkedIn */}
                        <a href="#" style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0, 119, 181, 0.05)", backdropFilter: "blur(8px)", border: "1px solid rgba(0, 119, 181, 0.2)", transition: "all 0.3s" }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="#0077b5"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>
                        </a>
                        {/* GitHub */}
                        <a href="#" style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(110, 84, 148, 0.05)", backdropFilter: "blur(8px)", border: "1px solid rgba(110, 84, 148, 0.2)", transition: "all 0.3s" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#c084fc"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.042-1.416-4.042-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                        </a>
                        {/* Instagram */}
                        <a href="#" style={{ width: "42px", height: "42px", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(251, 173, 80, 0.05)", backdropFilter: "blur(8px)", border: "1px solid rgba(251, 173, 80, 0.2)", transition: "all 0.3s" }}>
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="#fb7185"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" /></svg>
                        </a>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    paddingTop: "2rem",
                    borderTop: "1px solid rgba(255, 255, 255, 0.05)",
                    color: "#64748b",
                    fontSize: "0.9rem"
                }}>
                    <p>&copy; {year} EMS Inc. Built for the Future.</p>
                    <div style={{ display: "flex", gap: "2rem" }}>
                        <span>Status: Operational ⚡</span>
                        <span>v2.0.4</span>
                    </div>
                </div>
            </div>

            {/* Futuristic Background Element */}
            <div style={{
                position: "absolute",
                bottom: "-100px",
                left: "50%",
                transform: "translateX(-50%)",
                width: "800px",
                height: "800px",
                background: "radial-gradient(circle, rgba(99, 102, 241, 0.05) 0%, transparent 70%)",
                zIndex: 0
            }} />
        </footer>
    );
}

