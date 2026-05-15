/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  DateTime: { input: any; output: any; }
};

export type Anomaly = {
  __typename?: 'Anomaly';
  description: Scalars['String']['output'];
  detectedAt: Scalars['DateTime']['output'];
  score: Scalars['Float']['output'];
  sensorId: Scalars['ID']['output'];
  severity: AnomalySeverity;
};

export enum AnomalySeverity {
  Critical = 'CRITICAL',
  Info = 'INFO',
  Warning = 'WARNING'
}

export type Greenhouse = {
  __typename?: 'Greenhouse';
  id: Scalars['ID']['output'];
  location: Scalars['String']['output'];
  name: Scalars['String']['output'];
  zones: Array<Zone>;
};

export type Mutation = {
  __typename?: 'Mutation';
  registerSensor: Sensor;
};


export type MutationRegisterSensorArgs = {
  type: SensorType;
  unit: Scalars['String']['input'];
  zoneId: Scalars['ID']['input'];
};

export type Query = {
  __typename?: 'Query';
  anomalies: Array<Anomaly>;
  greenhouse?: Maybe<Greenhouse>;
  greenhouses: Array<Greenhouse>;
};


export type QueryAnomaliesArgs = {
  greenhouseId: Scalars['ID']['input'];
};


export type QueryGreenhouseArgs = {
  id: Scalars['ID']['input'];
};

export type Sensor = {
  __typename?: 'Sensor';
  id: Scalars['ID']['output'];
  latestReading?: Maybe<SensorReading>;
  type: SensorType;
  unit: Scalars['String']['output'];
};

export type SensorReading = {
  __typename?: 'SensorReading';
  observedAt: Scalars['DateTime']['output'];
  sensorId: Scalars['ID']['output'];
  type: SensorType;
  unit: Scalars['String']['output'];
  value: Scalars['Float']['output'];
};

export enum SensorType {
  Co2 = 'CO2',
  Humidity = 'HUMIDITY',
  Light = 'LIGHT',
  SoilMoisture = 'SOIL_MOISTURE',
  Temperature = 'TEMPERATURE'
}

export type Subscription = {
  __typename?: 'Subscription';
  readings: SensorReading;
};


export type SubscriptionReadingsArgs = {
  zoneId: Scalars['ID']['input'];
};

export type Zone = {
  __typename?: 'Zone';
  crop: Scalars['String']['output'];
  id: Scalars['ID']['output'];
  name: Scalars['String']['output'];
  sensors: Array<Sensor>;
};

export type GreenhousesQueryVariables = Exact<{ [key: string]: never; }>;


export type GreenhousesQuery = { __typename?: 'Query', greenhouses: Array<{ __typename?: 'Greenhouse', id: string, name: string, location: string, zones: Array<{ __typename?: 'Zone', id: string }> }> };


export const GreenhousesDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"Greenhouses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"greenhouses"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"name"}},{"kind":"Field","name":{"kind":"Name","value":"location"}},{"kind":"Field","name":{"kind":"Name","value":"zones"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]}}]} as unknown as DocumentNode<GreenhousesQuery, GreenhousesQueryVariables>;