"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = __importDefault(require("path"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const yargs_1 = __importDefault(require("yargs"));
const helpers_1 = require("yargs/helpers");
const main = async () => {
    const argv = await (0, yargs_1.default)((0, helpers_1.hideBin)(process.argv)).options({
        template: { type: 'string', default: 'default' },
        language: { type: 'string', default: 'typescript' },
    }).parse();
    const projectName = argv._[0];
    if (!projectName) {
        console.error('Error: Please specify a project name.');
        console.log('Usage: cdk-init <project-name> [--template <template>] [--language <language>]');
        process.exit(1);
    }
    const targetDir = path_1.default.join(process.cwd(), projectName);
    const templateName = argv.template;
    const language = argv.language;
    const templateDir = path_1.default.join(__dirname, '../templates', language, templateName);
    // 1. Validate template existence
    if (!fs_extra_1.default.existsSync(templateDir)) {
        console.error(`Error: Template "${templateName}" for language "${language}" not found.`);
        console.error(`Looked in: ${templateDir}`);
        process.exit(1);
    }
    // 2. Check if target directory already exists
    if (fs_extra_1.default.existsSync(targetDir)) {
        console.error(`Error: Directory "${projectName}" already exists.`);
        process.exit(1);
    }
    console.log(`Creating a new CDK app in ${targetDir}...`);
    // 3. Copy template files
    try {
        await fs_extra_1.default.copy(templateDir, targetDir);
        console.log(`Template "${templateName}" (${language}) copied successfully.`);
    }
    catch (err) {
        console.error('Error copying template files:', err);
        process.exit(1);
    }
    // 4. Customize package.json
    const pkgJsonPath = path_1.default.join(targetDir, 'package.json');
    if (fs_extra_1.default.existsSync(pkgJsonPath)) {
        try {
            const pkgJson = await fs_extra_1.default.readJson(pkgJsonPath);
            pkgJson.name = projectName;
            await fs_extra_1.default.writeJson(pkgJsonPath, pkgJson, { spaces: 2 });
            console.log('Customized package.json.');
        }
        catch (err) {
            console.error('Error customizing package.json:', err);
            await fs_extra_1.default.remove(targetDir);
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
