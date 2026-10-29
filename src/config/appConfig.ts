import { config } from "dotenv";
config();

export const AppConfig = {
  imageUrl: process.env.ASSETS_URL,
  jwtSecrets: process.env.JWT_SECRET,
};

export const dbConfig = {
  mongodb: {
    url: process.env.MONGODB_URL,
    dbName: process.env.DB_NAME,
  },
};

export const smtpConfig = {
  service: process.env.SMTP_SERVICE,
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  user: process.env.SMTP_USER,
  password: process.env.SMTP_PASSWORD,
  fromAddress: process.env.SMTP_FROM_ADDRESS,
};
