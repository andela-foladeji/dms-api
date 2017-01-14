import db from '../models';
import user from './users-controller';

/**
 * DocumentsController class to handle all documents
 * related actions
 */
class DocumentsController {

  /**
   * method createDocument to create new document
   * @param {object} req request object with all request data
   * @param {object} res response object that is sent to frontend
   * @return {object} response with status and message
   */
  static createDocument(req, res) {
    db.document.create(req.body)
      .then(docInfo => res.status(200).json({
        done: true,
        doc: docInfo.dataValues
      }))
      .catch((error) => {
        if (error.errors[0].type === 'notNull Violation' ||
        error.errors[0].type === 'unique violation') {
          return res.status(400).json({
            done: false,
            message: error.errors[0].message
          });
        }
        res.status(401).json({ done: false });
      });
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
        return res.status(200).json({ done: true, doc });
      }
      if (doc.access === 'private' && doc.ownerId !== req.decoded.id) {
        return user.returnUnAuthroized(res);
      }
      if (doc.access === 'role') {
        user.getUserRole(doc.ownerId, (docCreatorRole) => {
          if (docCreatorRole === req.decoded.role) {
            res.status(200).json({ done: true, doc });
          } else {
            user.returnUnAuthroized(res);
          }
        });
      }
    }).catch(() => {
      res.status(500).json({ done: false });
    });
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
    }).then((doc) => {
      return res.status(200).json({ done: true, doc: doc[1][0].dataValues });
    }).catch((error) => {
      res.status(500).json({ done: false, error });
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
        user.returnUnAuthroized(res)
    ).catch(() => {
      res.status(500).json({ done: false });
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
    let options;
    if (req.decoded.role.toLowerCase() === 'admin') {
      options = { order: [['createdAt', 'DESC']] };
    } else {
      options = {
        order: [['createdAt', 'DESC']],
        where: {
          $or: [
            { access: 'public' },
            {
              $and: {
                access: 'private',
                ownerId: req.decoded.id
              }
            }
          ]
        }
      };
    }
    if (req.query.page && req.query.limit) {
      options.limit = req.query.limit;
      options.offset = (req.query.page - 1) * 10;
    }
    db.document.findAll(options).then(documents =>
      res.status(200).json({ doc: documents })
    ).catch(() => res.status(500).json({ done: false }));
  }
}

export default DocumentsController;
