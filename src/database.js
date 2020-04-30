import Mongoose from 'mongoose';

import Dotenv from 'dotenv';

Dotenv.config();

/*
 * REMEMBER: https://www.cyberciti.biz/faq/how-to-secure-mongodb-nosql-production-database/
 */

Mongoose.connect(`mongodb://${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_AUTH}`, {
  user: process.env.DB_USER,
  pass: process.env.DB_PASSWORD,
  dbName: process.env.DB_NAME,
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

export default Mongoose;
