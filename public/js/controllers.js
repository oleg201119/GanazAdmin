// Main Controller

function MainCtrl($scope, AuthService) {
    this.userName = 'Administrator';

    $scope.logout = function() {
      AuthService.logout();
      window.location = "/#/login";
    }
};

// Login Controller
function LoginCtrl($scope, notify, AuthService) {
    $scope.auth = {
      username: 'GanazApp@yandex.com',
      password: ''
    };

    $scope.login = function() {
      console.log('LoginCtrl - login');

      AuthService.login($scope.auth.username, $scope.auth.password).then(
        function(response) {

          if (!response.result) {
            notify({
              message: response.data,
              classes: 'alert-info'
            });
          } else {
            window.location = "/#/index/dashboard";
          }
        },
        function(error) {
          console.log(error);
        }
      )
    }
}

// ForgotPassword Controller
function ForgotPasswordCtrl($scope, notify, SettingsService) {
    console.log('ForgotPasswordCtrl');

    $scope.sendTo = {
      email: ''
    };

    $scope.sendEmail = function() {
      SettingsService.sendEmailForPassword($scope.sendTo.email).then(
        function(response) {
          if (response.result) {
            notify({
              message: 'Email sent. Please check your email box',
              classes: 'alert-success'
            });
          } else {
            notify({
              message: response.data,
              classes: 'alert-danger'
            });
          }
        },
        function(error) {
          console.log(error);
          notify({
            message: error.data,
            classes: 'alert-info'
          });
        }
      );
    }
}

// ChangePassword Controller
function ChangePasswordCtrl($scope, notify, AuthService) {
    console.log('ChangePasswordCtrl');

    $scope.password = {
      pass1: '',
      pass2: ''
    };

    $scope.changePassword = function() {
      if ($scope.password.pass1 != $scope.password.pass2) {
        notify({
          message: 'Incorrect password. Please re-enter New Password and Confirm Password',
          classes: 'alert-info'
        });
      } else {
        AuthService.changePassword($scope.password.pass1).then(
          function(response) {
            notify({
              message: 'Password was changed.',
              classes: 'alert-success'
            });
          },
          function(error) {
            console.log(error);
          }
        );
      }
    }
}

// Dashboard Controller
function DashboardCtrl($scope, BASE_URL) {
    console.log('DashboardCtrl');

    $scope.linkForCompaniesCSV = BASE_URL + '/api/companies-csv';
    $scope.linkForWorkersCSV = BASE_URL + '/api/workers-csv';
    $scope.linkForJobsCSV = BASE_URL + '/api/jobs-csv';
}

// Companies Controller
function CompaniesCtrl($scope) {
    console.log('CompaniesCtrl');
}

// Workers Controller
function WorkersCtrl($scope, $uibModal) {

    $scope.openModal = function() {
      modalInstance = $uibModal.open({
        templateUrl: 'views/new_worker_modal.html',
        controller: 'ModalInstanceCtrl'
      });
    }
}

function ModalInstanceCtrl ($scope, $uibModalInstance, CompaniesService, WorkersService) {

  $scope.worker = {
    company: '',
    phonenumber: {
      country: 'US',
      country_code: 1,
      local_number: ''
    },
  };

  CompaniesService.getCompanies().then(
    function(response) {
      $scope.companies = response.companies;
      console.log(response.companies);
    },
    function(error) {
      console.log(error);
    }
  );

  $scope.add = function() {
    $uibModalInstance.close();

    WorkersService.inviteWorker($scope.worker.company, $scope.worker.phonenumber).then(
      function(response) {
        console.log(response);
      },
      function(error) {
        console.log(error);
      });
  }

  $scope.cancel = function() {
    $uibModalInstance.dismiss('cancel');
  }
}


// Jobs Controller
function JobsCtrl($scope) {
    console.log('JobsCtrl');
}

// Injects

MainCtrl.$inject = ['$scope', 'AuthService'];
LoginCtrl.$inject = ['$scope', 'notify', 'AuthService'];
DashboardCtrl.$inject = ['$scope', 'BASE_URL'];
ModalInstanceCtrl.$inject = ['$scope', '$uibModalInstance', 'CompaniesService', 'WorkersService'];
ChangePasswordCtrl.$inject = ['$scope', 'notify', 'AuthService'];
ForgotPasswordCtrl.$inject = ['$scope', 'notify', 'SettingsService'];

angular
    .module('dashboard')
    .controller('MainCtrl', MainCtrl)
    .controller('LoginCtrl', LoginCtrl)
    .controller('ForgotPasswordCtrl', ForgotPasswordCtrl)
    .controller('ChangePasswordCtrl', ChangePasswordCtrl)
    .controller('DashboardCtrl', DashboardCtrl)
    .controller('CompaniesCtrl', CompaniesCtrl)
    .controller('WorkersCtrl', WorkersCtrl)
    .controller('JobsCtrl', JobsCtrl)
    .controller('ModalInstanceCtrl', ModalInstanceCtrl)
    ;
