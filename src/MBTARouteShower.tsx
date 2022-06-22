// import React, {FormEventHandler, useState} from "react";
// import {MenuItem, Select} from "@mui/material";

import * as React from 'react';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import axios from 'axios';
import {useEffect, useState} from "react";
import {TextField, Typography} from "@mui/material";


const metroRoutes: string[] = ['None', 'Red', 'Mattapan', 'Orange', 'Green-B', 'Green-C', 'Green-D', 'Green-E', 'Blue'];

// export const MBTARouteShower2 = () => {
//     const [selectedStation, setSelectedStation] = useState<string>('Red');
//     // @ts-ignore
//     const handleChange = (event) => {
//       const value = event.target.value;
//       setSelectedStation(value);
//       console.log(`hello world value = ${value}`);
//     };
//     return <>
//         <Select
//             labelId="routes-select-label"
//             id="route-select-id"
//             label="route"
//         >
//             {metroStations.map(station => {
//                 return <MenuItem key={station} value={station} onChange={handleChange}> {station} </MenuItem>
//             })}
//         </Select>
//     </>
// }

type StopAttributesType = {
    wheelchair_boarding: number;
    vehicle_type: number;
    platform_name: string;
    platform_code: number;
    on_street: string;
    name: string;
    municipality: string;
    longitude: number;
    location_type: number;
    latitude: number;
    description: string;
    at_street: string;
    address: string;
}

type StopInfoType = {
    type: string;
    relationships: { [k: string]: string };
    links: any;
    id: string;
    attributes: StopAttributesType;
}

type StopsResponseType = {
    data: StopInfoType[];
}

type RouteAttributesType = {
    color: string;
    description: string;
    direction_destinations: string[],
    direction_names: string[],
    fare_class: string;
    long_name: string;
    short_name: string;
    sort_order: number;
    text_color: string;
    type: number;
}

type RouteInfoType = {
    attributes: RouteAttributesType;
    id: string;
    links: object;
    relationships: object;
    type: string;
}

type RoutesResponseType = {
    data: RouteInfoType[];
}

type RouteDescription = {
    id: string;
    longName: string;
}

export function MBTARouteShower() {
    const [routes, setRoutes] = useState<string[]>([]);
    const [currentRoute, setCurrentRoute] = useState('None');
    const [stations, setStations] = useState<string[]>([]);
    const [getRouteError, setGetRouteError] = useState<string | undefined>(undefined);

    const getStations = async (route: string): Promise<{ error?: string, stations?: string[] }> => {
        const stationsUrl = "https://api-v3.mbta.com/stops?filter%5Broute%5D=" + route;
        const response = await axios.get<StopsResponseType>(stationsUrl);
        if (response.status === 200) {
            const stations = response.data.data.map(d => d.attributes.name);
            return {stations};
        }
        return {error: response.statusText}
    };

    const getRoutes = async (routeFilter: string): Promise<{ error?: string, routes?: RouteDescription[] }> => {
        const routesUrl = `https://api-v3.mbta.com/routes?filter%5Btype%5D=${routeFilter}`;
        console.log(`routesUrl = ${routesUrl}`);
        const response = await axios.get<RoutesResponseType>(routesUrl);
        if (response.status === 200) {
            const routeData = response.data.data.map(d => {
                return {id: d.id, longName: d.attributes.long_name};
            });
            return {routes: routeData};
        }

        return {error: response.statusText};
    };

    const handleChange = (event: SelectChangeEvent) => {
        setCurrentRoute(event.target.value);
        console.log(`route = ${event.target.value}`);
        console.log(`event = ${JSON.stringify(event)}`);
    };

    useEffect(() => {
        const buildRoutes = ['None'];
        // on DOM load, load in the routes of type=0,1
        (async () => {
            const routeFilter = '0,1';
            const {routes, error} = await getRoutes(routeFilter);
            console.log(`getRoutes, routes = ${JSON.stringify(routes)}`);
            if (error) {
                console.log(`error = ${error}`);
            } else {
                if (routes === undefined) {
                    setGetRouteError(`an unexpected state occurred, getRoutes returned no error but routes is undefined`);
                }
                if (!routes) {
                    setGetRouteError(`there are no types for the current routeFilter of '${routeFilter}`);
                }

                setRoutes([])
            }
        })();
    }, [])

    useEffect(() => {
        if (currentRoute === 'None') {
            return;
        }
        (async () => {
            const {stations, error} = await getStations(currentRoute);
            if (error) {
                console.log(`error = ${error}`)
            } else {
                console.log(`stations = ${JSON.stringify(stations)}`)
                if (stations === undefined) {
                    console.log(`an error occurred, stations returned undefined without an error`);
                }
                setStations(stations!);
            }
        })();
    }, [currentRoute])

    const renderStops = () => {
        if (getRouteError || currentRoute === 'None') {
            return <></>
        }
        return <TextField
            id="outlined-multiline-static"
            label={`${currentRoute} Stops`}
            multiline
            rows={Math.min(stations.length, 10)}
            defaultValue=""
            value={stations.join("\n")}
        />
    }

    return (
        <div>
            <FormControl variant="filled" sx={{m: 1, minWidth: 120}}>
                <InputLabel id="demo-simple-select-filled-label">Route</InputLabel>
                <Select
                    labelId="demo-simple-select-filled-label"
                    id="demo-simple-select-filled"
                    value={currentRoute}
                    onChange={handleChange}
                >
                    {metroRoutes.map(route => {
                        return <MenuItem key={route} value={route}><Typography color="blue">{route}</Typography></MenuItem>
                    })}
                </Select>
            </FormControl>
            <Typography color="Red" variant="h6">{getRouteError}</Typography>
            {renderStops()}
        </div>
    );
}
