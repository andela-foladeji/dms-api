import supertest from 'supertest';
import { assert } from 'chai';
import db from '../../server/models';
import fakeData from '../fake-data';
import app from '../../server/index';

const request = supertest(app);

describe('Document related activities', () => {
  let roleId, token, token2;
  const incompleteDoc = {};
  const requiredFields = ['title', 'content'];
  before((done) => {
    db.role.create(fakeData.adminRole).then((role) => {
      roleId = role.dataValues.id;
      fakeData.user.roleId = roleId;
      request.post('/users')
        .send(fakeData.user)
        .end((err2, res2) => {
          if (!err2) {
            fakeData.document.ownerId = res2.body.user.id;
            fakeData.privateDoc.ownerId = res2.body.user.id;
            token = res2.body.token;
            fakeData.user2.roleId = roleId;
            request.post('/users')
              .send(fakeData.user2)
              .end((err3, res3) => {
                if (!err3) {
                  token2 = res3.body.token;
                  done();
                }
              });
          }
        });
    });
  });

  after((done) => {
    db.sequelize.sync({ force: true })
      .then(() => {
        done();
      });
  });

  describe('POST /documents create documents', () => {
    it('a new document has published date', (done) => {
      request.post('/documents')
        .set({ Authorization: token })
        .send(fakeData.privateDoc)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.property(res.body.doc, 'createdAt');
          done();
        });
    });

    it('does not create document without authorization token', (done) => {
      request.post('/documents')
        .send(fakeData.document)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.equal(res.status, 401);
          done();
        });
    });

    it('rejects creation if ownerId is not id of the logged in user', (done) => {
      let invalidDoc = {};
      Object.assign(invalidDoc, fakeData.document);
      invalidDoc.ownerId = 5;
      request.post('/documents')
        .set({ Authorization: token })
        .send(invalidDoc)
        .end((err, res) => {
          assert.equal(res.status, 401);
          done();
        });
    });

    it('sets access to public by default', (done) => {
      request.post('/documents')
        .set({ Authorization: token })
        .send(fakeData.document)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.doc.access, 'public');
          done();
        });
    });

    it('creates a document with access set to role', (done) => {
      fakeData.roleDocument.ownerId = 2;
      request.post('/documents')
        .set({ Authorization: token2 })
        .send(fakeData.roleDocument)
        .end((err, res) => {
          if (err) {
            return done(err);
          }
          assert.equal(res.status, 200);
          assert.isDefined(res.body.doc);
          assert.equal(res.body.doc.access, 'role');
          done();
        });
    });

    requiredFields.forEach((field) => {
      it(`requires ${field}`, (done) => {
        Object.assign(incompleteDoc, fakeData.document);
        delete incompleteDoc[field];
        request.post('/documents')
          .set({ Authorization: token })
          .send(incompleteDoc)
          .end((err, res) => {
            if (err) {
              return done(err);
            }
            assert.equal(res.status, 400);
            done();
          });
      });
    });
  });

  describe('GET /documents/:id to get a document details', () => {
    it('gets details for document with private access', (done) => {
      request.get('/documents/1')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.doc.title, fakeData.privateDoc.title);
          done();
        });
    });

    it('declines access private document if not requested by owner', (done) => {
      request.get('/documents/1')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 401);
          assert.isUndefined(res.body.doc);
          done();
        });
    });

    it('allows access if user has same role with creator', (done) => {
      request.get('/documents/3')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.equal(res.body.doc.title, fakeData.roleDocument.title);
          done();
        });
    });

    it(`declines access for a role document when
      requested by a different role`, (done) => {
      db.role.create(fakeData.regularRole).then((role) => {
        fakeData.user3.roleId = role.id;
        request.post('/users')
          .send(fakeData.user3)
          .end((err, res) => {
            request.get('/documents/3')
              .set({ Authorization: res.body.token })
              .end((err2, res2) => {
                assert.equal(res2.status, 401);
                done();
              });
          });
      });
    });
  });

  describe('PUT /documents/:id to update a document details', () => {
    it('should update details of the document', (done) => {
      request.put('/documents/3')
        .set({ Authorization: token2 })
        .send(fakeData.updateDoc)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.equal(res.status, 200);
          assert.equal(res.body.doc.title, fakeData.updateDoc.title);
          done();
        });
    });

    it('should prevent update if document not found', (done) => {
      request.put('/documents/0')
        .set({ Authorization: token })
        .send(fakeData.roleDocument)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.equal(res.status, 500);
          done();
        });
    });

    it('should prevent update of a document you didn\'t create', (done) => {
      request.put('/documents/1')
        .set({ Authorization: token2 })
        .send(fakeData.roleDocument)
        .end((err, res) => {
          if (err) {
            done(err);
          }
          assert.equal(res.status, 500);
          assert.isUndefined(res.body.doc);
          done();
        });
    });
  });

  describe('GET /documents to fetch all documents', () => {
    it('gets all documents the user is authorized to access', (done) => {
      request.get('/documents/')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.doc);
          assert.equal(res.body.doc.length, 3);
          assert.isAtLeast(res.body.doc[0].createdAt,
            res.body.doc[1].createdAt);
          done();
        });
    });

    it('gets the last two documents with pagination option', (done) => {
      request.get('/documents/?page=1&limit=2')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.doc);
          assert.equal(res.body.doc.length, 2);
          assert.isAtLeast(res.body.doc[0].createdAt,
            res.body.doc[1].createdAt);
          done();
        });
    });

    it('returns error for invalid page', (done) => {
      request.get('/documents/?page=-1&limit=2')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('returns error for invalid limit', (done) => {
      request.get('/documents/?limit=-2')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('gets all documents with role query', (done) => {
      request.get('/documents/?role=1')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.doc);
          assert.equal(res.body.doc.length, 3);
          assert.isAtLeast(res.body.doc[0].createdAt,
            res.body.doc[1].createdAt);
          done();
        });
    });
  });

  describe('DELETE /documents/:id to delete a document', () => {
    it('should delete a document', (done) => {
      request.delete('/documents/3')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 200);
          done();
        });
    });

    it('shouldn\'t delete a document not created by you', (done) => {
      request.delete('/documents/2')
        .set({ Authorization: token2 })
        .end((err, res) => {
          assert.equal(res.status, 401);
          done();
        });
    });
  });

  describe('GET /users/:id/documents for documents belonging to user', () => {
    it('gets documents belonging to user', (done) => {
      request.get('/users/1/documents')
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 200);
          assert.isArray(res.body.doc);
          assert.equal(res.body.doc.length, 2);
          done();
        });
    });
  });

  describe('GET /search documents to search documents', () => {
    it('retrieves documents with the title query', (done) => {
      request.get(`/documents/search?searchText=${fakeData.document.title}`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.body.doc.length, 1);
          assert.equal(res.body.doc[0].content, fakeData.document.content);
          done();
        });
    });

    it('retrieves the number of documents specified in the limit', (done) => {
      request.get(`/documents/search?searchText=title&limit=1`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.body.doc.length, 1);
          assert.equal(res.body.doc[0].title, fakeData.privateDoc.title);
          done();
        });
    });

    it('retrieves documents corresponding to the page', (done) => {
      request.get(`/documents/search?searchText=title&limit=1&page=2`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.body.doc.length, 1);
          assert.equal(res.body.doc[0].title, fakeData.document.title);
          done();
        });
    })

    it('returns error if limit specified is invalid', () => {
      request.get(`/documents/search?searchText=title&limit=-1`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('returns error if page specified is invalid', () => {
      request.get(`/documents/search?searchText=title&page=-1`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.status, 400);
          done();
        });
    });

    it('retrieves documents based on publishedDate value', (done) => {
      request.get(`/documents/search?searchText=title&publishedDate=DESC`)
        .set({ Authorization: token })
        .end((err, res) => {
          assert.equal(res.body.doc.length, 2);
          assert.isAbove(new Date(res.body.doc[0].createdAt), new Date(res.body.doc[1].createdAt));
          done();
        });
    });
  });
});
