const ee = require("@nauma/eventemitter");
const db = require("./lowDB");
const DATABASE = new ee.EventEmitter("database");
global.DATABASE = DATABASE;

DATABASE.on("goods/get", response => {
  const data = db.getState().goods || [];

  response.reply(data);
});

DATABASE.on("goods/post", response => {
  const { fields, dir } = response.data;

  try {
    db.get("goods")
      .push({
        picture: dir,
        name: fields.name,
        price: fields.price
      })
      .write();
    response.reply(true);
  } catch (err) {
    console.log(err.message);
    response.replyErr(err);
  }
});

DATABASE.on("skills/get", response => {
  const data = db.getState().skills || {};

  response.reply(data);
});

DATABASE.on("skills/post", response => {
  const { age, concerts, cities, years } = response.data;

  try {
    db.get("skills")
      .set("age", age)
      .set("concerts", concerts)
      .set("cities", cities)
      .set("years", years)
      .write();
    response.reply(true);
  } catch (err) {
    console.log(err.message);
    response.replyErr(err);
  }
});
