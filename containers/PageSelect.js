import React from "react";
import { StyleSheet, View, Text, Button, TouchableOpacity } from 'react-native';
import { MaterialIcons, FontAwesome5 } from '@expo/vector-icons';

const PageSelect = ({navigator, homeParams, favoritesParams}) => {
  return (
    <View style={styles.pageSelect}>
        <TouchableOpacity style={styles.button} onPress={() => navigator.navigate("Home", homeParams)}>
            <FontAwesome5 name="route" size={35} color="gray"/>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => navigator.navigate("Favorites", favoritesParams)}>
            <MaterialIcons name="favorite" size={35} color="gray"/>
        </TouchableOpacity>
    </View>
  );
};

export default PageSelect;

const styles = StyleSheet.create({
    pageSelect: {
        height: 80,
        width: '100%',
        backgroundColor: 'rgb(235, 235, 235)',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        justifyContent: 'space-around'
    },
    button: {
        marginBottom: 20,
        alignItems: "center"
    }
})