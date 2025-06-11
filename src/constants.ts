import getEnvVars from './config';

const config = getEnvVars();
export const API: string = config?.API || "";