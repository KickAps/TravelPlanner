let map;
let global_markers = [];
let bounds;
let global_path = {};
let polyline;
let infowindow;
const icon_url = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png";

function initMap() {
    let map_container = document.getElementById("map");

    if (!map_container) {
        return;
    }

    map = new google.maps.Map(map_container, {
        center: { lat: 46.62825131575064, lng: 2.264533130591902 },
        zoom: 6,
        mapTypeId: "roadmap",
    });

    bounds = new google.maps.LatLngBounds();
    polyline = new google.maps.Polyline();
}

function createMarker(pos, name, address, url) {
    let scaledSize = new google.maps.Size(25, 25);
    let anchor = new google.maps.Point(13, 34);
    if (navigator.userAgentData.mobile) {
        scaledSize = new google.maps.Size(60, 60);
        anchor = new google.maps.Point(25, 80);
    }

    const icon = {
        url: icon_url,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: anchor,
        scaledSize: scaledSize,
    };

    const marker = new google.maps.Marker({
        map,
        icon,
        position: pos,
    });

    const contentString =
        '<div class="text-3xl lg:text-base">' +
        '<p><b>' + name + '</b></p>' +
        '<p>' + address + '</p>' +
        '<a href="' + url + '" target="_blank" rel="noopener" style="cursor: pointer; color: rgb(66, 127, 237); text-decoration: none;">View on Google Maps</a>' +
        '</div>';

    marker.addListener("click", () => {
        if (infowindow) {
            infowindow.close();
        }

        infowindow = new google.maps.InfoWindow({
            content: contentString
        });

        infowindow.open({
            anchor: marker,
            map,
        });
    });

    return marker;
}

export function initInputSearch(step_count, day_id) {
    // Create the search box and link it to the UI element.
    const input = document.getElementById(day_id + "_place" + step_count);

    let searchBox = new google.maps.places.SearchBox(input);

    // Bias the SearchBox results towards current map's viewport.
    map.addListener("bounds_changed", () => {
        searchBox.setBounds(map.getBounds());
    });

    let markers = [];

    // Listen for the event fired when the user selects a prediction and retrieve
    // more details for that place.
    searchBox.addListener("places_changed", () => {
        const places = searchBox.getPlaces();

        if (places.length == 0) {
            return;
        }

        // Clear out the old markers.
        markers.forEach((marker) => {
            marker.setMap(null);
        });
        markers = [];

        const step_id = day_id + "_step" + step_count;

        // For each place, get the icon, name and location.
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const marker = createMarker(place.geometry.location, place.name, place.formatted_address, place.url);

            markers.push(marker);

            let input_lat = document.getElementById(day_id + "_lat" + step_count);
            input_lat.value = marker.getPosition().lat();
            let input_lng = document.getElementById(day_id + "_lng" + step_count);
            input_lng.value = marker.getPosition().lng();
            let input_url = document.getElementById(day_id + "_url" + step_count);
            input_url.value = place.url;
            let input_name = document.getElementById(day_id + "_name" + step_count);
            input_name.value = place.name;

            // Path
            global_path[step_id] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
            setGlobalPath();

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        // Zoom
        global_markers[step_id] = markers;
        map.fitBounds(bounds);
    });
}

export function initTravel(data) {
    let day_count = 0;
    for (const [date, steps_data] of Object.entries(data)) {
        day_count++;
        for (let i = 0; i < steps_data.length; i++) {
            let markers = [];
            let step_count = i + 1;
            const step_id = "day" + day_count + "_step" + step_count;
            let pos = { lat: parseFloat(steps_data[i].lat), lng: parseFloat(steps_data[i].lng) };

            const marker = createMarker(pos, steps_data[i].name, steps_data[i].place, steps_data[i].url);

            markers.push(marker);
            global_markers[step_id] = markers;

            // Path
            global_path[step_id] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };

            bounds.union(new google.maps.LatLngBounds(pos));
        }
    }
    setGlobalPath();
    map.fitBounds(bounds);
}

export function removeMarkers(index) {
    let markers = global_markers[index];

    if (!markers) {
        return;
    }
    markers.forEach((marker) => {
        marker.setMap(null);
    });
    markers = [];
}

export function setGlobalPath() {
    let path_ordered = [];

    document.querySelectorAll(".step").forEach((step) => {
        if (global_path[step.id]) {
            path_ordered.push(global_path[step.id]);
        }
    });

    polyline.setMap(null);

    let strokeWeight = 2;
    if (navigator.userAgentData.mobile) {
        strokeWeight = 4;
    }

    polyline = new google.maps.Polyline({
        path: path_ordered,
        geodesic: true,
        strokeColor: "#DB5C51",
        strokeOpacity: 1.0,
        strokeWeight: strokeWeight,
    });

    polyline.setMap(map);
}

export function removePath(index) {
    delete global_path[index];
    setGlobalPath();
}

export function forceFitBounds() {
    map.fitBounds(bounds);
}


window.initMap = initMap;