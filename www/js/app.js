// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.services' is found in services.js
// 'starter.controllers' is found in controllers.js


angular.module('popsoda', ['ionic', 'angucomplete-alt', 'ngCordova', 'ionicLazyLoad','popsoda.controllers', 'popsoda.services'])

.run(function($ionicPlatform, $ionicPopup) {
  $ionicPlatform.ready(function() {
    if (window.cordova && window.cordova.plugins && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
      cordova.plugins.Keyboard.disableScroll(true);
      screen.lockOrientation('portrait');
    }

    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }

    /* $ionicPlatform.registerBackButtonAction(function(event) {
      if (true) { // your check here
        console.log($state.current.name);
        $ionicPopup.confirm({
          template: 'Are you sure you want to exit?',
          cssClass: 'popup--exit'
        }).then(function(res) {
          if (res) {
            ionic.Platform.exitApp();
          }
        })
      }
    }, 100);
    
    if(window.Connection) {
      if(navigator.connection.type == Connection.NONE) {
          alert('There is no internet connection available');
      }else{
          alert(navigator.connection.type);
      }
    }else{
          alert('Cannot find Window.Connection');
    } */
  });
})

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider) {

  $ionicConfigProvider.views.maxCache(5);
  $ionicConfigProvider.scrolling.jsScrolling(false);
  // Ionic uses AngularUI Router which uses the concept of states
  // Learn more here: https://github.com/angular-ui/ui-router
  // Set up the various states which the app can be in.
  // Each state's controller can be found in controllers.js
  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/',
    templateUrl: 'templates/tabs.html',
    controller: 'TabSlideCtrl'
  })
  .state('movie', {
    url: '/movie/:movieId',
    views: {
      '': {
        templateUrl: 'templates/movie.html',
        controller: 'MovieCtrl'
      }
    },
    params: {
      movieId: null
    }
  })
  .state('article', {
    url: '/article/:articleId',
    views: {
      '': {
        templateUrl: 'templates/article.html',
        controller: 'ArticleCtrl'
      }
    },
    params: {
      movieId: null
    }
  });

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/');

})

// .config(function($httpProvider) {
//   $httpProvider.interceptors.push(function($rootScope) {
//     return {
//       request: function(config) {
//         $rootScope.$broadcast('loading:show')
//         return config
//       },
//       response: function(response) {
//         $rootScope.$broadcast('loading:hide')
//         return response
//       }
//     }
//   })
// })

// .run(function($rootScope, $ionicLoading) {
//   $rootScope.$on('loading:show', function() {
//     $ionicLoading.show({template: 'foo'})
//   })

//   $rootScope.$on('loading:hide', function() {
//     $ionicLoading.hide()
//   })
// });
