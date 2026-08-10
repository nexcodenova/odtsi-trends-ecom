// Shared design tokens for ODTSI — colors and radius scale locked in during brand review.
// Import this into each app's tailwind.config so every app stays visually consistent.

export const odtsiTheme = {
  colors: {
    primary: {
      DEFAULT: "#1B2A5E",
      hover: "#121D42",
      light: "#E8EBF5",
    },
    action: {
      DEFAULT: "#F2B705",
      ink: "#1B2A5E",
    },
    status: {
      DEFAULT: "#2FB673",
    },
  },
  borderRadius: {
    full: "999px",
    xl: "12px",
    "2xl": "16px",
    "3xl": "22px",
  },
};
