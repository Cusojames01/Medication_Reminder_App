import React, { useState } from 'react';
import { View, StyleSheet, Text, ScrollView, Alert, Image, TouchableOpacity,  KeyboardAvoidingView, Keyboard, Platform } from 'react-native';
import { TextInput, Button, RadioButton } from 'react-native-paper';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import {db} from '../firebaseConfig';   
import {doc, setDoc} from 'firebase/firestore';




function generateDoctorID() {
  const randomPart = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `DOC-${randomPart}`;
}
export default function DoctorRegistrationForm() {
  const [doctor, setDoctor] = useState({
     role:'Doctor',
    fullName: '',
    email: '',
    password: '',
    specialization: '',
    contactNumber: '',
    profilePic: null,
    sex: '',
    licenseNumber: '',
    dateOfBirth:null,
    hospital: '',
  });
  const [hidePassword, setHidePassword] = useState(true);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const handleChange = (field, value) => {
    setDoctor({ ...doctor, [field]: value });
  };

  const pickImage = async () => {
      const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.5,
    });

    if (!result.canceled) {
      setDoctor({ ...doctor, profilePic: result.assets[0].uri });
    }
  };

  const handleDateChange = (event, selectedDate) => {
    const currentDate = selectedDate || doctor.dateOfBirth;
    setShowDatePicker(false);
    setDoctor({ ...doctor, dateOfBirth: currentDate });
  };

  const handleRegister = async () => {
    const {
      fullName, email, password, specialization, contactNumber, profilePic,
      sex, licenseNumber, dateOfBirth, hospital
    } = doctor;

    if (!fullName || !email || !password || !specialization || !contactNumber ||
        !profilePic || !licenseNumber || !hospital) {
      Alert.alert('Error', 'Please fill in all fields and select a profile picture');
      return;
    }


    try{


        const DoctorID = generateDoctorID();
        const DoctorRef = doc(db, "Users", DoctorID);
        await setDoc(DoctorRef,{
          role:'Doctor',
          DoctorID,
          fullName,
          licenseNumber,
          email,
          password,
          specialization,
          contactNumber,
          profilePic,
          dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
          hospital,
          createdAt: new Date()
        });
    Alert.alert('Registration Successful', `Doctor: ${fullName}`);
    // You can send doctor object to Firebase here

      setDoctor({
        fullName:'',
        licenseNumber:'',
        password: '',
        email: '',
        specialization: '',
        contactNumber: '',
        profilePic: null,
        sex: '',
        dateOfBirth: null,
        specialization:'',
        hospital:'',

    });
        }catch(error){
            console.error("Error adding doctor", error);
                  Alert.alert("❌ Error", "Failed to register doctor");
          }
  };

  return (
    <KeyboardAvoidingView   style={{ flex: 1 }} behavior={Platform.OS==='android'? 'height':'padding'}>
    
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Doctor Registration</Text>

      <TouchableOpacity onPress={pickImage} style={styles.imagePicker}>
        {doctor.profilePic ? (
          <Image source={{ uri: doctor.profilePic }} style={styles.image} />
        ) : (
          <Text  style ={styles.imgtext} >Select Profile Picture</Text>
        )}
      </TouchableOpacity>

      <TextInput
        label="Full Name"
        value={doctor.fullName}
        onChangeText={(text) => handleChange('fullName', text)}
        style={styles.input}
      />
      <TextInput
        label="Email"
        value={doctor.email}
        onChangeText={(text) => handleChange('email', text)}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />
      <TextInput
        label="Password"
        value={doctor.password}
        onChangeText={(text) => handleChange('password', text)}
        secureTextEntry={hidePassword}
        right={<TextInput.Icon name={hidePassword ? 'eye' : 'eye-off'} onPress={() => setHidePassword(!hidePassword)} />}
        style={styles.input}
      />
      <TextInput
        label="Specialization"
        value={doctor.specialization}
        onChangeText={(text) => handleChange('specialization', text)}
        style={styles.input}
      />
      <TextInput
        label="Contact Number"
        value={doctor.contactNumber}
        onChangeText={(text) => handleChange('contactNumber', text)}
        keyboardType="phone-pad"
        style={styles.input}
      />

      {/* Sex */}
      <View style={{ marginVertical: 10 }}>
        <Text>Sex:</Text>
        <RadioButton.Group
          onValueChange={(value) => handleChange('sex', value)}
          value={doctor.sex}
        >
          <View style={styles.radioRow}>
            <RadioButton value="Male" />
            <Text>Male</Text>
            <RadioButton value="Female" />
            <Text>Female</Text>
          </View>
        </RadioButton.Group>
      </View>

      {/* License Number */}
      <TextInput
        label="License Number"
        value={doctor.licenseNumber}
        onChangeText={(text) => handleChange('licenseNumber', text)}
        style={styles.input}
      />

      {/* Date of Birth */}
      <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.datePicker}>
        <Text>Date of Birth: {''} { doctor.dateOfBirth ? doctor.dateOfBirth.toDateString() : 'Select Date'}</Text>
      </TouchableOpacity>
      {showDatePicker && (
        <DateTimePicker
          value={doctor.dateOfBirth || new Date()}
          mode="date"
          display="default"
          onChange={handleDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* Hospital */}
      <TextInput
        label="Hospital Name / Area"
        value={doctor.hospital}
        onChangeText={(text) => handleChange('hospital', text)}
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
