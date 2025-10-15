// screens/MedicationForm.js
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function MedicationForm({ navigation }) {
  const [patient, setPatient] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');

  const handleSave = async () => {
    if (!patient || !medicine || !dosage || !time) {
      Alert.alert('Missing info', 'Please fill in all fields.');
      return;
    }

    try {
      const newReminder = {
        id: Date.now().toString(),
        patient,
        medicine,
        dosage,
        time,
        dateAdded: new Date().toLocaleString(),
      };

      // Load existing reminders
      const existing = await AsyncStorage.getItem('reminders');
      const reminders = existing ? JSON.parse(existing) : [];

      // Add new reminder
      reminders.push(newReminder);

      // Save updated list
      await AsyncStorage.setItem('reminders', JSON.stringify(reminders));

      Alert.alert('Saved', 'Medication reminder added successfully.');
      navigation.navigate('ViewReminders');
    } catch (err) {
      console.error(err);
      Alert.alert('Error', 'Something went wrong while saving.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Add Medication Reminder</Text>

      <TextInput
        style={styles.input}
        placeholder="Patient Name"
        value={patient}
        onChangeText={setPatient}
      />

      <TextInput
        style={styles.input}
        placeholder="Medicine Name"
        value={medicine}
        onChangeText={setMedicine}
      />

      <TextInput
        style={styles.input}
        placeholder="Dosage (e.g., 1 tablet)"
        value={dosage}
        onChangeText={setDosage}
      />

      <TextInput
        style={styles.input}
        placeholder="Time (e.g., 8:00 AM)"
        value={time}
        onChangeText={setTime}
      />

      <Button title="Save Reminder" onPress={handleSave} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20, textAlign: 'center' },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
});
