/* Model */
var Admin = require('./models/admin');
var User = require('./models/user');
var Job = require('./models/job');
var Message = require('./models/message');
var Application = require('./models/application');
var Review = require('./models/review');
var MyWorker = require('./models/myworker');
var Invite = require('./models/invite');
var twilio = require('twilio');

var json2csv = require('json2csv');
const nodemailer = require('nodemailer');

/* route */
var config = require('../config/database');
var express = require('express');
var router = express.Router();
var request = require('request');
var jwt = require('jwt-simple');

var twilio_client = twilio(config.TWILIO_ACCOUNT_SID, config.TWILIO_AUTH_TOKEN);

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
console.log(req.body);
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

  var password = utils.generatePassword();

  // Change password
  Admin.findOne({}, function(err, user) {
    if (err) {
      res.json({
        result: false,
        data: "Error occured: " + err
      });
    } else {
      if (user) {

        if (user.username != req.body.email) {
          res.json({
            result: false,
            data: "Please enter administrator's email address"
          });
        } else {
          user.password = password;

          user.save(function(err, user2) {

            // create reusable transporter object using the default SMTP transport
            var transporter = nodemailer.createTransport({
                service: 'yandex',
                auth: {
                    user: 'GanazApp@yandex.com',
                    pass: 'Herewego17!'
                }
            });

            // setup email data with unicode symbols
            var mailOptions = {
                from: '"GanazApp" <GanazApp@yandex.com>', // sender address
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
        }
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
  User.find({type: 'company'}, function(err, users) {

    var company_json_array = [];
    var asyncTasks = [];

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
                  "Description": utils.getCompanyDescription(user),
                  "Auto Translate": utils.getCompanyTranslate(user),
                  "Address 1": utils.getCompanyAddress1(user),
                  "Address 2": utils.getCompanyAddress2(user),
                  "City": utils.getCompanyCity(user),
                  "State": utils.getCompanyState(user),
                  "First Name": utils.getFirstName(user),
                  "Last Name": utils.getLastName(user),
                  "Email": utils.getEmail(user),
                  "Phone Number": utils.getPhoneNumber(user),
                  "LoginID": utils.getUserName(user),
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
        var fields = [
          "Company Name",
          "Description",
          "Auto Translate",
          "Address 1",
          "Address 2",
          "City",
          "State",
          "First Name",
          "Last Name",
          "Email",
          "Phone Number",
          "LoginID",
          "Open Jobs",
          "Workers"
        ];

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
  Job.find({}, function(err, jobs) {

    var jobs_json_array = [];
    var asyncTasks = [];

    jobs.forEach(function(job) {
      asyncTasks.push(function(parallel_callback) {
        User.findOne({_id: job.company_id}, function(err, user) {
          if (err) {
            return parallel_callback(err);
          } else {
            jobs_json_array.push({
              "Company Name": utils.getCompanyName(user),
              "Title": utils.getJobTitle(job),
              "Pay Rate": utils.getPayRate(job),
              "Pay Unit": utils.getPayUnit(job),
              "Date(from)": utils.getDateString(utils.getStartDateForJob(job)),
              "Date(to)": utils.getDateString(utils.getEndDateForJob(job)),
              "Benefits - Training": utils.getBenefitsTraining(job),
              "Benefits - Health": utils.getBenefitsHealth(job),
              "Benefits - Housing": utils.getBenefitsHousing(job),
              "Benefits - Transportation": utils.getBenefitsTransportation(job),
              "Benefits - Bonus": utils.getBenefitsBonus(job),
              "Benefits - Scholarships": utils.getScholarships(job),
              "Comments": utils.getComments(job),
              "Positions": utils.getPositions(job),
              "Working Sites": utils.getSiteCount(job)
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
        var fields = [
          "Company Name",
          "Title",
          "Pay Rate",
          "Pay Unit",
          "Date(from)",
          "Date(to)",
          "Benefits - Training",
          "Benefits - Health",
          "Benefits - Housing",
          "Benefits - Transportation",
          "Benefits - Bonus",
          "Benefits - Scholarships",
          "Comments",
          "Positions",
          "Working Sites"
        ];

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
    var asyncTasks = [];

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

  var newInvite = new Invite({
    company_user_id: req.body.company_user_id,
    phone_number: req.body.phone_number
  });

  console.log(req.body);
  newInvite.save(function(err) {
    if (err) {
      res.json({
        result: false,
        data: "Error occured: " + err
      });
    } else {
      res.json({ result: true, invite: newInvite });

      twilio_client.messages.create({
        from: config.TWILIO_PHONE_NUMBER,
        to: "+" + newInvite.phone_number.country_code + newInvite.phone_number.local_number,
        body: `Hello, you are invited by ${req.body.company_name} to Ganaz Platform as a worker. You can search/apply for new job, and communicate with owners. (${config.appstore_url})`
      }, function(err, message) {
        if (err) {
          console.error(err.message);
        } else {
          console.log(message);
        }
      });
    }
  });
});

module.exports = router;
