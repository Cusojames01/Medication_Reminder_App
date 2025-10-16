import React, { useState, useEffect } from 'react';
import { View, Text, Button, TextInput, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';
import * as Speech from 'expo-speech';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';

// --- Notification setup ---
Notifications.requestPermissionsAsync();

// Schedule local notification
async function scheduleNotification(reminder) {
  const trigger = new Date(reminder.time);
  await Notifications.scheduleNotificationAsync({
    content: {
      title: '💊 Medicine Reminder',
      body: `Drink ${reminder.dosage} of ${reminder.medicine}`,
    },
    trigger,
  });
}

const Stack = createStackNavigator();

// --- Home Screen ---
function HomeScreen({ navigation }) {
  const [reminders, setReminders] = useState([]);

  useEffect(() => {
    loadReminders();
  }, []);

  async function loadReminders() {
    const data = await AsyncStorage.getItem('reminders');
    if (data) setReminders(JSON.parse(data));
  }

  async function markAsTaken(index) {
    const updated = [...reminders];
    updated[index].taken = true;
    await AsyncStorage.setItem('reminders', JSON.stringify(updated));
    setReminders(updated);
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>💊 Medicine Reminders</Text>
      <Button title="Add Reminder" onPress={() => navigation.navigate('AddReminder')} />

      <FlatList
        style={{ marginTop: 20 }}
        data={reminders}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item, index }) => (
          <View style={styles.card}>
            <Text>👤 Patient: {item.patientId}</Text>
            <Text>💊 Medicine: {item.medicine}</Text>
            <Text>💧 Dosage: {item.dosage}</Text>
            <Text>⏰ Time: {new Date(item.time).toLocaleTimeString()}</Text>
            <Text>📦 Tablets: {item.supply}</Text>
            <Text>Status: {item.taken ? '✅ Taken' : '🕒 Pending'}</Text>

            {!item.taken && (
              <>
                <TouchableOpacity
                  style={styles.btnTake}
                  onPress={() => markAsTaken(index)}>
                  <Text style={{ color: 'white' }}>Mark as Taken</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.btnSpeak}
                  onPress={() =>
                    Speech.speak(`Reminder: Drink ${item.dosage} of ${item.medicine} at ${new Date(item.time).toLocaleTimeString()}`)
                  }>
                  <Text>🔊 Speak</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

// --- Add Reminder Screen ---
function AddReminder({ navigation }) {
  const [patientId, setPatientId] = useState('');
  const [medicine, setMedicine] = useState('');
  const [dosage, setDosage] = useState('');
  const [time, setTime] = useState('');
  const [supply, setSupply] = useState('');

  async function saveReminder() {
    if (!patientId || !medicine || !dosage || !time) return alert('Fill all fields');
    const newReminder = { patientId, medicine, dosage, time, supply, taken: false };

    const data = await AsyncStorage.getItem('reminders');
    const reminders = data ? JSON.parse(data) : [];
    reminders.push(newReminder);
    await AsyncStorage.setItem('reminders', JSON.stringify(reminders));

    await scheduleNotification(newReminder);
    alert('Reminder saved and notification scheduled!');
    navigation.navigate('Home');
  }

  return (
    <View style={styles.container}>
      <Text style={styles.header}>➕ Add Reminder</Text>

      <TextInput placeholder="Patient ID" value={patientId} onChangeText={setPatientId} style={styles.input} />
      <TextInput placeholder="Medicine" value={medicine} onChangeText={setMedicine} style={styles.input} />
      <TextInput placeholder="Dosage" value={dosage} onChangeText={setDosage} style={styles.input} />
      <TextInput placeholder="Time (YYYY-MM-DD HH:MM)" value={time} onChangeText={setTime} style={styles.input} />
      <TextInput placeholder="Number of Tablets" value={supply} onChangeText={setSupply} style={styles.input} keyboardType="numeric" />

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Button title="Cancel" color="gray" onPress={() => navigation.goBack()} />
        <Button title="Save" onPress={saveReminder} />
      </View>
    </View>
  );
}

// --- Main App ---
export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="AddReminder" component={AddReminder} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// --- Styles ---
const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f9f9f9' },
  header: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  card: { backgroundColor: 'white', padding: 15, marginBottom: 10, borderRadius: 10, elevation: 2 },
  btnTake: { backgroundColor: 'green', padding: 8, marginTop: 8, borderRadius: 5, alignItems: 'center' },
  btnSpeak: { backgroundColor: '#ddd', padding: 8, marginTop: 5, borderRadius: 5, alignItems: 'center' },
});
