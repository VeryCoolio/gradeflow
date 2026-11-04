import { copyFileSync, mkdirSync } from "node:fs";
mkdirSync(new URL("assets/", import.meta.url), { recursive: true });
copyFileSync(new URL(import.meta.resolve("gsap/dist/gsap.min.js")), new URL("assets/gsap.min.js", import.meta.url));
