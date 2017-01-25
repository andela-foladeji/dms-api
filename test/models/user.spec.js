import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';

describe('User model', () => {
  let roleId, userId;
  const requiredFields = ['firstName', 'lastName',
    'username', 'email', 'password'];
  const uniqueAttributes = ['email', 'username'];
  const incompleteUser = {};
  const newUser = {};
  before((done) => {
    db.role.create(fakeData.adminRole).then((role) => {
      roleId = role.dataValues.id;
      done();
    });
  });

  after((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
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
      fakeData.user2.roleId = 5;
      db.user.create(fakeData.user2).then().catch(error =>
        assert.equal(error.name, 'SequelizeForeignKeyConstraintError')
      );
    });

    it('fails for invalid email', () => {
      Object.assign(newUser, fakeData.user2);
      newUser.email = 'invalid email';
      db.user.create(newUser).then().catch(error =>
        assert.match(error.message, /Validation isEmail failed/)
      );
    });
  });

  describe('Unique validations', () => {
    uniqueAttributes.forEach((each) => {
      Object.assign(newUser, fakeData.user2);
      it(`fails for an existing ${each}`, () => {
        newUser.roleId = roleId;
        newUser[each] = fakeData.user[each];
        db.user.create(newUser).then().catch((error) => {
          assert.equal(error.name, 'SequelizeUniqueConstraintError');
        });
      });
    });
  });

  describe('Not null validations', () => {
    fakeData.user3.roleId = roleId;
    requiredFields.forEach((each) => {
      Object.assign(incompleteUser, fakeData.user3);
      it(`it fails if ${each} is null`, () => {
        incompleteUser[each] = null;
        db.user.create(incompleteUser).then().catch(error =>
          assert.match(error.message, /^notNull/)
        );
      });
    });
  });

  describe('Update user', () => {
    it('ensures password is hashed', () => {
      fakeData.user2.roleId = roleId;
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
