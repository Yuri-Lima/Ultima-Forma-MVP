import { View, Text, StyleSheet } from 'react-native';

export default function ApprovedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✓</Text>
      <Text style={styles.title}>Consentimento Aprovado</Text>
      <Text style={styles.subtitle}>
        Os dados foram compartilhados com sucesso conforme sua autorização.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  icon: { fontSize: 64, color: '#22c55e', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
