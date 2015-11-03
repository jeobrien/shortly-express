var db = require('../config');
var bcrypt = require('bcrypt-nodejs');
var Promise = require('bluebird');



var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,


  initialize: function (params) {
    this.set('username', params.username);
    var encrypted = bcrypt.hashSync(params.password);
    this.set('password', encrypted);
  }

});

module.exports = User;