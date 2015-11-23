angular.module('popsoda.services', [])

.factory('Chats', function() {
  // Might use a resource here that returns a JSON array

  // Some fake testing data
  
  var chats = [];

  /*
  var chats = [{
    id: 0,
    name: 'Ben Sparrow',
    lastText: 'You on your way?',
    face: 'img/ben.png'
  }, {
    id: 1,
    name: 'Max Lynx',
    lastText: 'Hey, it\'s me',
    face: 'img/max.png'
  }, {
    id: 2,
    name: 'Adam Bradleyson',
    lastText: 'I should buy a boat',
    face: 'img/adam.jpg'
  }, {
    id: 3,
    name: 'Perry Governor',
    lastText: 'Look at my mukluks!',
    face: 'img/perry.png'
  }, {
    id: 4,
    name: 'Mike Harrington',
    lastText: 'This is wicked good ice cream.',
    face: 'img/mike.png'
  }]; */

  return {

    all: function() {
      return chats;
    },
    remove: function(chat) {
      chats.splice(chats.indexOf(chat), 1);
    },
    get: function(chatId) {
      for (var i = 0; i < chats.length; i++) {
        if (chats[i].id === parseInt(chatId)) {
          return chats[i];
        }
      }
      return null;
    }

  };
})

.factory('Movies', function($http) {

  var movies = [];

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
      console.log(movieId);
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

    toggleFollow: function(movieId) {
      var i = 0, len = movies.length;
      for(; i<len; i++) {
        if(movies[i].movie_id == parseInt(movieId)) {
          console.log(movies[i].follow);
          movies[i].follow == 0 ? movies[i].follow = 1 : movies[i].follow = 0;
          console.log(movies[i].follow);
          break;
        }
      }
    },

    getFeed: function(){
      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3/0/6")
      .then(function successCallback(response){
        movies = response.data.movie;
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
      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3/" + lastMovie + "/4").then(function(response){
        var newMovies = response.data.movie;
        movies = movies.concat(newMovies);
        return newMovies;
      });
    },
    setFeed: function() {

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
