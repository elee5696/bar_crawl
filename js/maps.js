/**
 * map class to store google maps map object and its data
 * @param {number} lat - user's latitude
 * @param {number} lng - user's longitude
 * @param {function} expandClickHandler - click handler to expand map
 * marker's dom elements
 */
class googleMap {
  constructor(lat, lng, expandClickHandler) {
    this.setMapOnAll = this.setMapOnAll.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.clearMarkers = this.clearMarkers.bind(this);
    this.updateLocation = this.updateLocation.bind(this);
    this.calculateAndDisplayRoute = this.calculateAndDisplayRoute.bind(this);
    this.lat = lat,
    this.lng = lng,
    this.mapObj = null
    this.markers = {
      events: [],
      biz: [],
      user: null,
      directions: []
    },
    this.directionsRenderer = null;
    this.waypts = [],
    this.expandClickHandler = expandClickHandler;
  }
  /**
   * Function to create a google maps object and append to dom
   * @param {none}
   * @return {none}
   */
  initMap() {
    const map = new google.maps.Map(document.getElementById('mapDisplay'), {
      zoom: 14,
      center: {
        lat: this.lat,
        lng: this.lng
      },
      styles: [
        { elementType: 'geometry', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.stroke', stylers: [{ color: '#242f3e' }] },
        { elementType: 'labels.text.fill', stylers: [{ color: '#746855' }] },
        {
          featureType: 'administrative.locality',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'geometry',
          stylers: [{ color: '#263c3f' }]
        },
        {
          featureType: 'poi.park',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#6b9a76' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry',
          stylers: [{ color: '#38414e' }]
        },
        {
          featureType: 'road',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#212a37' }]
        },
        {
          featureType: 'road',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#9ca5b3' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry',
          stylers: [{ color: '#746855' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'geometry.stroke',
          stylers: [{ color: '#1f2835' }]
        },
        {
          featureType: 'road.highway',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#f3d19c' }]
        },
        {
          featureType: 'transit',
          elementType: 'geometry',
          stylers: [{ color: '#2f3948' }]
        },
        {
          featureType: 'transit.station',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#d59563' }]
        },
        {
          featureType: 'water',
          elementType: 'geometry',
          stylers: [{ color: '#17263c' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.fill',
          stylers: [{ color: '#515c6d' }]
        },
        {
          featureType: 'water',
          elementType: 'labels.text.stroke',
          stylers: [{ color: '#17263c' }]
        }
      ]
      // mapTypeId: 'terrain',
    });

    this.mapObj = map;
    this.initAutocomplete();

    const userMarker = new Marker(this.mapObj, {name: "You"}, undefined, this.updateLocation, this.closeWindows, this.expandClickHandler);
    userMarker.renderUser({
      lat: this.lat,
      lng: this.lng
    });
    this.markers.user = userMarker;
  }
  /**
   * function to center the map to new location
   * @param {object} position - object with lat lng coordinates
   */
  updateLocation(position) {
    this.mapObj.panTo(position);
  }
  /**
   * function to remove google map markers from map
   * @param {object} map - google maps object
   * @return {none}
   */
  setMapOnAll(map) {
    for (let eventMarker of this.markers.events) {
      eventMarker.marker.setMap(null);
    }
    for (let bizMarker of this.markers.biz) {

      bizMarker.marker.setMap(null);
    }
    this.markers.user.marker.setMap(null);
    this.markers = {
      events: [],
      biz: [],
      user: null,
      directions: []
    }
  }
  /**
   * function to call function to delete markers and previous directions and routes
   * @param {none}
   * @return {none}
   */
  clearMarkers() {
    if (this.directionsRenderer) {
      this.directionsRenderer.set('directions',null);
    }
    this.setMapOnAll(null);
    this.waypts = [];
  }
  /**
   * function to close the pop up window on marker in map
   * @param {none}
   * @return {none}
   */
  closeWindows = () => {
    for (let eventMarker of this.markers.events) {
      eventMarker.infoWindow.close(this.map);
    }
    for (let bizMarker of this.markers.biz) {
      bizMarker.infoWindow.close(this.map);
    }
  }
  /**
   * function to add events and their markers on map
   * @param {object} events - data from eventbright api
   * @return {none}
   */
  addEvents(events) {
    // takes in the array data from eventbrite response and creates/renders Markers
    // on the map
    events.map((event, index) => {
      const eventMarker = new Marker(this.mapObj, event, `.event${index}`, this.updateLocation, this.closeWindows, this.expandClickHandler);
      this.markers.events.push(eventMarker);
      eventMarker.renderEvent(event, index);
    });
  }
  /**
   * function to add businesses and their markers on map
   * @param {object}
   * @return {none}
   */
  addBiz(businesses) {
    businesses.map((biz, index) => {
      const bizMarker = new Marker(this.mapObj, biz, `.business${index}`, this.updateLocation, this.closeWindows, this.expandClickHandler);
      this.markers.biz.push(bizMarker);
      bizMarker.renderBiz(biz, index);
    })
  }
  /**
   * function to initialize search bar on google maps with auto complete
   * @param {none}
   * @return {none}
   */
  initAutocomplete() {
    var input = document.getElementById('pac-input');
    var searchBox = new google.maps.places.SearchBox(input);
    this.mapObj.controls[google.maps.ControlPosition.TOP_LEFT].push(input);

    var markers = [];
    searchBox.addListener('places_changed', () => {
      var places = searchBox.getPlaces();
      var newUserLat = places[0].geometry.location.lat();
      var newUserLong = places[0].geometry.location.lng();
      this.updateDom(newUserLat, newUserLong);

      if (places.length == 0) {
        return;
      }

      markers.forEach( (marker) => {
        marker.setMap(null);
      });
      markers = [];
      var bounds = new google.maps.LatLngBounds();
      places.forEach( (place) => {
        if (!place.geometry) {
          console.log("Returned place contains no geometry");
          return;
        }
        var icon = {
          url: place.icon,
          size: new google.maps.Size(71, 71),
          origin: new google.maps.Point(0, 0),
          anchor: new google.maps.Point(17, 34),
          scaledSize: new google.maps.Size(25, 25)
        };

        markers.push(new google.maps.Marker({
          map: this.mapObj,
          title: place.name,
          position: place.geometry.location
        }));

        if (place.geometry.viewport) {
          bounds.union(place.geometry.viewport);
        } else {
          bounds.extend(place.geometry.location);
        }
      });
      this.mapObj.fitBounds(bounds);
    });
  }
  /**
   * function to update dom with new map location
   * @param {number} newLat - latitude coordinate
   * @param {number} newLong - longitude coordinate
   */
  updateDom(newLat, newLong) {
    barCrawl.userPositionLat = newLat;
    barCrawl.userPositionLong = newLong;
    this.lat = newLat;
    this.lng = newLong;
    barCrawl.updateLocation();
  }
  /**
   * function to create route for destinations picked
   * @param {none}
   * @return {none}
   */
  calculateAndDisplayRoute() {
    var directionsService = new google.maps.DirectionsService;
    this.directionsRenderer = new google.maps.DirectionsRenderer;
    this.directionsRenderer.setMap(this.mapObj);
    this.directionsRenderer.setPanel(document.getElementById('directionsPanel'));
    var waypts = this.waypts;
    directionsService.route({
      origin: {lat: this.lat, lng: this.lng},
      destination: waypts.pop().location,
      waypoints: waypts,
      optimizeWaypoints: true,
      travelMode: 'DRIVING'
    }, (response, status) => {
      if (status === 'OK') {
        this.directionsRenderer.setDirections(response);
      } else {
        window.alert('Directions request failed due to ' + status);
      }
    });
  }
  /**
   * function to push destinations to route array
   * @param {string} type - of destination business or events
   * @param {number} index - index of destination in array
   * @return {none}
   */
  addRouteDestination(type, index){
    this.waypts.push({location: this.markers[type][index].position, stopover: true});
  }

}
