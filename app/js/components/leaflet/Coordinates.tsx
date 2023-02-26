import React from "react";
import { useState } from "react";
import { useMapEvents } from "react-leaflet";
import { intCoord } from "../../utils/math";

export default function() {
    const [coords, setCoords] = useState([0, 0])
    const map = useMapEvents({
        mousemove: (event) => {
            const { lat: z, lng: x } = event.latlng
            setCoords([intCoord(x), intCoord(z)])
        }
    })
    const [x, z] = coords
    return <div className='leafmap-coords'>X / Z: {x} / {z}</div>
}