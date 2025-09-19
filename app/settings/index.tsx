import { useState } from 'react';
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';

interface SettingsScreenProps {
  route: any;
  navigation: any;
}

export default function SettingsScreen({ route, navigation }: SettingsScreenProps) {
    
  const [weatherCheckEnabled, setWeatherCheckEnabled] = useState(
    route.params?.weatherCheckEnabled || true
  );

  const goBack = () => {
    navigation.navigate('Start', { weatherCheckEnabled });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inställningar</Text>
      
      <View style={styles.settingRow}>
        <Text style={styles.settingLabel}>
          Blockera spel vid fint väder
        </Text>
        <Switch
          value={weatherCheckEnabled}
          onValueChange={setWeatherCheckEnabled}
          trackColor={{ false: '#767577', true: '#45da9cff' }}
        />
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>Tillbaka</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
    padding: 20,
    paddingTop: 80,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#eee',
    marginBottom: 30,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
  },
  settingLabel: {
    fontSize: 16,
    color: '#eee',
    flex: 1,
  },
  backButton: {
    backgroundColor: '#45da9cff',
    padding: 15,
    borderRadius: 12,
  },
  backButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});