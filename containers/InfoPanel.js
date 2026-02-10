import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image, Dimensions } from 'react-native';
import { MaterialIcons, AntDesign } from '@expo/vector-icons';

const deviceWidth = Dimensions.get("window").width;
//const deviceHeight = Dimensions.get("window").height;

export const InfoPanel = ({closePanel}) => {
    return (
        <View style={styles.overlay}>
            <View style={styles.panel}>
                <TouchableOpacity style={styles.closeButton} onPress={closePanel}>
                    <AntDesign name="close" size={35} color="gray"/>
                </TouchableOpacity>
                <ScrollView style={{flex: 1, marginTop: 5}}>
                    <Text style={styles.header}>Welcome to Explorun!</Text>
                    <Text style={styles.paragraph}>
                        Use Explorun to generate running, walking, or biking routes wherever you are.
                        Simply move the red marker to set your starting point, edit your distance range with
                        either kilometers or miles, and press "generate" to create a list of new routes to explore.
                    </Text>
                    <Image source={require('./../assets/route_preview.jpg')} style={{...styles.image, aspectRatio: 1179 / 1630}}/>
                    {/* image res 1179 * 1630*/}
                    <Text style={styles.caption}>10 mile route generated with Explorun</Text>
                    <Text style={styles.paragraph}>
                        Press the "heart" icon on the map to set a route as a favorite. These routes can be viewed in the favorites
                        tab, accessible through the heart icon at the bottom of your screen. To change a route's name, select its title
                        (the route's location by default) and start typing.
                    </Text>
                    <Image source={require('./../assets/favorites.jpg')} style={{...styles.image, aspectRatio: 1179 / 1468, borderWidth: 0, borderBottomWidth: 1}}/>
                    {/* image res 1179 * 1468*/}
                    <Text style={styles.caption}>The favorites tab</Text>
                    <Text style={styles.paragraph}>
                        A route's fullscreen view can be opened by pressing the fullscreen icon in any map.
                        This page shows a route at a larger scale and an icon indicating your current position and direction.
                        To "lock in" on this position for easier, on-the-go navigation, press the "current position" icon
                        in the bottom left corner.
                    </Text>
                    <Image source={require('./../assets/fullscreen.jpg')} style={{...styles.image, aspectRatio: 1179 / 1189}}/>
                    <Text style={styles.caption}>fullscreen view</Text>
                </ScrollView>
            </View>
        </View>
    );
}
  
const styles = StyleSheet.create({
    overlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)', // Adjust transparency here
        justifyContent: 'center',
        alignItems: 'center',
    },
    panel: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        marginVertical: 120,
        marginHorizontal: 30,
        paddingBottom: 33,
        backgroundColor: 'rgb(240, 240, 240)',
        justifyContent: 'center',
        alignItems: 'center',
        borderRadius: 10
    },
    paragraph: {
        fontSize: 16,
        marginTop: 20,
        marginBottom: 0,
        color: 'rgb(110, 110, 110)',
        fontFamily: 'NotoSans-Medium',
        marginHorizontal: 33
    },
    header: {
        fontSize: 22,
        marginTop: 0,
        marginHorizontal: 33,
        color: 'rgb(90, 90, 90)',
        fontFamily: 'NotoSans-Medium',
        textAlign: 'left'
    },
    closeButton: {
        backgroundColor: 'rgba(240, 240, 240)',
        alignSelf: 'flex-end',
        alignItems: 'center',
        justifyContent: 'center',
        width: 50,
        height: 50,
        marginTop: 5,
        marginRight: 5
        //top: 95,
        //right: 15
    },
    image: {
        marginHorizontal: 33,
        width: deviceWidth - 60 - 66,
        height: undefined,
        aspectRatio: 1179 / 1630,
        marginTop: 20,
        borderRadius: 10,
        borderWidth: 1.0,
        borderColor: 'rgb(200, 200, 200)'
    },
    caption: {
        textAlign: 'center',
        marginTop: 5,
        marginBottom: 0,
        color: 'rgb(180, 180, 180)',
        fontFamily: 'NotoSans-Italic',
        fontSize: 13,
    }
});