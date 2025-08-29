const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

module.exports = function generator(plop) {
  plop.setGenerator("userscript", {
    description: "Generate a new WebMCP userscript",
    prompts: [
      {
        type: "input",
        name: "siteName",
        message: "Site name (e.g., github, twitter):",
        validate: (input) => {
          if (!input) return "Site name is required";
          if (!/^[a-z][a-z0-9-]*$/.test(input)) {
            return "Site name must be lowercase, start with a letter, and contain only letters, numbers, and hyphens";
          }
          return true;
        },
      },
      {
        type: "input",
        name: "matchPattern",
        message: "URL match pattern (e.g., https://github.com/*):",
        default: (answers) => `https://${answers.siteName}.com/*`,
        validate: (input) => {
          if (!input) return "Match pattern is required";
          return true;
        },
      },
      {
        type: "input",
        name: "displayName",
        message: "Display name (e.g., GitHub MCP Server):",
        default: (answers) => {
          const name = answers.siteName;
          return `${name.charAt(0).toUpperCase() + name.slice(1)} MCP Server`;
        },
      },
      {
        type: "input",
        name: "description",
        message: "Description:",
        default: (answers) => `WebMCP integration for ${answers.displayName}`,
      },
      {
        type: "input",
        name: "author",
        message: "Author name:",
        default: "WebMCP",
      },
    ],
    actions: [
      {
        type: "add",
        path: "scripts/{{siteName}}/package.json",
        templateFile: "templates/package.json.hbs",
      },
      {
        type: "add",
        path: "scripts/{{siteName}}/tsconfig.json",
        templateFile: "templates/tsconfig.json.hbs",
      },
      {
        type: "add",
        path: "scripts/{{siteName}}/vite.config.ts",
        templateFile: "templates/vite.config.ts.hbs",
      },
      {
        type: "add",
        path: "scripts/{{siteName}}/src/index.ts",
        templateFile: "templates/index.ts.hbs",
      },
      {
        type: "add",
        path: "scripts/{{siteName}}/dist/.gitkeep",
        template: "",
      },
      async (answers) => {
        const scriptPath = path.join(process.cwd(), "scripts", answers.siteName);
        
        // Skip automatic install and build for now
        console.log("\n✅ Userscript files created!");
        console.log("\n📝 To complete setup, run:");
        console.log(`   cd scripts/${answers.siteName}`);
        console.log(`   pnpm install`);
        console.log(`   pnpm run build`);
        
        return `✅ Successfully created ${answers.siteName} userscript structure!`;
      },
      () => {
        console.log("\n🎉 Userscript created successfully!");
        console.log("\n📝 Next steps:");
        console.log("1. Navigate to your site and inject the script");
        console.log("2. Test the tools with MCP-B");
        console.log("3. Add more tools as needed");
        return "";
      },
    ],
  });
};