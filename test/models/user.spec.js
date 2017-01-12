import faker from 'faker';
import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';

describe('User model', () => {
  let roleId, userId;
  before(() => {
    db.role.create(fakeData.role1).then((role) => {
      roleId = role.dataValues.id;
    });
  });

  after((done) => {
    db.sequelize.sync({ force: true })
      .then((done));
  });

  describe('Create user', () => {
    it('should save all users details', () => {
      fakeData.user.roleId = roleId;
      db.user.create(fakeData.user).then((user) => {
        userId = user.dataValues.id;
        assert.equal(fakeData.user.userName, user.dataValues.userName);
        assert.equal(fakeData.user.firstName, user.dataValues.firstName);
        assert.equal(fakeData.user.lastName, user.dataValues.lastName);
        assert.equal(fakeData.user.email, user.dataValues.email);
      });
    });

    it('does not save if roleId violates foreign key constraint', () => {
      fakeData.user.roleId = 0;
      assert.throws(db.user.create(fakeData.user), new ForeignKeyConstraintError());
    });

    it('throws unique constraint error if an existing email/username is used', () => {
      fakeData.user.roleId = roleId;
      assert.throws(db.user.create(fakeData.user), new UniqueConstraintError());
    });
  });

  describe('Update user', () => {
    it('ensures password is hashed', () => {
      db.user.update(fakeData.user2, {
        where: {
          id: userId
        }
      }).then((user) => {
        assert.notEqual(user.password, fakeData.user2.password);
      });
    });
  });
});