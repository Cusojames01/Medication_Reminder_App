import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Image, TouchableOpacity,  KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {db} from '../firebaseConfig';   
import {doc, setDoc} from 'firebase/firestore';



function generateGuardianID() {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `GAR-${randomPart}`;
}
export default function GuardianRegistrationForm() {
  const [guardian, setGuardian] = useState({
    fullName: '',
    email: '',
    password: '',
    contactNumber: '',
    profilePic: null,
    sex: '',
    dateOfBirth: null,
   relationship_to_patient:''
  });
  const [hidePassword, setHidePassword] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setGuardian({ ...guardian, [field]: value });
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setGuardian({ ...guardian, profilePic: result.assets[0].uri });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || guardian.dateOfBirth;
    setShowDatePicker(false);
    setGuardian({ ...guardian, dateOfBirth: currentDate });
  };

  const handleRegister = async() => {
    const {
      fullName, email, password, contactNumber, profilePic,
      sex, dateOfBirth,  relationship_to_patient
    } = guardian;

    if (!fullName || !email || !password|| !contactNumber || !sex ||  !dateOfBirth ||
        !profilePic|| ! relationship_to_patient ) {
      Alert.alert('Error', 'Please fill in all fields and select a profile picture');
      return;
    }

     if (!password || typeof password !== "string") {
        Alert.alert("Error", "Invalid password. Please enter a valid string.");
        return;
     }
    
 try{
    const hashedPassword = await bcrypt.hash(password, 10);
    const guardianID = generateGuardianID();
    const guardianRef = doc(db, "Users", guardianID);
    await setDoc(guardianRef,{
       role:'Guardian',
      guardianID,
        fullName,
        sex,
        dateOfBirth,
        email,
        password,
        contactNumber,
        profilePic,
        relationship_to_patient,
         dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
              createdAt: new Date()
    });
 
    Alert.alert('Registration Successful', `Guardian: ${fullName}`);
    // You can send doctor object to Firebase here
      setGuardian({
       fullName: '',
        email: '',
        password: '',
        contactNumber: '',
        profilePic: null,
        sex: '',
        dateOfBirth: null,
           relationship_to_patient:''
    });
  }catch(error){
    console.error("Error adding guardian:", error);
          Alert.alert("❌ Error", "Failed to register guardian");
  }
};
  
  return (
    <KeyboardAvoidingView   style={{ flex: 1 }} behavior={Platform.OS==='android'? 'height':'padding'}>
    
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Guardian Registration</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {guardian.profilePic ? (
          <Image source={{ uri: guardian.profilePic }} style={styles.image} />
        ) : (
          <Text style ={styles.imgtext}>Select Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput
        label="Full Name"
        value={guardian.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={guardian.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={guardian.password}
        onChangeText={(text) => handleChange('password', text)}
        secureTextEntry={hidePassword}
        right={<TextInput.Icon name={hidePassword ? 'eye' : 'eye-off'} onPress={() => setHidePassword(!hidePassword)} />}
        style={styles.input}
      />

      <TextInput
        label="Contact Number"
        value={guardian.contactNumber}
        onChangeText={(text) => handleChange('contactNumber', text)}
        keyboardType="phone-pad"
        style={styles.input}
      />

      {/* Sex */}
      <View style={{ marginVertical: 10 }}>
        <Text>Sex:</Text>
        <RadioButton.Group
          onValueChange={(value) => handleChange('sex', value)}
          value={guardian.sex}
        >
          <View style={styles.radioRow}>
            <RadioButton value="Male" />
            <Text>Male</Text>
            <RadioButton value="Female" />
            <Text>Female</Text>
          </View>
        </RadioButton.Group>
      </View>


      {/* Date of Birth */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>Date of Birth: {' '} {guardian.dateOfBirth ? guardian.dateOfBirth.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={guardian.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      <TextInput
      label="Relationship to Patient"
       value={guardian. relationship_to_patient}
        onChangeText={(text) => handleChange('relationship_to_patient', text)}
           style={styles.input}
      />

      <Button mode="contained" onPress={handleRegister} style={styles.button}>
        Register
      </Button>
    </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    marginTop:25,
      paddingBottom: 40, 
    backgroundColor: '#f0f4f7',
    flexGrow: 1,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,

    color: '#3b5998',
  },
  imagePicker: {
    alignSelf: 'center',
    marginBottom: 20,
    width: 120,
    height: 120,
    backgroundColor: '#ddd',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 60,
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
  },
  input: {
    marginBottom: 20,
    backgroundColor: 'white',
  },
  button: {
    marginTop: 10,
    padding: 5,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  datePicker: {
    padding: 15,
    backgroundColor: 'white',
    marginBottom: 20,
    borderRadius: 5,
  },
  imgtext:{
    marginLeft:20,
  }
});
