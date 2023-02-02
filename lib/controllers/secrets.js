const { Router } = require('express');
const authenticate = require('../middleware/authenticate.js');
const authorize = require('../middleware/authorize.js');
const { Secret } = require('../models/Secret.js');

module.exports = Router()
  .get('/', [authenticate, authorize], async (req, res, next) => {
    try {
      const secrets = await Secret.getAll();
      res.json(secrets);
    } catch (e) {
      next(e);
    }
  })
  .post('/', [authenticate, authorize], async (req, res, next) => {
    try {
      const secret = await Secret.insert(req.body);
      res.json(secret);
    } catch (e) {
      next(e);
    }
  });
