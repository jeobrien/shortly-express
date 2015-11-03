var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,
  // defaults: {
  //   username: params.username,
  //   password: params.password
  // },

  initialize: function (params) {
    this.set('username', params.username);
    this.set('password', params.password);
    // this.set('username', params.username);
    // // do database stuff
    // this.set('password', params.username);
  }

});

module.exports = User;