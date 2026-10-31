import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { AppBackground } from '../components/common/AppBackground';
import { AppHeader } from '../components/common/AppHeader';
import { PujaSearchBar } from '../components/puja/PujaSearchBar';
import { PujaCategoryChips } from '../components/puja/PujaCategoryChips';
import { PujaCard } from '../components/puja/PujaCard';
import { Button, EmptyState } from '../components/ui';
import { THEME } from '../constants/theme';
import { SPACE, TYPE } from '../constants/ui';
import { useAppData } from '../context/AppDataContext';
import type { Puja } from '../data/mockData';
import { matchesPujaFilter } from '../utils/catalog';

interface PujasScreenProps {
  onSelectPuja: (puja: Puja) => void;
  onNotificationPress?: () => void;
}

export const PujasScreen: React.FC<PujasScreenProps> = ({ onSelectPuja, onNotificationPress }) => {
  const { pujas, loading, error, refresh } = useAppData();
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('All Pujas');

  const categories = useMemo(() => ['All Pujas', ...Array.from(new Set(pujas.map((p) => p.category)))], [pujas]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return pujas.filter((p) => {
      if (!matchesPujaFilter(p, category)) return false;
      if (!q) return true;
      return [p.name, p.subtitle, p.description, p.deity, p.category].some((v) => v?.toLowerCase().includes(q));
    });
  }, [pujas, category, query]);

  const header = (
    <View>
      <PujaSearchBar value={query} onChangeText={setQuery} onClear={() => setQuery('')} placeholder="Search pujas or deities" />
      <PujaCategoryChips categories={categories} selectedCategory={category} onSelectCategory={setCategory} />
      <Text style={styles.count}>
        {filtered.length} {filtered.length === 1 ? 'puja' : 'pujas'}
      </Text>
    </View>
  );

  const empty = loading && !pujas.length ? (
    <ActivityIndicator color={THEME.colors.primarySaffron} style={styles.loader} />
  ) : error && !pujas.length ? (
    <EmptyState title="Could not load pujas" subtitle={error} action={<Button title="Retry" onPress={refresh} />} />
  ) : (
    <EmptyState title="No pujas found" subtitle="Try another search or choose All Pujas." />
  );

  return (
    <AppBackground variant="golden">
      <AppHeader title="Pujas" subtitle="Choose a puja and book a slot" onNotificationPress={onNotificationPress} />
      <FlatList
        data={filtered}
        keyExtractor={(p) => p.id}
        ListHeaderComponent={header}
        ListEmptyComponent={empty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={<RefreshControl refreshing={loading && pujas.length > 0} onRefresh={refresh} />}
        renderItem={({ item, index }) => <PujaCard puja={item} index={index} onPress={onSelectPuja} />}
      />
    </AppBackground>
  );
};

const styles = StyleSheet.create({
  list: { paddingBottom: SPACE.xxl },
  loader: { marginTop: 48 },
  count: { ...TYPE.caption, paddingHorizontal: SPACE.lg, marginBottom: SPACE.md },
});
