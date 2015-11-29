
angular.module('popsoda', ['ionic', 'ionic-native-transitions' ,'angucomplete-alt', 'ngCordova', 'ionicLazyLoad','popsoda.controllers', 'popsoda.services'])

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

    // Back button handler

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

    // Connection Test
    
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

.config(function($stateProvider, $urlRouterProvider, $ionicConfigProvider, $ionicNativeTransitionsProvider) {

  $ionicConfigProvider.views.maxCache(5);
  $ionicConfigProvider.scrolling.jsScrolling(false);

  $ionicNativeTransitionsProvider.setDefaultOptions({
        duration: 400, // in milliseconds (ms), default 400,
        slowdownfactor: 4, // overlap views (higher number is more) or no overlap (1), default 4
        iosdelay: -1, // ms to wait for the iOS webview to update before animation kicks in, default -1
        androiddelay: -1, // same as above but for Android, default -1
        winphonedelay: -1, // same as above but for Windows Phone, default -1,
        fixedPixelsTop: 0, // the number of pixels of your fixed header, default 0 (iOS and Android)
        fixedPixelsBottom: 0, // the number of pixels of your fixed footer (f.i. a tab bar), default 0 (iOS and Android)
        triggerTransitionEvent: '$ionicView.afterEnter', // internal ionic-native-transitions option
        backInOppositeDirection: false // Takes over default back transition and state back transition to use the opposite direction transition to go back
    });

    $ionicNativeTransitionsProvider.setDefaultTransition({
        type: 'slide',
        direction: 'left'
    });

    $ionicNativeTransitionsProvider.setDefaultBackTransition({
        type: 'slide',
        direction: 'right'
    });


  $stateProvider

  // setup an abstract state for the tabs directive
  .state('tab', {
    url: '/',
    templateUrl: 'templates/tabs.html',
    controller: 'TabSlideCtrl'
  })
  .state('movie', {
    url: '/movie/:movieId',
    nativeTransitions: {
      'type' : 'slide',
      'direction': 'left'
    },
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
      articleId: null
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
