import dotenv from 'dotenv';
import * as Joi from 'joi';

let path = '.env.dev';
if (process.env.NODE_ENV === 'production') {
  path = '.env';
}

dotenv.config({ path });

const envSchema = Joi.object({
  NODE_ENV: Joi.string().required(),
  PORT: Joi.number().default(3005),
  OPENAI_API_KEY: Joi.string().required(),
}).unknown(true);

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Enviroment Variable Remaining: ${error.message}`);
}

export const envConfig = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  openAI: {
    key: envVars.OPENAI_API_KEY,
  },
};
