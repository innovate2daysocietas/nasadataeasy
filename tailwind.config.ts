import type { Config } from "tailwindcss";
export default { content: ["./app/**/*.{js,ts,jsx,tsx,mdx}","./components/**/*.{js,ts,jsx,tsx,mdx}"], theme: { extend: { colors: { navy: "#091f38", sky: "#0879bf", mist: "#f3f8fa", leaf: "#257b69", ember: "#ef9f43" }, boxShadow: { soft: "0 18px 48px rgba(9,31,56,.08)" } } }, plugins: [] } satisfies Config;
