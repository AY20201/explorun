import React, { useState, useMemo, useEffect } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Pressable, Text, Image } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons, FontAwesome6 } from '@expo/vector-icons';
import { GetPathColor } from "./containers/MapRenderer";
import * as Location from "expo-location";

const deviceWidth = Dimensions.get("window").width;
const deviceHeight = Dimensions.get("window").height;

const FullScreenView = ({ route, navigation }) => {
    const [activePath, setActivePath] = useState({path: [], elevation: [], elevation_gain: 0, center: [], distance: 0.0, bounds: 0.05})
    const [currentRegion, setCurrentRegion] = useState({});
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
        //console.log(location);
        //console.log(headingRef.current.trueHeading);

        if(isTrackingPosRef.current){
            mapRef.current.animateToRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.005,
                longitudeDelta: 0.005,
            });
        }
    };

    useEffect(() => {
        if(route.params != undefined)
        {
            const { activePath, currentPosParam } = route.params;
            setActivePath(activePath);
            if(activePath.path.length != 0) {
                setCurrentRegion({
                    latitude: activePath.center[0],
                    longitude: activePath.center[1],
                    latitudeDelta: activePath.bounds,
                    longitudeDelta: activePath.bounds
                });
            } else if (currentPosParam !== null){
                setCurrentRegion({
                    latitude: currentPosParam.latitude,
                    longitude: currentPosParam.longitude,
                    latitudeDelta: 0.05,
                    longitudeDelta: 0.05
                });
            }
            setCurrentPos(currentPosParam);
        }

        GetHeading();
        GetLocation();
        const interval = setInterval(() => {
            GetLocation();
        }, 3000);
        
        return () => clearInterval(interval);
    }, []);

    const pathColors = useMemo(() => GetPathColor(activePath.elevation), [activePath.elevation]);

    return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            {currentRegion && (
                <MapView style={styles.map} region={currentRegion} ref={mapRef}>
                    <Polyline coordinates={activePath.path} strokeWidth={4} strokeColors={pathColors} lineJoin="bevel"/>
                    {currentPos && (
                        <Marker coordinate={currentPos} title="Current Position">
                            <View style={styles.markerBackground}>
                                <Image source={require("./assets/runner_icon.png")} style={{
                                    width: 40, 
                                    height: 40,
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
                </MapView>
            )}
            <TouchableOpacity style={styles.overlayButton} onPress={() => navigation.goBack()}>
                <MaterialIcons name="fullscreen-exit" size={40} color="gray"/>
            </TouchableOpacity>
            <Pressable style={({pressed}) => [pressed ? {...styles.overlayButtonLeft, width: 55, height: 55, bottom: 37.5, left: 7.5} : styles.overlayButtonLeft]} onPress={() => setIsTrackingPos(!isTrackingPos)}>
                {({pressed}) => (
                    <FontAwesome6 name="location-crosshairs" size={pressed ? 38.5 : 35} color={isTrackingPos ? "red" : "gray"}/>
                )}
            </Pressable>
        </View>
    );
    /*
    return(
        <View style={{flex: 1, alignItems: 'center', justifyContent: 'center'}}>
            <MapView style={styles.map}>

            </MapView>
        </View>
    );
    */
};

export default FullScreenView;

const styles = StyleSheet.create({
    map: {
        flex: 1,
        width: deviceWidth,
        height: deviceHeight,
        //justifyContent: 'flex-end'
    },
    overlayButton: {
        position: 'absolute',
        backgroundColor: 'rgba(250, 250, 250, 0.95)',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        //top: 390,
        //right: 10,
        borderRadius: 15,
        bottom: 40,
        right: 10,
        //flex: 1
        //marginRight: 10,
        //marginBottom: 10
        //bottom: 30,
        //right: 10,
    },
    overlayButtonLeft: {
        position: 'absolute',
        backgroundColor: 'rgba(250, 250, 250, 0.95)',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 15,
        bottom: 40,
        left: 10,
    },
    markerBackground: {
        width: 50,
        height: 50,
        backgroundColor: 'rgba(255, 255, 255, 0.75)', 
        alignItems: 'center', 
        justifyContent: 'center',
        borderRadius: '50%'
    }
});