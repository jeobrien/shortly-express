var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,


  initialize: function (params) {

    this.on('creating', this.hashPassword);


    // this.set('username', params.username);
    // // var that = this;//trying binding instead of that = this

    // bcrypt.genSalt(10, function (err, salt) {
    //   bcrypt.hash(params.password, salt, function (err, hash) {
    //     if (err) {
    //       console.log('USER ERROR: ', err);
    //     } else {
    //       this.set('password', hash);//trying binding instead of that = this
    //       // this.save();
         
    //       // console.log('\n' + hash + '\n');
    //     }
    //   }.bind(this));//trying binding instead of that = this
    // }.bind(this));//trying binding instead of that = this
  },

  // saveNewUser: function (params, )

  hashPassword: function () {
    var cipher = Promise.promisify(bcrypt.hash);
    return cipher(this.get('password'), null, null).bind(this)
    .then(function (hash) {
      this.set('password', hash);
    });
  },

  comparePassword: function (password, next) {
    console.log('pass and hash', password, this.get('password'))
    bcrypt.compare(password, this.get('password'), function (err, res) {
      if (err) {
        console.log(err, "Compare Password");
      } else {
        next(res);
      }
    });
  }

});


module.exports = User;