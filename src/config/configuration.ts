import * as Joi from 'joi';

const DEFALT_APP_PORT = 3000;
const DEFAULT_BD_PORT = 5432;

export const EnvSchema = Joi.object({
  APP_PORT: Joi.number().required().default(DEFALT_APP_PORT),
  APP_FORBID_NON_WHITELISTED: Joi.boolean().required().default(true),
  APP_WHITELIST_CLEANER: Joi.boolean().required().default(true),
  DB_HOST: Joi.required(),
  DB_PORT: Joi.number().required().default(DEFAULT_BD_PORT),
  DB_NAME: Joi.required(),
  DB_USERNAME: Joi.required(),
  DB_DRIVER: Joi.required(),
  DB_PASSWORD: Joi.required(),
  DB_AUTOLOAD_ENTITIES: Joi.boolean().required().default(true),
  DB_SYNCHRONIZATION: Joi.boolean().required().default(false),
  JWT_SECRET: Joi.required(),
  JWT_EXPIRATION: Joi.required().default(3600),
});

export default () => ({
  port: parseInt(process.env.APP_PORT || '', 10) || DEFALT_APP_PORT,
  global: {
    whitelist: Boolean(process.env.APP_WHITELIST_CLEANER),
    forbidNonWhitelisted: Boolean(process.env.APP_FORBID_NON_WHITELISTED),
    jwtSecret: process.env.JWT_SECRET,
    jwtExpiration: process.env.JWT_EXPIRATION,
  },
  database: {
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '', 10) || DEFAULT_BD_PORT,
    name: process.env.DB_NAME,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    driver: process.env.DB_DRIVER,
    autoLoadEntities: Boolean(process.env.DB_AUTOLOAD_ENTITIES),
    synchronize: Boolean(process.env.DB_SYNCHRONIZATION),
  },
});
