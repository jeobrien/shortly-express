var db = require('../config');
var bcrypt = require('bcrypt');
var Promise = require('bluebird');


var User = db.Model.extend({
  tableName: 'users',
  hasTimestamps: false,


  initialize: function (params) {
    this.set('username', params.username);
    // var that = this;//trying binding instead of that = this

    bcrypt.genSalt(10, function (err, salt) {
      bcrypt.hash(params.password, salt, function (err, hash) {
        if (err) {
          console.log('USER ERROR: ', err);
        } else {
          this.set('password', hash);//trying binding instead of that = this
          // this.save();
         
          // console.log('\n' + hash + '\n');
        }
      }.bind(this));//trying binding instead of that = this
    }.bind(this));//trying binding instead of that = this
  }

  // saveNewUser: function (params, )

});


module.exports = User;