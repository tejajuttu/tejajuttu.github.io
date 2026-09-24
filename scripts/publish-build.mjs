import { cp, rm } from "node:fs/promises";
await rm("assets", { recursive: true, force: true });
await cp("dist", ".", { recursive: true });
