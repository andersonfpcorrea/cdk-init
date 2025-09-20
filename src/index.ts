import path from "node:path";
import fs from "fs-extra";
import yargs from "yargs";
import { hideBin } from "yargs/helpers";
import inquirer from "inquirer";
import ora from "ora";
import { execa } from "execa";

const main = async () => {
  const argv = await yargs(hideBin(process.argv))
    .options({
      template: { type: "string", default: "default" },
      language: { type: "string", default: "typescript" },
    })
    .parse();

  let serviceName = argv._[0] as string;

  if (!serviceName) {
    const answer = await inquirer.prompt([
      {
        type: "input",
        name: "serviceName",
        message: "What is the name of your service?",
        validate: (input) => {
          if (!input) {
            return "Please enter a service name.";
          }
          return true;
        },
      },
    ]);
    serviceName = answer.serviceName;
  }

  const answers = await inquirer.prompt([
    {
      type: "input",
      name: "projectNamespace",
      message: "What is the project namespace (organization name)?",
      default: `${serviceName}-organization`,
    },
    {
      type: "input",
      name: "awsDevAccount",
      message: "What is your AWS dev account ID?",
    },
    {
      type: "input",
      name: "awsDevRegion",
      message: "What is your AWS dev region?",
      default: "us-east-1",
    },
    {
      type: "input",
      name: "awsDevProfile",
      message: "What is your AWS dev profile name?",
      default: "default",
    },
  ]);

  const targetDir = path.join(process.cwd(), serviceName);
  const templateName = argv.template;
  const language = argv.language;

  const templateDir = path.join(
    __dirname,
    "../templates",
    language,
    templateName
  );

  const spinner = ora(`Creating a new CDK app in ${targetDir}...`).start();

  // 1. Validate template existence
  if (!fs.existsSync(templateDir)) {
    spinner.fail(
      `Template "${templateName}" for language "${language}" not found.`
    );
    console.error(`Looked in: ${templateDir}`);
    process.exit(1);
  }

  // 2. Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    spinner.fail(`Directory "${serviceName}" already exists.`);
    process.exit(1);
  }

  // 3. Copy template files
  spinner.text = "Copying template files...";
  try {
    await fs.copy(templateDir, targetDir);
    spinner.succeed("Template files copied successfully.");
  } catch (err) {
    spinner.fail("Error copying template files.");
    console.error(err);
    process.exit(1);
  }

  // 4. Replace placeholders
  spinner.text = "Updating project files...";
  const replacements = {
    "{{SERVICE_NAME}}": answers.serviceName,
    "{{PROJECT_NAMESPACE}}": answers.projectNamespace,
    "{{AWS_DEV_ACCOUNT}}": answers.awsDevAccount,
    "{{AWS_DEV_REGION}}": answers.awsDevRegion,
    "{{PROFILE}}": answers.awsDevProfile,
  };

  const filesToUpdate = [
    "package.json",
    "utils/constants.ts",
    "infra/config/index.ts",
  ];

  for (const file of filesToUpdate) {
    const filePath = path.join(targetDir, file);
    if (fs.existsSync(filePath)) {
      try {
        let content = await fs.readFile(filePath, "utf8");
        for (const [placeholder, value] of Object.entries(replacements)) {
          content = content.replace(new RegExp(placeholder, "g"), value);
        }
        await fs.writeFile(filePath, content);
      } catch (err) {
        spinner.fail(`Error updating file ${file}.`);
        console.error(err);
        await fs.remove(targetDir);
        process.exit(1);
      }
    }
  }
  spinner.succeed("Project files updated successfully.");

  // 5. Initialize Git
  spinner.text = "Initializing Git repository...";
  try {
    await execa("git", ["init"], { cwd: targetDir });
    spinner.succeed("Git repository initialized successfully.");
  } catch (err) {
    spinner.warn("Could not initialize Git repository.");
    // We don't exit here, as git initialization is not critical
  }

  // 6. Install dependencies
  spinner.text = "Installing dependencies...";
  try {
    await execa("npm", ["install"], { cwd: targetDir });
    spinner.succeed("Dependencies installed successfully.");
  } catch (err) {
    spinner.fail("Error installing dependencies.");
    console.error(err);
    process.exit(1);
  }

  spinner.succeed(`Success! Your new CDK app is ready in ${targetDir}`);

  console.log(`\nNext steps:\n  cd ${serviceName}`);
};

main().catch((err) => {
  console.error("An unexpected error occurred:", err);
  process.exit(1);
});
