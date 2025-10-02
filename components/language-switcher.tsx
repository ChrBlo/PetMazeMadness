import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export function LanguageSwitcher() {

  const { i18n } = useTranslation();
  
  const toggleLanguage = () => {
    const newLang = i18n.language === 'sv' ? 'en' : 'sv';
    i18n.changeLanguage(newLang);
  };
  
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleLanguage}>
        <Text style={styles.flag}>
          {i18n.language === 'sv' ? '🇬🇧' : '🇸🇪'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  flag: {
    fontSize: 35,
  }
});