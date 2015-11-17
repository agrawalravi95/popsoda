angular.module('popsoda.controllers', [])


// Tabs and Slide Controller

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state) {
    
})

// Home Page Controller

.controller('HomeCtrl', function($scope, Movies, $ionicSlideBoxDelegate, $http) {

  $scope.movies = Movies.all();

  console.log("Called normally");

  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
  });

  $scope.loadMore = function() {

    console.log("Called by loadMore");

    Movies.getFeed().then(function(movies){
      $scope.movies = $scope.movies.concat(movies);
    });

    $scope.$broadcast('scroll.infiniteScrollComplete');
    
    /* $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3").success(function(movies) {
        Movies.set(movies.movie);
        window.localStorage.removeItem('localMovies');
        window.localStorage.setItem('localMovies', JSON.stringify(movies.movie));
        console.log("Fetched new movies from the API");
      })
      .error(function() {
        if(window.localStorage.getItem('localMovies') !== undefined) {
          Movies.set(JSON.parse(window.localStorage.getItem('localMovies')));
          console.error("Failed to fetch new movies from the API");
        }
      })
      .finally(function() {
        // console.log(window.localStorage.getItem('localMovies'));
      }); */
  };
})

// Home ===> Follow Movies Controller

.controller('FollowCtrl',function($scope, $element, $ionicPopup, $timeout, Movies) {
    
    $scope.toggleFollow = function(movie) {
      if(movie.follow == 0) {
        movie.follow = 1;

        // Pop Up for Following
        var followPopup = $ionicPopup.show({
          template: "<style> .popup { padding: 25px; border-radius: 50px;} </style> <strong> Following " + movie.name + "</strong>",
          scope: $scope,
          cssClass: 'popup--follow'
        });

        //Timeout for PopUp
        $timeout(function() {
           followPopup.close();
        }, 1000);

      }
      else {
        movie.follow = 0;
      }
      Movies.toggleFollow(movie.movie_id);
      
    };
})

// Trending Pages Controller

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
