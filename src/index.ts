import { z, ZodRawShape } from "zod";
import { init } from "zod-empty";

function getEnv<T>(
	name: keyof NodeJS.ProcessEnv,
	schema: z.ZodType<T>,
	options: { fallback?: T; required: true },
): T;

function getEnv<T>(
	name: keyof NodeJS.ProcessEnv,
	schema: z.ZodType<T>,
	options: { fallback: T; required?: boolean },
): T;

function getEnv<T>(
	name: keyof NodeJS.ProcessEnv,
	schema: z.ZodType<T>,
	options?: { fallback?: T; required?: boolean },
): T | undefined;

function getEnv<T = string>(
	name: keyof NodeJS.ProcessEnv,
	schema: z.ZodType<T>,
	options?: { fallback?: T; required?: boolean },
): T | undefined {
	const { fallback = undefined, required = false } = options ?? {};

	if (!name) {
		throw new Error("Environment variable name is required");
	}

	const value = process.env[name];

	if (value === undefined) {
		if (required) {
			throw new Error(`Environment variable "${name}" is required`);
		}
		return fallback as T;
	}

	try {
		return schema.parse(value);
	} catch (error: any) {
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

export type ZodEnvObject = Partial<{ [keys in keyof NodeJS.ProcessEnv]: z.ZodType }>;
export type EnvObject = { [keys in keyof NodeJS.ProcessEnv]: string | number | boolean | undefined };

function collectEnv(schemaObject: ZodEnvObject, fallback?: Partial<EnvObject>): EnvObject {
	const schema = z.object(schemaObject as ZodRawShape);
    const env: EnvObject = {} as EnvObject;
    const defaults = init(schema);

    try {
        for (const key in schema.shape) {
            const value = getEnv(key, schema.shape[key], {
                required: !schema.shape[key].isOptional(),
                fallback: fallback?.[key] ?? defaults[key] ?? undefined,
            });
            env[key] = schema.shape[key].parse(value);
        }
        
        return env;
    } catch (error: any) {
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
