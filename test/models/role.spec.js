import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';

describe('Role model', () => {
  const newRole = {};
  after((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
  });

  describe('role should be created', () => {
    it('should create a new role', () => {
      db.role.create(fakeData.role1).then((newRole) => {
        assert.equal(newRole.dataValues.title, fakeData.role1.title);
      });
    });

    it('requires title', () => {
      db.role.create(newRole).then().catch(error =>
        assert.match(error.message, /^notNull/)
      );
    });
  });
});