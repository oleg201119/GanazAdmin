var utils = {};

utils.getCompanyName = function(user) {
  if (user && user.company && user.company.name) {
    return user.company.name;
  } else {
    return '';
  }
}

utils.getUserName = function(user) {
  if (user && user.username) {
    return user.username;
  } else {
    return '';
  }
}

utils.getPhoneNumber = function(user) {
  var countryCode = '';
  var localNumber = '';

  if (user && user.phone_number && user.phone_number.country_code) {
    countryCode = '+' + user.phone_number.country_code;
  }

  if (user && user.phone_number && user.phone_number.local_number) {
    localNumber = user.phone_number.local_number;
  }

  return countryCode + localNumber;
}

utils.getJobTitle = function(job) {
  if (job && job.title) {
    return job.title;
  } else {
    return '';
  }
}

utils.getStartDateForJob = function(job) {
  if (job && job.dates && job.dates.from) {
    return job.dates.from;
  } else {
    return '';
  }
}

utils.getEndDateForJob = function(job) {
  if (job && job.dates && job.dates.to) {
    return job.dates.to;
  } else {
    return '';
  }
}

utils.getPayment = function(job) {
  if (job && job.pay && job.pay.rate && job.pay.unit) {
    return '$' + job.pay.rate + ' / ' + job.pay.unit;
  } else {
    return '';
  }
}

utils.getDateString = function(dateVal) {
  let year = dateVal.getFullYear();
  let month = dateVal.getMonth() < 10 ? '0' + (dateVal.getMonth() + 1) : (dateVal.getMonth() + 1);
  let date = dateVal.getDate() < 10 ? '0' + (dateVal.getDate()) : (dateVal.getDate());

  return year + '/' + month + '/' + date;
}

utils.getPos = function(job) {
  if (job && job.positions_available) {
    return job.positions_available;
  } else {
    return '';
  }
}

utils.getSiteCount = function(job) {
  if (job && job.locations) {
    return job.locations.length;
  } else {
    return '';
  }
}

utils.generatePassword = function() {
    var length = 8,
        charset = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789",
        retVal = "";
    for (var i = 0, n = charset.length; i < length; ++i) {
        retVal += charset.charAt(Math.floor(Math.random() * n));
    }
    return retVal;
}


module.exports = utils;
