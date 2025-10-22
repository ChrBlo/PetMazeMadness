import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Modal, ScrollView, StyleSheet, Switch, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { GradientButton } from '../../components/gradient-button';
import PetImage from '../../components/pet-image';
import { getDefaultPet, getPetById, Pet, pets, getTranslatedPetName, getPetByIdWithTranslation } from '../../data/pets';
import { GyroMode } from '../../hooks/useGameSensors';
import { CRUDManager } from '../../utils/CRUD-manager';
import { typography } from '../../utils/typography';
import { SettingsScreenProps } from '../root-layout';

export default function SettingsScreen({ route, navigation }: SettingsScreenProps) {
  const { t } = useTranslation();
  
  const [selectedGyroMode, setSelectedGyroMode] = useState<GyroMode>(route.params?.gyroMode || GyroMode.NORMAL);
  const [showPetSelector, setShowPetSelector] = useState(false);
  const [showNameEditor, setShowNameEditor] = useState(false);
  const [selectedPet, setSelectedPet] = useState<Pet>(route.params?.selectedPet || getDefaultPet());
  const [customName, setCustomName] = useState(route.params?.selectedPet?.name || getDefaultPet().name);
  const [invertedGameControls, setInvertedGameControls] = useState(route.params?.invertedGameControls ?? false);
  
  const handlePetSelection = async (petId: string) => {
    const newPet = getPetByIdWithTranslation(petId);
    setSelectedPet(newPet);
    setCustomName(newPet.name);
    setShowPetSelector(false);

    await CRUDManager.saveSelectedPet(newPet);
  };

  const handleNameEdit = () => {
    setCustomName(selectedPet.name);
    setShowNameEditor(true);
  };

  const handleNameSave = async () => {
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

    await CRUDManager.saveSelectedPet(updatedPet);
  };

  const handleNameEditCancel = () => {
    setCustomName('');
    setShowNameEditor(false);
  };
    
  const goBack = () => {
    navigation.navigate('Start', {
      selectedPet,
      gyroMode: selectedGyroMode,
      invertedGameControls
    });
  };

  return (
    <ScrollView
          style={styles.container}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={true}
        >
    <View style={styles.container}>
      
      <Text style={styles.title}>{t('settings.screenTitle')}</Text>

      <View>
        <Text style={styles.settingsLabel}>{t('settings.selectPetLabel')}</Text>
      
        <TouchableOpacity style={styles.settingRow} onPress={() => setShowPetSelector(true)}>
          <Text style={styles.settingsText}>{t('settings.selectPet')}</Text>
          <View style={styles.petPreview}>
            {/* <Text style={styles.petEmoji}>{selectedPet.emoji}</Text> */}
            <PetImage source={selectedPet.emoji} size={24} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingRow} onPress={handleNameEdit}>
          <Text style={styles.settingsText}>{t('settings.name')}</Text>
          <Text style={styles.petNameDisplay}>{getTranslatedPetName(selectedPet)}</Text>
        </TouchableOpacity>
      </View>

      <Text style={styles.settingsLabel}>{t('settings.gameControlsLabel')}</Text>
      <View style={styles.settingRow}>

        <Text style={styles.settingsText}>{t('settings.gyroMode')}</Text>
        <View style={styles.segmentedControl}>
          <TouchableOpacity
            style={[styles.segment, selectedGyroMode === GyroMode.NORMAL && styles.activeSegment]}
            onPress={() => setSelectedGyroMode(GyroMode.NORMAL)}
          >
            <Text style={styles.segmentText}>{t('settings.gyroModeNormal')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.segment, selectedGyroMode === GyroMode.CHAOS && styles.activeSegment]}
            onPress={() => setSelectedGyroMode(GyroMode.CHAOS)}
          >
            <Text style={styles.segmentText}>{t('settings.gyroModeChaos')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.settingsLabel}>{t('settings.invertControlsLabel')}</Text>
      <View style={styles.settingRow}>
        <Text style={styles.settingsText}>
          {t('settings.invert')}
        </Text>
        <Switch
          value={invertedGameControls}
          onValueChange={setInvertedGameControls}
          trackColor={{ false: '#666', true: '#5ccf9fff' }}
        />
      </View>

      <GradientButton
        titleKey="settings.saveButtonText"
        onPress={goBack}
        theme="blue"
        style={styles.backButton}
        textStyle={styles.backButtonText}
      />

      {/* Pet Selector Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={showPetSelector}
        onRequestClose={() => setShowPetSelector(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('settings.selectYourPet')}</Text>
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
                  <PetImage source={pet.emoji} size={typography.h1} style={{ marginRight: 15 }} />
                  <Text style={styles.petOptionName}>{t(pet.name)}</Text>
                  <View style={styles.separator} />
                  <Text style={styles.petOptionName}>{t('settings.enemy')}</Text>
                  <PetImage source={pet.enemyEmoji} size={typography.h1} style={{ marginRight: 10 }}/>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={() => setShowPetSelector(false)}
            >
              <Text style={styles.modalCloseText}>{t('settings.savePetAndNameSelctionButtons')}</Text>
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
            <Text style={styles.modalTitle}>{t('settings.nameYourPet')}</Text>
            {/* <Text style={styles.petEmoji}>{selectedPet.emoji}</Text> */}
            <PetImage source={selectedPet.emoji} size={50} />
            <TextInput
              style={styles.nameInput}
              value={customName}
              onChangeText={setCustomName}
              placeholder={t(getPetById(selectedPet.id).name)}
              placeholderTextColor="#999"
              maxLength={25}
              autoFocus
            />
            <TouchableOpacity
              style={styles.clearButton}
              onPress={() => { setCustomName('') }}
              activeOpacity={0.7}
            >
              <Text style={styles.clearButtonText}>✕</Text>
            </TouchableOpacity>
            <View style={styles.nameModalButtons}>
              <TouchableOpacity style={styles.nameButton} onPress={handleNameEditCancel}>
                <Text style={styles.nameButtonText}>{t('settings.abortNamingPetButton')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.nameButton, styles.saveButton]} onPress={handleNameSave}>
                <Text style={styles.nameButtonText}>{t('settings.savePetAndNameSelctionButtons')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
   scrollContent: {
    paddingBottom: 80,
  },
  container: {
    flex: 1,
    backgroundColor: '#221c17ff',
    padding: 20,
    paddingTop: 30,
  },
  title: {
    fontSize: typography.h3,
    fontWeight: 'bold',
    color: '#eee',
    marginTop: 30,
    textAlign: 'center',
  },
  settingsLabel: {
    fontSize: typography.h5,
    fontWeight: 'bold',
    color: '#5ccf9fff',
    marginTop: 35,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    fontSize: typography.body,
    color: '#eee',
    marginTop: 5,
    marginBottom: 10,
  },
  settingsText: {
    fontSize: typography.body,
    color: '#eee',
  },
  petPreview: {
    backgroundColor: '#3d3d3d',
    padding: 6,
    borderRadius: 6,
  },
  petNameDisplay: {
    fontSize: typography.body,
    color: '#5ccf9fff',
    fontWeight: 'bold',
  },
  backButton: {
    padding: 10,
    borderRadius: 12,
    marginTop: 15,
    width: '100%',
  },
  backButtonText: {
    textAlign: 'center',
    color: '#ffffffff',
    fontSize: typography.h4,
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
    fontSize: typography.h4,
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
    padding: 8,
    paddingLeft: 14,
    borderRadius: 10,
    marginBottom: 10,
    backgroundColor: '#666',
  },
  selectedPetOption: {
    backgroundColor: '#5da6d6ff',
  },
  petOptionName: {
    fontSize: typography.body,
    color: '#eee',
    fontWeight: 'bold',
  },
  modalCloseButton: {
    backgroundColor: '#5da6d6ff',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 15,
  },
  modalCloseText: {
    color: 'white',
    textAlign: 'center',
    fontSize: typography.body,
    fontWeight: 'bold',
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
    backgroundColor: '#666',
    color: '#eee',
    fontSize: typography.h5,
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
    backgroundColor: '#5da6d6ff',
  },
  nameButtonText: {
    color: 'white',
    fontSize: typography.body,
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
    backgroundColor: '#666',
    justifyContent: 'center',
    alignItems: 'center',
  },
  clearButtonText: {
    color: '#eee',
    fontSize: typography.small,
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
    backgroundColor: '#5ccf9fff',
  },
  segmentText: {
    color: 'white',
    fontSize: typography.small,
    fontWeight: 'bold',
  },
  separator: {
    flex: 1,
  },
});