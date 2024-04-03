import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View } from 'react-native';
import InputReader from './containers/InputReader';
import PageSelect from './containers/PageSelect';

const Home = ({route, navigation}) => {

    const [favoritedRoutes, setFavoritedRoutes] = useState({});
    const [useKM, setUseKM] = useState(false);

    useEffect(() => {
        if(route.params !== undefined){
            if(route.params.hasOwnProperty("favorites"))
            {
                //console.log(Object.keys(route.params.favorites));
                setFavoritedRoutes(route.params.favorites);
            }
        }
    }, [route.params?.favorites]);

    return (
        <View style={styles.root}>
            <InputReader favorites={favoritedRoutes} favoritesCallback={setFavoritedRoutes} kmCallback={setUseKM}/>
            <PageSelect navigator={navigation} homeParams={{}} favoritesParams={{favorites: favoritedRoutes, useKM: useKM}}/>
        </View>
    );
}

export default Home;
  
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)',
        alignItems: 'center',
        justifyContent: 'center'
    }
});