import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getDefaultPet, getPetById, Pet, pets } from '../../data/pets';
import { GyroMode } from '../../hooks/useGameSensors';
import { SettingsScreenProps } from '../_layout';

export default function SettingsScreen({ route, navigation }: SettingsScreenProps) {
    
  const [selectedGyroMode, setSelectedGyroMode] = useState<GyroMode>(route.params?.gyroMode || GyroMode.NORMAL);
  const [weatherCheckEnabled, setWeatherCheckEnabled] = useState(route.params?.weatherCheckEnabled ?? true);
  const [selectedPet, setSelectedPet] = useState<Pet>(route.params?.selectedPet || getDefaultPet());
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [customName, setCustomName] = useState(route.params?.selectedPet?.name || getDefaultPet().name);

  const handlePetSelection = (petId: string) => {
    const newPet = getPetById(petId);
    setSelectedPet(newPet);
    setCustomName(newPet.name);
    setShowPetSelector(false);
  };

  const handleNameEdit = () => {
    setCustomName(selectedPet.name);
    setShowNameEditor(true);
  };

  const handleNameSave = () => {
    const originalPet = getPetById(selectedPet.id);
    const trimmedName = customName.trim();
    const finalName = trimmedName || originalPet.name;
    
    const updatedPet: Pet = {
      ...selectedPet,
      name: finalName
    };
    setSelectedPet(updatedPet);
    setCustomName(finalName);
    setShowNameEditor(false);
  };

  const handleNameEditCancel = () => {
    setCustomName('');
    setShowNameEditor(false);
  };
    
  const goBack = () => {
    navigation.navigate('Start', {
      weatherCheckEnabled, 
      selectedPet,
      gyroMode: selectedGyroMode
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Inställningar</Text>
      
      <Text style={styles.settingsLabel}>Väder</Text>
      <View style={styles.settingRow}>
        {/* //TODO Fixa så att denna lagras när man sparat, gått till StartScreen och sen tillbaka hit. */}
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

        <TouchableOpacity style={styles.settingRow} onPress={handleNameEdit}>
          <Text style={styles.settingLabel}>Namn</Text>
          <Text style={styles.petNameDisplay}>{selectedPet.name}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.settingsLabel}>Spelstyrning</Text>
      <View style={styles.settingRow}>

        <Text style={styles.settingLabel}>Gyro-läge</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity 
            style={[styles.segment, selectedGyroMode === GyroMode.NORMAL && styles.activeSegment]}
            onPress={() => setSelectedGyroMode(GyroMode.NORMAL)}
          >
            <Text style={styles.segmentText}>Normal</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.segment, selectedGyroMode === GyroMode.CHAOS && styles.activeSegment]}
            onPress={() => setSelectedGyroMode(GyroMode.CHAOS)}
          >
            <Text style={styles.segmentText}>Kaos</Text>
          </TouchableOpacity>
        </View>
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
              {pets.map((pet) => (
                <TouchableOpacity
                  key={pet.id}
                  style={[
                    styles.petOption,
                    selectedPet.id === pet.id && styles.selectedPetOption
                  ]}
                  onPress={() => handlePetSelection(pet.id)}
                >
                  <Text style={styles.petOptionEmoji}>{pet.emoji}</Text>
                  <Text style={styles.petOptionName}>{pet.name}</Text>
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

      {/* Name Edit Modal */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={showNameEditor}
        onRequestClose={handleNameEditCancel}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.nameModalContent}>
            <Text style={styles.modalTitle}>Namnge ditt husdjur</Text>
            <Text style={styles.petEmoji}>{selectedPet.emoji}</Text>
            <TextInput
              style={styles.nameInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder={getPetById(selectedPet.id).name}
              placeholderTextColor="#999"
              maxLength={25}
              autoFocus
            />
            <TouchableOpacity 
              style={styles.clearButton}
              onPress={() => {setCustomName('')}}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.nameModalButtons}>
              <TouchableOpacity style={styles.nameButton} onPress={handleNameEditCancel}>
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
  clearButton: {
    position: 'absolute',
    right: 35,
    top: '69%',
    transform: [{ translateY: -12 }],
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#eee',
    fontSize: 14,
    fontWeight: 'bold',
  },
  segmentedControl: {
    flexDirection: 'row',
    backgroundColor: '#3d3d3dff',
    borderRadius: 8,
  },
  segment: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  activeSegment: {
    backgroundColor: '#45da9cff',
  },
  segmentText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});