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

function createMarker(pos) {
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

    return marker;
}

export function initInputSearch(step_count, input_index, order) {
    // Create the search box and link it to the UI element.
    const inputs = document.getElementsByClassName("pac-input");

    let input = inputs[input_index];

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

        // For each place, get the icon, name and location.
        places.forEach((place) => {
            if (!place.geometry || !place.geometry.location) {
                console.log("Returned place contains no geometry");
                return;
            }

            const marker = createMarker(place.geometry.location);

            const contentString =
                '<div>' +
                '<b>' + place.formatted_address + '</b>' +
                '</div>' +
                '<a href="' + place.url + '" target="_blank" rel="noopener" style="cursor: pointer; color: rgb(66, 127, 237); text-decoration: none;">View on Google Maps</a>';

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

            markers.push(marker);

            let input_lat = document.getElementById("lat_" + step_count);
            input_lat.value = marker.getPosition().lat();
            let input_lng = document.getElementById("lng_" + step_count);
            input_lng.value = marker.getPosition().lng();

            // Path
            global_path['step_' + step_count] = { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
            setGlobalPath(order);

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        // Zoom
        global_markers[step_count] = markers;
        map.fitBounds(bounds);
    });
}

export function initTravel(data) {
    let order = [];
    for (let i = 0; i < data.length; i++) {
        let markers = [];
        let step_count = i + 1;
        let pos = { lat: parseFloat(data[i].lat), lng: parseFloat(data[i].lng) };

        const marker = createMarker(pos);

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

function setGlobalPath(order) {
    let path_ordered = [];

    for (const key in order) {
        path_ordered.push(global_path[order[key]]);
    }

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

export function removePath(index, order) {
    delete global_path[index];
    setGlobalPath(order);
}


window.initMap = initMap;