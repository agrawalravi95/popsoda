angular.module('popsoda.controllers', [])

///////////////////////////////
// Tabs and Slide Controller //
///////////////////////////////

.controller('TabSlideCtrl', function($rootScope, $scope, $timeout, $state, $stateParams, $cordovaNetwork) {

  var slider = angular.element(document.querySelector('.slider-slides'));
  slider.width = "1800px";

  $scope.connectionAvailable = false;
  $scope.connectionPopupToggle = true;

  var slideNo = $stateParams.slideNo || 0,
      searchTag = $stateParams.searchTag || null;

  if(slideNo == 3 && searchTag !== null) {
    $timeout(function() {
      $rootScope.$broadcast('tagClicked', {tag: searchTag})
    }, 1000);    
  };

  var connectionTest = function() {
      if(window.Connection) {
        if(navigator.connection.type == Connection.NONE) {
            console.log('There is no internet connection available');
            $scope.connectionAvailable = false;
        }else{
            console.log('There is internet connection available');
            $scope.connectionAvailable = true;
        }
      }else{
            console.log('Cannot find Window.Connection');
      }
  }

  connectionTest();
    
  document.addEventListener("deviceready", function () {

    $rootScope.$on('$cordovaNetwork:online', function(event){
      console.log("Online");
      connectionTest();
    });

    $rootScope.$on('$cordovaNetwork:offline', function(event){
      connectionTest();
      console.log("Offline");
    });
  }, false);

  $scope.closeConnectionPopup = function() {
    $scope.connectionPopupToggle = false;
  }

})

////////////////////////
// Welcome Controller //
////////////////////////

.controller('WelcomeCtrl', function($scope, $rootScope, $timeout, $state, $q, User, $ionicLoading) {

  // Initialize user from localstorage
  var loggedIn = false,
      user = User.getUserFbInfo(),
      authresponse;

  var checkLoginState = function () {

    user = User.getUserFbInfo();
    if(user !== undefined && user.hasOwnProperty('authResponse') && user.authResponse.session_key == true) {  
      
      User.setUser();
      loggedIn = true;
      $scope.loggedIn = true;
      $scope.$parent.loggedIn = true;
      $timeout(function() {
        $rootScope.$broadcast('successfulFbLogin');        
      }, 3000);  
      return true;
    }

    loggedIn = false;
    $scope.loggedIn = false;
    $scope.$parent.loggedIn = false;

    User.setUser("0");

    // Fix the document width

    return false;
  };

  //Check LogIn at start of application
  checkLoginState();



  //Success call for Facebook log in 
  var fbLoginSuccess = function (userData) {
      var authResponse = userData.authResponse;

      getFacebookProfileInfo(authResponse).then(function(profileInfo) {

        User.setUserFbInfo({
          'authResponse': authResponse,
          'userID': profileInfo.id,
          'name': profileInfo.name,
          'email': profileInfo.email,
          'friends' : profileInfo.friends,
          'picture' : "http://graph.facebook.com/" + authResponse.userID + "/picture?type=large"
        });

        User.setUserFbInfoAPI();
        $timeout(function() {
          $rootScope.$broadcast('successfulFbLogin');        
        }, 3000); 
      });

      loggedIn = true;
      $scope.loggedIn = true;
      $scope.$parent.loggedIn = true;

      
  }

  var getFacebookProfileInfo = function (authResponse) {
    var info = $q.defer();

    facebookConnectPlugin.api('/me?fields=email,name,friends&access_token=' + authResponse.accessToken, null,
      function (response) {
        console.log("Resolving Info");
        console.log(response);
        info.resolve(response);
      },
      function (response) {
        info.reject(response);
      }
    );

    return info.promise;
  };

  $scope.$on('fbLoginEvent', function(e) {
    $scope.facebookSignIn();
  });

  //Handle Facebook Signin Click
  $scope.facebookSignIn = function() {

    var deferred = $q.defer();
    facebookConnectPlugin.login(["public_profile", "user_friends", "email"],
        fbLoginSuccess,
        function (error) { console.log("Error: " + error) }
    );
  }

  //Handle skip signin click
  $scope.skipSignIn = function () {

    loggedIn = true;
    $scope.loggedIn = true;
    $scope.$parent.loggedIn = true;

    User.setUser("0");
  }

})

/////////////////////
// Home Controller //
/////////////////////

.controller('HomeCtrl', function($scope, User, Movies, Articles, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate) {

  //Initialize and declare controller variables
  var lastArticle,
      lastMovie,
      movieLoadAble = false,
      viewAllMoviesToggle = false,
      articleLoadAble = false,
      discoverMoviesToggle = true,
      continuePolling = true,
      pollPopupToggle = false;
      YOUTUBE_IMAGE_URL = "http://img.youtube.com/vi/",
      TIME_FOR_POLL = 10000;

  // Initialize Movies
  $scope.movies = Movies.all();
  $scope.articles = Articles.all();
  $scope.movieLoadAble = movieLoadAble;
  $scope.articLeloadAble = articleLoadAble;
  $scope.viewAllMoviesToggle = viewAllMoviesToggle;
  $scope.discoverMoviesToggle = discoverMoviesToggle;

  
  // Get Initial Feed from API
  Movies.getFeed(User.getUser()).then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].createdon;
    movieLoadAble = true;
  });

  Articles.getFeed(User.getUser()).then(function (articles) {
    $scope.articles = articles;
    lastArticle = articles[articles.length - 1].createdon;
    articleLoadAble = true;

    $scope.latestArticleTime = articles[0].createdon;
  });

  //Get Human friendly date
  $scope.prettyDate = function(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return;
            
    return day_diff == 0 && (
            diff < 60 && "now" ||
            diff < 120 && "1m" ||
            diff < 3600 && Math.floor( diff / 60 ) + "m" ||
            diff < 7200 && "1h" ||
            diff < 86400 && Math.floor( diff / 3600 ) + "h") ||
        day_diff == 1 && "1d" ||
        day_diff < 7 && day_diff + "d" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + "w";
  };

  //Check if more articles are available for infinite load
  $scope.moreArticlesAvailable = function() {
    var articles = Articles.all();
    if(!articles) return true;
    var lastObject = articles[articles.length - 1];

    if(lastObject && lastObject.hasOwnProperty('result') && lastObject.result == "404") {
      articleLoadAble = true;
      $scope.articleLoadAble = true;
      continuePolling = false;
      return false;
    }

    return true;
  };

  //Check if more movies are available for infinite load
  $scope.moreMoviesAvailable = function() {
    var movies = Movies.all();
    if(!movies) return true;
    var lastObject = movies[movies.length - 1];

    if(lastObject && lastObject.hasOwnProperty('result') && lastObject.result == "404") {
      movieLoadAble = true;
      $scope.movieLoadAble = true;


      return false;
    }

    return true;
  };

  //Function to handle View All Movies Click
  $scope.viewAllMovies = function() {

    viewAllMoviesToggle = true;
    $scope.viewAllMoviesToggle = true;

    if(lastMovie && movieLoadAble == true) {
      //Lock the function call
      movieLoadAble = false;
      $scope.movieLoadAble = false;


      //Get More Movies Function Call
      Movies.getMore(User.getUser(), lastMovie).then(function (movies) {

        $scope.movies = $scope.movies.concat(movies);
        lastMovie = movies[movies.length - 1].createdon;

        //Release Function Lock
        movieLoadAble = true;
        $scope.movieLoadAble = true;
      });
    }
  };

  //Function to handle Hide All Movies Click
  $scope.hideAllMovies = function() {
    viewAllMoviesToggle = false;
    $scope.viewAllMoviesToggle = false;
    discoverMoviesToggle = false;
    $scope.discoverMoviesToggle = false;
  };

  //Load More Movies on Infinite Scroll
  $scope.loadMoreMovies = function() {

    if(lastMovie && movieLoadAble == true) {
      
      // Lock the function call and show loading div
      movieLoadAble = false;
      $scope.movieLoadAble = false;

      // Get More Articles Function Call
      Movies.getMore(User.getUser(), lastMovie).then(function(movies){
        
        if(movies[movies.length - 1].hasOwnProperty('movie_id'))
          {
            $scope.movies = $scope.movies.concat(movies);
            lastMovie = movies[movies.length - 1].createdon;
          }
        
        // Release Function Lock
        movieLoadAble = true;
        $scope.movieLoadAble = true;
      });
    }

    // Mark end of Infinite Scroll
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  //Load More Articles on Infinite Scroll
  $scope.loadMoreArticles = function() {

    if(lastArticle && articleLoadAble == true) {
      
      // Lock the function call and show loading div
      articleLoadAble = false;
      $scope.articleLoadAble = false;

      // Get More Articles Function Call
      Articles.getMore(lastArticle).then(function(articles){
        
        if(articles[articles.length - 1].hasOwnProperty('article_id')) {
            $scope.articles = $scope.articles.concat(articles);
            lastArticle = articles[articles.length - 1].createdon;
          }

        // Start Polling
        pollArticles();
        
        // Release Function Lock
        articleLoadAble = true;
        $scope.articleLoadAble = true;
      });
    }

    // Mark end of Infinite Scroll
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };


  //Poll for new articles and popup handler
  var pollArticles = function() {

    //Stop Polling once reached end of data
    if(continuePolling == false) return;

    //Call for Articles Poll function from service
    Articles.poll($scope.articles[0].createdon).then(function(articles) {
      
      // If no articles to add
      if(articles.hasOwnProperty('result') && articles.result == '404') {
        $timeout(pollArticles, TIME_FOR_POLL);
        return;
      }

      //Show Popup
      $scope.pollPopupToggle = true;
      $scope.pollCount = articles.length;

      //Close Popup
      $timeout(function() {
        $scope.pollPopupToggle = false;
      }, 3000);

      // Add articles to 
      for (var i = articles.length - 1; i >= 0; i--) {
        $scope.articles.unshift(articles[i]);
        Articles.unshift(articles[i]);
      };      
      $timeout(pollArticles, TIME_FOR_POLL);
    });
  };

  //Scroll To Top After Clicking Poll Popup
  $scope.scrollToTop = function() {
    $ionicScrollDelegate.scrollTop(true);
    $scope.pollPopupToggle = false;
  };
})

//////////////////////////////
// Follow Movies Controller //
//////////////////////////////

.controller('FollowCtrl',function($scope, $rootScope, $ionicPopup, $timeout, User, Movies) {


    // $scope.$on('successfulFbLogin', function(e) {
    //   loggedIn = true;
    // });

    var followMovie = function(movie) {
      if(movie.follow == 0 ) {
        movie.follow = 1;
      }
      else {
        movie.follow = 0;
      } 

      $rootScope.$broadcast('movieFollowed');   
      Movies.toggleFollow(User.getUser(), movie.movie_id, movie.follow);
    }

   var showLoginModal = function(movie) {
     var confirmPopup = $ionicPopup.confirm({
         title: 'Please log in',
         template: 'To follow a movie, you need to login. Login now?'
       });

       confirmPopup.then(function(res) {
         if(res) {
            $rootScope.$broadcast('fbLoginEvent');       
            $timeout(function() {
              if(User.getLoginState == true) {
                followMovie(movie);
                return true;             
              }
              else return false;
            }, 2000);
         } else {
           return false;
         }
       });
     };  
    
    $scope.toggleFollow = function(movie) {
      if(User.getLoginState() == false) {
        var loginContinue = showLoginModal(movie);
        if(loginContinue == false) return;
      }
      else {
        followMovie(movie);
      }
    }
})


///////////////////////////////
// Trending Pages Controller //
///////////////////////////////

.controller('TrendingCtrl', function($scope, Trends, User, $cordovaOauth) {

  var lastTrend,
      trendLoadAble = false,
      twitterLoggedIn = false;

  (function() {
    if(User.getUserTwitterInfo) twitterLoggedIn = false;
    else twitterLoggedIn = true;
  })();


  $scope.prettyDate = function(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return;
            
    return day_diff == 0 && (
            diff < 60 && "now" ||
            diff < 120 && "1m" ||
            diff < 3600 && Math.floor( diff / 60 ) + "m" ||
            diff < 7200 && "1h" ||
            diff < 86400 && Math.floor( diff / 3600 ) + "h") ||
        day_diff == 1 && "1d" ||
        day_diff < 7 && day_diff + "d" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + "w";
  };

  //Initialize Trends
  $scope.trends = Trends.all();
  $scope.trendLoadAble = trendLoadAble;

  //Get Feed of Trends
  Trends.getFeed(User.getUser()).then(function (trends) {
    $scope.trends = trends;
    console.log(trends);
    lastTrend = trends[trends.length - 1].createdon;
    trendLoadAble = true;
  });

  //Check for End of Data on Infinite Scroll
  $scope.moreDataAvailable = function() {
    var trends = Trends.all();
    if(!trends) return true;
    var lastObject = trends[trends.length - 1];

    //Check for 404 in returned data
    if(lastObject && lastObject.hasOwnProperty('result') && lastObject.result == "404") {
      trendLoadAble = true;
      $scope.trendLoadAble = true;

      return false;
    }

    return true;
  };

  //Load More Trends on Infinite Scroll
  $scope.loadMoreTrends = function() {

    if(lastTrend && trendLoadAble == true) {
      
      // Lock the function call and show loading div
      trendLoadAble = false;
      $scope.trendLoadAble = false;

      // Get More Trends Function Call
      Trends.getMore(User.getUser(), lastTrend).then(function(trends){
        
        $scope.trends = $scope.trends.concat(trends);
        lastArticle = trends[trends.length - 1].createdon;  
        
        // Release Function Lock
        trendLoadAble = true;
        $scope.trendLoadAble = true;
      });
    }

    // Mark end of Infinite Scroll
    $scope.$broadcast('scroll.infiniteScrollComplete');
  };

  //Handle Retweet Click
  $scope.retweetHandler = function(tweetID) {

    console.log(twitterLoggedIn);

    if(twitterLoggedIn == false) {
      twitterLogIn();
    }

    Trends.retweet(tweetID);
    console.log("Here retweet");
  }

  //Handle Retweet Click
  $scope.favoriteHandler = function(tweetID) {
    
    console.log(twitterLoggedIn);

    if(twitterLoggedIn == false) {
      console.log("Calling Log In");
      twitterLogIn();
    }

    Trends.favorite(tweetID);
    console.log("Here favorite");
  }

  var twitterLogIn = function() {
      console.log("In Log In");

    $cordovaOauth.twitter("5FcFAFzcsyxzVLp99I55z61lO", "QFgsq0PUsgoci8JCFlSNpU2fkUaNCnQBzFKYABSaOHpMLvDrey").then(function(response) {
      User.setUserTwitterInfo(response);
      twitterLoggedIn = true;
    },
    function(response) {
      console.log("Error= " + response);
    });
    
  }

  $scope.followers = [{'image':'http://placehold.it/40x40'}];
  $scope.count = 234;
})

////////////////////////
// Trailer Controller //
////////////////////////

.controller('TrailersCtrl', function($scope, Trailers) {

  Trailers.getTrailers().then(function(trailers) {
    $scope.weekendTrailers = trailers.weekend;
    $scope.thisMonthTrailers = trailers.month;
    $scope.nextMonthTrailers = trailers.nextMonth;
  });

})

///////////////////////
// Search Controller //
///////////////////////


.controller('SearchCtrl', function($scope, $timeout, Searches, $ionicSlideBoxDelegate, User) {
  
  //Getting Tag
  $scope.$on('tagClicked', function(e, args) {
    console.log(args);
    $ionicSlideBoxDelegate.slide(3);
    $scope.searchResultClicked(args.tag);  

  });

  $scope.$on('successfulFbLogin', function(e) {
    console.log(User.getUserFbInfo());
    var friends = User.getUserFbInfo().friends.data;
        $scope.friends = friends;
        $scope.FbLoginToggle = true;
  });

  var selectedGenres = [];

  $scope.data = {
    "tags" : [],
    "search" : '',
    "genres" : [
    {'tag_name' : 'Animation', 'tag_id' : '27', 'selected' : false},
    {'tag_name' : 'Adventure', 'tag_id' : '20', 'selected' : false},
    {'tag_name' : 'Comedy', 'tag_id' : '53', 'selected' : false},
    {'tag_name' : 'Drama', 'tag_id' : '11', 'selected' : false},
    {'tag_name' : 'Action', 'tag_id' : '12', 'selected' : false},
    {'tag_name' : 'Sci-Fi', 'tag_id' : '15', 'selected' : false},
    {'tag_name' : 'Horror', 'tag_id' : '39', 'selected' : false},
    {'tag_name' : 'Romance', 'tag_id' : '13', 'selected' : false},
    {'tag_name' : 'Thriller', 'tag_id' : '28', 'selected' : false},
    {'tag_name' : 'Biography', 'tag_id' : '52', 'selected' : false},
    {'tag_name' : 'Crime', 'tag_id' : '99', 'selected' : false},
    {'tag_name' : 'Mystery', 'tag_id' : '186', 'selected' : false},
    {'tag_name' : 'War', 'tag_id' : '61', 'selected' : false},
    {'tag_name' : 'Fantasy', 'tag_id' : '89', 'selected' : false}],
  };

  Searches.getRecommendedArticles().then(function(articles) {
    $scope.recommendedArticles = articles;
  });

  $scope.FbLoginToggle = false;
  $scope.searchResultClick = true,
  $scope.showGenresToggle = false,
  $scope.selectedGenresExist = false,
  $scope.searchResultToggle = false;
  $scope.showMovieError = false;
  $scope.showMovieLoading = false;

  $scope.search = function() {
    $scope.searchResultClick = true;
    Searches.searchTags($scope.data.search).then(
      function successCallback(matches) {
        console.log(matches);
        $timeout(function() {
          $scope.data.tags = matches;
        }, 100);
      },
      function errorCallback(matches) {
        if(matches.tag[0].hasOwnProperty('result') && matches.tag[0].result == "404") {
            $scope.data.tags = [];
          }
      }
    )
  }

  $scope.cancelSearch = function() {
    $scope.searchResultClick = true;
    $scope.searchResultToggle = false;
    $scope.data.search = null;
  }

  $scope.searchResultClicked = function(tag) {
    $scope.searchResultClick = false;
    $scope.searchResultToggle = true;
    $scope.searchResultMoviesToggle = true;
    $scope.searchResultArticlesToggle = true;
    $scope.data.search = tag.tag_name;

    Searches.getSearchResult(User.getUser(), tag.tag_id).then(function(result) {
      
      if(result.movie.hasOwnProperty('result') && result.movie.result == "404") {
        $scope.searchResultMoviesToggle = false;
      }

      if(result.movie.hasOwnProperty('result') && result.movie.result == "404") {
        $scope.searchResultArticlesToggle = false;
      }

      $scope.movies = result.movie;
      $scope.articles = result.article;  
    });
  }

  $scope.showGenres = function() {
    $scope.showGenresToggle = true;
  }

  $scope.hideGenres = function() {
    $scope.showGenresToggle = false;
    selectedGenres = [];
    $scope.selectedGenresExist = false;
    for (var i = $scope.data.genres.length - 1; i >= 0; i--) {
      $scope.data.genres[i].selected = false;
    };
    $scope.searchResultMoviesToggle = false;
    $scope.searchResultToggle = false;
  }

  $scope.selectGenreToggle = function(index) {

    $scope.searchResultToggle = true;
    $scope.searchResultMoviesToggle = false;
    $scope.searchResultArticlesToggle = false;
    $scope.showMovieError = false;
    $scope.showMovieLoading = true;

    if(index == -1) return;

    if($scope.data.genres[index].selected == false) {
      $scope.data.genres[index].selected = true;
      $scope.selectedGenresExist = true;
      selectedGenres.push($scope.data.genres[index].tag_id);
    }
    else {
      $scope.data.genres[index].selected = false;
      selectedGenres.splice(selectedGenres.indexOf($scope.data.genres[index].tag_id), 1);
      if(selectedGenres.length == 0) {
        $scope.selectedGenresExist = false;
        $scope.searchResultMoviesToggle = false;
        return;}
    }

    Searches.searchByGenre(User.getUser(), selectedGenres).then(function(movies) {
        
        if(movies.hasOwnProperty('result') && movies.result == "404") {
          $scope.searchResultMoviesToggle = false;
          $scope.showMovieLoading = false;
          $scope.showMovieError = true;          
          return;
        }

        $scope.showMovieLoading = false;
        $scope.searchResultMoviesToggle = true;
        $scope.movies = movies.movie;
    });
  }

})

////////////////////////
// Profile Controller //
////////////////////////

.controller('ProfileCtrl', function($scope, $rootScope, User) {

  $scope.FbLoginToggle = false;
  $scope.moviesExist = false;
  $scope.articlesExist = false;
  $scope.viewAllMoviesToggle = false;

  // Get User Profile Picture and details
  var afterFbLogin = function() {
    var user = User.getUserFbInfo();
    $scope.user = {
      'image' : user.picture,
      'name' : user.name
    };  

    $scope.FbLoginToggle = true;
  };

  var getUserMovies = function() {
    User.getMovies(User.getUser()).then(function(movies) {

      if(movies.hasOwnProperty('result') && movies.result == "404") {
        return;
      }

      $scope.moviesExist = true;
      $scope.movies = movies;
    });
  }

  var getUserArticles = function() {
    User.getArticles(User.getUser()).then(function(articles) {

      if(articles.hasOwnProperty('result') && articles.result == "404") {
        return;
      }

      $scope.articlesExist = true;
      $scope.articles = articles;
    });
  }

  getUserMovies();
  getUserArticles();


  $scope.$on('successfulFbLogin', function(event) {
    afterFbLogin();
  });

  $scope.$on('articleLiked', function(event) {
    getUserArticles();
  });

  $scope.$on('movieFollowed', function(event) {
    getUserMovies();
  });

  $scope.facebookSignIn = function() {
    $rootScope.$broadcast('fbLoginEvent');
  }

})

/////////////////////////////
// Movie Detail Controller //
/////////////////////////////

.controller('MovieCtrl', function($scope, $rootScope, $state, $stateParams, Movies, User, $cordovaSocialSharing, $ionicScrollDelegate){

  $scope.movie = Movies.get($stateParams.movieId);

  Movies.getDetails(User.getUser(), $stateParams.movieId).then(function (movieDetail) {
    $scope.name = movieDetail.movie_name;
    $scope.description = movieDetail.description;
    $scope.director = movieDetail.directors;
    $scope.cast = movieDetail.actors;
    $scope.tags = movieDetail.tags;
    $scope.articles = movieDetail.related_articles;

    setTimeout(function() {
      $scope.image = movieDetail.image;
    }, 100);
  })

  
  $scope.goBack = function() {
        // $ionicHistory.goBack();                      //This doesn't work
        window.history.back();                          //This works
  }

  // Handle Share Movie Click 
  $scope.shareMovie = function () {
    var movieName = $scope.name;
        movieName = movieName.replace(/\s+/g, '-').toLowerCase();

        console.log(movieName);

    $cordovaSocialSharing.share("Check out the fizz on " + $scope.name +" at Popsoda!", "Check out the fizz on " + $scope.name +" at Popsoda!", null, "https://popsoda.mobi/movie/" + movieName+"/" + $stateParams.movieId);
  }

  // Handle Scroll - Hide and Unhide 
  $scope.scrollHandler = function () {
      var movieTitle = angular.element(document.querySelector('.movie-title')),
          movieBackIcon = angular.element(document.querySelector('.back-icon')),
          movieShareIcon = angular.element(document.querySelector('.share-icon')),
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

  //Get Human Readable Date
  $scope.prettyDate = function(time){
    var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
        diff = (((new Date()).getTime() - date.getTime()) / 1000),
        day_diff = Math.floor(diff / 86400);
            
    if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
        return;
            
    return day_diff == 0 && (
            diff < 60 && "now" ||
            diff < 120 && "1m" ||
            diff < 3600 && Math.floor( diff / 60 ) + "m" ||
            diff < 7200 && "1h" ||
            diff < 86400 && Math.floor( diff / 3600 ) + "h") ||
        day_diff == 1 && "1d" ||
        day_diff < 7 && day_diff + "d" ||
        day_diff < 31 && Math.ceil( day_diff / 7 ) + "w";
  }

  //Tag Based Search
  $scope.tagClick = function(tag){
    $rootScope.$broadcast('tagClicked', {tag: tag})
  }

  // Random Data

  $scope.followers = [{'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}];
  $scope.count = 234;


})

///////////////////////////////
// Article Detail Controller //
///////////////////////////////

.controller('ArticleCtrl', function($scope, $rootScope, $stateParams, $ionicPopup, $timeout, Articles, $cordovaSocialSharing, $sce, $ionicScrollDelegate, User){

    var YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";
    
    Articles.getDetails(User.getUser(), $stateParams.articleId).then(function (articleDetail) {
      $scope.article = articleDetail;
      $scope.videoWidth = window.screen.width;
      $scope.title = articleDetail.title;
      $scope.content = articleDetail.content;
      $scope.image = articleDetail.hero_image;

      //Check if video

      if(articleDetail.hero_video_url == false) {
        $scope.hasVideo = false;
      }
      else {
        $scope.video = $sce.trustAsResourceUrl(YOUTUBE_EMBED_URL + articleDetail.hero_video_url);
        $scope.hasVideo = true;
      }

      $scope.source = articleDetail.source;
      $scope.movieName = articleDetail.movie_name;
      $scope.tags = articleDetail.tags;
      $scope.date = articleDetail.publishedon;
      $scope.likes = articleDetail.likes;
      $scope.userLike = articleDetail.user_like_article;
    })

    $scope.prettyDate = function(time){
      var date = new Date((time || "").replace(/-/g,"/").replace(/[TZ]/g," ")),
          diff = (((new Date()).getTime() - date.getTime()) / 1000),
          day_diff = Math.floor(diff / 86400);
              
      if ( isNaN(day_diff) || day_diff < 0 || day_diff >= 31 )
          return;
              
      return day_diff == 0 && (
              diff < 60 && "now" ||
              diff < 120 && "1m" ||
              diff < 3600 && Math.floor( diff / 60 ) + "m" ||
              diff < 7200 && "1h" ||
              diff < 86400 && Math.floor( diff / 3600 ) + "h") ||
          day_diff == 1 && "1d" ||
          day_diff < 7 && day_diff + "d" ||
          day_diff < 31 && Math.ceil( day_diff / 7 ) + "w";
    }

    $scope.goBack = function() {
          // $ionicHistory.goBack();                      //This doesn't work
          window.history.back();                          //This works
    }

    $scope.shareArticle = function () {
      var articleName = $scope.title;
          articleName = articleName.replace(/\s+/g, '-').toLowerCase();

      $cordovaSocialSharing.share("Check out the fizz on " + $scope.name +" at Popsoda!", "Check out the fizz on " + $scope.name +" at Popsoda!", null, "https://popsoda.mobi/movie/" + articleName+"/" + $stateParams.articleId);
    }

    

      

    $scope.likeArticle = function () {
      if(User.getLoginState() == false) {
        var loginContinue = showLoginModal();
        if(loginContinue == false) return;
        }
        else {
          likeArticleToggle();
        }
    }

    var showLoginModal = function() {
     var confirmPopup = $ionicPopup.confirm({
         title: 'Please log in',
         template: 'To like an article, you need to login. Login now?'
       });

       confirmPopup.then(function(res) {
         if(res) {
            $rootScope.$broadcast('fbLoginEvent');
            $timeout(function() {
              if(User.getLoginState == true) {
                likeArticleToggle();   
                return true;             
              }
              else return false;
            }, 2000);

            return true;
         } else {
           return false;
         }
       });
     };  

    var likeArticleToggle = function() {
      if($scope.userLike == 1){
        $scope.userLike = 0;
        $scope.likes--;
      } else {
        $scope.likes++;
        $scope.userLike = 1;
      }
      
      $rootScope.$broadcast('articleLikeToggled');   
      Articles.toggleLike(User.getUser(), $stateParams.articleId, $scope.userLike);
    }

    $scope.tagClick = function(tag){
      $rootScope.$broadcast('tagClicked', {tag: tag})
    }

    var articleHeader = angular.element(document.querySelector('.article-header'));


    $scope.scrollHandler = function () {
      if($ionicScrollDelegate.getScrollPosition().top >= 80) {
        articleHeader.addClass('scrolled');

        
      }
      else {
        articleHeader.removeClass('scrolled');
      }
    }
})

///////////////////////////////
// Article Detail Controller //
///////////////////////////////

.controller('MoreCtrl', function($scope) {

  $scope.groups = [{'title': 'About Us', 'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'show' : true},

    {'title': 'Terms & Conditions', 'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'show' : false},

    {'title': 'Privacy Policy', 'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'show' : false},

    {'title': 'Help & Feedback', 'content': 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.', 'show' : false}];

  $scope.toggleGroup = function(group) {
    group.show = group.show == true ? false : true;

    var index = $scope.groups.indexOf(group);

    for (var i = $scope.groups.length - 1; i >= 0; i--) {
      if(index !== i) {
        $scope.groups[i].show = false;
      }
    }
  }

  $scope.goBack = function() {
    // $ionicHistory.goBack();                      //This doesn't work
    window.history.back();                          //This works
  }

});