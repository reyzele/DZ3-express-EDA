const ee = require('@nauma/eventemitter');
const formidable = require('formidable');
const path = require('path');
const fs = require('fs');
const joi = require('joi');
const nodemailer = require('nodemailer');
const psw = require('../libs/password');
const db = require('../db/lowDB');
const config = require('../config/config.json');
const validation = require('../libs/validation');
const ENGINE = new ee.EventEmitter('engine');
const DATABASE = global.DATABASE;
global.ENGINE = ENGINE;

ENGINE.on('index/get', async response => {
  const mainInfo = {
    title: 'Home page',
    description: '“Главное — это музыка”',
    videoLink: 'https://www.youtube.com/watch?v=nBE85Qy_SLc'
  };

  const results = await Promise.all([
    ENGINE.emit('goods/get'),
    ENGINE.emit('skills/get')
  ]);

  response.reply(
    Object.assign({}, mainInfo, { goods: results[0], skills: results[1] })
  );
});

ENGINE.on('goods/get', response => {
  DATABASE.emit('goods/get')
    .then(data => response.reply(data))
    .catch(error => response.replyErr({ message: `Ошабка: ${error}` }));
});

ENGINE.on('goods/post', async response => {
  const form = new formidable.IncomingForm();
  const upload = path.join('./public', 'upload');

  form.uploadDir = path.join(process.cwd(), upload);
  form.parse(response.data, (err, fields, files) => {
    if (err) {
      return response.replyErr(err.message);
    }

    const valid = validation(fields, files);

    if (valid.err) {
      fs.unlinkSync(files.photo.path);
      return response.replyErr(valid.status);
    }

    const fileName = path.join(upload, files.photo.name);

    fs.rename(files.photo.path, fileName, err => {
      if (err) {
        console.error(err.message);
        return response.replyErr(err);
      }

      const dir = fileName.substr(fileName.indexOf('\\'));

      DATABASE.emit('goods/post', {
        response,
        fields,
        dir
      })
        .then(() => response.reply('Картинка успешно загружена!'))
        .catch(err => response.replyErr(err.message));
    });
  });
});

ENGINE.on('skills/get', response => {
  DATABASE.emit('skills/get')
    .then(data => response.reply(data))
    .catch(error => response.replyErr({ message: `Ошабка: ${error}` }));
});

ENGINE.on('skills/post', response => {
  const { age, concerts, cities, years } = response.data;

  if (!age || !concerts || !cities || !years) {
    return response.replyErr('Все поля обязательны к заполнению');
  }

  DATABASE.emit('skills/post', response.data)
    .then(() => response.reply('Данные успешно загружены!'))
    .catch(err => response.replyErr(err.message));
});

ENGINE.on('sendmail', response => {
  const { name, email, text } = response.data;

  if (!name || !email || !text) {
    return response.reply({
      msg: 'Все поля нужно заполнить!',
      status: 'Error'
    });
  }

  const schema = joi.object().keys({
    name: joi
      .string()
      .min(3)
      .max(20)
      .required(),
    email: joi
      .string()
      .email()
      .required(),
    text: joi
      .string()
      .min(20)
      .max(500)
      .required()
  });

  joi.validate(response.data, schema, (err, { name, email, text }) => {
    if (err) {
      return response.replyErr({
        msg: err.details[0].message,
        status: 'Error'
      });
    }

    const transporter = nodemailer.createTransport(config.mail.smtp);
    const mailOptions = {
      from: `"${name}" <${email}>`,
      to: config.mail.smtp.auth.user,
      subject: config.mail.subject,
      text: text.trim().slice(0, 500) + `\n Отправлено с: <${email}>`
    };

    transporter
      .sendMail(mailOptions)
      .then(() =>
        response.reply({ msg: 'Письмо успешно отправлено!', status: 'Ok' })
      )
      .catch(error =>
        response.replyErr({
          msg: `При отправке письма произошла ошибка!: ${error}`,
          status: 'Error'
        })
      );
  });
});

ENGINE.on('login', async response => {
  const { password, email } = response.data.body;

  if (!email) {
    return response.replyErr('Please enter email');
  }

  if (!password) {
    return response.replyErr('Please enter password');
  }

  const user = await db.getState().user;

  if (user.email === email && psw.validPassword(password)) {
    return response.reply('/admin');
  } else {
    return response.replyErr('Enter the correct username and password!');
  }
});
