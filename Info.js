import React, { useState, useEffect } from "react";
import { StyleSheet, Text, View, ScrollView, Dimensions, Button, FlatList, TextComponent } from 'react-native';
import PageSelect from './containers/PageSelect';

const Info = ({route, navigation}) => {
    return (
        <View style={styles.root}>
            <ScrollView style={{flex: 1, marginTop: 50}}>
                <Text style={styles.header}>Welcome to Run Mapper!</Text>
                <Text style={styles.paragraph}>
                    Use Run Mapper to generate running, walking or biking routes wherever you are.
                    Simply move the red marker to set your starting point, edit your distance range with
                    either kilometers or miles, and press "generate" to create a list of new routes to explore.
                </Text>
            </ScrollView>
            <PageSelect navigator={navigation}/>
        </View>
    );
}

export default Info;
  
const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)',
        //alignItems: 'center',
        //justifyContent: 'center'
    },
    paragraph: {
        fontSize: 18,
        marginTop: 20,
        color: 'rgb(180, 180, 180)',
        fontFamily: 'NotoSans-Medium',
        marginHorizontal: 25
    },
    header: {
        fontSize: 22,
        marginTop: 30,
        color: 'rgb(120, 120, 120)',
        fontFamily: 'NotoSans-Medium',
        textAlign: 'center'
    }
});