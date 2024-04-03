import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions, Button, FlatList } from 'react-native';
import PageSelect from './containers/PageSelect';
import { MapDisplay } from "./containers/MapRenderer";
import AsyncStorage from '@react-native-async-storage/async-storage';

const deviceWidth = Dimensions.get("window").width;

function FavoriteBox({ navigation, route, useKM, removeFavorite, isFavorited }){
    const currentRegion = {
        latitude: route.center[0],
        longitude: route.center[1],
        latitudeDelta: route.bounds,
        longitudeDelta: route.bounds
    }

    let dist = Math.round(route.distance * (useKM ? 1.609 : 1.0) * 100.0) / 100.0;
    let elevation_gain = Math.round(route.elevation_gain * (useKM ? 1 : 3.28));

    return(
        <View style={styles.routeContainer}>
            {route.town && (<Text style={styles.headerText}>{route.town}</Text>)}
            <MapDisplay currentRegion={currentRegion} activePath={route} removeFavorite={removeFavorite} isFavorited={isFavorited} fullScreen={() => navigation.navigate("FullScreenView", { activePath: route, currentPosParam: {} })}/>
            <View style={styles.infoBox}>
                <Text style={{...styles.infoText, textAlign:'center'}}>Distance: {dist == 0.0 ? "--" : dist} {useKM ? "KM" : "MI"}</Text>
                <Text style={{...styles.infoText, textAlign:'center'}}>Elevation Gain: {elevation_gain == 0.0 ? "--" : elevation_gain} {useKM ? "M" : "FT"}</Text>
            </View>
        </View>
    );
}

const Favorites = ({route, navigation}) => {

    const [favoritedRoutes, setFavoritedRoutes] = useState({});
    const [displayFavoritedRoutes, setDisplayFavoritedRoutes] = useState({});
    const [routeInFavorites, setRouteInFavorites] = useState({});
    const [useKM, setUseKM] = useState(false);

    useEffect(() => {
        if(route.params != undefined)
        {
            const { favorites, useKM } = route.params;
            setFavoritedRoutes(favorites);
            setDisplayFavoritedRoutes({...favorites});
            let newRouteInFavorites = {};
            for(const pathId in favorites){
                newRouteInFavorites = {...newRouteInFavorites, [pathId]: true};
            }
            setRouteInFavorites(newRouteInFavorites);
            setUseKM(useKM);
        }
    }, []);
    /*
    function RemoveFavorite(pathId) {
        if(favoritedRoutes.hasOwnProperty(pathId)) {
            let newFavoritedRoutes = favoritedRoutes;
            delete newFavoritedRoutes[pathId];
            setFavoritedRoutes(newFavoritedRoutes);
            setFavoritedRoutesValues(Object.values(newFavoritedRoutes));
        }
    }
    */

    function RemoveFavorite(pathId) {
        let newFavoritedRoutes = favoritedRoutes;
        if(favoritedRoutes.hasOwnProperty(pathId)) {
            delete newFavoritedRoutes[pathId];
            setRouteInFavorites({...routeInFavorites, [pathId]: false});
            setFavoritedRoutes(newFavoritedRoutes);
        } else {
            newFavoritedRoutes = {...favoritedRoutes, [pathId]: displayFavoritedRoutes[pathId]};
            setRouteInFavorites({...routeInFavorites, [pathId]: true});
            setFavoritedRoutes(newFavoritedRoutes);
        }

        AsyncStorage.setItem('favoritedRoutes', JSON.stringify(newFavoritedRoutes));
    }
    /*
    return (
        <View style={styles.root}>
            <ScrollView contentContainerStyle={{flexGrow: 1}} keyboardShouldPersistTaps='handled'>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50}}>
                    {Object.values(displayFavoritedRoutes).length > 0 
                        ?
                        (Object.values(displayFavoritedRoutes).map(route => {
                            const pathId = route.path.length * Math.round(route.distance * 100);
                            return(
                                <FavoriteBox key={pathId} navigation={navigation} route={route} useKM={useKM} removeFavorite={() => RemoveFavorite(pathId)} isFavorited={routeInFavorites[pathId]}/>
                            );
                        }))
                        :
                        <Text style={styles.centerText}>No Favorites Yet!</Text>
                    }
                </View>
            </ScrollView>
            <PageSelect navigator={navigation} homeParams={{favorites: favoritedRoutes}} favoritesParams={{}}/>
        </View>
    );
    */
    
    return (
        <View style={styles.root}>
            <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 50}}>
                {Object.values(displayFavoritedRoutes).length > 0 
                    ?
                    <FlatList 
                        data={Object.values(displayFavoritedRoutes)}
                        renderItem={({ item: route }) => {
                            const pathId = route.path.length * Math.round(route.distance * 100);
                            return(<FavoriteBox key={pathId} navigation={navigation} route={route} useKM={useKM} removeFavorite={() => RemoveFavorite(pathId)} isFavorited={routeInFavorites[pathId]}/>);
                        }}
                    />
                    :
                    <Text style={styles.centerText}>No Favorites Yet!</Text>
                }
            </View>
            <PageSelect navigator={navigation} homeParams={{favorites: favoritedRoutes}} favoritesParams={{}}/>
        </View>
    );
}

export default Favorites;
  
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)',
        alignItems: 'center',
        justifyContent: 'center'
    },
    routeContainer: {
        width: deviceWidth-10,
        //height: 100,
        backgroundColor:'rgb(235, 235, 235)',
        borderRadius: 10,
        alignItems: 'center',
        justifyContent: 'center',
        margin: 5,
        padding: 15,
        borderWidth: 0.5,
        borderColor: 'rgb(200, 200, 200)'
    },
    infoBox: {
        width: deviceWidth - 40,
        flexDirection:'row', 
        justifyContent:'space-evenly',
        paddingVertical: 10,
        backgroundColor:'rgb(215, 215, 215)',
        borderRadius: 10,
        marginTop: 5,
        borderWidth: 0.5,
        borderColor: 'rgb(200, 200, 200)'
    },
    infoText: {
        color: 'rgb(110, 110, 110)',
        fontSize: 15,
        fontFamily: 'NotoSans-Medium'
    },
    centerText: {
        textAlign: 'center',
        fontSize: 24,
        color: 'rgb(215, 215, 215)',
        fontFamily: 'NotoSans-Medium'
    },
    headerText: {
        alignSelf: 'flex-start',
        color: 'rgb(110, 110, 110)',
        fontSize: 26,
        fontFamily: 'NotoSans-Medium',
        marginBottom: 8
    }
});