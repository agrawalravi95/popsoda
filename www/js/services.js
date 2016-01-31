angular.module('popsoda.services', [])

.factory('User', function() {
  
  var userID,
      defaultID = "0X0X001239956XXA",
      defaultUser = "popsodauser";

  var setUser = function(user_data) {
    window.localStorage.starter_facebook_user = JSON.stringify(user_data);
  };

  var getUser = function(){
    return JSON.parse(window.localStorage.starter_facebook_user || '{}');
  };

  return {
    getUser: getUser,
    setUser: setUser
  };
})

.factory('Movies', function($http) {

  var movies = [],
      movieDetail;


  return {
    all: function() {
      if(movies.length > 0) {
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

    set: function(moviesFromAPI) {
      var i = 0, len = moviesFromAPI.length;
      for(; i<len; i++) {
        movies.push(moviesFromAPI[i]);
      };
      return movies;
    },

    getDetails: function (movieId) {
      return $http.get("https://popsoda.mobi/api/index.php/getmovie/" + movieId + "/3")
      .then(function successCallback (response) {
        movieDetail = response.data;
        return movieDetail;
      },
      function errorCallback () {
        console.error("Cannot fetch movie detail at the moment");
      })
    },

    toggleFollow: function(movieId) {
      return false;
    },

    getFeed: function(){

      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3/0/4")
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

    getMore: function(lastMovie) {

      lastMovie = new Date(Date.parse(lastMovie) / 1000);
      lastMovie -= (lastMovie.getTimezoneOffset() * 60);

      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3/" + lastMovie + "/10").then(function(response){
        var newMovies = response.data;
        movies = movies.concat(newMovies);
        console.log(lastMovie);
        return newMovies;
      });
    },
    setFeed: function() {

    }
  }

})

.factory('Articles', function($http) {
  var articles = [],
      articleDetail;

  return{
    all: function () {
      if(articles.length > 0) {
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

    getDetails: function (articleId) {
      return $http.get("https://popsoda.mobi/api/index.php/getarticle/" + articleId)
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
    }
  }
})

.factory('Trends', function ($http) {
  
  var trends = [],
      colors = ['#F49999', '#FECE89', '#66C4BD'];

  var getRandomColor =  function() {
    return colors[Math.floor(Math.random() * 3)];
  };

  return {

    all: function (argument) {
      if(trends.length > 0) {
        return trends;
      }
      else {
        trends = JSON.parse(window.localStorage.getItem('localTrends'));
        console.log("Fetched from local");
        return trends;
      }
    },

    getFeed: function () {
      return $http.get("https://popsoda.mobi/api/index.php/twitter/0/10")
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

      return $http.get("https://popsoda.mobi/api/index.php/twitter/" + lastTrend + "/10").then(function(response){
        var newTrends = response.data;

        for (var i = newTrends.length - 1; i >= 0; i--) {
          newTrends[i].tweet1.color = getRandomColor();
          newTrends[i].tweet2.color = getRandomColor();
        };

        trends = trends.concat(newTrends);
        return newTrends;
      });
    },

    retweet: function (tweetID) {
      return $http.post("https://api.twitter.com/1.1/statuses/retweet/" + tweetID +".json").then(function(response) {
          console.log("Success retweet" + response.data);
      }, function(response) {
        console.log("Error: " + response.data);
      });
    },

    favorite: function (tweetID) {
      return $http.post("https://api.twitter.com/1.1/favorites/create.json?id=" + tweetID).then(function(response) {
          console.log("Success favorite" + response.data);
      }, function(response) {
        console.log("Error: " + response.data);
      });
    }

  }
})

.factory('Searches', function($q, $timeout, $http) {

  var searches = [{"fs":"LCI","iata":"LF","icao":"LCI","name":"Lao Central Airlines ","active":true},{"fs":"TGU","iata":"5U","icao":"TGU","name":"TAG","active":true},{"fs":"BT","iata":"BT","icao":"BTI","name":"Air Baltic","active":true},{"fs":"9J","iata":"9J","icao":"DAN","name":"Dana Airlines","active":true},{"fs":"2O","iata":"2O","icao":"RNE","name":"Island Air Service","active":true},{"fs":"NPT","icao":"NPT","name":"Atlantic Airlines","active":true},{"fs":"C8","iata":"C8","icao":"ICV","name":"Cargolux Italia","active":true},{"fs":"FK","iata":"FK","icao":"WTA","name":"Africa West","active":true},{"fs":"8K","iata":"8K","icao":"EVS","name":"EVAS Air Charters","active":true},{"fs":"W8","iata":"W8","icao":"CJT","name":"Cargojet","active":true},{"fs":"JBW","iata":"3J","icao":"JBW","name":"Jubba Airways (Kenya)","active":true},{"fs":"TNU","iata":"M8","icao":"TNU","name":"TransNusa","active":true},{"fs":"HCC","iata":"HC","icao":"HCC","name":"Holidays Czech Airlines","active":true},{"fs":"APJ","iata":"MM","icao":"APJ","name":"Peach Aviation","active":true},{"fs":"TUY","iata":"L4","icao":"TUY","name":"LTA","active":true},{"fs":"LAE","iata":"L7","icao":"LAE","name":"LANCO","active":true},{"fs":"L5*","iata":"L5","icao":"LTR","name":"Lufttransport","active":true},{"fs":"QA","iata":"QA","icao":"CIM","name":"Cimber","active":true},{"fs":"KBZ","iata":"K7","icao":"KBZ","name":"Air KBZ","active":true},{"fs":"L2","iata":"L2","icao":"LYC","name":"Lynden Air Cargo","active":true},{"fs":"MPK","iata":"I6","icao":"MPK","name":"Air Indus","active":true},{"fs":"CAO","icao":"CAO","name":"Air China Cargo ","active":true},{"fs":"BEK","iata":"Z9","icao":"BEK","name":"Bek Air","active":true},{"fs":"IAE","iata":"IO","icao":"IAE","name":"IrAero","active":true},{"fs":"GL*","iata":"GL","name":"Airglow Aviation Services","active":true},{"fs":"ATN","iata":"8C","icao":"ATN","name":"ATI","active":true},{"fs":"GU","iata":"GU","icao":"GUG","name":"Aviateca Guatemala","active":true},{"fs":"GHY","icao":"GHY","name":"German Sky Airlines ","active":true},{"fs":"SS","iata":"SS","icao":"CRL","name":"Corsair","active":true},{"fs":"XK","iata":"XK","icao":"CCM","name":"Air Corsica","active":true},{"fs":"W9*","iata":"W9","icao":"JAB","name":"Air Bagan","active":true},{"fs":"Z8*","iata":"Z8","icao":"AZN","name":"Amaszonas","active":true},{"fs":"D2","iata":"D2","icao":"SSF","name":"Severstal Aircompany","active":true},{"fs":"SNC","iata":"2Q","icao":"SNC","name":"Air Cargo Carriers","active":true},{"fs":"PST","iata":"7P","icao":"PST","name":"Air Panama","active":true},{"fs":"VV","iata":"VV","icao":"AEW","name":"Aerosvit Airlines","active":true},{"fs":"UJ","iata":"UJ","icao":"LMU","name":"AlMasria","active":true},{"fs":"9U","iata":"9U","icao":"MLD","name":"Air Moldova","active":true},{"fs":"NF","iata":"NF","icao":"AVN","name":"Air Vanuatu","phoneNumber":"678 238 48","active":true},{"fs":"NJS","iata":"NC","icao":"NJS","name":"Cobham Aviation","active":true}],
      recentSearches = [];

    var searchTags = function(searchFilter) {
         
        console.log('Searching tags for ' + searchFilter);

        var deferred = $q.defer();

        var matches = searches.filter( function(search) {
          if(search.name.toLowerCase().indexOf(searchFilter.toLowerCase()) !== -1 ) return true;
        })

        $timeout( function(){
        
           deferred.resolve( matches );

        }, 100);

        return deferred.promise;

    };

  return {

    searchTags : searchTags,

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
