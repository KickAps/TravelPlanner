let map;
let global_markers = [];
let bounds;
let global_path = {};
let polyline;
let infowindow;
const icon_url = "https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/geocode-71.png";

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 46.62825131575064, lng: 2.264533130591902 },
        zoom: 6,
        mapTypeId: "roadmap",
    });

    bounds = new google.maps.LatLngBounds();
    polyline = new google.maps.Polyline();
}

function createMarker(pos, name, address, url) {
    const icon = {
        url: icon_url,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(13, 34),
        scaledSize: new google.maps.Size(25, 25),
    };

    const marker = new google.maps.Marker({
        map,
        icon,
        position: pos,
    });

    const contentString =
        '<div>' +
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
    // TODO : fix
    let order = [];
    for (let i = 0; i < data.length; i++) {
        let markers = [];
        let step_count = i + 1;
        let pos = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lng) };

        const marker = createMarker(pos, data[i].name, data[i].place, data[i].url);

        markers.push(marker);
        global_markers[step_count] = markers;

        // Path
        global_path['step_' + step_count] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
        order[i] = 'step_' + step_count;

        bounds.union(new google.maps.LatLngBounds(pos));
    }

    setGlobalPath(order);
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

    polyline = new google.maps.Polyline({
        path: path_ordered,
        geodesic: true,
        strokeColor: "#FF0000",
        strokeOpacity: 1.0,
        strokeWeight: 2,
    });

    polyline.setMap(map);
}

export function removePath(index) {
    delete global_path[index];
    setGlobalPath();
}


window.initMap = initMap;