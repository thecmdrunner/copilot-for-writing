import { Command } from "commander";

// config({ path: ".env.prod" });

const program = new Command();

// Define command-line options
program
  .option("-f, --function_name <name>", "The function name")
  .parse(process.argv);

// Extract options

const { function_name } = program.opts<Partial<{ function_name: string }>>();

console.log(`FUNCTION NAME`, function_name);

// const ghData = {
//   GITHUB_SHA: process.env.GITHUB_SHA,
//   GITHUB_REF: process.env.GITHUB_REF,
//   GITHUB_REF_NAME: process.env.GITHUB_REF_NAME,
//   GITHUB_REF_TYPE: process.env.GITHUB_REF_TYPE,
// };
const ghData = {
  GITHUB_SHA: "0ec076807178c74988d74d2bf48d869c135608d1",
  GITHUB_REF: "refs/heads/main",
  GITHUB_REF_NAME: "main",
  GITHUB_REF_TYPE: "branch",
};

console.log(`GITHUB ENVS`, ghData);

const first7CharsOfSha = ghData.GITHUB_SHA.slice(0, 7);
// const calculatedFunctionName = `slidesgpt-backend-${ghData.GITHUB_REF_TYPE}-$÷{ghData.GITHUB_REF_NAME}-${first7CharsOfSha}`; // slidesgpt-backend-main-0ec0768-branch

const calculatedFunctionName = [
  "slidesgpt-backend",
  ghData.GITHUB_REF_TYPE,
  ghData.GITHUB_REF_NAME,
  ghData.GITHUB_SHA.slice(0, 7),
].join("-");

console.log(`CALCULATED FUNCTION NAME`, calculatedFunctionName);
