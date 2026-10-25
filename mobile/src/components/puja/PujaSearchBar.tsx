import React from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import { Search, X } from 'lucide-react-native';
import { THEME } from '../../constants/theme';

interface PujaSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
  placeholder?: string;
}

export const PujaSearchBar: React.FC<PujaSearchBarProps> = ({
  value,
  onChangeText,
  onClear,
  placeholder = 'Search pujas, rituals...',
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.inputWrapper}>
        <Search size={16} color="#8A8177" strokeWidth={2} style={styles.searchIcon} />
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor="#8A8177"
          style={styles.input}
          autoCapitalize="none"
          returnKeyType="search"
          accessibilityLabel="Search pujas"
        />
        {value.length > 0 ? (
          <TouchableOpacity
            onPress={onClear}
            activeOpacity={0.7}
            style={styles.clearButton}
            accessibilityLabel="Clear search"
          >
            <X size={14} color="#625950" strokeWidth={2.2} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingTop: 6,
    paddingBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#EFE7DD',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
  },
  searchIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 12.5,
    color: THEME.colors.heading,
    paddingVertical: 0,
  },
  clearButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#F3ECE3',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 6,
  },
});
