/**
 * INSPINIA - Responsive Admin Theme
 *
 * Inspinia theme use AngularUI Router to manage routing and views
 * Each view are defined as state.
 * Initial there are written state for all view in theme.
 *
 */
function config($stateProvider, $urlRouterProvider, $ocLazyLoadProvider, $httpProvider) {

    $httpProvider.interceptors.push(['$q', '$location', '$localStorage', function($q, $location, $localStorage) {
      return {
        'request': function(config) {
          config.headers = config.headers || {};
          if ($localStorage.token) {
            config.headers.Authorization = 'Bearer ' + $localStorage.token;
          }
          return config;
        },
        'responseError': function(response) {
          if (response.status === 401 || response.status === 403) {
            $location.path('/login');
          }
          return $q.reject(response);
        }
      };
    }]);

    $urlRouterProvider.otherwise("/login");

    $ocLazyLoadProvider.config({
        // Set to true if you want to see what and when is dynamically loaded
        debug: false
    });

    $stateProvider
        .state('login', {
            url: "/login",
            templateUrl: "views/login.html",
            controller: "LoginCtrl",
            data: { pageTitle: 'Login' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'cgNotify',
                            files: ['css/plugins/angular-notify/angular-notify.min.css','js/plugins/angular-notify/angular-notify.min.js']
                        }
                    ]);
                }
            }
        })
        .state('forgot_password', {
            url: "/forgot_password",
            templateUrl: "views/forgot_password.html",
            controller: "ForgotPasswordCtrl",
            data: { pageTitle: 'Forgot password' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'cgNotify',
                            files: ['css/plugins/angular-notify/angular-notify.min.css','js/plugins/angular-notify/angular-notify.min.js']
                        }
                    ]);
                }
            }
        })
        .state('index', {
            abstract: true,
            url: "/index",
            templateUrl: "views/common/content.html",
            controller: "MainCtrl"
        })
        .state('index.dashboard', {
            url: "/dashboard",
            templateUrl: "views/dashboard.html",
            controller: "DashboardCtrl",
            data: { pageTitle: 'Dashboard' }
        })
        .state('index.companies', {
            url: "/companies",
            templateUrl: "views/companies.html",
            controller: "CompaniesCtrl",
            data: { pageTitle: 'Companies' }
        })
        .state('index.workers', {
            url: "/workers",
            templateUrl: "views/workers.html",
            controller: "WorkersCtrl",
            data: { pageTitle: 'Workers' }
        })
        .state('index.jobs', {
            url: "/jobs",
            templateUrl: "views/jobs.html",
            controller: "JobsCtrl",
            data: { pageTitle: 'Jobs' }
        })
        .state('index.change-password', {
            url: "/change-password",
            templateUrl: "views/change_password.html",
            controller: "ChangePasswordCtrl",
            data: { pageTitle: 'Change Password' },
            resolve: {
                loadPlugin: function ($ocLazyLoad) {
                    return $ocLazyLoad.load([
                        {
                            name: 'cgNotify',
                            files: ['css/plugins/angular-notify/angular-notify.min.css','js/plugins/angular-notify/angular-notify.min.js']
                        }
                    ]);
                }
            }
        })
}
angular
    .module('dashboard')
    .config(config)
    .constant('BASE_URL', 'http://10.0.0.109:6002')
    .run(function($rootScope, $state, AuthService) {

        $rootScope.$on("$stateChangeStart", function (event, toState, toParams, fromState, fromParams) {
          if (toState.name != 'login' && toState.name != 'forgot_password' && !AuthService.getCurrentUser()._id) {
            event.preventDefault();
            toState.data.pageTitle = 'Login';
            $state.go('login');
          } else {

          }
        });

        $rootScope.$state = $state;
    });
