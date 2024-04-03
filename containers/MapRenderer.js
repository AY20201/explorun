import React, { useState, useMemo } from "react";
import { StyleSheet, View, Dimensions, TouchableOpacity, Pressable, Text, Image } from "react-native";
import MapView, { Marker, Polyline } from 'react-native-maps';
import { MaterialIcons } from '@expo/vector-icons';

const deviceWidth = Dimensions.get("window").width;

export function GetPathColor(activePathElevation) {
    let red = [255, 0, 149];
    let green = [101, 0, 148];
    let minElev = activePathElevation[0], maxElev = activePathElevation[0];

    for(var i = 0; i < activePathElevation.length; i++) {
        let elev = activePathElevation[i];
        if(elev < minElev) { minElev = elev }
        if(elev > maxElev) { maxElev = elev }
    }
    let colors = [];
    for(var i = 0; i < activePathElevation.length; i++) {
        let lerpVal = 0.0;
        if(maxElev > 0){
            lerpVal = (activePathElevation[i] - minElev) / (maxElev - minElev);
        }
        let lerpedR = green[0] + (red[0] - green[0]) * lerpVal;
        let lerpedG = green[1] + (red[1] - green[1]) * lerpVal;
        let lerpedB = green[2] + (red[2] - green[2]) * lerpVal;
        colors.push(`rgb(${lerpedR}, ${lerpedG}, ${lerpedB})`);
    }

    return colors;
}
//MapRenderer has the marker, MapDisplay does not
export const MapRenderer = React.forwardRef((props, ref) => {
    const [marker, setMarker] = useState(null);

    function onMapPress(event, callback)
    {
        setMarker(event.nativeEvent.coordinate);
        callback(event.nativeEvent.coordinate);
    }

    const pathColors = useMemo(() => GetPathColor(props.activePath.elevation), [props.activePath.elevation]);
    const pathExists = props.activePath.path.length !== 0;

    return(
        <View style={{height: 450}}>
            {props.currentRegion && (
                <MapView style={styles.map} region={props.currentRegion} onPress={(e) => onMapPress(e, props.locationCallback)} ref={ref}>
                    <Marker coordinate={marker === null ? props.currentPosition : marker} title="Start and end point">
                        <Image source={require("./../assets/marker_icon.png")} style={{width: 50, height: 50, marginBottom: 40}}/>
                    </Marker>
                    <Polyline coordinates={props.activePath.path} strokeWidth={4} strokeColors={pathColors} lineJoin="bevel"/>
                </MapView>
            )}
            {props.errorText != "" &&
                <Text style={styles.errorText}>{props.errorText}</Text>
            }
            <Pressable disabled={!pathExists} style={({pressed}) => [pressed ? {...styles.overlayButton, width: 55, height: 55, marginTop: -55, bottom: 2.5, right: 2.5} : styles.overlayButton]} onPress={props.favorite}>
                {({pressed}) => (
                    <MaterialIcons name={props.isFavorited ? "favorite" : "favorite-outline"} size={pressed ? 38.5 : 35} color={props.isFavorited ? "red" : (pathExists ? "gray" : "rgb(200, 200, 200)")}/>
                )}
            </Pressable>
            <TouchableOpacity style={styles.overlayButtonLeft} onPress={props.fullScreen}>
                <MaterialIcons name="fullscreen" size={40} color={"gray"}/>
            </TouchableOpacity>
        </View>
    );
});

export const MapDisplay = ({ currentRegion, activePath, removeFavorite, isFavorited, fullScreen }) => {
    const pathColors = useMemo(() => GetPathColor(activePath.elevation), [activePath.elevation]);

    return(
        <View>
            {currentRegion && (
                <MapView style={styles.smallMapDisplay} region={currentRegion}>
                    <Polyline coordinates={activePath.path} strokeWidth={4} strokeColors={pathColors} lineJoin="bevel"/>
                </MapView>
                
            )}
            <Pressable style={({pressed}) => [pressed ? {...styles.overlayButton, width: 55, height: 55, marginTop: -55, bottom: 2.5, right: 2.5} : styles.overlayButton]} onPress={removeFavorite}>
                {({pressed}) => (
                    <MaterialIcons name={isFavorited ? "favorite" : "favorite-outline"} size={pressed ? 38.5 : 35} color={isFavorited ? "red" : "gray"}/>
                )}
            </Pressable>
            <TouchableOpacity style={styles.overlayButtonLeft} onPress={fullScreen}>
                <MaterialIcons name="fullscreen" size={40} color="gray"/>
            </TouchableOpacity>
        </View>
    );
};
//"rgb(144, 0, 201)"

//export default MapRenderer;

const styles = StyleSheet.create({
    map: {
        flex: 1,
        width: deviceWidth,
        //height: 450,
        //height: 450,
        justifyContent: 'flex-end'
    },
    smallMapDisplay: {
        width: deviceWidth - 40,
        height: 250,
        borderRadius: 10,
        justifyContent: 'center',
        borderWidth: 1.0,
        borderColor: 'rgb(200, 200, 200)'
    },
    overlayButton: {
        position: 'relative',
        backgroundColor: 'rgba(250, 250, 250, 0.95)',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        //top: 390,
        //right: 10,
        borderRadius: 15,
        marginTop: -50,
        bottom: 5,
        right: 5,
        //flex: 1
        //marginRight: 10,
        //marginBottom: 10
        //bottom: 30,
        //right: 10,
    },
    overlayButtonLeft: {
        position: 'relative',
        backgroundColor: 'rgba(250, 250, 250, 0.95)',
        alignSelf: 'flex-start',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        borderRadius: 15,
        marginTop: -50,
        bottom: 5,
        left: 5,
    },
    errorText: {
        position: 'relative',
        color: 'rgba(235, 64, 52, 0.95)',
        textAlign: 'center',
        fontFamily: 'NotoSans-Medium',
        fontSize: 15,
        marginTop: -21,
        bottom: 5,
    }
});