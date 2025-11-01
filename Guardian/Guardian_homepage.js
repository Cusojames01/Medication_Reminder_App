import React, { useEffect, useState } from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity, Modal, ScrollView, Alert, TextInput } from 'react-native';
import { db } from '../firebaseConfig';
import { doc, getDoc, updateDoc } from 'firebase/firestore';

export default function PatientHome({ route, navigation }) {
  const { userID } = route.params;
  const [user, setUser] = useState(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [editUser, setEditUser] = useState({});
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const docRef = doc(db, "Users", userID);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUser(docSnap.data());
          setEditUser(docSnap.data());
        } else {
          Alert.alert("Error", "User not found");
        }
      } catch (error) {
        console.error(error);
      }
    };
    fetchUser();
  }, [userID]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "Users", userID);
      await updateDoc(docRef, editUser);
      setUser(editUser);
      setIsEditing(false);
      Alert.alert("Success", "Profile updated successfully!");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "Failed to update profile");
    }
  };

  const handleLogout = () => {
    Alert.alert("Logout", "Are you sure you want to logout?", [
      { text: "Cancel", style: "cancel" },
      { text: "Logout", style: "destructive", onPress: () => navigation.navigate("LoginForm") }
    ]);
  };

  if (!user) return <Text>Loading...</Text>;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => setDropdownVisible(!dropdownVisible)}>
          <Image source={{ uri: user.profilePic }} style={styles.profilePic} />
        </TouchableOpacity>
        <Text style={styles.userName}>{user.fullName}</Text>

        {/* Dropdown Menu */}
        {dropdownVisible && (
          <View style={styles.dropdownMenu}>
            <TouchableOpacity onPress={() => { setModalVisible(true); setDropdownVisible(false); }} style={styles.dropdownItem}>
              <Text>Profile</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleLogout} style={styles.dropdownItem}>
              <Text>Logout</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <ScrollView style={styles.modalContainer}>
          <Text style={styles.modalTitle}>Profile Details</Text>

          {/* Profile Picture and Name */}
          <View style={styles.personalHeader}>
            <Image source={{ uri: user.profilePic }} style={styles.modalProfilePic} />
            <View style={{ marginLeft: 15 }}>
              <Text style={styles.modalName}>{user.fullName}</Text>
              {user.role === "Guardian" && (
                <Text style={styles.guardianId}>Guardian ID: {user.guardianID}</Text>
              )}
            </View>
          </View>

          {/* Profile Fields */}
          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Full Name:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editUser.fullName}
                onChangeText={(text) => setEditUser({ ...editUser, fullName: text })}
              />
            ) : (
              <Text style={styles.valueText}>{editUser.fullName}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Email:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editUser.email}
                onChangeText={(text) => setEditUser({ ...editUser, email: text })}
              />
            ) : (
              <Text style={styles.valueText}>{editUser.email}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Address:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editUser.address}
                onChangeText={(text) => setEditUser({ ...editUser, address: text })}
              />
            ) : (
              <Text style={styles.valueText}>{editUser.address}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Contact Number:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editUser.contactNumber}
                onChangeText={(text) => setEditUser({ ...editUser, contactNumber: text })}
              />
            ) : (
              <Text style={styles.valueText}>{editUser.contactNumber}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Sex:</Text>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editUser.sex}
                onChangeText={(text) => setEditUser({ ...editUser, sex: text })}
              />
            ) : (
              <Text style={styles.valueText}>{editUser.sex}</Text>
            )}
          </View>

          <View style={styles.detailRow}>
            <Text style={styles.inputLabel}>Date of Birth:</Text>
            <Text style={styles.valueText}>{editUser.dateOfBirth ? new Date(editUser.dateOfBirth).toDateString() : ""}</Text>
          </View>

          {user.role === "Guardian" && (
            <View style={styles.detailRow}>
              <Text style={styles.inputLabel}>Relationship to Patient:</Text>
              {isEditing ? (
                <TextInput
                  style={styles.input}
                  value={editUser.relationship_to_patient}
                  onChangeText={(text) => setEditUser({ ...editUser, relationship_to_patient: text })}
                />
              ) : (
                <Text style={styles.valueText}>{editUser.relationship_to_patient}</Text>
              )}
            </View>
          )}

          {/* Buttons: Edit / Save / Cancel / Close */}
          <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, marginBottom: 20 }}>
            {!isEditing ? (
              <>
                <TouchableOpacity onPress={() => setIsEditing(true)} style={styles.editBtn}>
                  <Text style={{ color: 'white' }}>Edit</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                  <Text style={{ color: 'white' }}>Close</Text>
                </TouchableOpacity>
              </>
            ) : (
              <>
                <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                  <Text style={{ color: 'white' }}>Save</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => { setIsEditing(false); setEditUser(user); }} style={styles.cancelBtn}>
                  <Text style={{ color: 'white' }}>Cancel</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </ScrollView>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#f0f4f7' },
  header: { 
    marginTop: 20,
    flexDirection: 'row',
    alignItems: 'center', 
    paddingVertical: 15,
    gap: 15,
    position: 'relative',
    borderBottomColor: 'blueviolet',
    borderBottomWidth: 4,
    backgroundColor: 'transparent'   
  },
  profilePic: { width: 60, height: 60, borderRadius: 30 },
  userName: { fontSize: 18, fontWeight: 'bold' },
  dropdownMenu: { 
    position: 'absolute', 
    top: 70, 
    left: 0, 
    backgroundColor: 'white', 
    borderWidth: 1, 
    borderColor: '#ccc', 
    borderRadius: 5, 
    width: 120, 
    zIndex: 1000,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 5
  },
  dropdownItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  modalContainer: { padding: 20 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  personalHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  modalProfilePic: { width: 80, height: 80, borderRadius: 40 },
  modalName: { fontSize: 18, fontWeight: 'bold' },
  guardianId: { fontSize: 14, color: '#555', marginTop: 5 },
  detailRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  inputLabel: { fontWeight: 'bold', width: 150 },
  input: { backgroundColor: 'white', padding: 10, borderRadius: 5, flex: 1 },
  valueText: { fontSize: 16 },
  editBtn: { backgroundColor: 'blue', padding: 10, borderRadius: 5, flex: 1, alignItems: 'center' },
  saveBtn: { backgroundColor: 'green', padding: 10, borderRadius: 5, flex: 1, marginRight: 10, alignItems: 'center' },
  cancelBtn: { backgroundColor: 'red', padding: 10, borderRadius: 5, flex: 1, marginLeft: 10, alignItems: 'center' },
  closeBtn: { backgroundColor: 'gray', padding: 10, borderRadius: 5, flex: 1, marginLeft: 10, alignItems: 'center' },
});
