# @andersonfpcorrea/cdk-init

An opinionated CLI for bootstrapping AWS CDK applications with focus on best practices and developer experience.

## Features

- **Interactive Setup**: Guides you through project creation with a series of questions.
- **Template Selection**: Choose from predefined templates and languages to quickly start your project.
- **Placeholder Replacement**: Automatically populates project-specific values (e.g., service name, AWS account, region) into your template files.
- **Git Initialization**: Initializes a Git repository for your new project.
- **Dependency Installation**: Automatically installs project dependencies using `npm`.

## Usage with npx

To create a new CDK project, navigate to your desired directory and run:

```bash
npx @andersonfpcorrea/cdk-init <project-name>
```

If you omit `<project-name>`, the CLI will prompt you for it.

### Example:

```bash
npx @andersonfpcorrea/cdk-init my-new-service
```

This will guide you through some questions to configure your CDK application.

### Specifying a Template and Language

You can also specify a template and language directly using the `--template` and `--language` flags:

```bash
npx @andersonfpcorrea/cdk-init my-new-service --template default --language typescript
```

### Available Templates

Currently, the CLI supports the following templates:

- **Language: `typescript`**
  - **Template: `default`**: An opinionated starter template for small to medium AWS CDK projects.

## Development

To set up the development environment for `cdk-init`:

1.  **Clone the repository**:
    ```bash
    git clone https://github.com/andersonfpcorrea/cdk-init.git
    cd cdk-init
    ```
2.  **Install dependencies**:
    ```bash
    npm install
    ```
3.  **Build the project**:
    ```bash
    npm run build
    ```
4.  **Link the CLI for local testing**:

    ```bash
    npm link
    ```

    Now you can run `cdk-init` commands from any directory on your system.

5.  **Run tests**:
    ```bash
    npm run test
    ```

## Contributing

Contributions are welcome. Feel free to write an issue or submit a pull request.

## License

ISC License
