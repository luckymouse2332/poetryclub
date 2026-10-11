/** Tailwind 4 reads the real theme; imports stay in their existing order. */
const config = {
  plugins: ["prettier-plugin-tailwindcss"],
  tailwindStylesheet: "./src/app/globals.css",
  tailwindFunctions: ["cn", "clsx", "cva"],
  semi: true,
  singleQuote: false,
  trailingComma: "all",
};

export default config;
