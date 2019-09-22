class App {
  constructor() {
    this.apiList = {};
    this.userPositionLat = null;
    this.userPositionLong = null;
    this.domElements = {
      tabSelected: null,
      containerSelected: null,
    };
    this.retrieveUserPositon = this.retrieveUserPositon.bind(this);
    this.initApp = this.initApp.bind(this);
    this.domClickHandler = this.domClickHandler.bind(this);
    this.expandAndCollapse = this.expandAndCollapse.bind(this);
    this.tabClickHandler = this.tabClickHandler.bind(this);
  }

/**
* Gets position of user at app start
* @param - none
* @return - none
*/

  initApp() {
    navigator.geolocation.getCurrentPosition(this.retrieveUserPositon);
  }

/**
* Updates location from user entry, updates DOM and map
* @param - none
* @return - none
*/

  updateLocation() {
    this.apiList.map.clearMarkers();
    $('.eventsContainer').empty();
    $('.businessContainer').empty();
    $('.weatherContainer').empty();
    $('.destinationsAdded').empty();
    $('.directionsPanel').empty();
    const userMarker = new Marker(this.apiList.map.mapObj, { name: "You" }, undefined, this.apiList.map.updateLocation, this.apiList.map.closeWindows, this.apiList.map.expandClickHandler);
    userMarker.renderUser({
      lat: this.userPositionLat,
      lng: this.userPositionLong
    });
    this.apiList.map.markers.user = userMarker;
    this.initAJAX();
  }

/**
* Sets lat and lng, calls init methods
* @param {object} - object returned from initApp()
* @return - none
*/

  retrieveUserPositon(data) {
    this.userPositionLat = data.coords.latitude;
    this.userPositionLong = data.coords.longitude;
    this.initializeMap();
    this.initAJAX();
    this.initClickHandlers();
  }

/**
* Instantiates map
* @param - none
* @return - none
*/

  initializeMap() {
    this.apiList['map'] = new googleMap(this.userPositionLat, this.userPositionLong, this.expandAndCollapse);
    this.apiList.map.initMap();
  }

/**
* Instantiates API classes, calls retrieveData methods for each class, updates DOM
* @param - none
* @return - none
*/

  initAJAX() {
    this.apiList['eventbrite'] = new Eventbrite(this.userPositionLat, this.userPositionLong);
    this.apiList['yelp'] = new Yelp(this.userPositionLat, this.userPositionLong);
    this.apiList['weather'] = new WeatherData(this.userPositionLat, this.userPositionLong);

    this.apiList.weather.getWeatherData();

    this.apiList.eventbrite.retrieveData().then(data => this.apiList.map.addEvents(data.events))
                                          .catch(data => console.log(data));

    this.apiList.yelp.retrieveData().then(data => {
                                                    this.apiList.map.addBiz(data.businesses);
                                                    this.loadScreenHandler();
                                                  })
                                    .catch(data => console.log(data));
  }

/**
* creates click handlers for DOM elements
* @param - none
* @return - none
*/

  initClickHandlers(){
    this.domElements.tabSelected = $('.tabBars');
    this.domElements.containerSelected = $('.businessContainer');
    $('.eventsContainer').on('click', '.event', this.domClickHandler);
    $('.businessContainer').on('click', '.business', this.domClickHandler);
    $('.mapContainer').on('click', '.addLocation', this.addLocationClickHandler);
    $('.calculateRoute').on('click', this.apiList.map.calculateAndDisplayRoute);
    $('.tabContainer').on('click', '.tab', this.tabClickHandler);
  }

/**
* click handler for loading screen
* @param - none
* @return - none
*/

  loadScreenHandler() {
    $('.loading_icon').toggleClass('hidden');
    let loadScreenDom = $(".loading_screen");
    loadScreenDom.addClass('slide_to_top');
  }

/**
* click handler for DOM elements
* @param {object} - event
* @return - none
*/
  domClickHandler(event) {
    if ($(event.target).is("a")){
      return;
    }
    this.expandAndCollapse($(event.currentTarget));
  }

  tabClickHandler(event){
    let element = $(event.currentTarget);
    this.domElements.tabSelected.removeClass('tabSelected');
    element.addClass('tabSelected');
    this.domElements.tabSelected = element;
    let container = $('.' + element.text().toLowerCase());
    this.domElements.containerSelected.addClass('hidden');
    container.removeClass('hidden');
    this.domElements.containerSelected = container;
  }

/**
* expands/contracts DOM elements in the side bar
* @param {object} - jQuery object
* @return - none
*/

  expandAndCollapse(element) {
    let lastLetter = element.attr('id').match(/\d+/);
    if (element.hasClass('business')) {
      this.apiList.map.updateLocation({ lat: parseFloat(this.apiList.yelp.getCoordinatesById('lat', lastLetter)),
                                        lng: parseFloat(this.apiList.yelp.getCoordinatesById('lng', lastLetter))});
      if (element.hasClass("expanded")){
        $(".business").removeClass("collapsed");
        $(".business").removeClass("expanded");
        return;
      }
      else{
        $(".business").removeClass("expanded");
        $(".business").addClass("collapsed")
        element.removeClass("collapsed").addClass("expanded");
      }
    } else {
      this.apiList.map.updateLocation({ lat: parseFloat(this.apiList.eventbrite.getCoordinatesById('lat', lastLetter)),
                                        lng: parseFloat(this.apiList.eventbrite.getCoordinatesById('lng', lastLetter))});
      if (element.hasClass("expanded")) {
        $(".event").removeClass("collapsed");
        $(".event").removeClass("expanded");
        return;
      }
      else {
        $(".event").removeClass("expanded");
        $(".event").addClass("collapsed")
        element.removeClass("collapsed").addClass("expanded");
      }
    }
  }

/**
* click handler for adding markers to the route
* @param {object} - event object
* @return - none
*/

  addLocationClickHandler(event) {
    let target = $(event.currentTarget);
    target.removeClass("addLocation").text("Added to route");
    let clickId = target.attr('id');
    let type = '';
    var newDom = null;
    if (clickId.includes("business")){
      newDom = $('.business.' + clickId).clone();
      newDom.addClass('destination');
      type = "biz";
      clickId = clickId.substr(8);
    } else {
      newDom = $('.event.' + clickId).clone();
      newDom.addClass('destination');
      type = "events";
      clickId = clickId.substr(5);
    }
    $('.destinationsAdded').append(newDom);
    this.apiList['map'].addRouteDestination(type, clickId);
  }

}
