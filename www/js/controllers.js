angular.module('popsoda.controllers', [])


// Tabs and Slide Controller

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state) {
    
})

// Home Page Controller

.controller('HomeCtrl', function($scope, Movies, $ionicSlideBoxDelegate) {

  $scope.movies = Movies.all();

  console.log("Called normally");

  var lastMovie;

  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].movie_id;
    console.log(lastMovie);
  });

  $scope.loadMore = function() {

    console.log("Called");
    
    if(isNaN(lastMovie)==false) {

      console.log(lastMovie);
      console.log("Called by loadMore");

      Movies.getMore(lastMovie).then(function(movies){
        $scope.movies = $scope.movies.concat(movies);
      }); 
    }

    $scope.$broadcast('scroll.infiniteScrollComplete');
  };
})

// Home ===> Follow Movies Controller

.controller('FollowCtrl',function($scope, $element, $ionicPopup, $timeout, Movies) {
    
    $scope.toggleFollow = function(movie) {
      console.log(movie);
      if(movie.follow == 0) {
        movie.follow = 1;
        console.log(movie.follow);

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

      console.log(Movies.all());
      Movies.toggleFollow(movie.movie_id);
    };
})

// Trending Pages Controller

.controller('TrendingCtrl', function($scope, Chats, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };
})

// Trailer Controller

.controller('TrailersCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.settings = {
    enableFriends: true
  };
})

//Search Controller

.controller('SearchCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

})

//Profile Controller

.controller('ProfileCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

})

//Article Detail Controller

.controller('ArticleCtrl', function($scope, $stateParams, Movies) {
  $scope.movie = Movies.get($stateParams.articleId);
  console.log($scope.movie);
})

