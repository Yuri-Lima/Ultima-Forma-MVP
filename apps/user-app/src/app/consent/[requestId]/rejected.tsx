import { View, Text, StyleSheet } from 'react-native';

export default function RejectedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>✕</Text>
      <Text style={styles.title}>Consentimento Rejeitado</Text>
      <Text style={styles.subtitle}>
        A solicitação foi recusada. Nenhum dado foi compartilhado.
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
  icon: { fontSize: 64, color: '#ef4444', marginBottom: 24 },
  title: { fontSize: 22, fontWeight: '600', marginBottom: 12, textAlign: 'center' },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
});
