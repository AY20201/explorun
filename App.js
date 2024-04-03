//import { StatusBar } from 'expo-status-bar';
import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import InputReader from './containers/InputReader';
import Favorites from './Favorites';
import FullScreenView from './FullScreenView'
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';

const Stack = createNativeStackNavigator();
//SplashScreen.preventAutoHideAsync();

export default function App() {
    //const [fontsLoaded, fontError] = useFonts({
        //'NotoSans-Medium': require('./assets/fonts/NotoSans-Medium.ttf')
    //});

    const [appIsReady, setAppIsReady] = useState(false);

    useEffect(() => {
        async function prepare() {
            try {
                SplashScreen.preventAutoHideAsync();
                await Font.loadAsync({
                    'NotoSans-Medium': require('./assets/fonts/NotoSans-Medium.ttf')
                });
                //await new Promise(resolve => setTimeout(resolve, 2000));
            } catch (e) {
                console.warn(e);
            } finally {
                setAppIsReady(true);
                SplashScreen.hideAsync();
            }
        }
        prepare();

    }, []);
    /*
    const onLayoutRootView = useCallback(async () => {
        if (appIsReady) {
            await SplashScreen.hideAsync();
        }
    }, [appIsReady]);
    */
  
    if (!appIsReady) {
        return null;
    }
    
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen
                    name="Home"
                    component={InputReader}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Favorites"
                    component={Favorites}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="FullScreenView"
                    component={FullScreenView}
                    options={{ headerShown: false }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
}

const styles = StyleSheet.create({
    root: {
        flex: 1,
        backgroundColor: 'rgb(255, 255, 255)',
        alignItems: 'center',
        justifyContent: 'center'
    }
})