"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import StatusModal from "@/components/StatusModal";

export default function SignupPage() {
    const router = useRouter();
    const [formData, setFormData] = useState({
        name: "",
        lastName: "",
        email: "",
        phone: "",
        password: "",
        city: "",
        postalCode: "",
        dob: "",
        gender: "Male",
        role: "EMPLOYEE",
        countryCode: "+91",
        securityQuestion: "What's your pet's name?",
        securityAnswer: ""
    });
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [modal, setModal] = useState({
        isOpen: false,
        title: "",
        message: "",
        type: "success" as "success" | "error"
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const response = await fetch("/api/auth/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Signup failed");
            }

            const roleLabel = formData.role === "ADMIN" ? "Admin" : "Employee";

            setModal({
                isOpen: true,
                title: `${roleLabel} Account Created!`,
                message: `Welcome aboard, ${formData.name}! Your professional ${roleLabel.toLowerCase()} profile is ready.`,
                type: "success"
            });
        } catch (err: any) {
            setError(err.message);
            setModal({
                isOpen: true,
                title: "Signup Error",
                message: err.message,
                type: "error"
            });
        } finally {
            setLoading(false);
        }
    };

    const inputStyle = {
        width: "100%",
        padding: "0.875rem 1rem",
        borderRadius: "10px",
        border: "1px solid rgba(255, 255, 255, 0.1)",
        background: "rgba(255, 255, 255, 0.05)",
        color: "white",
        fontSize: "0.95rem",
        outline: "none"
    };

    const labelStyle = {
        display: "block",
        marginBottom: "0.6rem",
        color: "#94a3b8",
        fontSize: "0.9rem",
        fontWeight: 600
    };

    const countryConfig: any = {
        "+91": { name: "IN", length: 10, placeholder: "Enter your phone number" },
        "+1": { name: "US", length: 10, placeholder: "Enter your phone number" },
        "+44": { name: "UK", length: 10, placeholder: "Enter your phone number" },
        "+971": { name: "UAE", length: 9, placeholder: "Enter your phone number" },
        "+61": { name: "AU", length: 9, placeholder: "Enter your phone number" }
    };

    return (
        <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "4rem 2rem" }}>
            <div className="glass animate-fade-in" style={{ width: "100%", maxWidth: "800px", padding: "3.5rem", borderRadius: "24px", position: "relative" }}>
                <div style={{ position: "absolute", top: "1.5rem", left: "1.5rem", display: "flex", gap: "1rem" }}>
                    <Link href="/" style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "0.5rem",
                        color: "#94a3b8",
                        textDecoration: "none",
                        fontSize: "0.9rem",
                        fontWeight: 600,
                        transition: "color 0.2s"
                    }}
                        onMouseOver={(e) => e.currentTarget.style.color = "white"}
                        onMouseOut={(e) => e.currentTarget.style.color = "#94a3b8"}
                    >
                        🏠 Home
                    </Link>
                </div>

                <div style={{ textAlign: "center", marginBottom: "3.5rem" }}>
                    <h1 style={{ fontSize: "2.8rem", fontWeight: 900, marginBottom: "0.5rem", background: "linear-gradient(135deg, #fff, #c084fc)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>Join the Workforce</h1>
                    <p style={{ color: "#94a3b8", fontSize: "1.1rem" }}>
                        {formData.role === "ADMIN" ? "Create your professional admin profile" : "Create your professional employee profile"}
                    </p>
                </div>

                <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                    <div>
                        <label style={labelStyle}>First Name</label>
                        <input required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Enter your first name" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Last Name</label>
                        <input required value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Enter your last name" style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Email Address</label>
                        <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="Enter your email" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Phone Number</label>
                        <div style={{ display: "flex", gap: "0.5rem" }}>
                            <select
                                value={formData.countryCode}
                                onChange={(e) => setFormData({ ...formData, countryCode: e.target.value, phone: "" })}
                                style={{ ...inputStyle, width: "125px", color: "white", padding: "0.875rem 0.5rem" }}
                            >
                                <option style={{ color: "black" }} value="+91">+91 (IN)</option>
                                <option style={{ color: "black" }} value="+1">+1 (US)</option>
                                <option style={{ color: "black" }} value="+44">+44 (UK)</option>
                                <option style={{ color: "black" }} value="+971">+971 (UAE)</option>
                                <option style={{ color: "black" }} value="+61">+61 (AU)</option>
                            </select>
                            <input
                                required
                                type="tel"
                                maxLength={countryConfig[formData.countryCode].length}
                                value={formData.phone}
                                onChange={(e) => {
                                    const value = e.target.value.replace(/\D/g, "");
                                    const limit = countryConfig[formData.countryCode].length;
                                    if (value.length <= limit) setFormData({ ...formData, phone: value });
                                }}
                                placeholder="Enter your phone number"
                                style={inputStyle}
                            />
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>City</label>
                        <input required value={formData.city} onChange={(e) => setFormData({ ...formData, city: e.target.value })} placeholder="Enter your city" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Postal Code</label>
                        <input required value={formData.postalCode} onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })} placeholder="Enter your postal code" style={inputStyle} />
                    </div>

                    <div>
                        <label style={labelStyle}>Date of Birth</label>
                        <input type="date" required value={formData.dob} onChange={(e) => setFormData({ ...formData, dob: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Gender</label>
                        <select
                            value={formData.gender}
                            onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                            style={{ ...inputStyle, color: "white" }}
                        >
                            <option style={{ color: "black" }} value="Male">Male</option>
                            <option style={{ color: "black" }} value="Female">Female</option>
                            <option style={{ color: "black" }} value="Other">Other</option>
                        </select>
                    </div>

                    <div>
                        <label style={labelStyle}>Password</label>
                        <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} placeholder="Enter password (needs special character)" style={inputStyle} />
                    </div>
                    <div>
                        <label style={labelStyle}>Join as</label>
                        <select
                            value={formData.role}
                            onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            style={{ ...inputStyle, color: "white" }}
                        >
                            <option style={{ color: "black" }} value="EMPLOYEE">Employee</option>
                            <option style={{ color: "black" }} value="ADMIN">Admin</option>
                        </select>
                    </div>

                    {/* Recovery Settings Box - Matching Image 2 */}
                    <div style={{
                        gridColumn: "1 / -1",
                        marginTop: "1rem",
                        padding: "2rem",
                        borderRadius: "16px",
                        border: "1px dashed rgba(99, 102, 241, 0.4)",
                        background: "rgba(99, 102, 241, 0.05)"
                    }}>
                        <h3 style={{ color: "#6366f1", fontSize: "1rem", fontWeight: 800, marginBottom: "1.5rem" }}>Recovery Settings (for Forgot Password)</h3>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1.5rem" }}>
                            <div>
                                <label style={labelStyle}>Security Question</label>
                                <select
                                    value={formData.securityQuestion}
                                    onChange={(e) => setFormData({ ...formData, securityQuestion: e.target.value })}
                                    style={{ ...inputStyle, color: "white" }}
                                >
                                    <option style={{ color: "black" }} value="What's your pet's name?">What's your pet's name?</option>
                                    <option style={{ color: "black" }} value="What's your favorite city?">What's your favorite city?</option>
                                    <option style={{ color: "black" }} value="What's your mother's maiden name?">What's your mother's maiden name?</option>
                                    <option style={{ color: "black" }} value="What was the name of your first school?">What was the name of your first school?</option>
                                </select>
                            </div>
                            <div>
                                <label style={labelStyle}>Security Answer</label>
                                <input required value={formData.securityAnswer} onChange={(e) => setFormData({ ...formData, securityAnswer: e.target.value })} placeholder="Your secret answer" style={inputStyle} />
                            </div>
                        </div>
                    </div>

                    <div style={{ gridColumn: "1 / -1", marginTop: "2rem" }}>
                        <button
                            type="submit"
                            disabled={loading}
                            style={{
                                width: "100%",
                                padding: "1.1rem",
                                background: "linear-gradient(to right, #f97316, #ea580c)",
                                color: "white",
                                border: "none",
                                borderRadius: "10px",
                                fontSize: "1.1rem",
                                fontWeight: 800,
                                cursor: "pointer",
                                boxShadow: "0 4px 12px rgba(249, 115, 22, 0.3)"
                            }}
                        >
                            {loading ? "Creating Account..." : "Create Account"}
                        </button>
                    </div>
                </form>

                <div style={{ marginTop: "2rem", textAlign: "center" }}>
                    <p style={{ color: "#94a3b8" }}>
                        Already have an account?{" "}
                        <Link href="/login" style={{ color: "#6366f1", textDecoration: "none", fontWeight: 800 }}>Login here</Link>
                    </p>
                </div>
            </div>

            <StatusModal
                isOpen={modal.isOpen}
                onClose={() => {
                    setModal({ ...modal, isOpen: false });
                    if (modal.type === "success") {
                        const redirectPath = formData.role === "ADMIN" ? "/login/admin" : "/login/employee";
                        router.push(redirectPath);
                    }
                }}
                title={modal.title}
                message={modal.message}
                type={modal.type}
            />
        </div>
    );
}
