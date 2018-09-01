export interface Config {
  port: number;
  prettyLog: boolean;
}

const config: Config = {
  port: +process.env.port || 3000,
  prettyLog: process.env.NODE_ENV !== 'production',
};

export { config };
