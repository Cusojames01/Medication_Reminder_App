import React from 'react';
import { View, StyleSheet, Alert, Text } from 'react-native';
import { Button } from 'react-native-paper';

export default function ChooseRole({ navigation }) {
  const handleRoleSelect = (role) => {
    Alert.alert('Role Selected', `You selected: ${role}`);
    // Later you can navigate to the correct screen:
    // navigation.navigate(roleScreen)
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Select Your Role</Text>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("DoctorRegistrationForm")}
      >
        Doctor
      </Button>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() => navigation.navigate("PatientRegistrationForm")}
      >
        Patient
      </Button>

      <Button
        mode="contained"
        style={styles.button}
        onPress={() =>navigation.navigate("GuardianRegistrationForm")}
      >
        Guardian
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#3b5998',
  },
  button: {
    width: '80%',
    paddingVertical: 10,
    marginVertical: 10,
    borderRadius: 10, // rounded corners
  },
});
