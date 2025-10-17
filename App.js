import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from './Login/Login';
import ChooseRole from './Registration/ChooseRole';
import DoctorRegistrationForm from './Registration/DoctorRegistrationForm';
import GuardianRegistrationForm from './Registration/Guardian_RegistrationForm';
import PatientRegistrationForm from './Registration/Patient_registrationForm';
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName="LoginForm">
        <Stack.Screen name="LoginForm" component={LoginForm} options={{ headerShown: false }} />
        <Stack.Screen name="ChooseRole" component={ChooseRole} options={{ headerShown: false }} />
           <Stack.Screen name="DoctorRegistrationForm" component={DoctorRegistrationForm} options={{ headerShown: false }} />
            <Stack.Screen name="GuardianRegistrationForm" component={GuardianRegistrationForm} options={{ headerShown: false }} />
               <Stack.Screen name="PatientRegistrationForm" component={PatientRegistrationForm} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
