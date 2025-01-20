import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View, Image } from "react-native";
import { Marker, Polyline } from 'react-native-maps';
//import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
//import { GetPathColor } from "./containers/MapRenderer";
import * as Location from "expo-location";

export const LocationMarker = () => {
    //const [activePath, setActivePath] = useState({path: [], elevation: [], elevation_gain: 0, center: [], distance: 0.0, bounds: 0.05})
    //const [currentRegion, setCurrentRegion] = useState({});
    const [currentPos, setCurrentPos] = useState({});
    const [currentHeading, setCurrentHeading] = useState({});
    const [isTrackingPos, setIsTrackingPos] = useState(false);
    const [mapRef, setMapRef] = useState(React.createRef());

    const isTrackingPosRef = React.useRef(false);
    isTrackingPosRef.current = isTrackingPos;
    const headingRef = React.useRef(0);
    headingRef.current = currentHeading;

    const GetHeading = async() => {
        const headingWatcher = await Location.watchHeadingAsync(heading => {
            if(heading.accuracy != 0){
                setCurrentHeading(heading);
                //console.log(heading.trueHeading);
            }
        });

        return () => headingWatcher.remove();
    }

    const GetLocation = async() => {
        let { status } = await Location.requestForegroundPermissionsAsync();
        if(status !== "granted"){
            console.log("Permission to access location was denied");
            return;
        }
        let location = await Location.getCurrentPositionAsync({accuracy: Location.Accuracy.High, distanceInterval: 25});
        //let location = {coords: {latitude: 42.37616964888291, longitude: -71.33434055672049}};
        //let location = {coords: {latitude: 42.41861941449529, longitude: -71.05038528547605}};
        setCurrentPos(location.coords);
        //console.log(headingRef.current.trueHeading);
        /*
        if(isTrackingPosRef.current){
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        }
        */
    };

    useEffect(() => {
        GetHeading();
        GetLocation();
        const interval = setInterval(() => {
            GetLocation();
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    return(
        <View>
            {currentPos && (
                <Marker coordinate={currentPos} anchor={{ x: 0.5, y: 0.5 }} calloutAnchor={{ x: 0.5, y: 0.5 }}>
                    <View style={{...styles.markerBackground, width: 50, height: 50}}>
                        <Image source={require("./../assets/runner_icon.png")} style={{
                            width: 40,
                            height: 40,
                            //marker snaps to top left when being rotated
                            transform: [
                                {
                                rotate: !headingRef.current.trueHeading
                                    ? "0deg"
                                    : `${headingRef.current.trueHeading - 90}deg`,
                                },
                            ],
                        }}/>
                    </View>
                </Marker>
            )}
        </View>
    )
}

const styles = StyleSheet.create({
    markerBackground: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.75)', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '50%',
    }
});