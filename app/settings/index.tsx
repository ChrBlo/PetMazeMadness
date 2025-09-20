import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getDefaultPet, getPetById, PETS } from '../../data/pets';


interface SettingsScreenProps {
  route: any;
  navigation: any;
}

export default function SettingsScreen({ route, navigation }: SettingsScreenProps) {
    
  const [weatherCheckEnabled, setWeatherCheckEnabled] = useState(
    route.params?.weatherCheckEnabled || true
  );

  const [selectedPetId, setSelectedPetId] = useState(
    route.params?.selectedPetId || getDefaultPet().id
  );

  const [petName, setPetName] = useState(
    route.params?.petName || getPetById(route.params?.selectedPetId || getDefaultPet().id).defaultName
  );

  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [defaultPetName, setDefaultPetName] = useState(petName);

  const selectedPet = getPetById(selectedPetId);

  const handlePetSelection = (petId: string) => {
    setSelectedPetId(petId);
    const newPet = getPetById(petId);
    // Update name to default if current name matches old pet's default
    if (petName === selectedPet.defaultName) {
      setPetName(newPet.defaultName);
    }
    setShowPetSelector(false);
  };

  const handleNameSave = () => {
    setPetName(defaultPetName.trim() || selectedPet.defaultName);
    setShowNameEditor(false);
  };

  const handleNameCancel = () => {
    setDefaultPetName(petName);
    setShowNameEditor(false);
  };
    
  const goBack = () => {
    navigation.navigate('Start', {
      weatherCheckEnabled, 
      selectedPetId,
      petName
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inställningar</Text>
      
      <Text style={styles.settingsLabel}>Väder</Text>
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

      <View style={styles.petSelection}>
        <Text style={styles.settingsLabel}>Husdjur</Text>
        
        <TouchableOpacity style={styles.settingRow} onPress={() => setShowPetSelector(true)}>
          <Text style={styles.settingLabel}>Välj husdjur</Text>
          <View style={styles.petPreview}>
            <Text style={styles.petEmoji}>{selectedPet.emoji}</Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={() => {
          setDefaultPetName(petName);
          setShowNameEditor(true);
        }}>
          <Text style={styles.settingLabel}>Namn</Text>
          <Text style={styles.petNameDisplay}>{petName}</Text>
        </TouchableOpacity>
      </View>
      
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.backButtonText}>Spara inställningar</Text>
      </TouchableOpacity>

      {/* Pet Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPetSelector}
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Välj ditt husdjur</Text>
            <ScrollView style={styles.petGrid}>
              {PETS.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    selectedPetId === pet.id && styles.selectedPetOption
                  ]}
                  onPress={() => handlePetSelection(pet.id)}
                >
                  <Text style={styles.petOptionEmoji}>{pet.emoji}</Text>
                  <Text style={styles.petOptionName}>{pet.defaultName}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity 
              style={styles.modalCloseButton} 
              onPress={() => setShowPetSelector(false)}
            >
              <Text style={styles.modalCloseText}>Stäng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Name Editor Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNameEditor}
        onRequestClose={handleNameCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nameModalContent}>
            <Text style={styles.modalTitle}>Namnge ditt husdjur</Text>
            <Text style={styles.petEmoji}>{selectedPet.emoji}</Text>
            <TextInput
              style={styles.nameInput}
              value={defaultPetName}
              onChangeText={setDefaultPetName}
              placeholder={selectedPet.defaultName}
              placeholderTextColor="#999"
              maxLength={15}
              autoFocus
            />
            <View style={styles.nameModalButtons}>
              <TouchableOpacity style={styles.nameButton} onPress={handleNameCancel}>
                <Text style={styles.nameButtonText}>Avbryt</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nameButton, styles.saveButton]} onPress={handleNameSave}>
                <Text style={styles.nameButtonText}>Spara</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
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
    marginBottom: 50,
  },
  petSelection: {
    marginTop: 30,
    marginBottom: 30,
  },
  settingsLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#45da9cff',
    marginBottom: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 5,
  },
  settingLabel: {
    fontSize: 16,
    color: '#eee',
    flex: 1,
  },
  petPreview: {
    backgroundColor: '#3d3d3d',
    padding: 8,
    borderRadius: 8,
  },
  petEmoji: {
    fontSize: 24,
  },
  petNameDisplay: {
    fontSize: 16,
    color: '#45da9cff',
    fontWeight: 'bold',
  },
  backButton: {
    backgroundColor: '#45da9cff',
    padding: 15,
    borderRadius: 12,
    marginTop: 20,
  },
  backButtonText: {
    textAlign: 'center',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 20,
    width: '85%',
    maxHeight: '70%',
    marginBottom: 140,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#eee',
    textAlign: 'center',
    marginBottom: 20,
  },
  petGrid: {
    maxHeight: 300,
  },
  petOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#3d3d3d',
  },
  selectedPetOption: {
    backgroundColor: '#45da9cff',
  },
  petOptionEmoji: {
    fontSize: 24,
    marginRight: 15,
  },
  petOptionName: {
    fontSize: 16,
    color: '#eee',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#666',
    padding: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  modalCloseText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  nameModalContent: {
    backgroundColor: '#2d2d2d',
    borderRadius: 15,
    padding: 25,
    width: '80%',
    alignItems: 'center',
    marginBottom: 140,
  },
  nameInput: {
    backgroundColor: '#3d3d3d',
    color: '#eee',
    fontSize: 18,
    padding: 15,
    borderRadius: 8,
    width: '100%',
    textAlign: 'center',
    marginVertical: 20,
  },
  nameModalButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  nameButton: {
    backgroundColor: '#666',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
  },
  saveButton: {
    backgroundColor: '#45da9cff',
  },
  nameButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});