/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#2563eb",
        "primary-foreground": "#ffffff",
        secondary: "#f3f4f6",
        "secondary-foreground": "#1f2937",
        destructive: "#ef4444",
        "destructive-foreground": "#ffffff",
        muted: "#9ca3af",
        "muted-foreground": "#6b7280",
        accent: "#dbeafe",
        "accent-foreground": "#1e40af",
        background: "#ffffff",
        foreground: "#1f2937",
        border: "#e5e7eb",
        input: "#e5e7eb",
        ring: "#2563eb",
        "card": "#ffffff",
        "card-foreground": "#1f2937",
      },
      borderRadius: {
        md: "0.375rem",
      },
    },
  },
  plugins: [],
}
