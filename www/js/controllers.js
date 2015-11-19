angular.module('popsoda.controllers', [])


// Tabs and Slide Controller

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state) {
})

// Home Page Controller

.controller('HomeCtrl', function($scope, Movies, $ionicPopup, $timeout, $ionicSlideBoxDelegate) {

  $scope.activeSlide = 0;

  $ionicSlideBoxDelegate.enableSlide(true);

  var slider = angular.element(document.querySelector('.slider'));
  console.log(slider.inheritedData('$uiView').state);

  /* $scope.$watch(function (scope) {
    return scope.activeSlide;
  }, function(newValue, oldValue) {
    switch(newValue) {
      case 0:
      case 4: $ionicSlideBoxDelegate.enableSlide(false);
              break;
    }
  }); */

  $scope.enableSlide = function () {
    $ionicSlideBoxDelegate.enableSlide(true);
  }

  /* $ionicLoading.show({
    content: 'Loading',
    animation: 'fade-in',
    showBackdrop: true,
    maxWidth: 200,
    showDelay: 0
  });

  $timeout(function () {
    $ionicLoading.hide();
  }, 2000);*/

  $scope.movies = Movies.all();
  
  var lastMovie, loadAble = false;

  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].movie_id;
    loadAble = true;
  });

  $scope.moreDataAvailable = function() {
    return true;
  }

  $scope.loadMore = function() {

    console.log("Called");
    
    if(isNaN(lastMovie)==false && loadAble == true) {

      loadAble = false;

      console.log(lastMovie);
      console.log("Called by loadMore");

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
        loadAble = true;
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

.controller('ArticleCtrl', function($scope, $stateParams, Movies) {
  $scope.movie = Movies.get($stateParams.articleId);
})

