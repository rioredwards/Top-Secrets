const { Router } = require('express');
const UserService = require('../services/UserService.js');

module.exports = Router().post('/', async (req, res, next) => {
  try {
    /* eslint-disable-next-line */
    console.log(req.body);
    const user = await UserService.create(req.body);
    res.json(user);
  } catch (e) {
    next(e);
  }
});
