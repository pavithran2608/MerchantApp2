import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

interface StatCardProps {
  title: string;
  value: string;
  subtitle?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, subtitle }) => {
  const { colors } = useTheme();

  return (
    <View style={[
      styles.card,
      {
        backgroundColor: colors.card,
        shadowColor: colors.shadow,
        borderColor: colors.border,
      }
    ]}>
      <Text style={[
        styles.title,
        { color: colors.textSecondary }
      ]}>
        {title}
      </Text>
      
      <Text style={[
        styles.value,
        { color: colors.primary }
      ]} numberOfLines={1} adjustsFontSizeToFit>
        {value}
      </Text>
      
      {subtitle && (
        <Text style={[
          styles.subtitle,
          { color: colors.textSecondary }
        ]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    marginHorizontal: 6,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 140,
  },
  title: {
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 1,
    opacity: 0.8,
  },
  value: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 8,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 9,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    opacity: 0.7,
  },
});

export default StatCard;
