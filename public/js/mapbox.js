export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiYmlnZHN5IiwiYSI6ImNsa2E4a3NoaTAzeXYzZm54cHJ1OW45aTcifQ.xPCN4GxDO_RjOgDrNXicJA';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/bigdsy/clkaorsq300a901pq95061zcy',
        scrollZoom: false,
        // center: [-118, 34],
        // zoom: 10,
        // interactive: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom', // means is that it's the bottom of the element which is going to be located at the exact GPS location.
        })
            .setLngLat(loc.coordinates)
            .addTo(map);

        // Add popup
        new mapboxgl.Popup({
            offset: 30, // The distance between the content and the marker
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bounds to include current location.
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            // Set a distance between the marker and the boundary in the camera.
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};
