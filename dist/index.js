import { z } from "zod";
import { init } from "zod-empty";
function getEnv(name, schema, options) {
    const { fallback = undefined, required = false } = options !== null && options !== void 0 ? options : {};
    if (!name) {
        throw new Error("Environment variable name is required");
    }
    const value = process.env[name];
    if (value === undefined) {
        if (required) {
            throw new Error(`Environment variable "${name}" is required`);
        }
        return fallback;
    }
    try {
        return schema.parse(value);
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues
                .map((issue) => `${issue.path.join(".")} - ${issue.message}`)
                .join(", ");
            throw new Error(`Invalid value for environment variable "${name}": ${issues}`);
        }
        if (error instanceof Error) {
            throw new Error(`Error parsing environment variable "${name}": ${error.message}`);
        }
        throw new Error(`Error parsing environment variable "${name}": ${error}`);
    }
}
function collectEnv(schemaObject, fallback) {
    var _a, _b;
    const schema = z.object(schemaObject);
    const env = {};
    const defaults = init(schema);
    try {
        for (const key in schema.shape) {
            const value = getEnv(key, schema.shape[key], {
                required: !schema.shape[key].isOptional(),
                fallback: (_b = (_a = fallback === null || fallback === void 0 ? void 0 : fallback[key]) !== null && _a !== void 0 ? _a : defaults[key]) !== null && _b !== void 0 ? _b : undefined,
            });
            env[key] = schema.shape[key].parse(value);
        }
        return env;
    }
    catch (error) {
        if (error instanceof z.ZodError) {
            const issues = error.issues
                .map((issue) => `${issue.path.join(".")} - ${issue.message}`)
                .join(", ");
            throw new Error(`Invalid environment variable values: ${issues}`);
        }
        if (error instanceof Error) {
            throw new Error(`Error collecting environment variables: ${error.message}`);
        }
        throw new Error(`Error collecting environment variables: ${error}`);
    }
}
const env = {
    get: getEnv,
    collect: collectEnv,
};
export default env;
