const express = require('express');
const router = express.Router();
const ENGINE = global.ENGINE;

router.get('/', (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect('/admin');
  }
  res.render('pages/login', { title: 'Login page', msglogin: req.query.msg });
});

router.post('/', (req, res) => {
  ENGINE.emit('login', req)
    .then(link => {
      req.session.isAdmin = true;
      return res.redirect(link);
    })
    .catch(err => res.redirect(`/login/?msg=${err}`));
});

module.exports = router;
