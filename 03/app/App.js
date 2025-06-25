// Importações necessárias
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, TextInput } from 'react-native';

// O IP do seu ESP32. Você pode tornar isso configurável.
const ESP32_IP = '192.168.0.53'; // <<-- SUBSTITUA PELO IP REAL DO SEU ESP32

export default function App() {
  const [lampadaEstado, setLampadaEstado] = useState('off'); // Estado da lâmpada no app.
  const [loading, setLoading] = useState(false); // Para mostrar que uma ação está em progresso.

  // Função para enviar requisições ao ESP32
  const controlarLampada = async (acao) => {
    setLoading(true);
    const url = `http://${ESP32_IP}/lampada/${acao}`; // Monta a URL (on ou off)
    try {
      const response = await fetch(url); // Faz a requisição HTTP GET
      if (response.ok) { // Verifica se a requisição foi bem-sucedida (código 200)
        setLampadaEstado(acao); // Atualiza o estado no app
        Alert.alert('Sucesso', `Lâmpada ${acao === 'on' ? 'ligada' : 'desligada'}!`);
      } else {
        Alert.alert('Erro', 'Não foi possível controlar a lâmpada. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar com o ESP32:', error);
      Alert.alert('Erro de Conexão', 'Verifique se o ESP32 está online e na mesma rede.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle da Lâmpada</Text>
      <Text style={styles.status}>Estado Atual: {lampadaEstado.toUpperCase()}</Text>

      <TouchableOpacity
        style={[styles.button, styles.buttonOn]}
        onPress={() => controlarLampada('on')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>LIGAR</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonOff]}
        onPress={() => controlarLampada('off')}
        disabled={loading}
      >
        <Text style={styles.buttonText}>DESLIGAR</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  status: {
    fontSize: 20,
    marginBottom: 30,
    color: '#555',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '60%',
    alignItems: 'center',
  },
  buttonOn: {
    backgroundColor: '#4CAF50',
  },
  buttonOff: {
    backgroundColor: '#f44336',
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
});