import { z } from "zod";
declare function getEnv<T>(name: keyof NodeJS.ProcessEnv, schema: z.ZodType<T>, options: {
    fallback?: T;
    required: true;
}): T;
declare function getEnv<T>(name: keyof NodeJS.ProcessEnv, schema: z.ZodType<T>, options: {
    fallback: T;
    required?: boolean;
}): T;
declare function getEnv<T>(name: keyof NodeJS.ProcessEnv, schema: z.ZodType<T>, options?: {
    fallback?: T;
    required?: boolean;
}): T | undefined;
export type ZodEnvObject = {
    [keys in keyof NodeJS.ProcessEnv]: z.ZodType;
};
export type EnvObject = Record<keyof NodeJS.ProcessEnv, string | boolean | number>;
declare function collectEnv(schemaObject: ZodEnvObject, fallback?: Partial<EnvObject>): EnvObject;
declare const env: {
    get: typeof getEnv;
    collect: typeof collectEnv;
};
export default env;
