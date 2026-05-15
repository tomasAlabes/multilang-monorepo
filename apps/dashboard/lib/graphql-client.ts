import { GraphQLClient } from "graphql-request";

// The dashboard's only backend dependency is the api-gateway's GraphQL
// endpoint. All service-to-service gRPC traffic stays behind the gateway.
const endpoint = process.env.NEXT_PUBLIC_GRAPHQL_URL ?? "http://localhost:8080/query";

export const gqlClient = new GraphQLClient(endpoint);
