var db = require('../config');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,


  initialize: function (params) {
    this.set('username', params.username);
    var that = this;

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(params.password, salt, function (err, hash) {
        if (err) {
          console.log('USER ERROR: ', err);
        } else {
          that.set('password', hash);
          console.log('\n' + hash + '\n');
        }
      });
    });
  }

});


module.exports = User;