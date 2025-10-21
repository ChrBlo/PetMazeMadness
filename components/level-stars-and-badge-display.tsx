import { Image } from 'expo-image';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet, Text, View } from 'react-native';
import { typography } from '../utils/typography';

interface LevelStarsDisplayProps {
  earnedStars: number;
  normalModeCompleted: boolean;
  chaosModeCompleted: boolean;
}

export function LevelStarsAndBadgeDisplay({ earnedStars, normalModeCompleted, chaosModeCompleted }: LevelStarsDisplayProps) {
  const { t } = useTranslation();
  
  return (
    <>
      {/* Stars Row */}
      <View style={styles.starsRow}>
        {[0, 1, 2, 3, 4].map((index) => {
          const starOrder = [0, 1, 4, 3, 2];
          const starNumber = starOrder[index];

          return (
            <Image
              key={index}
              style={[
                styles.star,
                index === 0 && styles.star1,
                index === 1 && styles.star2,
                index === 2 && styles.star3,
                index === 3 && styles.star4,
                index === 4 && styles.star5,
              ]}
              source={starNumber < earnedStars 
                ? require('../assets/images/orange_star.png')
                : require('../assets/images/no_star.png')
              }
            />
          );
        })}
      </View>
      
      {/* Badges Row */}
      <View style={styles.badgesRow}>
        <View style={styles.modeBadge}>
          <Text style={styles.badgeText}>{t('BadgeDisplayComponent.normalBadgeText')}</Text>
          <Image 
            style={styles.badge} 
            source={normalModeCompleted 
              ? require('../assets/images/dark_bluegreen_check.png')
              : require('../assets/images/not_completed.png')
            } 
          />
        </View>
        
        <View style={styles.modeBadge}>
          <Text style={styles.badgeText}>{t('BadgeDisplayComponent.chaosBadgeText')}</Text>
          <Image 
            style={styles.badge} 
            source={chaosModeCompleted 
              ? require('../assets/images/dark_bluegreen_check.png')
              : require('../assets/images/not_completed.png')
            } 
          />
        </View>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  starsRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'center',
    marginLeft: 11,
  },
  star: {
    width: 24,
    height: 24,
  },
  badgesRow: {
    flexDirection: 'row',
    gap: 14,
    alignItems: 'center',
  },
  modeBadge: {
    alignItems: 'center',
    gap: 3,
  },
  badge: {
    width: 32,
    height: 32,
  },
  badgeText: {
    fontSize: typography.body,
    color: '#bbb',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  star1: {
    transform: [{ rotate: '-10deg' }],
  },
  star2: {
    transform: [{ rotate: '-5deg' }, { scale: 1.2 }],
    marginBottom: 15,
  },
  star3: {
    transform: [{ scale: 1.4 }],
    marginBottom: 25,
    marginLeft: 6,
    marginRight: 6,
  },
  star4: {
    transform: [{ rotate: '5deg' }, { scale: 1.2 }],
    marginBottom: 15,
  },
  star5: {
    transform: [{ rotate: '10deg' }],
  }
});