import type { ConfigInput as Config } from "./schemas/config";
import type { HandlerInput as Handler } from "./schemas/handler";

export const defineConfig = (config: Config): Config => config;
export const defineHandler = (handler: Handler): Handler => handler;

export type { Config, Handler };
