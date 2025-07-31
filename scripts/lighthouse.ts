import { execSync } from "node:child_process";

execSync(
	"npx lighthouse http://localhost:3000 --output html --output-path ./lighthouse-report.html",
	{ stdio: "inherit" },
);
