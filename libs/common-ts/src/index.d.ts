/** Reads a required environment variable or throws — fail fast on misconfig. */
export declare function requireEnv(name: string): string;
/** Human-readable label for a sensor reading, e.g. "23.4 celsius". */
export declare function formatReading(value: number, unit: string): string;
/** Clamps a number into the inclusive [min, max] range. */
export declare function clamp(value: number, min: number, max: number): number;
/** Discriminated result type used across the TS projects for fallible calls. */
export type Result<T, E = Error> = {
    ok: true;
    value: T;
} | {
    ok: false;
    error: E;
};
