var infowindow;
var directions;
var renderer;

var map;
     function initMap() {
        var markerArray = [];


        // Instantiate a directions service.
        var directionsService = new google.maps.DirectionsService;

        // Create a map and center it on ucsd.
         infowindow = new google.maps.InfoWindow();
         directions = new google.maps.DirectionsService();
         renderer = new google.maps.DirectionsRenderer({
             suppressPolylines: true,
             infoWindow: infowindow
         });
        map = new google.maps.Map(document.getElementById('map'), {
          zoom: 13,
          center: {lat: 32.879736, lng: -117.235934},
                    mapTypeControl: true,
          mapTypeControlOptions: false,
          disableDefaultUI: true

        });

        // Create a renderer for directions and bind it to the map.
        var directionsDisplay = new google.maps.DirectionsRenderer({map: map});

        // Instantiate an info window to hold step text.
        var stepDisplay = new google.maps.InfoWindow;

        // Display the route between the initial start and end selections.
        calculateAndDisplayRoute(
            directionsDisplay, directionsService, markerArray, stepDisplay, map);
        // Listen to change events from the start and end lists.
        var onChangeHandler = function() {
          calculateAndDisplayRoute();
        };


         console.log("about to load geoJson file!");
         // map.data.loadGeoJson('https://storage.googleapis.com/mapsdevsite/json/google.json');
         map.data.loadGeoJson('https://raw.githubusercontent.com/Meggolbek/MoveSafe/mapLayerSparrow/public/neighborhood_files/ZillowNeighborhoods-CA.json');


         // map.data.setStyle({
         //     fillColor: 'red',
         //     strokeWeight: 1
         // });

         // Color Capital letters blue, and lower case letters red.
         // Capital letters are represented in ascii by values less than 91
         map.data.setStyle(function(feature) {
             var regionid = feature.getProperty('RegionID');
             var type = regionid % 5;
             // var color = type == 0 ? '#f00' : '#0f0';
             var color;
             if(type == 0) {
                 color = '#009933';
             } else if (type == 1) {
                 color = '#99ff33';
             } else if (type == 2) {
                 color = '#ffff00';
             } else if (type == 3) {
                 color = '#ff9900';
             } else if (type == 4) {
                 color = '#ff0000';
             }
             return {
                 clickable:false,
                 fillColor: color,
                 strokeWeight: 1
             };
         });
     }

      function calculateAndDisplayRoute() {

        // Retrieve the start and end locations and create a DirectionsRequest using
        // WALKING directions.
        directions.route({
          origin: document.getElementById('origin-input').value,
          destination: document.getElementById('destination-input').value,
          provideRouteAlternatives: true,
          travelMode: 'WALKING'
        }, function(response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                if(renderer.getRouteIndex()==undefined){
                    renderer.setRouteIndex(0);
                    var ETA = response.routes[0].legs[0].duration.text;
                    var num = ETA.charCodeAt(0);
                    console.log(num);
                    var safetyLevel = (num % 5) + 1;
                    console.log(safetyLevel);
                    $("#safetyLevel").text("Safety Level: " + safetyLevel);
                    $("#ETA").text("ETA: " + ETA);
                };
                renderer.setDirections(response);
                renderer.setMap(map);
                //renderer.setPanel(panel);
                renderDirectionsPolylines(response);
            } else {
                $(".pathInfo").hide();
                $("#safetyLevel").hide();
                $("#ETA").hide();
                $("#map").text("Please press Search for a new place and enter in a valid place or address");
                $("#zillowDiv").hide();
            }
        });
      }

var selectedPolylineOptions = {
    strokeColor: '#9900cc',
    strokeOpacity: 3,
    strokeWeight: 3
};
var lineSymbol = {
    path: 'M 0,0,0,0',
    strokeOpacity: 1,
    scale: 4
};
var polylineOptions = {
    strokeColor: '#9900cc',
    strokeOpacity: 0,
    icons: [{
        icon: lineSymbol,
        offset: '0',
        repeat: '8px'
    }],
};

var polylines = [];
function renderDirectionsPolylines(response) {
    for (var i=0; i<polylines.length; i++) {
        polylines[i].setMap(null);
    }
    for(var a=0; a<response.routes.length; a++) {
        var legs = response.routes[a].legs;
        for (i = 0; i < legs.length; i++) {
            var steps = legs[i].steps;
            for (j = 0; j < steps.length; j++) {
                var nextSegment = steps[j].path;
                if(a==(renderer.getRouteIndex())){
                    var stepPolyline = new google.maps.Polyline(selectedPolylineOptions);
                }else {
                    var stepPolyline = new google.maps.Polyline(polylineOptions);
                }
                for (k = 0; k < nextSegment.length; k++) {
                    stepPolyline.getPath().push(nextSegment[k]);
                }
                polylines.push(stepPolyline);
                stepPolyline.setMap(map);
                // route click listeners, different one on each step
                stepPolyline.onClick = attachListener(a, stepPolyline, response);
            }
        }
    }
}
function attachListener(num, stepPolyline, response) {
    return google.maps.event.addListener(stepPolyline, 'click', function (evt) {
        renderer.setRouteIndex(num);
        var ETA = response.routes[num].legs[0].duration.text;
        var number = ETA.charCodeAt(0);
        safetyLevel = (number % 5) + 1;
        $("#safetyLevel").text("Safety Level: " + safetyLevel);
        $("#ETA").text("ETA: " + ETA);
        renderDirectionsPolylines(response);
        })
}
      function attachInstructionText(stepDisplay, marker, text, map) {
        google.maps.event.addListener(marker, 'click', function() {
          // Open an info window when the marker is clicked on, containing the text
          // of the step.
          stepDisplay.setContent(text);
          stepDisplay.open(map, marker);
        });
      }
google.maps.event.addDomListener(window, 'load', initMap);