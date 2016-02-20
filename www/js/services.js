angular.module('popsoda.services', [])
.factory('User', function($http) {
  
  var userID = "0",
      userFbInfo,
      userTwitterInfo,
      logInProvider = "App";

  var setUser = function(user_data) {
    userID = "" + user_data;
    window.localStorage.userID = userID;
  };

  var getUser = function(){
    return userID;
  };

  var setUserFbInfo = function(info){
    userFbInfo = info;
    window.localStorage.userFbInfo = JSON.stringify(info);
  };

  var getUserFbInfo = function(info){
    return JSON.parse(window.localStorage.userFbInfo || '{}');
  };

  var getLoginState = function() {
    try {
      if(userFbInfo.authResponse.session_key == true)
      return true;
    }
    catch(err) {
      return false;
    }
    
  }

  var setUserTwitterInfo = function(info) {
    userTwitterInfo = info;
    window.localStorage.userTwitterInfo = JSON.stringify(info);
  }

  var getUserTwitterInfo = function(info) {
    return JSON.parse(window.localStorage.userTwitterInfo || '{}');
  }

  var setUserFbInfoAPI = function() {

    logInProvider = "Facebook";

    var friendsList = "",
        firstName = userFbInfo.name.substr(0, userFbInfo.name.indexOf(' ')),
        lastName = userFbInfo.name.substr(userFbInfo.name.indexOf(' '), userFbInfo.name.length);

    for (var i = userFbInfo.friends.data.length - 1; i >= 1; i--) {
      friendsList = friendsList + userFbInfo.friends.data[i].id + ",";
    }

    friendsList = friendsList + userFbInfo.friends.data[i].id;

    var req = {
      method: 'POST',
      url: 'https://popsoda.mobi/api/index.php/userlogin',
      headers: {'Content-Type': 'application/x-www-form-urlencoded'},
      transformRequest: function(obj) {
        var str = [];
        for(var p in obj)
        str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
        return str.join("&");
      },
      data: { 
      fb_provider_key: userFbInfo.userID,
      fname: firstName,
      lname: lastName,
      email: userFbInfo.email,
      friends_ID: friendsList,
      login_provider: logInProvider,
      app_id: "POP_APP_MOB_420"
      }
    };

    return $http(req).
    then(function successCallback(response) {
      console.log(response);
      userID = response.data.user_id;
    }, function errorCallback(response) {
      console.log(response);
    });
  }

  return {
    getUser: getUser,
    setUser: setUser,
    setUserFbInfo: setUserFbInfo,
    getUserFbInfo: getUserFbInfo,
    setUserTwitterInfo: setUserTwitterInfo,
    getUserTwitterInfo: getUserTwitterInfo,
    setUserFbInfoAPI: setUserFbInfoAPI,
    getLoginState: getLoginState
  };
})

.factory('Movies',function($http, $rootScope) {

  var movies = [],
      movieDetail;

  return {
    all: function() {
      if(movies) {
        return movies;
      }
      else {
        movies = JSON.parse(window.localStorage.getItem('localMovies'));
        console.log("Fetched from local");
        return movies;
      }
    },

    get: function(movieId) {
      var i = 0, len = movies.length;
      for(; i<len; i++) {
        if(movies[i].movie_id == parseInt(movieId)) {
          return movies[i];
        }
      }
    },

    getDetails: function (user_id, movieId) {
      return $http.get("https://popsoda.mobi/api/index.php/getmovie/" + movieId + "/"+user_id)
      .then(function successCallback (response) {
        movieDetail = response.data;
        return movieDetail;
      },
      function errorCallback () {
        console.error("Cannot fetch movie detail at the moment");
      })
    },

    toggleFollow: function(user_id, movieId, follow) {
      console.log(user_id);
      console.log(movieId);
      console.log(follow);
      var req = {
        method: 'POST',
        url: 'https://popsoda.mobi/api/index.php/follow',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: { 
        follow: parseInt(follow),
        user_id : parseInt(user_id),
        movie_id : parseInt(movieId) }
      };

      return $http(req)
      .then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      })
    },

    getFeed: function(user_id){

      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/"+ user_id +"/0/4")
      .then(function successCallback(response){
        movies = response.data;
        window.localStorage.removeItem('localMovies');
        window.localStorage.setItem('localMovies', JSON.stringify(movies));
        return movies;
      }, 
      function errorCallback() {
        movies = JSON.parse(window.localStorage.getItem('localMovies'));
        console.log("Fetched from local");
        return movies;
      });
    },

    getMore: function(user_id, lastMovie) {

      lastMovie = new Date(Date.parse(lastMovie) / 1000);
      lastMovie -= (lastMovie.getTimezoneOffset() * 60);

      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/" + user_id +"/" + lastMovie + "/10").then(function(response){
        var newMovies = response.data;
        movies = movies.concat(newMovies);
        console.log(lastMovie);
        return newMovies;
      });
    }
  }

})

.factory('Articles', function($http) {
  var articles = [],
      articleDetail;

  return{
    all: function () {
      if(articles) {
        return articles;
      }
      else {
        articles = JSON.parse(window.localStorage.getItem('localArticles'));
        console.log("Fetched from local");
        return articles;
      }
    },

    get: function(articleId) {
      var i = 0, len = articles.length;
      for(; i<len; i++) {
        if(articles[i].article_id == parseInt(articleId)) {
          return articles[i];
        }
      }
    },

    set: function(articlesFromAPI) {
      var i = 0, len = articlesFromAPI.length;
      for(; i<len; i++) {
        articles.push(articlesFromAPI[i]);
      };
      return articles;
    },

    getFeed: function(){
      return $http.get("https://popsoda.mobi/api/index.php/home/toparticle/0/10")
      .then(function successCallback(response){
        articles = response.data;
        window.localStorage.removeItem('localArticles');
        window.localStorage.setItem('localArticles', JSON.stringify(articles));
        return articles;
      }, 
      function errorCallback() {
        articles = JSON.parse(window.localStorage.getItem('localArticles'));
        console.log("Fetched from local");
        return articles;
      });
    },

    getMore: function(lastArticle) {

      lastArticle = new Date(Date.parse(lastArticle) / 1000);
      lastArticle -= (lastArticle.getTimezoneOffset() * 60);

      return $http.get("https://popsoda.mobi/api/index.php/home/toparticle/" + lastArticle + "/10").then(function(response){
        var newArticles = response.data;
        articles = articles.concat(newArticles);
        return newArticles;
      });
    },

    getDetails: function (user_id, articleId) {
      return $http.get("https://popsoda.mobi/api/index.php/getarticle/" + user_id + "/" +articleId)
      .then(function successCallback (response) {
        articleDetail = response.data;
        return articleDetail;
      },
      function errorCallback () {
        console.error("Cannot fetch article detail at the moment");
      })
    },

    poll: function(articleTimestamp) {

      articleTimestamp = new Date(Date.parse(articleTimestamp) / 1000);
      articleTimestamp -= (articleTimestamp.getTimezoneOffset() * 60);
      
      return $http.get("https://popsoda.mobi/api/index.php/home/latesttoparticle/" + articleTimestamp)
      .then(function successCallback (response) {
        var latestArticles = response.data;
        return latestArticles;
      },
      function errorCallback() {
        console.error("Cannot fetch new articles at the moment");
      })
    },

    unshift: function(articlesFromView) {
      articles.unshift(articlesFromView);
    },

    toggleLike: function(user_id, article_id, article_like) {
      var req = {
        method: 'POST',
        url: 'https://popsoda.mobi/api/index.php/like',
        headers: {'Content-Type': 'application/x-www-form-urlencoded'},
        transformRequest: function(obj) {
          var str = [];
          for(var p in obj)
          str.push(encodeURIComponent(p) + "=" + encodeURIComponent(obj[p]));
          return str.join("&");
        },
        data: { 
        like: parseInt(article_like),
        user_id : parseInt(user_id),
        article_id : parseInt(article_id) }
      };

      return $http(req)
      .then(function successCallback(response) {
        console.log(response);
      }, function errorCallback(response) {
        console.log(response);
      })
    }
  }
})

.factory('Trends', function($http) {
  
  var trends = [],
      colors = ['#F49999', '#FECE89', '#66C4BD'],
      oauthToken,
      oauthTokenSecret;

  var getRandomColor =  function() {
    return colors[Math.floor(Math.random() * 3)];
  };

  return {

    all: function (argument) {
      if(trends) {
        return trends;
      }
      else {
        trends = JSON.parse(window.localStorage.getItem('localTrends'));
        console.log("Fetched from local");
        return trends;
      }
    },

    getFeed: function (user_id) {
      return $http.get("https://popsoda.mobi/api/index.php/twitter/"+user_id+ "/0/10")
      .then(function successCallback(response){
        trends = response.data;

        for (var i = trends.length - 1; i >= 0; i--) {
          trends[i].tweet1.color = getRandomColor();
          trends[i].tweet2.color = getRandomColor();
        };

        window.localStorage.removeItem('localTrends');
        window.localStorage.setItem('localTrends', JSON.stringify(trends));

        return trends;
      }, 
      function errorCallback() {
        trends = JSON.parse(window.localStorage.getItem('localTrends'));

        for (var i = trends.length - 1; i >= 0; i--) {
          trends[i].tweet1.color = getRandomColor();
          trends[i].tweet2.color = getRandomColor();
        };

        console.log("Fetched from local");
        return trends;
      });
    },

    getMore: function (lastTrend) {

      lastTrend = Date.parse(lastTrend) / 1000;

      return $http.get("https://popsoda.mobi/api/index.php/twitter/"+ user_id +"/" + lastTrend + "/10").then(function(response){
        var newTrends = response.data;

        for (var i = newTrends.length - 1; i >= 0; i--) {
          newTrends[i].tweet1.color = getRandomColor();
          newTrends[i].tweet2.color = getRandomColor();
        };

        trends = trends.concat(newTrends);
        return newTrends;
      });
    },

    setOauthToken: function(oauth) {
      oauthToken = oauth;
    },

    setOauthTokenSecret: function(oauth) {
      oauthTokenSecret = oauth;
    },

    retweet: function (tweetID) {
      return $http.post("https://api.twitter.com/1.1/statuses/retweet/" + tweetID +".json", getConfig()).then(function(response) {
          console.log("Success retweet" + response.data);
      }, function(response) {
        console.log("Error: " + response.data);
      });
    },

    favorite: function (tweetID) {
      return $http.post("https://api.twitter.com/1.1/favorites/create.json?id=" + tweetID, getConfig()).then(function(response) {
          console.log("Success favorite" + response.data);
      }, function(response) {
        console.log(response.data);
      });
    }

  }
})

.factory('Trailers', function($http) {
  var trailers = [];

  var getTrailers = function() {
    return $http.get("https://popsoda.mobi/api/index.php/trailerRelease").then(

      function successCallback(response){

        trailers = response.data;
        window.localStorage.removeItem('localTrailers');
        window.localStorage.setItem('localTrailers', JSON.stringify(trailers));

        return trailers;

      },
      function errorCallback(response) {
        trailers = JSON.parse(window.localStorage.getItem('localTrailers')); 
        console.log("Fetched from local");
        return trailers;
    });
  };

  return {
    getTrailers : getTrailers
  }
})

.factory('Searches', function($q, $timeout, $http) {

  var searches = [], matches, searchResult, genreResult;

    var searchTags = function(searchFilter) {
        
        matches = [];
        var deferred = $q.defer();

        $http.get("https://popsoda.mobi/api/index.php/typeahead/" + searchFilter).then(function(response) {


          if(response.data.tag[0].hasOwnProperty("result") && response.data.tag[0].result == "404"){
            deferred.reject(response.data);
            return deferred.promise;
          }

          searches = response.data.tag;

          matches = searches.filter( function(search) {
            if(search.tag_name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
            else {
              return deferred.promise;
            }
          })

          deferred.resolve( matches );

        }, function(response) {
          return deferred.promise;
        });

        return deferred.promise;

    };

    var getSearchResult = function(user_id, tagID) {
      return $http.get("https://popsoda.mobi/api/index.php/searchbytag/"+tagID).then(function successCallback(response) {

        searchResult = response.data;
        return searchResult;

      });
    };

    var searchByGenre = function(user_id, genres) {

      var str = 'https://popsoda.mobi/api/index.php/searchmoviebygenre/';

      for (var i = genres.length - 1; i >= 1; i--) {
        str = str + genres[i] + ',';
        console.log(str);
      };

      str = str + genres[i];

      return $http.get(str).then(function successCallback(response) {

        genreResult = response.data;
        return genreResult;

      }, function errorCallback(response) {
        genreResult = [{'result' : '404'}];
        return genreResult;
      });
    };

    var getRecommendedArticles = function() {
      return $http.get("https://popsoda.mobi/api/index.php/recommend").then(function(response) {
        return response.data;
      }, function(response) {
        console.log("Error: "+ response.data);
      });
    }

  return {

    searchTags : searchTags,
    getRecommendedArticles : getRecommendedArticles,
    getSearchResult: getSearchResult,
    searchByGenre: searchByGenre,

    sort: function (a, b) {
      var searchA = a.name.toLowerCase();
      var searchB = b.name.toLowerCase();

      if(searchA > searchB) return 1;
      if(searchA < searchB) return -1;
      return 0; 
    },

    searchRemote: function(filter) {
      return $http.get("https://popsoda.mobi/api/index.php/typeahead/" + filter ).then( function successCallback(response) {
        searches = response.data.tag;
        return searches;
      });
    },

    searchResultClick: function(searchResult) {
      recentSearches.push(searchResult.tag_name);
      return recentSearches;
    }
  }
});