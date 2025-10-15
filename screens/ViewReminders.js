// screens/ViewReminders.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, Button, Alert, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ViewReminders() {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  const loadReminders = async () => {
    const stored = await AsyncStorage.getItem('reminders');
    if (stored) setReminders(JSON.parse(stored));
  };

  const handleDelete = async (id) => {
    const updated = reminders.filter((r) => r.id !== id);
    await AsyncStorage.setItem('reminders', JSON.stringify(updated));
    setReminders(updated);
    Alert.alert('Deleted', 'Reminder has been removed.');
  };

  const renderReminder = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.medicine}>{item.medicine}</Text>
      <Text>👤 {item.patient}</Text>
      <Text>💊 {item.dosage}</Text>
      <Text>🕒 {item.time}</Text>
      <Text style={styles.date}>Added: {item.dateAdded}</Text>
      <TouchableOpacity onPress={() => handleDelete(item.id)} style={styles.deleteBtn}>
        <Text style={styles.deleteText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Reminders</Text>
      {reminders.length === 0 ? (
        <Text style={{ textAlign: 'center', marginTop: 20 }}>No reminders yet.</Text>
      ) : (
        <FlatList
          data={reminders}
          keyExtractor={(item) => item.id}
          renderItem={renderReminder}
        />
      )}
      <Button title="Refresh" onPress={loadReminders} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: '#f9f9f9' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 10, textAlign: 'center' },
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    elevation: 2,
  },
  medicine: { fontSize: 18, fontWeight: 'bold', color: '#2a7' },
  date: { fontSize: 12, color: '#666', marginTop: 5 },
  deleteBtn: {
    backgroundColor: '#ff5555',
    marginTop: 10,
    padding: 6,
    borderRadius: 5,
    alignSelf: 'flex-start',
  },
  deleteText: { color: '#fff', fontWeight: 'bold' },
});
