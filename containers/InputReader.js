import React, { useState, useEffect } from "react";
import { StyleSheet, View, ScrollView, TextInput, Pressable, Text } from "react-native";
import * as Location from "expo-location";
import { MapRenderer } from "./MapRenderer";
import PageSelect from "./PageSelect";
import AsyncStorage from '@react-native-async-storage/async-storage';

const usStateToAbbrev = {
    "Alabama": "AL",
    "Alaska": "AK",
    "Arizona": "AZ",
    "Arkansas": "AR",
    "California": "CA",
    "Colorado": "CO",
    "Connecticut": "CT",
    "Delaware": "DE",
    "Florida": "FL",
    "Georgia": "GA",
    "Hawaii": "HI",
    "Idaho": "ID",
    "Illinois": "IL",
    "Indiana": "IN",
    "Iowa": "IA",
    "Kansas": "KS",
    "Kentucky": "KY",
    "Louisiana": "LA",
    "Maine": "ME",
    "Maryland": "MD",
    "Massachusetts": "MA",
    "Michigan": "MI",
    "Minnesota": "MN",
    "Mississippi": "MS",
    "Missouri": "MO",
    "Montana": "MT",
    "Nebraska": "NE",
    "Nevada": "NV",
    "New Hampshire": "NH",
    "New Jersey": "NJ",
    "New Mexico": "NM",
    "New York": "NY",
    "North Carolina": "NC",
    "North Dakota": "ND",
    "Ohio": "OH",
    "Oklahoma": "OK",
    "Oregon": "OR",
    "Pennsylvania": "PA",
    "Rhode Island": "RI",
    "South Carolina": "SC",
    "South Dakota": "SD",
    "Tennessee": "TN",
    "Texas": "TX",
    "Utah": "UT",
    "Vermont": "VT",
    "Virginia": "VA",
    "Washington": "WA",
    "West Virginia": "WV",
    "Wisconsin": "WI",
    "Wyoming": "WY",
    "District of Columbia": "DC",
    "American Samoa": "AS",
    "Guam": "GU",
    "Northern Mariana Islands": "MP",
    "Puerto Rico": "PR",
    "United States Minor Outlying Islands": "UM",
    "U.S. Virgin Islands": "VI",
}

function InputBox({ placeholderText, value, setValue })
{
    return(
        <TextInput
            style={styles.input}
            onChangeText={setValue}
            value={value}
            placeholder={placeholderText}
            keyboardType='numeric'
        />
    )
}

function StyledButton({ text, onPress, style=styles.button, pressedStyle={...styles.button, backgroundColor: 'rgb(61, 45, 142)'}, disabled=false })
{
    if(disabled) {
        return(
            <Pressable style={{...style, borderColor: 'rgb(200, 200, 200)'}}>
                <Text style={{...styles.text, color: 'rgb(200, 200, 200)'}}>{text}</Text>  
            </Pressable>
        );
    }
    return(
        <Pressable onPress={onPress} style={({pressed}) => [pressed ? pressedStyle : style]}>
            {({pressed}) => (
                <Text style={pressed ? {...styles.text, color: 'rgb(255, 255, 255)'} : styles.text}>{text}</Text>
            )}
        </Pressable>
    );
    
}
//f3a727dd9d7bf44f73ebb4962a56ff4a
function RouteInfoBox({ activePath, useKM })
{
    let dist = activePath.distance * (useKM ? 1.609 : 1.0);
    dist = Math.round(dist * 100.0) / 100.0;
    let elevation_gain = Math.round(activePath.elevation_gain * (useKM ? 1 : 3.28));

    return(
        <View style={styles.infoBox}>
            <Text style={{...styles.infoText, textAlign:'center'}}>Distance: {dist == 0.0 ? "--" : dist} {useKM ? "KM" : "MI"}</Text>
            <Text style={{...styles.infoText, textAlign:'center'}}>Elevation Gain: {elevation_gain == 0.0 ? "--" : elevation_gain} {useKM ? "M" : "FT"}</Text>
        </View>
    );
}

const InputReader = ({route, navigation}) => {
    
    const [minDistance, setMinDistance] = useState("");
    const [maxDistance, setMaxDistance] = useState("");

    const [currentPos, setCurrentPos] = useState(null);
    const [initialRegion, setInitialRegion] = useState(null);
    const [startPos, setStartPos] = useState(null);
    const [useKM, setUseKM] = useState(0);

    const [activePath, setActivePath] = useState({path: [], elevation: [], elevation_gain: 0, center: [], distance: 0.0, bounds: 0.05});
    const [loadedPaths, setLoadedPaths] = useState({});
    const [routeData, setRouteData] = useState({});
    const [favoritedRoutes, setFavoritedRoutes] = useState({});

    const [loading, setLoading] = useState(false);
    const [errorText, setErrorText] = useState("");
    const [loadedData, setLoadedData] = useState(false);
    const [markedPlaced, setMarkerPlaced] = useState(false);

    const [activePathIndex, setActivePathIndex] = useState(0);
    const [activePathIsFavorite, setActivePathIsFavorite] = useState(false);

    const [mapRef, setMapRef] = useState(React.createRef());
    //const mapRef = React.createRef();
    
    useEffect(() => {
        const getLocation = async() => {
            let { status } = await Location.requestForegroundPermissionsAsync();
            if(status !== "granted"){
                console.log("Permission to access location was denied");
                return;
            }
            let location = await Location.getCurrentPositionAsync({});
            //let location = {coords: {latitude: 42.37616964888291, longitude: -71.33434055672049}};
            
            setCurrentPos(location.coords);
            setStartPos(location.coords);

            setInitialRegion({
                latitude: location.coords.latitude,
                longitude: location.coords.longitude,
                latitudeDelta: 0.02,
                longitudeDelta: 0.02,
            });
        };
        
        if(!loadedData){
            //load data from async storage into favorited routes
            AsyncStorage.getItem('favoritedRoutes', (err, result) => {
                parsedResult = JSON.parse(result);
                if(parsedResult != null) {
                    setFavoritedRoutes(parsedResult);
                }
            });
            setLoadedData(true);
        }

        if(route.params !== undefined){
            if(route.params.hasOwnProperty("favorites")) {
                setFavoritedRoutes(route.params.favorites);
                setActivePathIsFavorite(route.params.favorites.hasOwnProperty(activePath.path.length * Math.round(activePath.distance * 100)));
            }
        }

        if(!markedPlaced){
            getLocation();
            setMarkerPlaced(true);
        }
    }, [route.params?.favorites]);
    
    function locationCallback(markerPos) {
        setStartPos(markerPos);
    }
    
    function checkParams(){
        let minDistNum = Number(minDistance)
        let maxDistNum = Number(maxDistance)
        return minDistNum < 0.0 || maxDistNum < 0.0 || minDistNum >= maxDistNum || minDistance == "" || maxDistance == "";
    }

    function addFavorite() {
        if(activePath.path.length !== 0) {
            let pathId = activePath.path.length * Math.round(activePath.distance * 100);
            let newFavoritedRoutes = favoritedRoutes;
            if(favoritedRoutes.hasOwnProperty(pathId)) {
                delete newFavoritedRoutes[pathId];
                setFavoritedRoutes(newFavoritedRoutes);
                setActivePathIsFavorite(false);
            } else {
                const geoCodingApiKey = "f3a727dd9d7bf44f73ebb4962a56ff4a";
                fetch(`http://api.openweathermap.org/geo/1.0/reverse?lat=${activePath.path[0].latitude}&lon=${activePath.path[0].longitude}&limit=1&appid=${geoCodingApiKey}`, { method: 'get', mode: 'cors' })
                .then(
                    res => res.json()
                ).then(
                    data => {
                        let townName = `${data[0]["name"]}, ${data[0].hasOwnProperty("state") && data[0]["country"] == "US" ? usStateToAbbrev[data[0]["state"]] : data[0]["country"]}`;
                        
                        newFavoritedRoutes = {...favoritedRoutes, [pathId]: {...activePath, town: townName}};
                        setFavoritedRoutes(newFavoritedRoutes);
                    }
                );

                setActivePathIsFavorite(true);
            }

            AsyncStorage.setItem('favoritedRoutes', JSON.stringify(newFavoritedRoutes));
        }
    }
    
    function ScrollRoutes(change) {
        if(routeData.loops !== undefined) {
            let newIndex = activePathIndex + change;
            if(newIndex >= 0 && newIndex < routeData.loops.length) {
                GetPath(routeData, newIndex);
                setActivePathIndex(newIndex);
            }
        }
    }

    function GenerateRoutes() {
        setErrorText("");
        setLoading(true);
        if(checkParams()){
            setLoading(false);
            setErrorText("Parameters are invalid");
            return;
        }
        //https://alxy24.pythonanywhere.com/data
        fetch(`https://alxy24.pythonanywhere.com/data?dist_min=${Number(minDistance)}&dist_max=${Number(maxDistance)}&loc_lat=${startPos.latitude}&loc_lon=${startPos.longitude}&km=${useKM}&count=${undefined}`, { method: 'get', mode: 'cors' })
        .then(
            res => res.json()
        ).then(
            data => {
                setLoading(false);
                if(data.loops.length > 0) {
                    setRouteData(data);
                    setActivePathIndex(0)
                    GetPath(data, 0);
                } else {
                    setErrorText("No routes were found");
                }
            }
        ).catch((error) => {
            setErrorText("The request failed; try again");
            setLoading(false);
            console.log(error);
        });
    }

    function GetPath(routeData, index) {
        let newPath = {path: [], elevation: [], elevation_gain: 0, center: [], distance: 0.0, bounds: 0.05};
        let newPathId = 0;

        if(routeData.loops !== undefined)
        {
            let route = routeData.loops[index];
            newPathId = route.path.length * Math.round(route.distance * 100);

            if(!loadedPaths.hasOwnProperty(newPathId)){
                let latMin = 10000;
                let lonMin = 10000;
                let latMax = -10000;
                let lonMax = -10000;
                for(var i = 0; i < route.path.length; i++) {
                    let lat = route.path[i][0];
                    let lon = route.path[i][1];
                    if(lat > latMax) { latMax = lat }
                    if(lat < latMin) { latMin = lat }
                    if(lon > lonMax) { lonMax = lon }
                    if(lon < lonMin) { lonMin = lon }

                    newPath.path.push({latitude: lat, longitude: lon});
                }

                newPath.center = route.center;
                newPath.distance = route.distance;
                newPath.elevation = route.elevation;
                newPath.elevation_gain = route.elevation_gain;

                let delta = lonMax - lonMin > latMax - latMin ? lonMax - lonMin : latMax - latMin;
                newPath.bounds = delta + 0.005;

                setLoadedPaths({...loadedPaths, newPathId: newPath});
            } else {
                newPath = loadedPaths[newPathId];
            }

            mapRef.current.animateToRegion({
                latitude: newPath.center[0],
                longitude: newPath.center[1],
                latitudeDelta: newPath.bounds,
                longitudeDelta: newPath.bounds,
            });
        }

        setActivePath(newPath);
        setActivePathIsFavorite(favoritedRoutes.hasOwnProperty(newPathId));
    }

    return (
        <View style={styles.root}>
            <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
                <MapRenderer currentPosition={currentPos} currentRegion={initialRegion} locationCallback={locationCallback} favorite={addFavorite} isFavorited={activePathIsFavorite} activePath={activePath} fullScreen={() => navigation.navigate("FullScreenView", { activePath: activePath, currentPosParam: currentPos })} errorText={errorText} ref={mapRef}/>
                <View style={styles.inputSection}>
                    <RouteInfoBox activePath={activePath} useKM={useKM}/>
                    <InputBox placeholderText={"Minimum Distance"} value={minDistance} setValue={setMinDistance}/>
                    <InputBox placeholderText={"Maximum Distance"} value={maxDistance} setValue={setMaxDistance}/>
                    <View style={styles.separator}/>
                    <View style={styles.row}>
                        <Pressable onPress={() => setUseKM(1)} style={useKM ? {...styles.button, borderRightWidth: 0.5, backgroundColor: 'rgb(61, 45, 142)'} : {...styles.button, borderRightWidth: 0.5}}>
                            <Text style={useKM ? {...styles.text, color: 'rgb(255, 255, 255)'} : styles.text}>KM</Text>
                        </Pressable>
                        <Pressable onPress={() => setUseKM(0)} style={!useKM ? {...styles.button, borderLeftWidth: 0.5, backgroundColor: 'rgb(61, 45, 142)'} : {...styles.button, borderLeftWidth: 0.5}}>
                            <Text style={!useKM ? {...styles.text, color: 'rgb(255, 255, 255)'} : styles.text}>MI</Text>
                        </Pressable>
                    </View>
                    <View style={styles.separator}/>
                    <View style={styles.row}>
                        <StyledButton text="PREV" onPress={() => ScrollRoutes(-1)} style={{...styles.button, borderRightWidth: 0.5}} disabled={routeData.loops !== undefined ? (activePathIndex == 0) : true}/>
                        <StyledButton text="NEXT" onPress={() => ScrollRoutes(1)} style={{...styles.button, borderLeftWidth: 0.5}} disabled={routeData.loops !== undefined ? (activePathIndex >= routeData.loops.length - 1) : true}/>
                    </View>
                    <View style={styles.separator}/>
                    <StyledButton text="GENERATE" onPress={() => GenerateRoutes()} style={{...styles.button, width: '100%'}} pressedStyle={{...styles.button, width: '100%', backgroundColor: 'rgb(61, 45, 142)'}} disabled={loading}/>
                </View>
            </ScrollView>
            <PageSelect navigator={navigation} homeParams={{}} favoritesParams={{favorites: favoritedRoutes, useKM: useKM}}/>
        </View>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    text: {
        fontSize: 15,
        textAlign: 'center',
        color: 'rgb(90, 90, 90)',
        fontFamily: 'NotoSans-Medium'
    },
    buttonText: {
        color: 'rgb(255, 255, 255)',
        textAlign: 'center',
    },
    infoText: {
        color: 'rgb(110, 110, 110)',
        fontSize: 15,
        fontFamily: 'NotoSans-Medium'
    },
    /*
    infoBoxContiner: {
        width: '100%',
        flexDirection:'row', 
        justifyContent:'space-evenly'
    },
    */
    infoBox: {
        width: '100%',
        flexDirection:'row', 
        justifyContent:'space-evenly',
        paddingVertical: 10,
        backgroundColor:'rgb(235, 235, 235)',
        borderRadius: 10,
        borderWidth: 0.5,
        borderColor: 'rgb(200, 200, 200)'
    },
    /*
    favoriteButton: {
        width: '12%',
        alignItems: 'center',
        paddingVertical: 12,
        backgroundColor:'rgb(235, 235, 235)',
        borderRadius: 10
    },
    */
    inputSection: {
        alignItems: 'center', 
        justifyContent: 'center',
        margin: 5
    },
    input: {
        borderWidth: 1,
        borderColor: 'rgb(150, 150, 150)',
        height: 40,
        width: '100%',
        marginTop: 3,
        padding: 10,
        fontSize: 15,
        fontFamily: 'NotoSans-Medium'
    },
    button: {
        borderWidth: 1,
        borderColor: 'rgb(150, 150, 150)',
        backgroundColor: 'white',
        width: '50%',
        padding: 15,
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    separator: {
        marginVertical: 4,
        borderBottomColor: 'rgb(255, 255, 255)',
        borderBottomWidth: StyleSheet.hairlineWidth,
        width: '100%',
        alignSelf: 'stretch',
    }
});

export default InputReader;