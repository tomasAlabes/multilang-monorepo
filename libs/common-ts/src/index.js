// Shared, framework-agnostic TypeScript utilities. Domain-specific enough to
// be worth sharing, generic enough not to belong to any single app.
/** Reads a required environment variable or throws — fail fast on misconfig. */
export function requireEnv(name) {
    const value = process.env[name];
    if (value === undefined || value === "") {
        throw new Error(`Missing required environment variable: ${name}`);
    }
    return value;
}
/** Human-readable label for a sensor reading, e.g. "23.4 celsius". */
export function formatReading(value, unit) {
    return `${value.toFixed(1)} ${unit}`;
}
/** Clamps a number into the inclusive [min, max] range. */
export function clamp(value, min, max) {
    return Math.min(Math.max(value, min), max);
}
