// Auth Service
function AuthService($http, $q, $localStorage, BASE_URL) {
    console.log('AuthService');

    function urlBase64Decode(str) {
        var output = str.replace('-', '+').replace('_', '/');
        switch (output.length % 4) {
            case 0:
                break;
            case 2:
                output += '==';
                break;
            case 3:
                output += '=';
                break;
            default:
                throw 'Illegal base64url string!';
        }
        return window.atob(output);
    }

    function getUserFromToken() {
        var token = $localStorage.token;
        var user = {};
        if (typeof token !== 'undefined') {
            var encoded = token.split('.')[1];
            user = JSON.parse(urlBase64Decode(encoded));
        }
        return user;
    }

    function changeUser(user) {
        angular.extend(currentUser, user);
    }

    var service = {};
    var currentUser = getUserFromToken();

    // current user
    service.getCurrentUser = function() {
      return getUserFromToken();
    }

    // register
    service.register = function(username, password) {

      var deferred = $q.defer();
      var url = BASE_URL + '/api/register';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      var data = {
        username: username,
        password: password
      };

      $http.post(url, data, config)
        .success(function(response) {
          $localStorage.token = response.data.token;
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    // login
    service.login = function(username, password) {

      var deferred = $q.defer();
      var url = BASE_URL + '/api/login';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      var data = {
        username: username,
        password: password
      };

      $http.post(url, data, config)
        .success(function(response) {
          $localStorage.token = response.data.token;
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    service.logout = function() {
      changeUser({});
      delete $localStorage.token;

      console.log("logout");
      console.log(service.getCurrentUser());
    }

    // Change password
    service.changePassword = function(password) {

      var deferred = $q.defer();
      var url = BASE_URL + '/api/change-password';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      var data = {
        password: password
      };

      $http.post(url, data, config)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    return service;
}

// Companies Service
function CompaniesService($http, $q, BASE_URL) {
    console.log('CompaniesService');

    var service = {};

    service.getCompanies = function() {

      var deferred = $q.defer();
      var url = BASE_URL + '/api/companies';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      $http.get(url, config)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    return service;
}

// Workers Service
function WorkersService($http, $q, BASE_URL) {
    console.log('WorkersService');

    var service = {};

    service.inviteWorker = function(companyId, phoneNumber) {
      var deferred = $q.defer();
      var url = BASE_URL + '/api/invite';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      var data = {
        company_user_id: companyId,
        phone_number: phoneNumber
      };

      $http.post(url, data, config)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    return service;
}

// Jobs Service
function JobsService() {
    console.log('JobsService');
}

// Settings Service
function SettingsService($http, $q, BASE_URL) {
    console.log('SettingsService');

    var service = {};

    service.sendEmailForPassword = function(email) {
      var deferred = $q.defer();
      var url = BASE_URL + '/api/send-email';
      var config = {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      };

      var data = {
        email: email
      };

      $http.post(url, data, config)
        .success(function(response) {
          deferred.resolve(response);
        })
        .error(function(err) {
          deferred.reject(err);
      });

      return deferred.promise;
    }

    return service;
}

// Injects
AuthService.$inject = ['$http', '$q', '$localStorage', 'BASE_URL'];
CompaniesService.$inject = ['$http', '$q', 'BASE_URL'];
WorkersService.$inject = ['$http', '$q', 'BASE_URL'];
SettingsService.$inject = ['$http', '$q', 'BASE_URL'];

angular
    .module('dashboard')
    .factory('AuthService', AuthService)
    .factory('CompaniesService', CompaniesService)
    .factory('WorkersService', WorkersService)
    .factory('JobsService', JobsService)
    .factory('SettingsService', SettingsService)
    ;
