import type { CodegenConfig } from "@graphql-codegen/cli";

// Generates a fully typed GraphQL client from the shared schema contract.
// Because `dashboard` declares an implicit dependency on `graphql-schema`,
// editing the schema marks the dashboard affected and reruns this codegen.
const config: CodegenConfig = {
  schema: "../../libs/graphql-schema/schema.graphql",
  documents: ["app/**/*.tsx", "lib/**/*.ts"],
  ignoreNoDocuments: true,
  generates: {
    "./lib/gql/": { preset: "client" },
  },
};

export default config;
