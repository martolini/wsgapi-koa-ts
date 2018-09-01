export interface Config {
  port: number;
  prettyLog: boolean;
}

const config: Config = {
  port: +process.env.PORT || 8080,
  prettyLog: process.env.NODE_ENV !== 'production',
};

export { config };
