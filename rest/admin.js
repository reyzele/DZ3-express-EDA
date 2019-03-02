const express = require('express');
const router = express.Router();
const ENGINE = global.ENGINE;
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect('/');
};

router.get('/', isAdmin, (req, res) => {
  res.render('pages/admin', {
    title: 'Admin page',
    msgfile: req.query.msgfile,
    msgskill: req.query.msgskills
  });
});

router.post('/upload', isAdmin, (req, res) => {
  ENGINE.emit('goods/post', req)
    .then(message => res.redirect(`/admin/?msgfile=${message}`))
    .catch(err => res.redirect(`/admin/?msgfile=${err}`));
});

router.post('/skills', isAdmin, (req, res) => {
  ENGINE.emit('skills/post', req.body)
    .then(message => res.redirect(`/admin/?msgskills=${message}`))
    .catch(err => res.redirect(`/admin/?msgskills=${err}`));
});

module.exports = router;
