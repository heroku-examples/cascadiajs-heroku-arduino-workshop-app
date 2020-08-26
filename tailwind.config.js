module.exports = {
  future: {
    removeDeprecatedGapUtilities: true,
  },
  purge: ["./src/**/*.html", "./src/**/*.js"],
  theme: {
    extend: {},
  },
  variants: {
    backgroundColor: ["responsive", "hover", "focus", "disabled", "checked"],
    opacity: ["responsive", "hover", "focus", "disabled"],
    cursor: ["responsive", "disabled"],
  },
  plugins: [],
}
