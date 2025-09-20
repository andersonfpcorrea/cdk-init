import path from 'path';
import fs from 'fs-extra';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

const main = async () => {
  const argv = await yargs(hideBin(process.argv)).options({
    template: { type: 'string', default: 'default' },
    language: { type: 'string', default: 'typescript' },
  }).parse();

  const projectName = argv._[0] as string;

  if (!projectName) {
    console.error('Error: Please specify a project name.');
    console.log('Usage: cdk-init <project-name> [--template <template>] [--language <language>]');
    process.exit(1);
  }

  const targetDir = path.join(process.cwd(), projectName);
  const templateName = argv.template;
  const language = argv.language;

  const templateDir = path.join(__dirname, '../templates', language, templateName);

  // 1. Validate template existence
  if (!fs.existsSync(templateDir)) {
    console.error(`Error: Template "${templateName}" for language "${language}" not found.`);
    console.error(`Looked in: ${templateDir}`);
    process.exit(1);
  }

  // 2. Check if target directory already exists
  if (fs.existsSync(targetDir)) {
    console.error(`Error: Directory "${projectName}" already exists.`);
    process.exit(1);
  }

  console.log(`Creating a new CDK app in ${targetDir}...`);

  // 3. Copy template files
  try {
    await fs.copy(templateDir, targetDir);
    console.log(`Template "${templateName}" (${language}) copied successfully.`);
  } catch (err) {
    console.error('Error copying template files:', err);
    process.exit(1);
  }

  // 4. Customize package.json
  const pkgJsonPath = path.join(targetDir, 'package.json');
  if (fs.existsSync(pkgJsonPath)) {
    try {
      const pkgJson = await fs.readJson(pkgJsonPath);
      pkgJson.name = projectName;
      await fs.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
      console.log('Customized package.json.');
    } catch (err) {
      console.error('Error customizing package.json:', err);
      await fs.remove(targetDir);
      process.exit(1);
    }
  }

  console.log('\nSuccess! Your new CDK app is ready.');
  console.log(`\nNext steps:\n  cd ${projectName}\n  npm install`);
};

main().catch(err => {
  console.error('An unexpected error occurred:', err);
  process.exit(1);
});