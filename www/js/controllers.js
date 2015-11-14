angular.module('popsoda.controllers', [])

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state) {
      // $state.go("/home");
}) 

.controller('HomeCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {
})

.controller('TrendingCtrl', function($scope, Chats, $ionicTabsDelegate, $ionicSlideBoxDelegate) {
  // With the new view caching in Ionic, Controllers are only called
  // when they are recreated or on app start, instead of every page change.
  // To listen for when this page is active (for example, to refresh data),
  // listen for the $ionicView.enter event:
  //
  //$scope.$on('$ionicView.enter', function(e) {
  //});

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

.controller('ChatDetailCtrl', function($scope, $stateParams, Chats, $ionicTabsDelegate, $ionicSlideBoxDelegate) {
  
  $scope.chat = Chats.get($stateParams.chatId);

})

.controller('TrailersCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.settings = {
    enableFriends: true
  };
})

.controller('SearchCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {
  $scope.settings = {
    enableFriends: true
  };
})

.controller('ProfileCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {
  $scope.settings = {
    enableFriends: true
  };
});
