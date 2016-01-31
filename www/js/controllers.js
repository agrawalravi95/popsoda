angular.module('popsoda.controllers', [])

///////////////////////////////
// Tabs and Slide Controller //
///////////////////////////////

.controller('TabSlideCtrl', function($scope, $ionicSlideBoxDelegate, $state, $ionicHistory) {
    console.log($ionicHistory.viewHistory());

})

////////////////////////
// Welcome Controller //
////////////////////////

.controller('WelcomeCtrl', function($scope, $state, $q, User, $ionicLoading) {

  // Initialize user from localstorage
  var loggedIn = false,
      user = User.getUser(),
      authresponse;
  
  // initialize Scope
  $scope.loggedIn = false;

  var checkLoginState = function () {
    
    user = User.getUser();

    if(user !== undefined && user.hasOwnProperty('status') && user.status == "connected") {  

      loggedIn = true;
      $scope.$parent.loggedIn = true;

      return true;
    }

    loggedIn = false;
    $scope.loggedIn = false;
    $scope.$parent.loggedIn = false;

    return false;
  };

  //Check LogIn at start of application
  checkLoginState();

  //Success call for Facebook log in 
  var fbLoginSuccess = function (userData) {
      console.log("Scope= " + $scope.loggedIn + " Scope Parent= " + $scope.$parent.loggedIn);

      User.setUser(userData);
      loggedIn = true;
      $scope.loggedIn = true;
      $scope.$parent.loggedIn = true;

      $state.go('app.tabs');
  }

  //Handle Facebook Signin Click
  $scope.facebookSignIn = function() {

    var deferred = $q.defer();
    facebookConnectPlugin.login(["public_profile", "user_friends", "email"],
        fbLoginSuccess,
        function (error) { alert("" + error) }
    );
  }

  //Handle skip signin click
  $scope.skipSignIn = function () {
    
    user = {
      'username' : 'popsoda',
      'fbuser'   : 'no' 
    };

    loggedIn = true;
    $scope.loggedIn = true;
    $scope.$parent.loggedIn = true;

    User.setUser(user);

    console.log("Scope= " + $scope.loggedIn + " Scope Parent= " + $scope.$parent.loggedIn);
  }

})

/////////////////////
// Home Controller //
/////////////////////

.controller('HomeCtrl', function($scope, Movies, Articles, $timeout, $ionicSlideBoxDelegate, $ionicScrollDelegate) {

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
  Movies.getFeed().then(function(movies){
    $scope.movies = movies;
    lastMovie = movies[movies.length - 1].createdon;
    movieLoadAble = true;
  });

  Articles.getFeed().then(function (articles) {
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
    var articles = Articles.all(),
        lastObject = articles[articles.length - 1];

    if(lastObject.hasOwnProperty('result') && lastObject.result == "404") {
      articleLoadAble = true;
      $scope.articleLoadAble = true;
      continuePolling = false;
      return false;
    }

    return true;
  };

  //Check if more movies are available for infinite load
  $scope.moreMoviesAvailable = function() {
    var movies = Movies.all(),
        lastObject = movies[movies.length - 1];

    if(lastObject.hasOwnProperty('result') && lastObject.result == "404") {
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

    console.log("Here");


    if(lastMovie && movieLoadAble == true) {
      //Lock the function call
      movieLoadAble = false;
      $scope.movieLoadAble = false;

      console.log("Here");

      //Get More Movies Function Call
      Movies.getMore(lastMovie).then(function (movies) {

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
      Movies.getMore(lastMovie).then(function(movies){
        
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

    console.log("Polling");

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
      
      for (var i = articles.length - 1; i >= 0; i--) {
        $scope.articles.unshift(articles[i]);
        Articles.unshift(articles[i]);
      };
      // Add articles to 
      
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


///////////////////////////////
// Trending Pages Controller //
///////////////////////////////

.controller('TrendingCtrl', function($scope, Trends, $ionicSlideBoxDelegate) {

  var lastTrend,
      trendLoadAble = false;

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
  Trends.getFeed().then(function (trends) {
    $scope.trends = trends;
    lastTrend = trends[trends.length - 1].createdon;
    trendLoadAble = true;
  });

  //Check for End of Data on Infinite Scroll
  $scope.moreDataAvailable = function() {
    var trends = Trends.all(),
        lastObject = trends[trends.length - 1];

    //Check for 404 in returned data
    if(lastObject.hasOwnProperty('result') && lastObject.result == "404") {
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
      Trends.getMore(lastTrend).then(function(trends){
        
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
    Trends.retweet(tweetID);
    console.log("Here retweet");
  }

  //Handle Retweet Click
  $scope.favoriteHandler = function(tweetID) {
    Trends.favorite(tweetID);
    console.log("Here favorite");
  }

  $scope.followers = [{'image':'http://placehold.it/40x40'}];
  $scope.count = 234;
})

////////////////////////
// Trailer Controller //
////////////////////////

.controller('TrailersCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

  $scope.settings = {
    enableFriends: true
  };
})

///////////////////////
// Search Controller //
///////////////////////


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

////////////////////////
// Profile Controller //
////////////////////////

.controller('ProfileCtrl', function($scope, $ionicTabsDelegate, $ionicSlideBoxDelegate) {

})

/////////////////////////////
// Movie Detail Controller //
/////////////////////////////


.controller('MovieCtrl', function($scope, $stateParams, Movies, $cordovaSocialSharing, $ionicScrollDelegate){

  $scope.movie = Movies.get($stateParams.movieId);

  Movies.getDetails($stateParams.movieId).then(function (movieDetail) {
    $scope.name = movieDetail.movie_name;
    $scope.description = movieDetail.description;
    $scope.director = movieDetail.directors;
    $scope.cast = movieDetail.actors;
    $scope.tags = movieDetail.tags;
    $scope.articles = movieDetail.related_articles;

    setTimeout(function() {
      $scope.image = movieDetail.image;
    }, 1000);
  })

  
  $scope.goBack = function() {
        // $ionicHistory.goBack();                      //This doesn't work
        window.history.back();                          //This works
  }

  // Handle Share Movie Click 
  $scope.shareMovie = function (movie) {
    $cordovaSocialSharing.share("movie.name", null, "movie.image", "http://agrawalravi.com");
  }

  // Handle Scroll - Hide and Unhide 
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

  // Random Data

  $scope.followers = [{'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}, {'image':'http://placehold.it/40x40'}];
  $scope.count = 234;


})

///////////////////////////////
// Article Detail Controller //
///////////////////////////////

.controller('ArticleCtrl', function($scope, $stateParams, Articles, $cordovaSocialSharing, $sce, $ionicScrollDelegate){

    var YOUTUBE_EMBED_URL = "https://www.youtube.com/embed/";
    
    $scope.article = Articles.get($stateParams.articleId);
    Articles.getDetails($stateParams.articleId).then(function (articleDetail) {

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
    })

    $scope.goBack = function() {
          // $ionicHistory.goBack();                      //This doesn't work
          window.history.back();                          //This works
    }

    $scope.sharearticle = function (article) {
      $cordovaSocialSharing.share(article.title, null, article.image, "http://agrawalravi.com");
    }

    var articleHeader = angular.element(document.querySelector('.article-header'));


    $scope.scrollHandler = function (argument) {
      if($ionicScrollDelegate.getScrollPosition().top >= 80) {
        articleHeader.addClass('scrolled');

        
      }
      else {
        articleHeader.removeClass('scrolled');
      }
    }
});