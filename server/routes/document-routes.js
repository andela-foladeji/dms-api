const express = require('express');
const Authentication = require('../controllers/authentication');
const docController = require('../controllers/documents-controller');

const docRoute = express.Router();

docRoute.route('/')
  .post(Authentication.verify, docController.createDocument)
  .get(Authentication.verify, docController.getAllDocuments);

docRoute.route('/:id')
  .get(Authentication.verify, docController.getADocument)
  .delete(Authentication.verify, docController.deleteDocument)
  .put(Authentication.verify, docController.editDocument);

module.exports = docRoute;
