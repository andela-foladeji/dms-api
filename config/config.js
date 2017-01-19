const env = process.env.NODE_ENV || 'development';
require('dotenv').config({ silent: true });

const config = {
  development: {
    port: process.env.DB_PORT,
    db: {
      database: process.env.DB_DEV_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
      }
    }
  },
  test: {
    port: process.env.DB_PORT,
    db: {
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      options: {
        host: process.env.DB_HOST,
        dialect: 'postgres',
        logging: false
      }
    }
  },
  production: {
    connection: process.env.DATABASE_URL
  }
};

export default config[env];
