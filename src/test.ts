import { readFileSync } from "fs";
// config({ path: ".env.prod" });

console.log(`GITHUB ENVS`, {
  GITHUB_SHA: process.env.GITHUB_SHA,
  GITHUB_REF: process.env.GITHUB_REF,
  GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
  GITHUB_REF_TYPE: process.env.GITHUB_REF_TYPE,
  ...process.env,
});

const envFile = readFileSync(".env.prod", "utf-8");
console.log(envFile);
