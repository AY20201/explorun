import { StyleSheet } from 'react-native';

const styles = () => {
    return(
        StyleSheet.create({
            root: {
                backgroundColor: 'rgb(255, 255, 255)'
            },
            container: {
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center'
            },
            text: {
                color: 'rgb(255, 255, 255)',
                textAlign: 'center',
            },
            input: {
                borderWidth: 1,
                height: 40,
                margin: 12,
                padding: 10,
            }
        })
    );
};

export default styles