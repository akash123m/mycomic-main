"use client";
import React, { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { requestJson } from "@/lib/api";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", message: "" });
  const [submitted, setSubmitted] = useState(false);
  const contact = useMutation({ mutationFn: () => requestJson("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) }), onSuccess: () => { setForm({ name: "", email: "", message: "" }); setSubmitted(true); window.setTimeout(() => setSubmitted(false), 3000); } });
  const faqs = [
    {
      q: "Is reading comics on MyComic free?",
      a: "Yes! All chapters currently published on MyComic are completely free to read without ads.",
    },
    {
      q: "Can I submit my own comic series?",
      a: "We are currently accepting submissions for indie creators. Reach out through the contact form below!",
    },
    {
      q: "How often are new chapters released?",
      a: "Update schedules vary by series, but most ongoing series release new chapters weekly or bi-weekly.",
    },
  ];

  return (
    <div className="section">
      <div className="section-inner" style={{ maxWidth: "900px" }}>
        <SectionHeader
          title="Contact & Support"
          subtitle="We'd love to hear from you. Send us a message or check our FAQs below."
          accentColor="tertiary"
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr",
            gap: "clamp(2rem, 5vw, 4rem)",
          }}
          className="contact-grid"
        >
          {/* Contact Form */}
          <form
            onSubmit={(e) => { e.preventDefault(); if (!contact.isPending) contact.mutate(); }}
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "16px",
              padding: "clamp(1.5rem, 3vw, 2.5rem)",
              borderRadius: "var(--radius-xl)",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--font-size-h3)",
                color: "var(--color-text-primary)",
              }}
            >
              Send a Message
            </h3>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Name
              </label>
              <input
                type="text"
                placeholder="Your name"
                required
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Email
              </label>
              <input
                type="email"
                placeholder="your@email.com"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                }}
              />
            </div>

            <div>
              <label
                style={{
                  display: "block",
                  fontSize: "var(--font-size-caption)",
                  fontWeight: 600,
                  color: "var(--color-text-secondary)",
                  marginBottom: "6px",
                }}
              >
                Message
              </label>
              <textarea
                rows={5}
                placeholder="How can we help?"
                required
                value={form.message}
                onChange={(e) => setForm({ ...form, message: e.target.value })}
                style={{
                  width: "100%",
                  padding: "12px 16px",
                  borderRadius: "var(--radius-md)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                  color: "var(--color-text-primary)",
                  outline: "none",
                  resize: "vertical",
                }}
              />
            </div>

            {contact.isError && <p role="alert" style={{ color: "var(--color-error)", fontSize: "var(--font-size-small)" }}>Please check your details and try again.</p>}
            <Button variant="primary" size="lg" type="submit" fullWidth disabled={contact.isPending || submitted}>
              {contact.isPending ? "Submitting…" : submitted ? "Submitted" : "Send Message"}
            </Button>
          </form>

          {/* FAQs */}
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "20px",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--font-size-h3)",
                color: "var(--color-text-primary)",
              }}
            >
              Frequently Asked Questions
            </h3>

            {faqs.map((faq) => (
              <div
                key={faq.q}
                style={{
                  padding: "16px 20px",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h4
                  style={{
                    fontSize: "var(--font-size-small)",
                    fontWeight: 700,
                    color: "var(--color-primary)",
                    marginBottom: "6px",
                  }}
                >
                  {faq.q}
                </h4>
                <p
                  style={{
                    fontSize: "var(--font-size-small)",
                    color: "var(--color-text-secondary)",
                  }}
                >
                  {faq.a}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
