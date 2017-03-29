  //admin panel controller for traffic rendering via controller/Base.js
var BaseController = require("./Base"),
  View = require("../views/Base"),
  model = new (require("../models/ContentModel")),
  crypto = require("crypto"),
  fs = require("fs");

module.exports = BaseController.extend({
  name: "Admin",
  username: "admin",
  password: "iwish1H@dabe^^erpassWord",
  //run method for welcome and session creds
  run: function(req, res, next){
    var self = this;
    if(this.authorize(req)) {
      model.setDB(req.db);
      req.session.maoltech = true;
      req.session.save();
      var v = new View(res, 'admin');
      self.del(req, function() {
        self.form(req, res, function(formMarkup) {
          self.list(function(listMarkup){
            v.render({
              title: "Administration",
              content: "Welcome to the Admin Control Panel",
              list: listMarkup,
              form: formMarkup
            });
          });
        });
      });
    } else {
      var v = new View(res, 'admin-login');
      v.render({
        title: 'Please Login'
      });
    }
  },
  //authorize helpers for log in security/page protection
  authorize: function(req) {
    return (
      req.session && req.session.maoltech
     && req.session.maoltech === true
    ) || (
      req.body && req.body.username === this.username &&
      req.body.password === this.password
    );
  },
  //table records update function
  list: function(callback) {
    model.getlist(function(err, records) {
      var markup = '<table>';
      markup += '\
                  <tr>\
                    <td><strong>Type</strong></td>\
                    <td><strong>Title</strong></td>\
                    <td><strong>Picture</strong></td>\
                    <td><strong>Actions</strong></td>\
                  </tr>\
                ';
        for(var i=0; record=records[i]; i++)
          {
          markup += '\
                      <tr>\
                        <td>'+record.type+'</td>\
                        <td>'+record.title+'</td>\
                        <td><img class="list-picture" src="'+record.picture+'" /></td>\
                        <td>\
                          <a href="/admin?action=delete&id='+record.ID+'">delete</a>&nbsp;&nbsp;\
                          <a href="/admin?action=edit&id='+record.ID+'">edit</a>\
                        </td>\
                      </tr>\
                    ';
                  }
            markup += '<table>';
            callback(markup);
          })
  },
  //form function for rendering of form information inputs
  form: function(req, res, callback) {
    var returnTheForm = function() {
      if(req.query && req.query.action === "edit" && req.query.id) {
        model.getlist(function(err, records) {
          if(records.length > 0) {
            var record = records[0];
            res.render('admin-record', {
              ID: record.ID,
              text: record.text,
              title: record.title,
              type: '<option value="'+record.type+'">'+record.type+'</option>',
              picture: record.picture,
              pictureTag: record.picture != '' ? '<img class="list-picture" src="'+record.picture+'" />' : ''
            }, function(err, html) {
                  callback(html);
          });
        } else {
          res.render('admin-record', {}, function(err, html) {
            callback(html);
          });
        }
      }, {ID: req.query.id});
    } else {
      res.render('admin-record', {}, function(err, html) {
          callback(html);
      });
    }
  }
  //form updating handler
  if(req.body && req.body.formsubmitted && req.body.formsubmitted == 'yes') {
        var data = {
          title: req.body.title,
          text: req.body.text,
          type: req.body.type,
          picture: this.handleFileUpload(req),
          ID: req.body.ID
        }
        model[req.body.ID != '' ? 'update' : 'insert'](data, function(err, objects) {
          returnTheForm();
        });
    } else {
        returnTheForm();
      }
    },//end of form main function
    //form helper functions
    del: function(req, callback){
      if(req.query && req.query.action === "delete" && req.query.id) {
        model.remove(req.query.id, callback);
    } else {
      callback();
    }
  },
  //form methods - update records
  handleFileUpload: function(req){
    if(!req.files || !req.files.picture || !req.files.picture.name) {
      console.log("Image Upload Folder.. Folder Not Found...");
      console.log("...or FileNotFound... create folder: './public/uploads'")
      console.log("Once folder/file is created, please try again...")
      return req.body.currentPicture || '' ;
    }
    var data = fs.readFileSync(req.files.picture.path);
    var fileName = req.files.picture.name;
    var uid = crypto.randomBytes(10).toString('hex');
    var dir = __dirname+"/../public/uploads/"+uid;
    fs.mkdirSync(dir, "0777");
    fs.writeFileSync(dir+"/"+fileName, data);
    return '../uploads/'+uid+"/"+fileName;
  }
});
