class Eventbrite {
  constructor(lat, lng) {
    this.key = 'YT37TJX32QTNUIJPS4NG';
    this.eventStorage = [];
    this.data = null;
    this.lat = lat;
    this.lng = lng;
    this.domContainer = $(".eventsContainer");
    this.render = this.render.bind(this);
  }

/**
* Retrives data from eventbrite server with AJAX Call.
* @param - none
* @return - Promise - resolve: response packet, reject: error response packet
*/

  retrieveData() {
    return new Promise((resolve, reject) =>
    {
      let today = new Date();
      let dateInput = `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate() + 7}T${today.getHours()}:${today.getMinutes()}:${today.getSeconds()}`;
      $.ajax({
        url: 'php/eventbrite.php',
        method: 'GET',
        dataType: 'JSON',
        headers: {
          'Authorization': 'Bearer YT37TJX32QTNUIJPS4NG'
        },
        data: {
          'location.longitude': `${this.lng}`,
          'location.latitude': `${this.lat}`,
          'categories': '103',
          'start_date.range_end': dateInput,
          'location.within': '10mi',
          'expand': 'venue'
        },
        success: (response) => {
          this.data = this.postProcessData(response);
          this.render();
          resolve(response);
        },
        error: (response) => {
          reject(response);
        }
      })
    })
  }

/**
* Cuts down response packet to first 20 entries
* @param (repsonse) - response packet
* @return - trimmed packet
*/

  postProcessData(response) {
    if(response.events.length < 20) {
      return response;
    }
    response.events.splice(20);
    return response;
  }

/**
* creates DOM elements for events sidebar
* @param - none
* @return - none
*/

  render(){
    for (let eventIndex = 0; eventIndex < this.data.events.length; eventIndex++){
      let thisEvent = this.data.events[eventIndex];
      let newEvent = {};
      let startDateTime =  this.parseDateTime(thisEvent.start.local);
      let endDateTime = this.parseDateTime(thisEvent.end.local);
      newEvent.name = thisEvent.name.html;
      newEvent.description = thisEvent.description;
      newEvent.address = thisEvent.venue.localized_multi_line_address_display;
      newEvent.lat = thisEvent.venue.address.latitude;
      newEvent.lng = thisEvent.venue.address.longitude;
      this.eventStorage.push(newEvent);
      let eventDom = $("<div>", {
        id: "event"+eventIndex,
        class: "event event" + eventIndex,
        html: `<div class="event-name">${newEvent.name}</div>
              <div class="address">${thisEvent.venue.address.localized_multi_line_address_display[0]}
              <br>${thisEvent.venue.address.localized_multi_line_address_display[1]}</div>
              <div class='event-time'>${startDateTime.month}/${startDateTime.dayNum} ${startDateTime.hour}:${startDateTime.minute} ${startDateTime.ampm} - ${endDateTime.hour}:${endDateTime.minute} ${endDateTime.ampm}</div>
              <div class="event-info">Event Summary:<br>${thisEvent.summary}</div>
              <a class="event-url" href="${thisEvent.url} target=_blank">Visit Event Site</a>`});

      eventDom.css('background-image', `url('assets/images/icons8-event-64.png')`)
      this.domContainer.append(eventDom);
    }
  }

/**
* splits up date from packet into object with keys
* @param {string} - str: date from repssonse packet
* @return {object} - object with date components as keys
*/

  parseDateTime(str){
    let date = new Date(str);
    let minute = date.getMinutes();
    if (!minute){
      minute = '00'
    }
    let ampm = null;
    let hour = date.getHours();
    if (hour > 12 ){
      hour -= 12;
      ampm = "PM"
    }
    else{
      ampm = "AM"
    }
    return {
      dayNum: date.getDate(),
      month: date.getMonth(),
      hour: hour,
      minute: minute,
      ampm: ampm
    }
  }


  /**
  * converts data to be able to be rendered to dom
  * @param {string} type - lat or lng
  * @param {num} id - id of business
  * @return {num} - lat or lng of business
  *
  */
  getCoordinatesById(type, id) {
    switch (type) {
      case 'lat':
        return this.eventStorage[id].lat;
        break;
      case 'lng':
        return this.eventStorage[id].lng;
        break;
    }
  }

}
