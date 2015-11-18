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
      for(var i=0; i<movies.length; i++) {
        if(movies[i].movie_id == parseInt(movieId)) {
          return movies[i];
        }
      }
    },

    set: function(moviesFromAPI) {
      for (var i = 0; i <= moviesFromAPI.length - 1; i++) {
        movies.push(moviesFromAPI[i]);
      };
      return movies;
    },

    toggleFollow: function(movieId) {
      for(var i=0; i<movies.length; i++) {
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
      return $http.get("https://popsoda.mobi/api/index.php/home/allmovie/3/" + lastMovie + "/6").then(function(response){
        movies = response.data.movie;
        return movies;
      });
    },
    setFeed: function() {

    }
  }

});
