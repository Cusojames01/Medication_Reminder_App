import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginForm from './Login/Login';
import ChooseRole from './Registration/ChooseRole';
import DoctorRegistrationForm from './Registration/DoctorRegistrationForm';
import GuardianRegistrationForm from './Registration/Guardian_RegistrationForm';
import PatientRegistrationForm from './Registration/Patient_registrationForm';
import GuardianHome from './Guardian/Guardian_homepage';
import PatientHome from './Patient/Patient_homepage';
import DoctorHome from './Doctor/Doctor_Homepage';



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
                <Stack.Screen name="GuardianHome" component={GuardianHome} options={{ headerShown: false }} />
                  <Stack.Screen name="PatientHome" component={PatientHome} options={{ headerShown: false }} />
                  <Stack.Screen name="DoctorHome" component={DoctorHome} options={{ headerShown: false }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
