"use client";

import React from "react";
import type { ButtonVariant, ButtonSize } from "@/types";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  href?: string;
  icon?: React.ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
}

const variantStyles: Record<ButtonVariant, React.CSSProperties> = {
  primary: {
    background: "var(--color-primary)",
    color: "var(--color-text-inverse)",
    border: "1px solid var(--color-primary)",
  },
  secondary: {
    background: "transparent",
    color: "var(--color-primary)",
    border: "1px solid var(--color-primary)",
  },
  ghost: {
    background: "transparent",
    color: "var(--color-text-primary)",
    border: "1px solid transparent",
  },
};

const sizeStyles: Record<ButtonSize, React.CSSProperties> = {
  sm: { height: "36px", padding: "0 14px", fontSize: "0.78rem" },
  md: { height: "42px", padding: "0 18px", fontSize: "0.86rem" },
  lg: { height: "48px", padding: "0 22px", fontSize: "0.94rem" },
};

export default function Button({
  variant = "primary",
  size = "md",
  href,
  icon,
  iconPosition = "right",
  fullWidth = false,
  children,
  className,
  style,
  ...props
}: ButtonProps) {
  const combinedStyle: React.CSSProperties = {
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "8px",
    borderRadius: "var(--radius-full)",
    fontFamily: "var(--font-body)",
    fontWeight: 650,
    lineHeight: 1,
    letterSpacing: "-0.005em",
    cursor: "pointer",
    transition: "all var(--transition-base)",
    textDecoration: "none",
    whiteSpace: "nowrap",
    width: fullWidth ? "100%" : "auto",
    ...variantStyles[variant],
    ...sizeStyles[size],
    ...style,
  };

  const content = (
    <>
      {icon && iconPosition === "left" && icon}
      {children}
      {icon && iconPosition === "right" && icon}
    </>
  );

  if (href) {
    return (
      <a href={href} style={combinedStyle} className={`mc-button mc-button-${variant} ${className ?? ""}`}>
        {content}
      </a>
    );
  }

  return (
    <button style={combinedStyle} className={`mc-button mc-button-${variant} ${className ?? ""}`} {...props}>
      {content}
    </button>
  );
}
