export interface IConfig {
  port: number;
  prettyLog: boolean;
}

const config: IConfig = {
  port: +process.env.port || 3000,
  prettyLog: process.env.NODE_ENV !== 'production',
};

export { config };
