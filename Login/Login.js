import React, { useState } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Alert } from 'react-native';
import { TextInput, Button } from 'react-native-paper';
import { db } from '../firebaseConfig';
import { collection, query, where, getDocs } from 'firebase/firestore';

export default function LoginForm({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [hidePassword, setHidePassword] = useState(true);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter both email and password");
      return;
    }

    try {
      // Query the "Users" collection where email matches
      const q = query(collection(db, "Users"), where("email", "==", email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        Alert.alert("Error", "No user found with this email");
        return;
      }

      // Get user data
      const userData = querySnapshot.docs[0].data();

      if (userData.password !== password) {
        Alert.alert("Error", "Incorrect password");
        return;
      }

      // ✅ Successful login
      Alert.alert("Welcome!", `Logged in as ${userData.fullName}\nRole: ${userData.role}`);

      // Example: Redirect based on role
      if (userData.role === "Guardian") {
        navigation.navigate("GuardianDashboard");
      } else if (userData.role === "Doctor") {
        navigation.navigate("DoctorDashboard");
      } else if (userData.role === "Patient") {
        navigation.navigate("PatientDashboard");
      } else {
        navigation.navigate("Home");
      }

    } catch (error) {
      console.error("Login error:", error);
      Alert.alert("Error", "Something went wrong while logging in.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Medication Reminder</Text>

      <TextInput
        label="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        style={styles.input}
        autoCapitalize="none"
      />

      <TextInput
        label="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry={hidePassword}
        right={
          <TextInput.Icon
            name={hidePassword ? "eye" : "eye-off"}
            onPress={() => setHidePassword(!hidePassword)}
            color={hidePassword ? "gray" : "black"}
          />
        }
        style={styles.input}
      />

      <Button mode="contained" onPress={handleLogin} style={styles.button}>
        Login
      </Button>

      <TouchableOpacity onPress={() => Alert.alert("Forgot Password", "Functionality coming soon!")}>
        <Text style={styles.forgot}>Forgot Password?</Text>
      </TouchableOpacity>

      <View style={styles.signupContainer}>
        <Text>Don't have an account? </Text>
        <TouchableOpacity onPress={() => navigation.navigate("ChooseRole")}>
          <Text style={styles.signupText}>Sign Up</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#f0f4f7',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 40,
    color: '#3b5998',
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    marginVertical: 10,
    padding: 5,
  },
  forgot: {
    textAlign: 'center',
    color: '#3b5998',
    marginVertical: 10,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 20,
  },
  signupText: {
    color: '#3b5998',
    fontWeight: 'bold',
  },
}); 