// Importações necessárias
import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';

// O IP do seu ESP32. Você pode tornar isso configurável.
const ESP32_IP = '192.168.0.53'; // <<-- SUBSTITUA PELO IP REAL DO SEU ESP32
const UPDATE_INTERVAL = 5000; // Intervalo de atualização dos dados do sensor em milissegundos (5 segundos)

export default function App() {
  const [lampadaEstado, setLampadaEstado] = useState('off'); // Estado da lâmpada no app.
  const [temperatura, setTemperatura] = useState('--');      // Estado da temperatura.
  const [umidade, setUmidade] = useState('--');              // Estado da umidade.
  const [loading, setLoading] = useState(false);             // Para mostrar que uma ação está em progresso (controle da lâmpada).
  const [sensorLoading, setSensorLoading] = useState(false); // Para mostrar que os dados do sensor estão sendo carregados.

  // Função para enviar requisições ao ESP32 para controlar a lâmpada
  const controlarLampada = async (acao) => {
    setLoading(true); // Ativa o loading para a ação da lâmpada
    const url = `http://${ESP32_IP}/lampada/${acao}`;
    try {
      const response = await fetch(url);
      if (response.ok) {
        setLampadaEstado(acao); // Atualiza o estado no app
        Alert.alert('Sucesso', `Lâmpada ${acao === 'on' ? 'ligada' : 'desligada'}!`);
        // Opcional: force uma atualização dos dados do sensor após controlar a lâmpada
        // para garantir que o estado na tela do app esteja sincronizado com o ESP32.
        fetchSensorData(); 
      } else {
        Alert.alert('Erro', 'Não foi possível controlar a lâmpada. Tente novamente.');
      }
    } catch (error) {
      console.error('Erro ao conectar com o ESP32 (controle):', error);
      Alert.alert('Erro de Conexão', 'Verifique se o ESP32 está online e na mesma rede Wi-Fi.');
    } finally {
      setLoading(false); // Desativa o loading
    }
  };

  // Função para buscar dados do sensor DHT22 do ESP32
  const fetchSensorData = async () => {
    setSensorLoading(true); // Ativa o loading para os dados do sensor
    const url = `http://${ESP32_IP}/`; // Acessa a página principal para pegar os dados
    try {
      const response = await fetch(url);
      const html = await response.text(); // Pega a resposta como texto HTML

      // Regex para extrair a temperatura e umidade da string HTML
      // Ajuste estas regex se o formato da sua HTML mudar no ESP32!
      const tempMatch = html.match(/Temperatura: (\d+\.?\d*) &deg;C/);
      const humidMatch = html.match(/Umidade: (\d+\.?\d*) %/);

      if (tempMatch && tempMatch[1]) {
        setTemperatura(parseFloat(tempMatch[1]).toFixed(1) + ' °C'); // Converte para float e formata
      } else {
        setTemperatura('--');
      }

      if (humidMatch && humidMatch[1]) {
        setUmidade(parseFloat(humidMatch[1]).toFixed(1) + ' %'); // Converte para float e formata
      } else {
        setUmidade('--');
      }
      
      // Opcional: extrair também o estado da lâmpada da HTML para manter sincronia
      const lampadaEstadoMatch = html.match(/Estado: (on|off)<\/p>/);
      if (lampadaEstadoMatch && lampadaEstadoMatch[1]) {
        setLampadaEstado(lampadaEstadoMatch[1]);
      }

    } catch (error) {
      console.error('Erro ao buscar dados do sensor:', error);
      setTemperatura('--');
      setUmidade('--');
    } finally {
      setSensorLoading(false); // Desativa o loading
    }
  };

  // useEffect para buscar dados do sensor quando o componente é montado e periodicamente
  useEffect(() => {
    fetchSensorData(); // Busca os dados na montagem inicial

    const interval = setInterval(() => {
      fetchSensorData(); // Busca os dados a cada UPDATE_INTERVAL
    }, UPDATE_INTERVAL);

    // Limpa o intervalo quando o componente é desmontado
    return () => clearInterval(interval);
  }, []); // O array vazio [] garante que o useEffect rode apenas uma vez (na montagem) e as dependências internas (interval) sejam gerenciadas.

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Controle da Lâmpada e Ambiente</Text> {/* Título atualizado */}

      {/* Exibição do estado da Lâmpada */}
      <Text style={styles.status}>Lâmpada: {lampadaEstado.toUpperCase()}</Text>

      {/* Botões de Controle da Lâmpada */}
      <TouchableOpacity
        style={[styles.button, styles.buttonOn]}
        onPress={() => controlarLampada('on')}
        disabled={loading} // Desabilita enquanto a requisição estiver em andamento
      >
        {loading && lampadaEstado !== 'on' ? ( // Mostra o spinner se estiver carregando E não for o estado atual
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>LIGAR</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.buttonOff]}
        onPress={() => controlarLampada('off')}
        disabled={loading} // Desabilita enquanto a requisição estiver em andamento
      >
        {loading && lampadaEstado !== 'off' ? ( // Mostra o spinner se estiver carregando E não for o estado atual
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>DESLIGAR</Text>
        )}
      </TouchableOpacity>

      {/* --- Exibição dos Dados do Sensor --- */}
      <View style={styles.sensorContainer}>
        <Text style={styles.sensorTitle}>Dados do Ambiente:</Text>
        {sensorLoading ? (
          <ActivityIndicator size="large" color="#0000ff" />
        ) : (
          <>
            <Text style={styles.sensorData}>Temperatura: {temperatura}</Text>
            <Text style={styles.sensorData}>Umidade: {umidade}</Text>
          </>
        )}
        <TouchableOpacity onPress={fetchSensorData} style={styles.refreshButton}>
          <Text style={styles.refreshButtonText}>Atualizar Dados</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f0f0', // Um pouco mais de contraste no fundo
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  status: {
    fontSize: 22,
    marginBottom: 20,
    color: '#007bff', // Uma cor para o status
    fontWeight: 'bold',
  },
  button: {
    paddingVertical: 15,
    paddingHorizontal: 30,
    borderRadius: 8,
    marginVertical: 10,
    width: '80%', // Aumenta a largura dos botões
    alignItems: 'center',
    shadowColor: '#000', // Sombra para dar profundidade
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  buttonOn: {
    backgroundColor: '#28a745', // Verde mais escuro
  },
  buttonOff: {
    backgroundColor: '#dc3545', // Vermelho mais escuro
  },
  buttonText: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  sensorContainer: {
    marginTop: 40,
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#e9ecef', // Fundo levemente cinza para a seção do sensor
    alignItems: 'center',
    width: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sensorTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#495057',
  },
  sensorData: {
    fontSize: 20,
    marginBottom: 10,
    color: '#343a40',
  },
  refreshButton: {
    marginTop: 15,
    paddingVertical: 10,
    paddingHorizontal: 20,
    backgroundColor: '#007bff', // Azul para o botão de atualizar
    borderRadius: 5,
  },
  refreshButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});