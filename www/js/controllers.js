angular.module('popsoda.controllers', [])


// Tabs and Slide Controller

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());

})

// Home Page Controller

.controller('HomeCtrl', function($scope, Movies, $ionicPopup, $timeout, $ionicSlideBoxDelegate, $ionicHistory) {

  console.log($ionicHistory.viewHistory());

  $scope.movies = Movies.all();
  
  var lastMovie,
      loadAble = false;

  $scope.loadAble = loadAble;

  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].movie_id;
    loadAble = true;
  });

  $scope.moreDataAvailable = function() {
    return true;
  }

  $scope.loadMore = function() {

    if(isNaN(lastMovie)==false && loadAble == true) {
      
      // Lock the function call and show loading div
      loadAble = false;
      $scope.loadAble = true;
      console.log(lastMovie);
      console.log("Called by loadMore");
      // Get More Movies Function Call
      Movies.getMore(lastMovie).then(function(movies){
        $scope.movies = $scope.movies.concat(movies);
        try {
          lastMovie = movies[movies.length - 1].movie_id;  
        }
        catch (err) {

          /* 
          // Error Pop Up
          var errorPopup = $ionicPopup.show({
            template: " <strong> You have reached the end of the list! </strong>",
            scope: $scope,
            cssClass: 'popup--error'
          });

          //Timeout for popup
          $timeout(function() {
             errorPopup.close();
          }, 1000);

          */

        }
        // Release Function Lock
        loadAble = true;
        $scope.loadAble = false;
      });
    }
    // Mark end of Infinite Scroll
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
          template: "<strong> Following " + movie.name + "</strong>",
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
      // Movies.toggleFollow(movie.movie_id);
    };
})

// Trending Pages Controller

.controller('TrendingCtrl', function($scope, Chats, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.chats = Chats.all();
  $scope.remove = function(chat) {
    Chats.remove(chat);
  };

  $scope.$on('$ionicView.loaded', function() {
      console.log("Here");
  });
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

.controller('ArticleCtrl', function($scope, $stateParams, $ionicHistory, Movies){
  $scope.movie = Movies.get($stateParams.articleId);
  
  $scope.goBackHandler = function()
    {
        // $ionicHistory.goBack();                      //This doesn't work
        window.history.back();                          //This works
        console.log($ionicHistory.viewHistory());
    }
})

