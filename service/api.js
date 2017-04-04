/* Model */
var Admin = require('./models/admin');
var User = require('./models/user');
var Job = require('./models/job');
var Message = require('./models/message');
var Application = require('./models/application');
var Review = require('./models/review');
var MyWorker = require('./models/myworker');
var Invite = require('./models/invite');

var json2csv = require('json2csv');
const nodemailer = require('nodemailer');

/* route */
var config = require('../config/database');
var express = require('express');
var router = express.Router();
var request = require('request');
var jwt = require('jwt-simple');

/* custom utils */
var utils = require('./utils');

var async = require('async');

function ensureAuthorized(req, res, next) {

    var bearerToken;
    var bearerHeader = req.headers["authorization"];
    if (typeof bearerHeader !== 'undefined') {
        var bearer = bearerHeader.split(" ");
        bearerToken = bearer[1];
        req.token = bearerToken;
        next();
    } else {
        res.send(403);
    }
}

router.post('/register', function(req, res) {

		Admin.findOne({
				username: req.body.username,
				password: req.body.password
			},
			function(err, user) {
				if (err) {
					res.json({
						result: false,
						data: "Error occured: " + err
					});
				} else {
					if (user) {
						res.json({
							result: false,
							data: "User already exists!"
						});
					} else {
						var userModel = new Admin();
						userModel.username = req.body.username;
						userModel.password = req.body.password;
						userModel.save(function(err, user) {
							user.token = jwt.encode(user, config.secret);
							user.save(function(err, user2) {
								res.json({
									result: true,
									data: user2,
									token: user2.token
								});
							});
						});
					}
				}
			}
		)
});

router.post('/login', function(req, res) {

		Admin.findOne({
			username: req.body.username,
			password: req.body.password
		}, function(err, user) {
			if (err) {
				res.json({
					result: false,
					data: "Error occured: " + err
				});
			} else {
				if (user) {
					res.json({
						result: true,
						data: user,
						token: user.token
					});
				} else {
					res.json({
						result: false,
						data: "Incorrect username/password"
					});
				}
			}
		});
});

router.post('/change-password', function(req, res) {

		Admin.findOne({}, function(err, user) {
			if (err) {
				res.json({
					result: false,
					data: "Error occured: " + err
				});
			} else {
				if (user) {

          user.password = req.body.password;

          user.save(function(err, user2) {
            res.json({
              result: true,
              data: user2,
              token: user2.token
            });
          });
				} else {
					res.json({
						result: false,
						data: "Can't find admin account"
					});
				}
			}
		});
});

router.post('/send-email', function(req, res) {

  let password = utils.generatePassword();

  // Change password
  Admin.findOne({}, function(err, user) {
    if (err) {
      res.json({
        result: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {
        user.password = password;

        user.save(function(err, user2) {

          // create reusable transporter object using the default SMTP transport
          let transporter = nodemailer.createTransport({
              service: 'yandex',
              auth: {
                  user: 'oleg201119@yandex.com',
                  pass: 'dlfdkrcjdquf19'
              }
          });

          // setup email data with unicode symbols
          let mailOptions = {
              from: '"oleg201119@yandex.com" <oleg201119@yandex.com>', // sender address
              to: req.body.email, // list of receivers
              subject: 'Password for Ganaz Admin', // Subject line
              text: 'Password is ' + password, // plain text body
              html: 'Password is <b>' + password + '</b>' // html body
          };

          // send mail with defined transport object
          transporter.sendMail(mailOptions, (err, info) => {
              if (err) {
                res.json({
                  result: false,
                  data: "Error occured: " + err
                });
              } else {
                console.log('Message %s sent: %s', info.messageId, info.response);
                res.json({
                  result: true
                });
              }
          });
        });
      } else {
        res.json({
          result: false,
          data: "Can't find admin account"
        });
      }
    }
  });
});

router.get('/companies-csv', function(req, res) {

  // Find companies
  User.find({type: 'company'}, '_id phone_number company', function(err, users) {

    var company_json_array = [];
    let asyncTasks = [];

    users.forEach(function(user) {
      asyncTasks.push(function(parallel_callback) {
        MyWorker.count({company_user_id: user._id}, function(err, worker_count) {
          if (err) {
            return parallel_callback(err);
          } else {
            Job.count({company_id: user._id}, function(err, job_count) {
              if (err) {
                return parallel_callback(err);
              } else {
                company_json_array.push({
                  "Company Name": utils.getCompanyName(user),
                  "Phone Number": utils.getPhoneNumber(user),
                  "Open Jobs": job_count,
                  "Workers": worker_count
                });

                parallel_callback();
              }
            })
          }
        });
      });
    });

    async.parallel(asyncTasks, function(err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(company_json_array);

        // For json2csv
        var fields = ["Company Name", "Phone Number", "Open Jobs", "Workers"];

        try {
          var result = json2csv({ data: company_json_array, fields: fields });

          res.setHeader('Content-disposition', 'attachment; filename=companies.csv');
          res.set('Content-Type', 'text/csv');
          res.status(200).send(result);

        } catch (err) {
          console.error(err);
        }
      }
    });
  });
});

router.get('/jobs-csv', function(req, res) {

  // Find jobs
  Job.find({}, '_id pay title positions_available dates company_id locations', function(err, jobs) {

    var jobs_json_array = [];
    let asyncTasks = [];

    jobs.forEach(function(job) {
      asyncTasks.push(function(parallel_callback) {
        User.findOne({_id: job.company_id}, function(err, user) {
          if (err) {
            return parallel_callback(err);
          } else {
            jobs_json_array.push({
              "Company Name": utils.getCompanyName(user),
              "Title": utils.getJobTitle(job),
              "Payment": utils.getPayment(job),
              "Date": utils.getDateString(utils.getStartDateForJob(job)) + ' - ' + utils.getDateString(utils.getEndDateForJob(job)),
              "Pos": utils.getPos(job),
              "Sites": utils.getSiteCount(job)
            });

            parallel_callback();
          }
        })
      });
    });

    async.parallel(asyncTasks, function(err, results) {
      if (err) {
        console.log(err);
      } else {
        console.log(jobs_json_array);

        // For json2csv
        var fields = ["Company Name", "Title", "Payment", "Date", "Pos", "Sites"];

        try {
          var result = json2csv({ data: jobs_json_array, fields: fields });

          res.setHeader('Content-disposition', 'attachment; filename=jobs.csv');
          res.set('Content-Type', 'text/csv');
          res.status(200).send(result);

        } catch (err) {
          console.error(err);
        }
      }
    });
  });
});

router.get('/workers-csv', function(req, res) {

  // Find companies
  User.find({type: 'worker'}, '_id phone_number username', function(err, users) {

    var worker_json_array = [];
    let asyncTasks = [];

    users.forEach(function(user) {
      worker_json_array.push({
        "WorkerID": utils.getUserName(user),
        "Phone Number": utils.getPhoneNumber(user)
      });
    });

    // For json2csv
    var fields = ["WorkerID", "Phone Number"];

    try {
      var result = json2csv({ data: worker_json_array, fields: fields });

      res.setHeader('Content-disposition', 'attachment; filename=workers.csv');
      res.set('Content-Type', 'text/csv');
      res.status(200).send(result);

    } catch (err) {
      console.error(err);
    }
  });
});

router.get('/companies', ensureAuthorized, function(req, res) {
  // Find companies
  User.find({type: 'company'}, function(err, users) {

    if (err) {
      res.json({
        result: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({ result: true, companies: users });
    }
  });
});

router.post('/invite', ensureAuthorized, function(req, res) {

  let newInvite = new Invite({
    company_user_id: req.company_user_id,
    phone_number: req.body.phone_number
  });

  newInvite.save(function(err) {
    if (err) {
      res.json({
        result: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({ result: true, invite: newInvite });
    }
  });
});

module.exports = router;
