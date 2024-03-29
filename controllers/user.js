require('dotenv').config();
const jwt = require('jsonwebtoken');
const cryptoJS = require("crypto-js");
const { User } = require('../models');

// POST '/register'
const register = (req, res) => {
  const newUser = new User({
    name: req.body.name,
    password: req.body.password,
    role: "reader"
  });

  newUser.save()
    .then(data => {
      let payload = { subject: data._id };
      let token = jwt.sign(payload, process.env.SECRET_KEY);
      res.json({ token, name: data.name, role: data.role });
    })
    .catch(err => {
      console.error(err);
      res.json({ Error: err });
    }
    );
};

// POST '/login'
const login = (req, res) => {
  let userData = req.body;

  User.findOne({ name: userData.name })
    .then(user => {
      if (!user) {
        res.sendStatus(401);
      } else {
        let dbPsw = cryptoJS.AES.decrypt(user.password, process.env.SECRET_PASSWORD).toString(cryptoJS.enc.Utf8);
        let userPsw = cryptoJS.AES.decrypt(userData.password, process.env.SECRET_PASSWORD).toString(cryptoJS.enc.Utf8);
        if (dbPsw !== userPsw) {
          res.sendStatus(401);
        } else {
          let payload = { subject: user._id };
          let token = jwt.sign(payload, process.env.SECRET_KEY);
          res.json({ token, name: user.name, role: user.role });
        }
      }
    })
    .catch(err => {
      console.error(err);
      res.json({ Error: err });
    });
};


//export controller functions
module.exports = {
  register,
  login
};
