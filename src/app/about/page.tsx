import React from "react";
import SectionHeader from "@/components/ui/SectionHeader";
import Button from "@/components/ui/Button";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us",
  description: "Learn more about MyComic — our mission, vision, and passion for digital visual storytelling.",
};

export default function AboutPage() {
  return (
    <div className="section">
      <div className="section-inner" style={{ maxWidth: "900px" }}>
        <SectionHeader
          title="About MyComic"
          subtitle="Empowering independent storytellers & visual artists worldwide"
          accentColor="secondary"
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "clamp(1.5rem, 4vw, 2.5rem)",
            fontSize: "var(--font-size-body)",
            color: "var(--color-text-secondary)",
            lineHeight: 1.8,
          }}
        >
          <p>
            Welcome to <strong style={{ color: "var(--color-primary)" }}>MyComic</strong> — a platform dedicated to bringing rich, immersive digital comics to readers everywhere. We believe that visual storytelling is one of the most powerful forms of artistic expression.
          </p>

          <div
            style={{
              padding: "clamp(1.5rem, 3vw, 2rem)",
              borderRadius: "var(--radius-xl)",
              background: "var(--color-bg-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <h3
              style={{
                fontFamily: "var(--font-heading)",
                fontSize: "var(--font-size-h2)",
                color: "var(--color-text-primary)",
                marginBottom: "12px",
              }}
            >
              Our Mission
            </h3>
            <p>
              To create an accessible, beautiful, and distraction-free reading experience for readers, while giving independent comic creators full artistic freedom and control over their work.
            </p>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
              gap: "var(--space-card-gap)",
            }}
          >
            {[
              {
                title: "Dark Mode First",
                desc: "Designed specifically for modern screens to make comic artwork pop while reducing eye strain.",
                color: "var(--color-primary)",
              },
              {
                title: "Flexible Reader",
                desc: "Read the way you want — continuous vertical scroll webtoon-style or classic panel-by-panel mode.",
                color: "var(--color-secondary)",
              },
              {
                title: "Creator-Centric",
                desc: "Built to spotlight creator talent and foster a passionate community of comic fans.",
                color: "var(--color-tertiary)",
              },
            ].map((feature) => (
              <div
                key={feature.title}
                style={{
                  padding: "clamp(1.25rem, 3vw, 1.75rem)",
                  borderRadius: "var(--radius-lg)",
                  background: "var(--color-bg-elevated)",
                  border: "1px solid var(--color-border)",
                }}
              >
                <h4
                  style={{
                    fontSize: "var(--font-size-h3)",
                    fontWeight: 700,
                    color: feature.color,
                    marginBottom: "8px",
                  }}
                >
                  {feature.title}
                </h4>
                <p style={{ fontSize: "var(--font-size-small)" }}>
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>

          <div
            style={{
              textAlign: "center",
              marginTop: "clamp(1rem, 3vw, 2rem)",
            }}
          >
            <Button variant="primary" size="lg" href="/contact">
              Get in Touch with Us
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
