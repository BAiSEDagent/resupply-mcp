/**
 * Environment Variable Validation
 *
 * Pattern: PATTERN_TS_ENV_VALIDATION
 * Rule: Validate env vars at startup (fail-fast)
 */
import { z } from 'zod';
declare const envSchema: z.ZodObject<{
    RPC_URL: z.ZodString;
    ETHERSCAN_API_KEY: z.ZodString;
    MCP_SERVER_NAME: z.ZodDefault<z.ZodOptional<z.ZodString>>;
    MCP_SERVER_VERSION: z.ZodDefault<z.ZodOptional<z.ZodString>>;
}, z.core.$strip>;
export type Env = z.infer<typeof envSchema>;
/**
 * Validate and return environment variables
 *
 * @throws ZodError if validation fails (fail-fast at startup)
 */
export declare function getEnv(): Env;
export {};
//# sourceMappingURL=env.d.ts.map