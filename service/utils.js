var utils = {};

utils.getCompanyName = function(user) {
  if (user && user.company && user.company.name) {
    return user.company.name;
  } else {
    return '';
  }
}

utils.getCompanyDescription = function(user) {
  if (user && user.company && user.company.description) {
    return user.company.description;
  } else {
    return '';
  }
}

utils.getCompanyTranslate = function(user) {
  if (user && user.company && (user.company.auto_translate === true || user.company.auto_translate === false)) {
    if (user.company.auto_translate === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getCompanyAddress1 = function(user) {
  if (user && user.company && user.company.address && user.company.address.address1) {
    return user.company.address.address1;
  } else {
    return '';
  }
}

utils.getCompanyAddress2 = function(user) {
  if (user && user.company && user.company.address && user.company.address.address2) {
    return user.company.address.address2;
  } else {
    return '';
  }
}

utils.getCompanyCity = function(user) {
  if (user && user.company && user.company.address && user.company.address.city) {
    return user.company.address.city;
  } else {
    return '';
  }
}

utils.getCompanyState = function(user) {
  if (user && user.company && user.company.address && user.company.address.state) {
    return user.company.address.state;
  } else {
    return '';
  }
}

utils.getFirstName = function(user) {
  if (user && user.firstname) {
    return user.firstname;
  } else {
    return '';
  }
}

utils.getLastName = function(user) {
  if (user && user.lastname) {
    return user.lastname;
  } else {
    return '';
  }
}

utils.getEmail = function(user) {
  if (user && user.email_address) {
    return user.email_address;
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

utils.getPayRate = function(job) {
  if (job && job.pay && job.pay.rate) {
    return job.pay.rate;
  } else {
    return '';
  }
}

utils.getPayUnit = function(job) {
  if (job && job.pay && job.pay.unit) {
    return job.pay.unit;
  } else {
    return '';
  }
}

utils.getDateString = function(dateVal) {
  var year = dateVal.getFullYear();
  var month = dateVal.getMonth() < 10 ? '0' + (dateVal.getMonth() + 1) : (dateVal.getMonth() + 1);
  var date = dateVal.getDate() < 10 ? '0' + (dateVal.getDate()) : (dateVal.getDate());

  return year + '/' + month + '/' + date;
}

utils.getBenefitsTraining = function(job) {
  if (job && job.benefits && (job.benefits.training === true || job.benefits.training === false)) {
    if (job.benefits.training === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getBenefitsHealth = function(job) {
  if (job && job.benefits && (job.benefits.health_checks === true || job.benefits.health_checks === false)) {
    if (job.benefits.health_checks === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getBenefitsHousing = function(job) {
  if (job && job.benefits && (job.benefits.housing === true || job.benefits.housing === false)) {
    if (job.benefits.housing === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getBenefitsTransportation = function(job) {
  if (job && job.benefits && (job.benefits.transportation === true || job.benefits.transportation === false)) {
    if (job.benefits.transportation === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getBenefitsBonus = function(job) {
  if (job && job.benefits && (job.benefits.bonus === true || job.benefits.bonus === false)) {
    if (job.benefits.bonus === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getScholarships = function(job) {
  if (job && job.benefits && (job.benefits.scholarships === true || job.benefits.scholarships === false)) {
    if (job.benefits.scholarships === true) {
      return 'YES';
    } else {
      return 'NO';
    }
  } else {
    return '';
  }
}

utils.getComments = function(job) {
  if (job && job.comments) {
    return job.comments;
  } else {
    return '';
  }
}

utils.getPositions = function(job) {
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
