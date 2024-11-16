import { ConfigInput } from "./schemas/config";

export const defineConfig = (config: ConfigInput) => config;

export type { ConfigInput as Config } from "./schemas/config";
