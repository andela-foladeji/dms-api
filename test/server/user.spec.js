import supertest from 'supertest';
import faker from 'faker';
import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';
import app from '../../server/index';

const request = supertest(app);

describe('User Actions', () => {
  const requiredFields = ['firstName', 'lastName',
    'username', 'email', 'password'];
  let roleId1, roleId2, token;
  let incompleteUser = {};
  before((done) => {
    db.role.create(fakeData.adminRole).then((role) => {
      roleId1 = role.dataValues.id;
      db.role.create(fakeData.regularRole).then((newRole) => {
        roleId2 = newRole.dataValues.id;
        done();
      });
    });
  });

  after((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
  });

  describe('POST /users create account', () => {
    it('if all details are available', (done) => {
      fakeData.user.roleId = roleId1;
      request.post('/users')
        .send(fakeData.user)
        .end((error, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it('does not create with an invalid roleid', (done) => {
      fakeData.user2.roleId = 0;
      request.post('/users')
        .send(fakeData.user2)
        .end((error, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('another account with unique details', (done) => {
      fakeData.user2.roleId = roleId2;
      request.post('/users')
        .send(fakeData.user2)
        .end((error, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it('ensures a new user has unique data', (done) => {
      fakeData.user.roleId = roleId1;
      request.post('/users')
        .send(fakeData.user)
        .end((error, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    requiredFields.forEach((field) => {
      it(`does not create account without ${field}`, (done) => {
        Object.assign(incompleteUser, fakeData.user);
        delete incompleteUser[field];
        request.post('/users')
          .send(incompleteUser)
          .end((error, res) => {
            assert.equal(res.status, 400);
            done();
          });
      });
      incompleteUser = {};
    });
  });

  describe('POST /users/login', () => {
    it('logs in for valid username and password', (done) => {
      request.post('/users/login')
        .send({
          username: fakeData.user.username,
          password: fakeData.user.password
        })
        .end((error, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.token);
          token = res.body.token;
          done();
        });
    });

    it('prevents login for invalid username', (done) => {
      request.post('/users/login')
        .send({
          username: faker.internet.userName(),
          password: fakeData.user.password
        })
        .end((error, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.token);
          done();
        });
    });

    it('prevents login for invalid password', (done) => {
      request.post('/users/login')
        .send({
          username: fakeData.user.username,
          password: faker.internet.password()
        })
        .end((error, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.token);
          done();
        });
    });
  });

  describe('GET /users gets all users\' data', () => {
    it('prevents unauthorized user (without valid token)', (done) => {
      request.get('/users')
        .set({ Authorization: 'invalidToken' })
        .end((error, res) => {
          assert.equal(res.status, 401);
          done();
        });
    });

    it('gets all users for valid token with admin role', (done) => {
      request.get('/users')
        .set({ Authorization: token })
        .end((error, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.allUsers);
          assert.equal(res.body.allUsers.length, 2);
          done();
        });
    });
  });

  describe('GET /users/<id> gets all details of a user', () => {
    it('requires an authorization token', (done) => {
      request.get('/users/1')
        .end((error, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.user);
          done();
        });
    });

    it('requires a valid authorization token', (done) => {
      request.get('/users/1')
        .set({ Authorization: 'invalidtoken' })
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.user);
          done();
        });
    });

    it('returns details of the authenticated user', (done) => {
      request.get('/users/1')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isObject(res.body.user);
          assert.property(res.body.user, 'username');
          done();
        });
    });
  });

  describe('PUT /users/<id> updates a user details', () => {
    it('prevents unauthorized user', (done) => {
      request.put('/users/1')
        .send(fakeData.user2)
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.user);
          done();
        });
    });

    it('updates for currently logged in user', (done) => {
      request.put('/users/1')
        .set({ Authorization: token })
        .send(fakeData.user3)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.user.username, fakeData.user3.username);
          assert.equal(res.body.user.email, fakeData.user3.email);
          assert.equal(res.body.user.firstName, fakeData.user3.firstName);
          done();
        });
    });

    it('prevents updates of another user details', (done) => {
      request.put('/users/2')
        .set({ Authorization: token })
        .send(fakeData.user2)
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.user);
          done();
        });
    });
  });

  describe('DELETE /users/<id> ', () => {
    it('prevents unauthorized user from deleting', (done) => {
      request.delete('/users/2')
        .end((err, res) => {
          assert.equal(res.status, 401);
          done();
        });
    });

    it('deletes the user if requested by an authorized user', (done) => {
      request.delete('/users/1')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });

  describe('POST /logout to log out a user', () => {
    it('should logout a logged in user', (done) => {
      request.post('/users/logout')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });
  });
});
