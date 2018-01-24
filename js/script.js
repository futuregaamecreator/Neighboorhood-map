var initialLocations = [{
    name: 'Popeyes',
    lat: 33.8827222,
    long: -84.21936249999999
  },
  {
    name: 'Nam Phuong Restaurant',
    lat: 33.8611977,
    long: -84.30764110000001
  },
  {
    name: 'Shanes Rib Shack',
    lat: 33.9542043,
    long: -84.22079150000002
  },
  {
    name: 'Lucky Shoals Park',
    lat: 33.8805852,
    long: -84.1971694
  },
  {
    name: 'Perimeter Mall',
    lat: 33.9235944,
    long: -84.34053890000001
  },
  {
    name: 'Pho 24',
    lat: 33.8773468,
    long: -84.29343690000002
  },
  {
    name: 'MicroCenter',
    lat: 33.9642901,
    long: -84.1373031
  },
  {
    name: 'Sprouts',
    lat: 33.8498509,
    long: -84.24296620000001
  }

];

// Declaring global variables now to satisfy strict mode
var map;
var clientID;
var clientSecret;




var Location = function(data) {
  var self = this;
  this.name = data.name;
  this.lat = data.lat;
  this.long = data.long;
  this.URL = "";
  this.street = "";
  this.city = "";


  this.visible = ko.observable(true);



  var foursquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + this.lat + ',' + this.long + '&client_id=' + clientID + '&client_secret=' + clientSecret + '&v=20160118' + '&query=' + this.name;

  $.getJSON(foursquareURL).done(function(data) {
    var results = data.response.venues[0];
    self.URL = results.url;
    if (typeof self.URL === 'undefined') {
      self.URL = "";
    }
    self.street = results.location.formattedAddress[0];
    self.city = results.location.formattedAddress[1];
  }).fail(function() {
    alert("There was an error with the Foursquare API call. Please refresh the page and try again to load Foursquare data.");
  });

  this.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
    '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
    '<div class="content">' + self.street + "</div>" +
    '<div class="content">' + self.city + "</div>";

  this.infoWindow = new google.maps.InfoWindow({
    content: self.contentString
  });

  this.marker = new google.maps.Marker({
    position: new google.maps.LatLng(data.lat, data.long),
    map: map,
    title: data.name
  });

  this.showMarker = ko.computed(function() {
    if (this.visible() === true) {
      this.marker.setMap(map);
    } else {
      this.marker.setMap(null);
    }
    return true;
  }, this);

  this.marker.addListener('click', function() {
    self.contentString = '<div class="info-window-content"><div class="title"><b>' + data.name + "</b></div>" +
      '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" +
      '<div class="content">' + self.street + "</div>" +
      '<div class="content">' + self.city + "</div>";

    self.infoWindow.setContent(self.contentString);

    self.infoWindow.open(map, this);

    self.marker.setAnimation(google.maps.Animation.BOUNCE);
    setTimeout(function() {
      self.marker.setAnimation(null);
    }, 2100);
  });

  this.bounce = function(place) {
    google.maps.event.trigger(self.marker, 'click');
  };
};

function AppViewModel() {
  var self = this;

  this.searchTerm = ko.observable("");

  this.locationList = ko.observableArray([]);

  //Holds value for list togglings
  this.toggleSymbol = ko.observable('hide');

  map = new google.maps.Map(document.getElementById('map'), {
    zoom: 12,
    center: {
      lat: 33.875944,
      lng: -84.25556169999999
    }
  });

  //toggles the  view
  this.listToggle = function() {
      if(self.toggleSymbol() === 'hide') {
          self.toggleSymbol('show');
      } else {
          self.toggleSymbol('hide');
      }
  };

  // Foursquare API settings
  clientID = "XNVQVVCEY2LTFUDRV3C2RKPP0GV41I2VBEDBA3R54JTQMGHC";
  clientSecret = "E2PWOZ11ZIZ1J1G5ZWBTIEY1CPKU5VNYF5C0CPPQXOXJDTUG";

  initialLocations.forEach(function(locationItem) {
    self.locationList.push(new Location(locationItem));
  });

  this.filteredList = ko.computed(function() {
    var filter = self.searchTerm().toLowerCase();
    if (!filter) {
      self.locationList().forEach(function(locationItem) {
        locationItem.visible(true);
      });
      return self.locationList();
    } else {
      return ko.utils.arrayFilter(self.locationList(), function(locationItem) {
        var string = locationItem.name.toLowerCase();
        var result = (string.search(filter) >= 0);
        locationItem.visible(result);
        return result;
      });
    }
  }, self);

  this.mapElem = document.getElementById('map');
  this.mapElem.style.height = window.innerHeight - 50;
}

function startApp() {
  ko.applyBindings(new AppViewModel());
}

function errorHandling() {
  alert("Google Maps has failed to load. Please check your internet connection and try again.");
}
