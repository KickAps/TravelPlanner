import home_icon from '../logo/home_icon.png';
import star_icon from '../logo/star_icon.png';

let map;
let global_home_markers = [];
let global_star_markers = [];
let bounds;
let global_path = {};
let polyline;
let infowindow;

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

function createMarker(pos, name, address, url, home = false) {
    let scaledSize = new google.maps.Size(25, 25);
    let anchor = new google.maps.Point(10, 8);
    if (navigator.userAgentData.mobile) {
        scaledSize = new google.maps.Size(45, 45);
        anchor = new google.maps.Point(20, 10);
    }

    const icon = {
        url: home ? home_icon : star_icon,
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
        '<a href="' + url + '" target="_blank" rel="noopener" style="cursor: pointer; color: rgb(66, 127, 237); text-decoration: none; outline: none;">View on Google Maps</a>' +
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

function getPos(marker) {
    return { lat: marker.getPosition().lat(), lng: marker.getPosition().lng() };
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

            if (place.geometry.viewport) {
                // Only geocodes have viewport.
                bounds.union(place.geometry.viewport);
            } else {
                bounds.extend(place.geometry.location);
            }
        });

        global_star_markers[step_id] = markers;

        // Update zoom
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
            let home = steps_data[i].home === "true";
            const step_id = "day" + day_count + "_step" + step_count;
            let pos = { lat: parseFloat(steps_data[i].lat), lng: parseFloat(steps_data[i].lng) };

            const marker = createMarker(pos, steps_data[i].name, steps_data[i].place, steps_data[i].url, home);

            markers.push(marker);

            if (home) {
                global_home_markers[step_id] = markers;
                // Path
                global_path[step_id] = getPos(marker);
            } else {
                global_star_markers[step_id] = markers;
            }

            bounds.union(new google.maps.LatLngBounds(pos));
        }
    }
    setGlobalPath();
    map.fitBounds(bounds);
}

export function removeMarkers(step_id) {
    const is_home = step_id in global_home_markers;
    let markers;

    if (is_home) {
        markers = global_home_markers[step_id];
        delete global_home_markers[step_id];
    } else {
        markers = global_star_markers[step_id];
        delete global_star_markers[step_id];
    }

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

    let strokeWeight = 4;
    if (navigator.userAgentData.mobile) {
        strokeWeight = 6;
    }

    polyline = new google.maps.Polyline({
        path: path_ordered,
        geodesic: true,
        strokeColor: "#DC1100",
        strokeOpacity: 1.0,
        strokeWeight: strokeWeight,
    });

    polyline.setMap(map);
}

export function removePath(step_id) {
    delete global_path[step_id];
    setGlobalPath();
}

export function forceFitBounds() {
    map.fitBounds(bounds);
}

export function switchIcon(step_id) {
    const is_home = step_id in global_home_markers;
    let marker;
    let icon;

    if (is_home) {
        marker = global_home_markers[step_id][0];
        icon = marker.icon;
        icon.url = star_icon;
        marker.setIcon(icon);

        global_star_markers[step_id] = [marker];
        delete global_home_markers[step_id];

        removePath(step_id);
    } else {
        if (!global_star_markers[step_id]) {
            return false;
        }
        marker = global_star_markers[step_id][0];
        icon = marker.icon;
        icon.url = home_icon;
        marker.setIcon(icon);

        global_home_markers[step_id] = [marker];
        delete global_star_markers[step_id];

        global_path[step_id] = getPos(marker);
        setGlobalPath();
    }

    return true;
}

export function focusMarker(step_id) {
    let marker;

    if (step_id in global_home_markers) {
        marker = global_home_markers[step_id][0];
    } else {
        marker = global_star_markers[step_id][0];
    }

    map.setCenter(getPos(marker));

    new google.maps.event.trigger(marker, 'click');
}


window.initMap = initMap;