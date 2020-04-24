import {Sequelize} from 'sequelize-typescript';
import { config } from './config/config';


const c = config.dev;

// Instantiate new Sequelize instance!
export const sequelize = new Sequelize({
  "username": c.username,
  "password": c.password,
  "database": c.database,
  "host":     c.host,
  pool: {
    max: 15,
    min: 5,
    idle: 20000,
    evict: 15000,
    acquire: 30000
  },
  dialect: 'postgres',
  storage: ':memory:',
});
