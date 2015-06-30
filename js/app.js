//The places model which holds all of the information about the different tourist attractions
//That will be included on the neighbourhood map

var Places = [
    {
        title: "Ripleys Aquarium of Canada",
        lat: 43.642403,
        lng: -79.385971,
        url: "https://www.ripleyaquariums.com/canada/"
    },
    {
        title: "Exhibition Place",
        lat: 43.6322512,
        lng: -79.419566,
        url: "http://www.explace.on.ca/"
    },
    {
        title: "Ontario Place",
        lat: 43.6280839,
        lng: -79.4137697,
        url: "http://www.ontarioplace.com/"
    },
    {
        title: "Air Canada Centre",
        lat: 43.6434661,
        lng: -79.3790989,
        url: "http://www.theaircanadacentre.com/"
    },
    {
        title: "Rogers Centre",
        lat: 43.6414378,
        lng: -79.3893532,
        url: "http://www.rogerscentre.com/"
    },
    {
        title: "CN Tower",
        lat: 43.6425662,
        lng: -79.3870568,
        url: "http://www.cntower.ca/"
    },
    {
        title: "Hockey Hall of Fame",
        lat: 43.6472722,
        lng: -79.3776902,
        url: "https://www.hhof.com/"
    },
    {
        title: "Metro Toronto Convention Centre",
        lat: 43.6430406,
        lng: -79.3852705,
        url: "http://www.mtccc.com/"
    },
    {
        title: "Princess of Wales Theatre",
        lat: 43.6468156,
        lng: -79.389154,
        url: "http://www.mirvish.com/"
    },
    {
        title: "Art Gallery Of Ontario",
        lat: 43.6536066,
        lng: -79.3925123,
        url: "www.ago.net/"
    }
    ];

//Function to take the places and turn them into knockout observables
var Markers = function(data){
    "use strict";
    
    this.title = ko.observable(data.title);
    this.lat = ko.observable(data.lat);
    this.lng = ko.observable(data.lng);
    this.marker = ko.observable();
    this.rating = ko.observable();
    this.url = ko.observable(data.url);
};

var MapModel = function(){
    "use strict";
    
    var mapModel = this;
    mapModel.placeList = ko.observableArray([]);
    
    //Loop through each of the places in the Places model and push them to the knockout observable array
    Places.forEach(function(placeLocation){
        mapModel.placeList.push(new Markers(placeLocation));
    });
    
    //Information window for markers which is activated on click
    var infoWindow = new google.maps.InfoWindow();
    
    
    //Google maps DOM listener so that the map is responsive
    google.maps.event.addDomListener(window, "resize", function() {
      var center = map.getCenter();
      google.maps.event.trigger(map, "resize");
      map.setCenter(center); 
    });
    
    //Empty variable initialized to hold our marker data
    var mark;
    
    this.placeList().forEach(function(placeLocation){
        mark = new google.maps.Marker({
            position: new google.maps.LatLng(placeLocation.lat(), placeLocation.lng()),
            map: map,
            title: placeLocation.title(),
            animation: google.maps.Animation.DROP
        });
        
        //Set the marker variable that was created earlier equal to a new marker for each the locations 
        placeLocation.marker = mark;
        
        //Foursquare API information
        
        var fourSquareClientId = "2MPQTPFCBK4V1UKJNOUFMGWSOGY05GPKZ31MCNFYYQFG3QF2";
        var fourSquareSecret = "VSIPHTOFVE0C24BAW34ONE1V2RZH2DKE4HY5NGXYC03JZYXT";

        var requestUrl = 'https://api.foursquare.com/v2/venues/explore?limit=1&ll=' + placeLocation.lat() + ',' + placeLocation.lng() + '&intent=match&query=' + placeLocation.title() + '&client_id=' + fourSquareClientId + '&client_secret=' + fourSquareSecret + '&v=20150629';
        
        var name, urlResult, url, rating, street, district;
        
        //AJAX request from the foursquare API
        $.getJSON(requestUrl, function(data){
            urlResult = data.response.groups[0].items[0].venue;
            placeLocation.name = urlResult.name;
            placeLocation.url = urlResult.url;
            placeLocation.rating = urlResult.rating;
            placeLocation.street = urlResult.location.formattedAddress[0];
            placeLocation.district = urlResult.location.formattedAddress[1];
        }).error(function(e){
            $('span').text('Please reopen this window');
        });
        
        //Initialize the bounce animation for the markers here
        function bounce(){
            if(placeLocation.marker.getAnimation() != null){
                placeLocation.marker.setAnimation(null);
            } else {
                placeLocation.marker.setAnimation(google.maps.Animation.BOUNCE);
            }
        };
        
        //Set the content of the information window for the selected map marker
        google.maps.event.addListener(placeLocation.marker, 'click', function(){
            bounce();
            setTimeout(bounce, 2000);
            setTimeout(function(){
                infoWindow.setContent('<h3>' + placeLocation.name + '</h3>\n<p><b>Rating: </b>' + placeLocation.rating + '</p>\n<a href=' + placeLocation.url + '>' + placeLocation.url + '</a>\n<p><b>Address:</b></p>\n<p>' + placeLocation.street + '</p>\n<p>' + placeLocation.district + '</p>');
                infoWindow.open(map, placeLocation.marker);
            }, 200);
        });
        
        //Implementation of the filtering function which uses the map page search text box
        mapModel.filter = function(){
            
            var input = $("#search").val();
            input = input.toLowerCase().replace(/\b[a-z]/g, function(mapModel){
                return mapModel.toUpperCase();
            }),
                
                $(".location > li").each(function(){
                    $(this).text().search(input) > -1 ? $(this).show() : $(this).hide();
            });
            
            for(var i = 0; i < this.placeList().length; i++) {
                mapModel.placeList()[i].marker.setMap(mapModel.placeList()[i].marker.title.search(input) > -1 ? map : null);
            }
        };
    });
     
    //Display the information for the given map marker on click
    mapModel.displayInfo = function(placeLocation){
        google.maps.event.trigger(placeLocation.marker, 'click');
    }
};
   

    //Initialise the map to center on downtown Toronto where the tourist attractions are
    //With a zoom of 14 to get closer without the need to manually zoom
    var map = new google.maps.Map(document.getElementById('map-canvas'), {
        center: new google.maps.LatLng(43.645409, -79.382172),
        zoom: 14,
        
    });
    
    //Apply the knockout bindings on document load
    $(document).ready(function(){
        ko.applyBindings(new MapModel());
    });
    