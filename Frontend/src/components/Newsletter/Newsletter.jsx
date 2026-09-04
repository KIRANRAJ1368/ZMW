import { useState } from "react";
import ScrollReveal from "../ScrollReveal/ScrollReveal";
import "./Newsletter.css";

export default function Newsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("idle"); // idle | success | error

  const onSubmit = (e) => {
    e.preventDefault();
    const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    setStatus(isValid ? "success" : "error");
  };

  return (
    <ScrollReveal as="section" className="newsletter">
      <div className="container newsletter-inner">
        <div>
          <h2>Get 10% off your first order</h2>
          <p>One email a month. New arrivals, restocks, nothing else.</p>
        </div>

        <form className="newsletter-form" onSubmit={onSubmit} noValidate>
          <label htmlFor="newsletter-email" className="visually-hidden">
            Email address
          </label>
          <input
            id="newsletter-email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (status !== "idle") setStatus("idle");
            }}
            required
          />
          <button type="submit" className="btn btn-primary">
            Sign up
          </button>
        </form>
        <p
          className={`newsletter-message ${status !== "idle" ? "is-visible" : ""} ${
            status === "error" ? "is-error" : ""
          }`}
          role="status"
        >
          {status === "success" && "You're on the list — check your inbox."}
          {status === "error" && "That email doesn't look right — try again."}
        </p>
      </div>
    </ScrollReveal>
  );
}
