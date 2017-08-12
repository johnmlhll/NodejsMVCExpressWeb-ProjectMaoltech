//base controller to ensure controller expensibility to child classes
var _ = require("underscore");
module.exports = {
  name: "base",
  extend: function(child) {
    return _.extend({}, this, child);
  },
  run: function(req,res,next) {

  }
}
