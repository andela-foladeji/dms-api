import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';

describe('Document model', () => {
  let roleId, userInfo;
  const required = ['title', 'content'];
  beforeEach((done) => {
    db.role.create(fakeData.role1).then((role) => {
      roleId = role.dataValues.id;
      fakeData.user.roleId = roleId;
      db.user.create(fakeData.user).then((user) => {
        userInfo = user;
        done();
      });
      
    });
  });

  afterEach((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
  });

  describe('Document Creation', () => {
    it('creates a new document', () => {
      fakeData.document.ownerId = userInfo.id;
      db.document.create(fakeData.document).then((theDocument) => {
        assert.isDefined(theDocument);
        assert.equal(theDocument.dataValues.title, fakeData.document.title);
        assert.equal(theDocument.dataValues.content, fakeData.document.content);
        assert.isDefined(theDocument.dataValues.createdAt);
      });
    });

    it('gives a default access value of public', () => {
      fakeData.document.ownerId = userInfo.id;
      db.document.create(fakeData.document).then((theDocument) => {
        assert.equal(theDocument.dataValues.access, 'public');
      });
    });
  });

  describe('unique constraints', () => {
    it('ensures title is unique', () => {
      const newDocument1 = {};
      const newDocument2 = {};
      Object.assign(newDocument1, fakeData.document);
      newDocument1.ownerId = userInfo.id;
      Object.assign(newDocument2, fakeData.privateDoc);
      newDocument2.ownerId = userInfo.id;
      newDocument2.title = newDocument1.title;
      db.document.bulkCreate([newDocument1, newDocument2]).then().catch(error =>
        assert.equal(error.name, 'SequelizeUniqueConstraintError')
      );
    });
  });

  describe('foreign key constraints', () => {
    it('fails for a user that does not exist', () => {
      const newDocDetails = {};
      Object.assign(newDocDetails, fakeData.document);
      newDocDetails.ownerId = 0;
      db.document.create(newDocDetails).then((theDocument) => 
        assert.isUndefined(theDocument)
      ).catch(error =>
        assert.equal(error.name, 'SequelizeForeignKeyConstraintError')
      );
    });
  });

  describe('not null constraints', () => {
    required.forEach((each) => {
      const newDocument = {};
      Object.assign(newDocument, fakeData.document);
      it(`fails if ${each} is null`, () => {
        delete newDocument[each];
        db.document.create(newDocument).then().catch(error =>
          assert.match(error.message, /^notNull/)
        );
      });
    })
  });
});