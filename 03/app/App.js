import { View, Text, StyleSheet, Alert, Button } from "react-native";

export default function Index() {
    function handleMessage() {
        const name = "GersonES"
        Alert.alert("Hello " + name + "!");
    }
    return (
        <View style={styles.container}>
        <Text style={styles.title}>Ola GersonES!</Text>
        <Button title="Enviar" onPress={handleMessage} />
        </View>
    );
    }

const styles = StyleSheet.create({
    container: { 
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
         padding: 32    
        },
    title :{ 
        color: "red", 
        fontSize: 24,
        fontWeight: "bold",
    },
    });