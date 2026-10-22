import { router, Stack } from "expo-router";
import { useMemo, useState } from "react";
import { FlatList, Platform, RefreshControl, TextInput, View } from "react-native";
import { api } from "@/api/client";
import { useAuth } from "@/auth/AuthContext";
import { Icon } from "@/components/Icon";
import { PersonRow } from "@/components/PersonRow";
import { Empty, ErrorView, Loading, styles } from "@/components/ui";
import { useFetch } from "@/hooks/useFetch";
import { colors, radius, space, touch, type } from "@/theme";

const PLACEHOLDER = "Prénom, ville, centre d'intérêt…";

export default function MembersScreen() {
  const { user: me } = useAuth();
  const { data, error, loading, refreshing, refresh, reload } = useFetch(api.users);
  const [query, setQuery] = useState("");
  const nativeSearch = Platform.OS === "ios";

  const members = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((u) => u.id !== me?.id)
      .filter((u) => !q || [u.userName, u.hometown ?? "", ...u.tags.map((t) => t.name)].some((s) => s.toLowerCase().includes(q)));
  }, [data, query, me?.id]);

  return (
    <>
      {/* iOS: the system search bar, built into the navigation bar. */}
      <Stack.Screen
        options={{
          headerSearchBarOptions: nativeSearch
            ? {
                placeholder: PLACEHOLDER,
                onChangeText: (e) => setQuery(e.nativeEvent.text),
                hideWhenScrolling: false,
                tintColor: colors.primaryText,
                cancelButtonText: "Annuler",
              }
            : undefined,
        }}
      />
      {loading ? (
        <Loading />
      ) : error ? (
        <ErrorView message={error} onRetry={reload} />
      ) : (
        <FlatList
          style={styles.screen}
          contentContainerStyle={styles.list}
          contentInsetAdjustmentBehavior="automatic"
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          data={members}
          keyExtractor={(u) => String(u.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={refresh} tintColor={colors.primary} />}
          ListHeaderComponent={nativeSearch ? null : <SearchField value={query} onChangeText={setQuery} />}
          ListEmptyComponent={
            <Empty icon="search" title="Aucun membre trouvé" text={query ? "Essayez un autre prénom, une autre ville ou un autre centre d'intérêt." : undefined} />
          }
          renderItem={({ item }) => (
            <PersonRow
              name={item.userName}
              picture={item.picture}
              title={`${item.userName}, ${item.age} ans`}
              subtitle={item.hometown}
              detail={item.tags.map((t) => t.name).join(" · ")}
              onPress={() => router.push(`/members/${item.id}`)}
            />
          )}
        />
      )}
    </>
  );
}

// Fallback search field where the native iOS search bar isn't available.
function SearchField({ value, onChangeText }: { value: string; onChangeText: (v: string) => void }) {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: space.sm, minHeight: touch.min + 4, backgroundColor: colors.fill, borderRadius: radius.md, paddingHorizontal: space.md }}>
      <Icon name="search" size={20} color={colors.secondaryText} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={PLACEHOLDER}
        placeholderTextColor={colors.secondaryText}
        accessibilityLabel="Rechercher un membre"
        clearButtonMode="while-editing"
        style={[type.callout, { flex: 1, color: colors.text, paddingVertical: space.sm }]}
      />
    </View>
  );
}
