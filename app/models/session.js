var db = require('../config');
var Click = require('./click');
var crypto = require('crypto');

var Session = db.Model.extend({
  tableName: 'sessions',
  // hasTimestamps: true,

  users: function () {
    return this.hasOne(users, 'user_id');
  },
  initialize: function(params){
    this.user_id = params.user_id;
    this.session_id = params.session_id;

  }
});

module.exports = Session;
