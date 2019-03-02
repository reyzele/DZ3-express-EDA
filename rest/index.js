const express = require('express');
const router = express.Router();
const ENGINE = global.ENGINE;

router.get('/', (req, res) => {
  ENGINE.emit('index/get', req)
    .then(data => res.render('pages/index', data))
    .catch(error => res.render('error', { message: error.message }));
});

router.post('/', (req, res) => {
  ENGINE.emit('sendmail', req.body)
    .then(data => res.json(data))
    .catch(error => res.json(error));
});

module.exports = router;
