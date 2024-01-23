const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { validationResult } = require('express-validator');
const { Op } = require('sequelize');

const User = require('../models/user');

var transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST,
  port: process.env.MAIL_PORT,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD
  }
});

exports.getLogin = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/login', {
    path: '/login',
    pageTitle: 'Login',
    errorMessage: message,
    oldInput: {},
  });
};

exports.getSignup = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/signup', {
    path: '/signup',
    pageTitle: 'Signup',
    errorMessage: message,
    oldInput: {},
    validationErrors: {}
  });
};

exports.postLogin = (req, res, next) => {
  const email = req.body.email;
  const password = req.body.password;

  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).render('auth/login', {
      path: '/login',
      pageTitle: 'Login',
      errorMessage: errors.array()[0].msg,
      oldInput: { email: email, password: password }
    })
  }

  User.findOne({ where: { email: email } })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password.');
        return res.redirect('/login');
      }
      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (doMatch) {
            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save(err => {
              console.log(err);
              res.redirect('/');
            });
          }
          req.flash('error', 'Invalid email or password.');
          res.redirect('/login');
        })
        .catch(err => {
          console.log(err);
          res.redirect('/login');
        });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postSignup = (req, res, next) => {
  const name = req.body.name;
  const email = req.body.email;
  const password = req.body.password;
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errors_array = errors.array();
    const validationErrors = errors_array.reduce((acc, error) => {
      acc[error.path] = error;
      return acc;
    }, {});

    return res.status(422).render('auth/signup', {
      path: '/signup',
      pageTitle: 'Signup',
      validationErrors,
      errorMessage: '',
      oldInput: { name, password, email }
    })
  }

  bcrypt
    .hash(password, 12)
    .then(hashedPassword => {
      const user = new User({
        name: name,
        email: email,
        password: hashedPassword,
        cart: { items: [] }
      });
      return user.save();
    })
    .then(result => {
      res.redirect('/login');
      return transporter.sendMail({
        to: email,
        from: 'shop@node-complete.com',
        subject: 'Signup succeeded!',
        html: '<h1>You successfully signed up!</h1>'
      });
    })
    .catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    });
};

exports.postLogout = (req, res, next) => {
  req.session.destroy(err => {
    console.log(err);
    res.redirect('/');
  });
};

exports.getReset = (req, res, next) => {
  let message = req.flash('error');
  if (message.length > 0) {
    message = message[0];
  } else {
    message = null;
  }
  res.render('auth/reset', {
    path: '/reset',
    pageTitle: 'Reset Password',
    errorMessage: message
  });
};

exports.postReset = (req, res, next) => {
  const email = req.body.email;
  crypto.randomBytes(32, (err, buffer) => {
    let token = buffer.toString('hex');
    User.findOne({ where: { email: email } }).then(user => {
      if (!user) {
        req.flash('error', 'No user exists with this email address');
        return res.redirect('/reset');
      }
      user.resetToken = token
      user.resetTokenExpiry = Date.now() + 3600000;
      return user.save();
    }).then(result => {
      res.redirect('/')
      transporter.sendMail({
        to: req.body.email,
        from: 'shop@node-complete.com',
        subject: 'Reset Password',
        html: `
        <p>Reset Password link </p>
        <a href="http://localhost:3000/set-password?token=${token}">Reset Password</a>
        `
      })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    })
  })

}

exports.getPasswordForm = (req, res, next) => {
  const token = req.query.token || '';
  User.findOne({ where: { resetToken: token } })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Request');
        return res.redirect('/login')
      }
      res.render('auth/set-password', {
        pageTitle: 'Set Password',
        path: '/reset',
        errorMessage: '',
        oldInput: '',
        token: token
      })
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    })

}

exports.setPassword = (req, res, next) => {
  const password = req.body.password;
  const token = req.body.token;
  let resetUser;
  User.findOne({ where: { resetToken: token, resetTokenExpiry: { [Op.gt]: Date.now() } } })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid Request');
        return res.redirect('/login')
      }
      resetUser = user;
      return bcrypt.hash(password, 12);
    })
    .then(hashedPassword => {
      resetUser.resetToken = null;
      resetUser.resetTokenExpiry = null;
      resetUser.password = hashedPassword
      return resetUser.save()
    }).then(user => {
      res.redirect('/login');
    }).catch(err => {
      const error = new Error(err);
      error.httpStatusCode = 500;
      next(error);
    })
}