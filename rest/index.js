const express = require("express");
const router = express.Router();
const ENGINE = global.ENGINE;
const isAdmin = (req, res, next) => {
  if (req.session.isAdmin) {
    return next();
  }
  res.redirect("/");
};

router.get("/", (req, res) => {
  const sendObj = {
    title: "Home page",
    description: "“Главное — это музыка”",
    videoLink: "https://www.youtube.com/watch?v=nBE85Qy_SLc"
  };

  ENGINE.emit("index/get", req)
    .then(data => res.render("pages/index", Object.assign({}, sendObj, data)))
    .catch(error => res.render("error", { message: error.message }));
});
router.post("/", (req, res) => {
  ENGINE.emit("sendmail", req.body)
    .then(data => res.json(data))
    .catch(error => res.json(error));
});

router.get("/login", (req, res) => {
  if (req.session.isAdmin) {
    return res.redirect("/admin");
  }
  res.render("pages/login", { title: "Login page", msglogin: req.query.msg });
});
router.post("/login", (req, res) => {
  ENGINE.emit("login", req)
    .then(link => {
      req.session.isAdmin = true;
      return res.redirect(link);
    })
    .catch(err => res.redirect(`/login/?msg=${err}`));
});

router.get("/admin", isAdmin, (req, res) => {
  res.render("pages/admin", {
    title: "Admin page",
    msgfile: req.query.msgfile,
    msgskill: req.query.msgskills
  });
});
router.post("/admin/upload", isAdmin, (req, res) => {
  ENGINE.emit("goods/post", req)
    .then(message => res.redirect(`/admin/?msgfile=${message}`))
    .catch(err => res.redirect(`/admin/?msgfile=${err}`));
});
router.post("/admin/skills", isAdmin, (req, res) => {
  ENGINE.emit("skills/post", req.body)
    .then(message => res.redirect(`/admin/?msgskills=${message}`))
    .catch(err => res.redirect(`/admin/?msgskills=${err}`));
});

module.exports = router;
