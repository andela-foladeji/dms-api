import fs from 'fs';
import path from 'path';
import Sequelize from 'sequelize';
import config from '../../config/config';

const basename = path.basename(module.filename);

const db = {};
let sequelize;

if (process.env.NODE_ENV === 'production') {
  sequelize = new Sequelize(config.connection);
} else {
  sequelize = new Sequelize(config.db.database, config.db.user,
config.db.password, config.db.options);
}


fs
  .readdirSync(__dirname)
  .filter(file =>
    (file.indexOf('.') !== 0) &&
    (file !== basename) &&
    (file.slice(-3) === '.js')
  )
  .forEach((file) => {
    const model = sequelize.import(path.join(__dirname, file));
    db[model.name] = model;
  });

Object.keys(db).forEach((modelName) => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;

export default db;
