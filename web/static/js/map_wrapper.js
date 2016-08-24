/**
 * Set the location in the given input.
 * That means set the input text, latitude and longitude
 */
function set_location(input, lat, lng, formatted_address){
    input.value = formatted_address;
    input.setAttribute("data-lat", lat);
    input.setAttribute("data-lng", lng);
}



/***********************************************************/

var AccesibleMap = {};

AccesibleMap.accesible_icon_path = '';
AccesibleMap.marker_origin = null;
AccesibleMap.marker_destination = null;
AccesibleMap.search_markers = [];
AccesibleMap.search_marker_groups = [];

/**
 * Remove previous markers in the map
 */
AccesibleMap.clean_map = function(){
    // Clean previous results
    AccesibleMap.search_markers.map(function (marker) {
        AccesibleMap.mapa.removeLayer(marker);
    });
};

/**
 * Setup search UI
 */
AccesibleMap.setup_google_search = function () {
    //http://stackoverflow.com/a/34716954/1345165
    var map = AccesibleMap.mapa;

    // Clean previous results
    AccesibleMap.clean_map();

    // Setup the From input
    var input_from = document.getElementById("route-from");
    AccesibleMap.input_from = input_from;
    var searchbox_from = new google.maps.places.SearchBox(input_from);
    searchbox_from.addListener('places_changed', function () {
        var places = searchbox_from.getPlaces();

        if (places.length == 0) {
            return;
        }

        var result = places[0];  // We just need the first result
        var title = result.formatted_address;
        var pos = [result.geometry.location.lat(),
                result.geometry.location.lng()];
        console.log('generate route');
    });

    // Setup the To input
    var input_to = document.getElementById("route-to");
    AccesibleMap.input_to = input_to;
    var searchbox_to = new google.maps.places.SearchBox(input_to);
    searchbox_to.addListener('places_changed', function () {
        var places = searchbox_to.getPlaces();

        if (places.length == 0) {
            return;
        }

        var result = places[0];  // We just need the first result
        var title = result.formatted_address;
        var pos = [result.geometry.location.lat(),
                result.geometry.location.lng()];
        console.log('generate route');
    });

    // Setup the search input
    var input_search = document.getElementById("search-input");
    AccesibleMap.input_search = input_search;
    var searchBox = new google.maps.places.SearchBox(input_search);
    searchBox.addListener('places_changed', function () {
        // Clean the map from previous results
        AccesibleMap.clean_map();

        var places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        var result = places[0];  // We just need the first result
        var title = result.formatted_address;
        var pos = [result.geometry.location.lat(),
                result.geometry.location.lng()];
        var attr = "'" + title + "',[" + pos + "]";
        var html_title = title +
            '<div class="text-center">' +
            '<a href="#" class="btn btn-default btn-xs" onclick="AccesibleMap.add_destination_and_calc_route(' + attr + ');">Ir Aqui</a>' +
            '</>';
        var marker = AccesibleMap.add_marker(pos, html_title);
        marker.openPopup();
    });
};

AccesibleMap.set_location_in_input = function(input, lat, lng, callback){
    var url = "https://maps.googleapis.com/maps/api/geocode/json?latlng=" + lat + "," + lng + "&sensor=false&key=AIzaSyB9vvH3_yypmEd4HCxvd2OtIbBk7PgbuOE";
    $.get(url).done(function (response) {

        // Fill the origin input with the location details
        var result = response.results[0];
        var formatted_address = result.formatted_address;
        var lat = result.geometry.location.lat;
        var lng = result.geometry.location.lng;
        set_location(input, lat, lng, formatted_address);

        // Add the marker
        callback(lat, lng, formatted_address);

        // Change the view to 'directions'
        AccesibleMap.change_search_mode('directions');

        if (AccesibleMap.marker_origin != null && AccesibleMap.marker_destination != null){
            // Calculate route
            AccesibleMap.draw_complete_route();
        }

    }).fail(function () {
        console.log("Couldn't find location: " + url);
    });
};

AccesibleMap.setup = function () {
    // Setup context menu
    function directions_from_here (e) {
        var callback_origin = function (lat, lng, tooltip_text) {
            // If exists, remove previous origin marker
            if (AccesibleMap.marker_origin != null) {
                AccesibleMap.mapa.removeLayer(AccesibleMap.marker_origin);
                AccesibleMap.marker_origin = null;
            }

            // Add a marker
            var pos = [lat, lng];
            var marker = AccesibleMap.add_marker(pos, tooltip_text);
            marker.openPopup();
            AccesibleMap.marker_origin = marker;
        };
        AccesibleMap.set_location_in_input(AccesibleMap.input_from, e.latlng.lat, e.latlng.lng, callback_origin);
    }

    function directions_to_here(e) {
        var callback_destination = function (lat, lng, tooltip_text) {
            // If exists, remove previous origin marker
            if (AccesibleMap.marker_destination != null) {
                AccesibleMap.mapa.removeLayer(AccesibleMap.marker_destination);
                AccesibleMap.marker_destination = null;
            }

            // Add a marker
            var pos = [lat, lng];
            var marker = AccesibleMap.add_marker(pos, tooltip_text);
            marker.openPopup();
            AccesibleMap.marker_destination = marker;
        };
        AccesibleMap.set_location_in_input(AccesibleMap.input_to, e.latlng.lat, e.latlng.lng, callback_destination);
    }

    var context_menu = {
        contextmenu: true,
        contextmenuWidth: 140,
        contextmenuItems: [{
            text: 'Directions from here',
            callback: directions_from_here
        }, {
            text: 'Directions to here',
            callback: directions_to_here
        }]
    };

    // Setup the basic map
    var mapa = L.map('map', context_menu);
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}', {
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a>',
        maxZoom: 20,
        id: 'dnaranjo89.97a21b99',
        accessToken: 'pk.eyJ1IjoiZG5hcmFuam84OSIsImEiOiJjaWc1Z2p4ZTc0MW0ydWttM3Mxem44cmVlIn0.qYwIDUVfbIQ2x2a9IQgg-g'
    }).addTo(mapa);
    AccesibleMap.mapa = mapa;

    // Set up search functionality
    AccesibleMap.setup_google_search();

    // TODO Remove this, it's just for development
    mapa.setView([39.472499, -6.376273], 15);
    //new L.Control.Zoom({ position: 'bottomright' }).addTo(mapa);

    $("#search-btn").click(function () {
        var input = document.getElementById('search-input');
        google.maps.event.trigger(input, 'focus');
        google.maps.event.trigger(input, 'keydown', {
            keyCode: 13
        });
    });

    $("#current-loc-icon").click(function () {
        AccesibleMap.add_origen_current_loc();
    });
    $("#show-current-pos").change(function () {
        AccesibleMap.show_current_location(this.checked);
    });
    $("#show-accessible-parkings").change(function () {
        AccesibleMap.show_accessible_parkings(this.checked);
    });

    $("#calculate-route").click(function () {
        if (AccesibleMap.allow_geolocation) {
            AccesibleMap.add_origen_current_loc();
        }
        AccesibleMap.draw_complete_route();
    });
};

AccesibleMap.test_route = function () {
    var origen = L.latLng(39.474346, -6.375368);
    var parking = L.latLng(39.473684, -6.377592);
    var destination = L.latLng(39.473949, -6.378597);
    var avoid_stairs = true;
    AccesibleMap.draw_complete_route(origen, parking, destination, avoid_stairs);
};

AccesibleMap.routes_markers = [];
AccesibleMap.routes_lines = [];

AccesibleMap.draw_complete_route = function () {
    // Remove previous routes
    AccesibleMap.routes_markers.map(function (marker) {
        AccesibleMap.mapa.removeLayer(marker);
    });
    AccesibleMap.routes_lines.map(function (line) {
        AccesibleMap.mapa.removeControl(line);
    });

    // Draw route
    var $origen = $('#route-from');
    var origen = [$origen.attr('data-lat'), $origen.attr('data-lng')];
    var parking = null;
    var $destination = $('#route-to');
    var destination = [$destination.attr('data-lat'), $destination.attr('data-lng')];
    var step_penalty = $('#avoid-steps').is(":checked");

    var callback_get_parking = function (data) {
        var plazas = [];
        for (i = 0; i < data.results.bindings.length; i++) {
            plazas.push([data.results.bindings[i].geo_lat_plaza.value, data.results.bindings[i].geo_long_plaza.value]);
        }
        console.log(plazas);
        var best_parking = plazas[0];
        console.log("origen:" + origen);
        console.log("destino:" + destination);
        AccesibleMap.routes_markers = [];
        AccesibleMap.routes_markers.push(AccesibleMap.add_marker(best_parking, "Parking", "parking"));
        AccesibleMap.routes_lines.push(AccesibleMap.calculate_route_pedestrian(best_parking, destination, step_penalty).addTo(AccesibleMap.mapa));
        AccesibleMap.routes_lines.push(AccesibleMap.calculate_route_auto(origen, best_parking).addTo(AccesibleMap.mapa));
    };

    var parkings = AccesibleMap.get_closest_parking(destination, callback_get_parking);
    console.log(destination);
    console.log(parkings);

};


AccesibleMap.search_nominatim = function (query) {
    // Clean previous results
    AccesibleMap.search_markers.map(function (marker) {
        AccesibleMap.mapa.removeLayer(marker);
    });

    var num_results = 1;
    //var url = "http://nominatim.openstreetmap.org/search?q=" + query + "&format=json";
    var url = " http://nominatim.openstreetmap.org/search?q=135+pilkington+avenue,+birmingham";
    $.get(url).done(function (response) {
        response.features.map(function (location) {
            var pos = [location.lat, location.lon];
            var title = location.display_name;
            var attr = "'" + title + "',[" + pos + "]";
            var html_title = location.properties.label +
                '<div class="text-center">' +
                '<a href="#" class="btn btn-default btn-xs" onclick="AccesibleMap.add_destination_and_calc_route(' + attr + ');">Ir Aqui</a>' +
                '</>';
            var marker = AccesibleMap.add_marker(pos, html_title);
            marker.openPopup();
            AccesibleMap.search_markers.push(marker);
        });
    }).fail(function () {
        console.log("Couldn't find location: " + url);
    });
};

AccesibleMap.search = function (query) {
    // Clean previous results
    AccesibleMap.search_markers.map(function (marker) {
        AccesibleMap.mapa.removeLayer(marker);
    });

    var num_results = 1;
    var url = "https://search.mapzen.com/v1/autocomplete?api_key=search-AU6x3Ho&text=" + query + "&boundary.country=ES&size=" + num_results;
    $.get(url).done(function (response) {
        response.features.map(function (location) {
            var cords = location.geometry.coordinates;
            var pos = [cords[1], cords[0]];
            var title = location.properties.label;
            var attr = "'" + title + "',[" + pos + "]";
            var html_title = location.properties.label +
                '<div class="text-center">' +
                '<a href="#" class="btn btn-default btn-xs" onclick="AccesibleMap.add_destination_and_calc_route(' + attr + ');">Ir Aqui</a>' +
                '</>';
            var marker = AccesibleMap.add_marker(pos, html_title);
            marker.openPopup();
            AccesibleMap.search_markers.push(marker);
        });
    }).fail(function () {
        console.log("Couldn't find location: " + url);
    });
};

AccesibleMap.add_origen_current_loc = function () {
    AccesibleMap.show_current_location(true);
    navigator.geolocation.getCurrentPosition(function (current_pos) {
        var $origen = $('#route-from');
        $origen.attr("data-lat", current_pos[0]);
        $origen.attr("data-lng", current_pos[1]);
    });
    $('#route-from').val("Posici�n actual");
};

/**
 * Show the panel given as parameter.
 * It may be 'search' or 'directions'
 */
AccesibleMap.change_search_mode = function (mode){
    if (mode=='search'){
        $('#frame-search').toggleClass('hidden', false);
        $('#frame-route').toggleClass('hidden', true);
    } else {
        $('#frame-search').toggleClass('hidden', true);
        $('#frame-route').toggleClass('hidden', false);
    }
};

AccesibleMap.add_destination_and_calc_route = function (title, destination) {
    // Switch to route frame
    AccesibleMap.change_search_mode('directions');

    // Update destination field
    var $destination = $('#route-to');
    $destination.val(title);
    $destination.attr("data-lat", destination[0]);
    $destination.attr("data-lng", destination[1]);

    if (AccesibleMap.allow_geolocation) {
        AccesibleMap.add_origen_current_loc();
        AccesibleMap.draw_complete_route();
    }
};

AccesibleMap.current_location_markers = [];

AccesibleMap.show_current_location = function (enable_location) {
    if (enable_location) {
        function onLocationFound(e) {
            var radius = e.accuracy / 2;
            AccesibleMap.current_location_markers.push({
                marker: L.marker(e.latlng).addTo(AccesibleMap.mapa).bindPopup("<div class='text-center'>Est�s aqu�<br> (precisi�n " + radius + " metros)</div>").openPopup(),
                circle: L.circle(e.latlng, radius).addTo(AccesibleMap.mapa)
            });
            var $origen = $('#route-from');
            $origen.attr("data-lng", e.latlng.lng);
            $origen.attr("data-lat", e.latlng.lat);
        }

        function onLocationError(e) {
            alert(e.message);
        }

        AccesibleMap.mapa.on('locationfound', onLocationFound);
        AccesibleMap.mapa.on('locationerror', onLocationError);
        AccesibleMap.mapa.locate({setView: true, maxZoom: 16});
    } else {
        // Clean previous current locations
        AccesibleMap.current_location_markers.map(function (marker) {
            AccesibleMap.mapa.removeLayer(marker.marker);
            AccesibleMap.mapa.removeLayer(marker.circle);
        });

        AccesibleMap.mapa.removeLayer(AccesibleMap.current_location_marker['marker']);
        AccesibleMap.mapa.removeLayer(AccesibleMap.current_location_marker['circle']);
    }
    AccesibleMap.allow_geolocation = enable_location;
};

AccesibleMap.markers_parking = [];

AccesibleMap.show_accessible_parkings = function (show_parkings) {
    if (show_parkings) {
        var callback_show_parkings = function (data) {
            var plazas = [];
            for (i = 0; i < data.results.bindings.length; i++) {
                plazas.push([data.results.bindings[i].geo_lat.value, data.results.bindings[i].geo_long.value]);
                var location = [data.results.bindings[i].geo_lat.value, data.results.bindings[i].geo_long.value];
                AccesibleMap.markers_parking.push(AccesibleMap.add_marker(location, "parking", "parking"));
            }
        };
        AccesibleMap.get_all_parkings(callback_show_parkings);
    } else {
        // Clean previous parkings
        AccesibleMap.markers_parking.map(function (marker) {
            AccesibleMap.mapa.removeLayer(marker);
        });
    }
};

/**
 * Internal functions
 */

AccesibleMap.add_marker = function (location, title, type) {
    var options = {
        "title": title,
    };
    if (type == "parking") {
        options['icon'] = L.icon({
            iconUrl: AccesibleMap.accesible_icon_path,
            iconSize: [38, 38], // size of the icon
            iconAnchor: [22, 22], // point of the icon which will correspond to marker's location
            popupAnchor: [-3, -76] // point from which the popup should open relative to the iconAnchor
        });
    }
    var marker = L.marker(location, options).addTo(AccesibleMap.mapa).bindPopup(title);
    AccesibleMap.search_markers.push(marker);
    return marker;
};

AccesibleMap.calculate_route_auto = function (origen, destination) {
    var waypoints = [origen, destination];
    var costing_options = {};
    var mode = "auto";
    return AccesibleMap.calculate_route(waypoints, mode, costing_options);
};

AccesibleMap.calculate_route_pedestrian = function (origen, destination, avoid_stairs) {
    var waypoints = [origen, destination];
    var step_penalty = avoid_stairs ? 99999 : 0;
    var costing_options = {"pedestrian": {"step_penalty": step_penalty}};
    var mode = "pedestrian";
    return AccesibleMap.calculate_route(waypoints, mode, costing_options);
};

AccesibleMap.calculate_route = function (waypoints, mode, costing_options) {
    var styles = [
        {color: 'white', opacity: 0.8, weight: 12},
        {color: '#2676C6', opacity: 1, weight: 6}
    ];
    styles[1].color = (mode == "pedestrian") ? '#76c626' : '#2676C6';

    var options = {
        parking_route: mode,
        waypoints: waypoints,
        lineOptions: {
            styles: styles
        },
        router: L.Routing.mapzen('valhalla-dWJ_XBA', {costing: mode}, costing_options),
        formatter: new L.Routing.mapzenFormatter()
    };

    return L.Routing.control(options);
};


/**
 *  Opendata Queries
 */

AccesibleMap.get_closest_parking = function (location, callback_get_parking) {
    var pk = "select ?uri ?geo_lat_plaza ?geo_long_plaza ?distancia {" +
        "{select ?uri ?geo_lat_plaza ?geo_long_plaza ((bif:st_distance(bif:st_point(" +
        "\"" + location[0] + "\"^^xsd:decimal," +
        "\"" + location[1] + "\"^^xsd:decimal),bif:st_point(?geo_lat_plaza,?geo_long_plaza))) AS ?distancia) where{" +
        "?uri a om:PlazaMovilidadReducida ." +
        "?uri geo:lat ?geo_lat_plaza ." +
        "?uri geo:long ?geo_long_plaza ." +
        "}order by asc (?distancia) } FILTER (?distancia < 1) }limit 3";

    var plazas = [];

    var graphQuerySPARQL = "";
    var preQuerySPARQL = "http://opendata.caceres.es/sparql";

    $.ajax({
        data: {"default-graph-uri": graphQuerySPARQL, query: pk, format: 'json'},
        url: preQuerySPARQL,
        cache: false
    }).done(callback_get_parking);
};


AccesibleMap.get_all_parkings = function (callback_parkings) {

    var query = "select ?URI ?geo_lat ?geo_long where{" +
        "?URI a om:PlazaMovilidadReducida." +
        "?URI om:situadoEnVia ?om_situadoEnVia." +
        "?URI geo:lat ?geo_lat." +
        "?URI geo:long ?geo_long." +
        "}";

    var plazas = [];

    var graphQuerySPARQL = "";
    var preQuerySPARQL = "http://opendata.caceres.es/sparql";

    $.ajax({
        data: {"default-graph-uri": graphQuerySPARQL, query: query, format: 'json'},
        url: preQuerySPARQL,
        cache: false
    }).done(callback_parkings);

    return (plazas);

};