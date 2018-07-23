export interface IConfig {
  port: number;
  prettyLog: boolean;
  redisHost?: string;
  redisPort?: number;
}

const config: IConfig = {
  port: +process.env.port || 3000,
  prettyLog: process.env.NODE_ENV !== 'production',
  redisHost: process.env.REDIS_HOST,
  redisPort: +process.env.REDIS_PORT,
};

export { config };
