import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';

describe('Role model', () => {
  const aNewRole = {};

  before(() => {
    db.role.bulkCreate([fakeData.adminRole, fakeData.regularRole]);
  });

  after((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
  });

  describe('role should be created', () => {
    it('should create a new role', () => {
      db.role.create(fakeData.newRole).then((newRole) => {
        assert.equal(newRole.dataValues.title, fakeData.newRole.title);
      });
    });

    it('requires title', () => {
      db.role.create(aNewRole).then().catch(error =>
        assert.match(error.message, /^notNull/)
      );
    });

    it('prevents a role with existing title', () => {
      db.role.create(fakeData.adminRole).then().catch(error =>
        assert.equal(error.name, 'SequelizeUniqueConstraintError')
      );
    });
  });

  describe('role table should have default values', () => {
    it('should have both admin and regular role', () => {
      db.role.findAll().then((allRoles) => {
        assert.equal(allRoles[0].dataValues.title.toLowerCase(), 'admin');
        assert.equal(allRoles[1].dataValues.title.toLowerCase(), 'regular');
      });
    });
  });
});
