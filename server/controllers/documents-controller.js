import db from '../models';
import user from './users-controller';
import Helper from './helper';

/**
 * DocumentsController class to handle all documents
 * related actions
 */
class DocumentsController extends Helper {

  /**
   * method createDocument to create new document
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static createDocument(req, res) {
    if(parseInt(req.body.ownerId, 10) === req.decoded.id) {
      db.document.create(req.body)
      .then(docInfo => res.status(200).json({
        doc: docInfo.dataValues
      }))
      .catch((error) => {
        if (error.name === 'SequelizeForeignKeyConstraintError') {
          return res.status(400).json({
            message: 'User does not exist'
          });
        }
        if (error.errors[0].type === 'notNull Violation' ||
        error.errors[0].type === 'unique violation') {
          return res.status(400).json({
            message: error.errors[0].message
          });
        }
        res.status(401).json({ error });
      });
    } else {
      return Helper.returnUnAuthorized(res);
    }
  }

  /**
   * method getDocuments to get details of a document
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static getADocument(req, res) {
    db.document.findById(req.params.id)
    .then((docInfo) => {
      const doc = docInfo.dataValues;
      if (doc.access === 'public' ||
      (doc.access === 'private' && doc.ownerId === req.decoded.id)) {
        return res.status(200).json({ doc });
      }
      if (doc.access === 'private' && doc.ownerId !== req.decoded.id) {
        return Helper.returnUnAuthorized(res);
      }
      if (doc.access === 'role') {
        user.getUserRole(doc.ownerId, (docCreatorRole) => {
          if (docCreatorRole === req.decoded.role) {
            res.status(200).json({ doc });
          } else {
            Helper.returnUnAuthorized(res);
          }
        });
      }
    }).catch(error =>
      res.status(500).json({ error })
    );
  }

  /**
   * method getDocuments to get details of a document
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static editDocument(req, res) {
    db.document.update(req.body, {
      where: {
        id: req.params.id,
        ownerId: req.decoded.id
      },
      fields: ['title', 'content', 'access'],
      returning: true
    }).then(doc =>
      res.status(200).json({ doc: doc[1][0].dataValues })
    ).catch((error) => {
      res.status(500).json({ error });
    });
  }

  /**
   * method deleteDocument to delete a document
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static deleteDocument(req, res) {
    /* eslint-disable no-confusing-arrow */
    db.document.destroy({
      where: { id: req.params.id, ownerId: req.decoded.id }
    }).then(deleted =>
      (deleted) ? res.status(200).json({ done: true }) :
        Helper.returnUnAuthorized(res)
    ).catch((error) => {
      res.status(500).json({ error });
    });
    /* eslint-enable no-confusing-arrow */
  }

  /**
   * method getAllDocuments gets all document that user is authorized to
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static getAllDocuments(req, res) {
    let options = {};
    options.order = [['createdAt', 'DESC']];
    if (req.decoded.role.toLowerCase() !== 'admin') {
      options.where = {
          $or: [
            { access: 'public' },
            {
              $and: {
                access: 'private',
                ownerId: req.decoded.id
              }
            }
          ]
        };
    }
    if (req.query.limit) {
      if (req.query.limit < 1) {
        return res.status(400).json({ message: 'Invalid limit specified'});
      }
      options.limit = req.query.limit;
    }
    if (req.query.page) {
      if (req.query.page < 1 || !req.query.limit) {
        return res.status(400).json({ message: 'Invalid page/limit specified'});
      }
      options.offset = (req.query.page - 1) * req.query.limit;
    }
    db.document.findAll(options).then(documents =>
      res.status(200).json({ doc: documents })
    ).catch((error) => res.status(500).json({ error }));
  }
}

export default DocumentsController;
