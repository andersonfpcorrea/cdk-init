# Opinionated CDK TypeScript Template

This template provides a well-structured starting point for small to medium AWS CDK projects. It strikes a balance between simplicity and abstraction, promoting best practices without enforcing a complex, domain-driven folder structure.

## Philosophy

The goal is to move beyond a single monolithic stack file while keeping the architecture approachable. Key principles include:

- **Sensible Structure**: Code is organized into logical units (`constructs`, `src`, `schemas`) to improve maintainability.
- **Environment Stages**: Encourages the use of CDK Stages for managing different deployment environments (e.g., Dev, PreProd, Prod).
- **Abstracted Constructs**: Provides a foundation for creating reusable components, such as a common Lambda construct, to reduce boilerplate.
- **Integrated Best Practices**: Comes pre-configured with modern tooling for testing (`vitest`), linting (`eslint`), and formatting (`prettier`), along with CDK validations (`cdk-nag`).
- **Colocated tests**: No separated folder for tests. Just place the test file close (as possible) to what is being tested.

## Directory Structure

```
├── bin/              # CDK App entrypoint, where Stages and Stacks are instantiated.
├── constructs/       # Reusable CDK constructs.
│   ├── stack/        # The main application stack.
│   └── stage/        # The Stage construct for environment isolation.
├── schemas/          # Data contracts and event schemas.
│   ├── events/
│   └── openapi/
├── src/              # Application source code (e.g., Lambda handlers).
│   ├── lambdas/
│   └── lib/
```

## Getting Started

1.  **Install Dependencies**: `npm install`
2.  **Build the Code**: `npm run build`
3.  **Synthesize the Stack**: `npm run synth`
4.  **Deploy a Stage**: `npm run deploy:dev`

Start by customizing your application stack in `constructs/stack/` and defining your deployment stages in `constructs/stage/`.

## Testing

This template uses `vitest` for testing. You can run tests using the following commands:

- `npm run test`: Run all tests.
- `npm run test:debug`: Run tests in debug mode.
- `npm run coverage`: Generate a coverage report.

### Remote Lambda Tests

For tests that require AWS resources, this template provides a script to export environment variables from a deployed stack. This is useful for testing Lambdas locally as if they were running in the cloud (remocal tests).

To use it, run the following command:

```bash
npm run export-env
```

This will create a `.env` file in the root of the project with the outputs of the deployed stack. In the `vitest.config.ts` file we use `dotenv` to load those env varibles during the tests.
