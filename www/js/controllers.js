angular.module('popsoda.controllers', [])


// Tabs and Slide Controller

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());
})

// Welcome Controller

.controller('WelcomeCtrl', function($scope, $state, $q, User, $ionicLoading) {

  $scope.facebookSignIn = function() {
      $cordovaOauth.facebook("1523912164589911", ["email"]).then(function(result) {
          console.log("Success");
      }, function(error) {
          console.log("Error");
      });
  }

  // // This is the success callback from the login method
  // var fbLoginSuccess = function(response) {
  //   if (!response.authResponse){
  //     fbLoginError("Cannot find the authResponse");
  //     return;
  //   }

  //   var authResponse = response.authResponse;

  //   getFacebookProfileInfo(authResponse)
  //   .then(function(profileInfo) {
  //     // For the purpose of this example I will store user data on local storage
  //     User.setUser({
  //       authResponse: authResponse,
  //       userID: profileInfo.id,
  //       name: profileInfo.name,
  //       email: profileInfo.email,
  //       picture : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
  //     });
  //     $ionicLoading.hide();
  //     $state.go('app.home');
  //   }, function(fail){
  //     // Fail get profile info
  //     console.log('profile info fail', fail);
  //   });
  // };

  // // This is the fail callback from the login method
  // var fbLoginError = function(error){
  //   console.log('fbLoginError', error);
  //   $ionicLoading.hide();
  // };

  // // This method is to get the user profile info from the facebook api
  // var getFacebookProfileInfo = function (authResponse) {
  //   var info = $q.defer();

  //   facebookConnectPlugin.api('/me?fields=email,name&access_token=' + authResponse.accessToken, null,
  //     function (response) {
  //       console.log(response);
  //       info.resolve(response);
  //     },
  //     function (response) {
  //       console.log(response);
  //       info.reject(response);
  //     }
  //   );
  //   return info.promise;
  // };

  // //This method is executed when the user press the "Login with facebook" button
  // $scope.facebookSignIn = function() {
  //   facebookConnectPlugin.getLoginStatus(function(success){
  //     if(success.status === 'connected'){
  //       // The user is logged in and has authenticated your app, and response.authResponse supplies
  //       // the user's ID, a valid access token, a signed request, and the time the access token
  //       // and signed request each expire
  //       console.log('getLoginStatus', success.status);

  //       // Check if we have our user saved
  //       var user = User.getUser('facebook');

  //       if(!user.userID){
  //         getFacebookProfileInfo(success.authResponse)
  //         .then(function(profileInfo) {
  //           // For the purpose of this example I will store user data on local storage
  //           User.setUser({
  //             authResponse: success.authResponse,
  //             userID: profileInfo.id,
  //             name: profileInfo.name,
  //             email: profileInfo.email,
  //             picture : "http://graph.facebook.com/" + success.authResponse.userID + "/picture?type=large"
  //           });

  //           $state.go('app.home');
  //         }, function(fail){
  //           // Fail get profile info
  //           console.log('profile info fail', fail);
  //         });
  //       }else{
  //         $state.go('app.home');
  //       }
  //     } else {
  //       // If (success.status === 'not_authorized') the user is logged in to Facebook,
  //       // but has not authenticated your app
  //       // Else the person is not logged into Facebook,
  //       // so we're not sure if they are logged into this app or not.

  //       console.log('getLoginStatus', success.status);

  //       $ionicLoading.show({
  //         template: 'Logging in...'
  //       });

  //       // Ask the permissions you need. You can learn more about
  //       // FB permissions here: https://developers.facebook.com/docs/facebook-login/permissions/v2.4
  //       facebookConnectPlugin.login(['email', 'public_profile'], fbLoginSuccess, fbLoginError);
  //     }
  //   });
  // };
})

// Home Page Controller

.controller('HomeCtrl', function($scope, Movies, Articles, $ionicPopup, $timeout, $ionicSlideBoxDelegate) {

  var lastArticle,
      lastMovie,
      movieLoadAble = false,
      articleLoadAble = false;

  // Initialize Movies
  $scope.movies = Movies.all();
  $scope.movieLoadAble = movieLoadAble;
  $scope.articLeloadAble = articleLoadAble;

  
  // Get Initial Feed from API
  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].movie_id;
    movieLoadAble = true;
  });

  Articles.getFeed().then(function (articles) {
    $scope.articles = articles;
    lastArticle = articles[articles.length - 1].article_id;
    articleLoadAble = true;
  })

  $scope.moreDataAvailable = function() {
    return true;
  }

  $scope.loadMoreMovies = function () {
    if(isNaN(lastMovie)==false && movieLoadAble == true) {
      //Lock the function call
      movieLoadAble = false;
      $scope.movieLoadAble = false;

      //Get More Movies Function Call
      Movies.getMore(lastMovie).then(function (movies) {
        
        $scope.movies = $scope.movies.concat(movies);
        lastMovie = movies[movies.length - 1].movie_id;

        //Release Function Lock
        movieLoadAble = true;
        $scope.movieLoadAble = true;
      });
    }
  }

  $scope.loadMoreArticles = function() {

    if(isNaN(lastArticle)==false && articleLoadAble == true) {
      
      console.log(lastArticle);

      // Lock the function call and show loading div
      articleLoadAble = false;
      $scope.articleLoadAble = false;

      // Get More Articles Function Call
      Articles.getMore(lastArticle).then(function(articles){
        
        $scope.articles = $scope.articles.concat(articles);
        lastArticle = articles[articles.length - 1].article_id;  
        
        // Release Function Lock
        articleLoadAble = true;
        $scope.articleLoadAble = true;
      });
    }

    // Mark end of Infinite Scroll
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };
})

// Home ===> Follow Movies Controller

.controller('FollowCtrl',function($scope, $element, $ionicPopup, $timeout, Movies) {
    
    $scope.toggleFollow = function(movie) {
      if(movie.follow == 0) {
        movie.follow = 1;
      }
      else {
        movie.follow = 0;
      }
      
      Movies.toggleFollow(movie.movie_id);
    };
})

// Trending Pages Controller

.controller('TrendingCtrl', function($scope, Chats, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.followers = [{'image':'http://placehold.it/40x40'}];
  $scope.count = 234;

  $scope.trends = [{
    'movie_id': '1',
    'movie_name' : 'Mockingjay',
    'image' : 'http://placehold.it/360x180',
    'follow' : '0',
    'tweet1' : {
      'tweet_text' : 'Tweet this bitch ahsdjasjkdashdkasdhjashdkjashdkashdkahsdkajhdka',
      'tweet_retweet' : '12',
      'tweet_favorite' : '4',
      'tweet_time' : '26m'
    },
    'tweet2' : {
      'tweet_text' : 'Tweet this bitch',
      'tweet_retweet' : '12',
      'tweet_favorite' : '4',
      'tweet_time' : '2d'
    }
  },
  {
    'movie_id': '2',
    'movie_name' : 'Mockingjay',
    'image' : 'http://placehold.it/360x180',
    'follow' : '1',
    'tweet1' : {
      'tweet_text' : 'Tweet this bitch',
      'tweet_retweet' : '12',
      'tweet_favorite' : '4',
      'tweet_time' : '26m'
    },
    'tweet2' : {
      'tweet_text' : 'Tweet this bitch',
      'tweet_retweet' : '12',
      'tweet_favorite' : '4',
      'tweet_time' : '2d'
    }
  }];

  console.log($scope.trends[0].tweet1);
})

// Trailer Controller

.controller('TrailersCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.settings = {
    enableFriends: true
  };
})

//Search Controller

.controller('SearchCtrl', function($scope, Searches) {
  
  $scope.data = { "tags" : [], "search" : '' };

  $scope.searchResultClick = true;

  $scope.search = function() {
    $scope.searchResultClick = true;
    Searches.searchTags($scope.data.search).then(
      function(matches) {
        $scope.data.tags = matches;
      }
    )
  }

  $scope.cancelSearch = function  (argument) {
    $scope.data.search = null;
  }

  $scope.searchResultClicked = function (tag) {
    $scope.searchResultClick = false;
    $scope.data.search = tag.name; 
  }
})

//Profile Controller

.controller('ProfileCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

})

//Article Detail Controller

.controller('MovieCtrl', function($scope, $stateParams, Movies, $cordovaSocialSharing, $ionicScrollDelegate){

  $scope.movie = Movies.get($stateParams.movieId);

  Movies.getDetails($stateParams.movieId).then(function (movieDetail) {
    $scope.description = movieDetail.description;
    $scope.image = movieDetail.image;
    $scope.director = movieDetail.directors;
    $scope.cast = movieDetail.actors;
    $scope.tags = movieDetail.tags;
  })

  
  $scope.goBack = function() {
        // $ionicHistory.goBack();                      //This doesn't work
        window.history.back();                          //This works
  }

  $scope.shareMovie = function (movie) {
    $cordovaSocialSharing.share("movie.name", null, "movie.image", "http://agrawalravi.com");
  }

  $scope.scrollHandler = function () {
      var movieTitle = angular.element(document.querySelector('.movie-title')),
          movieBackIcon = angular.element(document.querySelector('.back-icon'));
          movieShareIcon = angular.element(document.querySelector('.share-icon'));
          movieHeader = angular.element(document.querySelector('.movie-header'));

      if($ionicScrollDelegate.getScrollPosition().top >= 370){
        movieHeader.addClass('scrolled');
        movieTitle.addClass('scrolled');
        movieBackIcon.addClass('scrolled');
        movieShareIcon.addClass('scrolled');
      }
      else {
        movieHeader.removeClass('scrolled');
        movieTitle.removeClass('scrolled');
        movieBackIcon.removeClass('scrolled');
        movieShareIcon.removeClass('scrolled');
      }
  }

  // Random Data

  $scope.followers = [{'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}];
  $scope.count = 234;

  $scope.articles = [{
    'id' : '1',
    'title' : 'The Recap: Logo Dimensions, The Peanuts Movie and Angry Birds',
    'image' : 'http://placehold.it/125x125',
    'source' : 'cinetime.com',
    'time' : '3d'
  }, {
    'id' : '2',
    'title' : 'The Recap: Logo Dimensions, The Peanuts Movie and Angry Birds',
    'image' : 'http://placehold.it/125x125',
    'source' : 'cinetime.com',
    'time' : '3d'
  }, {
    'id' : '3',
    'title' : 'The Recap: Logo Dimensions, The Peanuts Movie and Angry Birds',
    'image' : 'http://placehold.it/125x125',
    'source' : 'cinetime.com',
    'time' : '3d'
  }];


})

