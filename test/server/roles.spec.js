import supertest from 'supertest';
import { assert } from 'chai';
import app from '../../server/index';
import db from '../../server/models';
import fakeData from '../fake-data';

const request = supertest(app);

describe('Roles related activites', () => {
  let roleId, token;
  before((done) => {
    db.role.create(fakeData.role1).then((role) => {
      roleId = role.dataValues.id;
      fakeData.user.roleId = roleId;
      request.post('/users')
        .send(fakeData.user)
        .end((err, res) => {
          if (!err) {
            token = res.body.token;
          }
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

  describe('POST /role to create a new role', () => {
    it('allows only an admin to create role', (done) => {
      request.post('/role')
        .set({ Authorization: token })
        .send(fakeData.role2)
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isDefined(res.body.role);
          done();
        });
    });

    it('ensures that title is not null', (done) => {
      request.post('/role')
        .set({ Authorization: token })
        .send(fakeData.role2)
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('prevents a non admin user from creating a role', (done) => {
      fakeData.user2.roleId = 2;
      request.post('/users')
        .send(fakeData.user2)
        .end((err, res) => {
          const user2Token = res.body.token;
          request.post('/role')
            .set({ Authorization: user2Token })
            .send(fakeData.role2)
            .end((err, res) => {
              assert.equal(res.status, 401);
              assert.isUndefined(res.body.role);
              done();
            });
        });
    });
  });

  describe('GET /roles to get all created roles', () => {
    it('gets all created roles if requested by admin', (done) => {
      request.get('/role')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.roles);
          assert.equal(res.body.roles.length, 2);
          done();
        });
    });
  });
});
