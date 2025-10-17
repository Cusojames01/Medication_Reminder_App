import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  Text,
  ScrollView,
  Alert,
  TouchableOpacity,
  FlatList,
  RefreshControl,
} from 'react-native';
import { Card, Button, IconButton, Chip } from 'react-native-paper';
import { db } from '../firebaseConfig';
import {
  collection,
  query,
  where,
  getDocs,
  doc,
  updateDoc,
  arrayUnion,
  arrayRemove,
  onSnapshot,
  deleteDoc,
} from 'firebase/firestore';

export default function PatientDashboard({ navigation, route }) {
  const [patient, setPatient] = useState(null);
  const [medications, setMedications] = useState([]);
  const [assignedDoctor, setAssignedDoctor] = useState(null);
  const [guardian, setGuardian] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Mock patient data - in real app, this would come from login
  const currentPatientId = "PAT-ABC123"; // This should come from login context

  useEffect(() => {
    loadPatientData();
    setupRealTimeListeners();
  }, []);

  const loadPatientData = async () => {
    try {
      // Load patient data
      const patientQuery = query(collection(db, "Users"), where("patientID", "==", currentPatientId));
      const patientSnapshot = await getDocs(patientQuery);
      
      if (!patientSnapshot.empty) {
        const patientData = patientSnapshot.docs[0].data();
        setPatient(patientData);

        // Load assigned doctor if exists
        if (patientData.assignedDoctorId) {
          const doctorQuery = query(collection(db, "Users"), where("DoctorID", "==", patientData.assignedDoctorId));
          const doctorSnapshot = await getDocs(doctorQuery);
          if (!doctorSnapshot.empty) {
            setAssignedDoctor(doctorSnapshot.docs[0].data());
          }
        }

        // Load guardian if exists
        if (patientData.guardianId) {
          const guardianQuery = query(collection(db, "Users"), where("guardianID", "==", patientData.guardianId));
          const guardianSnapshot = await getDocs(guardianQuery);
          if (!guardianSnapshot.empty) {
            setGuardian(guardianSnapshot.docs[0].data());
          }
        }
      }
    } catch (error) {
      console.error("Error loading patient data:", error);
      Alert.alert("Error", "Failed to load patient data");
    }
  };

  const setupRealTimeListeners = () => {
    // Real-time listener for medications
    const medsQuery = query(
      collection(db, "Medications"),
      where("patientId", "==", currentPatientId)
    );

    const unsubscribeMeds = onSnapshot(medsQuery, (snapshot) => {
      const medsList = [];
      snapshot.forEach((doc) => {
        medsList.push({ id: doc.id, ...doc.data() });
      });
      setMedications(medsList);
    });

    // Real-time listener for notifications
    const notifQuery = query(
      collection(db, "Notifications"),
      where("patientId", "==", currentPatientId),
      where("read", "==", false)
    );

    const unsubscribeNotif = onSnapshot(notifQuery, (snapshot) => {
      const notifList = [];
      snapshot.forEach((doc) => {
        notifList.push({ id: doc.id, ...doc.data() });
      });
      setNotifications(notifList);
    });

    return () => {
      unsubscribeMeds();
      unsubscribeNotif();
    };
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadPatientData();
    setRefreshing(false);
  };

  const markAsTaken = async (medicationId, scheduleId) => {
    try {
      const medicationRef = doc(db, "Medications", medicationId);
      await updateDoc(medicationRef, {
        [`schedules.${scheduleId}.status`]: 'taken',
        [`schedules.${scheduleId}.takenAt`]: new Date(),
        lastUpdated: new Date()
      });

      // Create notification for doctor/guardian
      const notificationRef = doc(collection(db, "Notifications"));
      await updateDoc(notificationRef, {
        type: 'medication_taken',
        patientId: currentPatientId,
        patientName: patient?.fullName,
        medicationId: medicationId,
        scheduleId: scheduleId,
        timestamp: new Date(),
        read: false,
        message: `${patient?.fullName} has taken their medication`
      });

      Alert.alert("Success", "Medication marked as taken");
    } catch (error) {
      console.error("Error marking medication as taken:", error);
      Alert.alert("Error", "Failed to update medication status");
    }
  };

  const deleteMedication = (medicationId, medicationName) => {
    Alert.alert(
      "Delete Medication",
      `Are you sure you want to delete ${medicationName}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteDoc(doc(db, "Medications", medicationId));
              Alert.alert("Success", "Medication deleted successfully");
            } catch (error) {
              console.error("Error deleting medication:", error);
              Alert.alert("Error", "Failed to delete medication");
            }
          }
        }
      ]
    );
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'taken': return '#4CAF50';
      case 'missed': return '#F44336';
      case 'pending': return '#FF9800';
      default: return '#9E9E9E';
    }
  };

  const getSupplyStatus = (supplyLeft) => {
    if (supplyLeft > 10) return { color: '#4CAF50', text: 'Good' };
    if (supplyLeft > 5) return { color: '#FF9800', text: 'Low' };
    return { color: '#F44336', text: 'Critical' };
  };

  const renderMedicationItem = ({ item }) => {
    const supplyStatus = getSupplyStatus(item.supplyLeft);
    
    return (
      <Card style={styles.medicationCard}>
        <Card.Content>
          <View style={styles.medicationHeader}>
            <Text style={styles.medicationName}>{item.name}</Text>
            <IconButton
              icon="delete"
              size={20}
              onPress={() => deleteMedication(item.id, item.name)}
            />
          </View>
          
          <View style={styles.medicationDetails}>
            <Text style={styles.dosage}>Dosage: {item.dosage}</Text>
            <Text style={styles.frequency}>Frequency: {item.frequency}</Text>
            
            <View style={styles.supplyContainer}>
              <Text>Supply Left: </Text>
              <Chip 
                textStyle={{ color: 'white', fontSize: 12 }}
                style={{ backgroundColor: supplyStatus.color }}
              >
                {item.supplyLeft} tablets - {supplyStatus.text}
              </Chip>
            </View>

            <Text style={styles.scheduleTitle}>Today's Schedule:</Text>
            {Object.entries(item.schedules || {}).map(([scheduleId, schedule]) => (
              <View key={scheduleId} style={styles.scheduleItem}>
                <View style={styles.scheduleTime}>
                  <Text style={styles.timeText}>{schedule.time}</Text>
                  <Chip 
                    textStyle={{ color: 'white', fontSize: 10 }}
                    style={{ backgroundColor: getStatusColor(schedule.status) }}
                  >
                    {schedule.status?.toUpperCase() || 'PENDING'}
                  </Chip>
                </View>
                
                {schedule.status === 'pending' && (
                  <Button
                    mode="contained"
                    compact
                    onPress={() => markAsTaken(item.id, scheduleId)}
                    style={styles.takenButton}
                  >
                    Mark as Taken
                  </Button>
                )}
              </View>
            ))}
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderNotificationItem = ({ item }) => (
    <Card style={styles.notificationCard}>
      <Card.Content>
        <Text style={styles.notificationMessage}>{item.message}</Text>
        <Text style={styles.notificationTime}>
          {new Date(item.timestamp?.toDate()).toLocaleTimeString()}
        </Text>
      </Card.Content>
    </Card>
  );

  return (
    <View style={styles.container}>
      <ScrollView 
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header with Patient Info */}
        <Card style={styles.headerCard}>
          <Card.Content>
            <Text style={styles.welcomeText}>
              Welcome, {patient?.fullName || 'Patient'}
            </Text>
            <Text style={styles.conditionText}>
              Condition: {patient?.medical_condition || 'Not specified'}
            </Text>
          </Card.Content>
        </Card>

        {/* Assigned Doctor Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Assigned Doctor</Text>
            </View>
            {assignedDoctor ? (
              <View style={styles.profileSection}>
                <View style={styles.profileInfo}>
                  <Text style={styles.doctorName}>Dr. {assignedDoctor.fullName}</Text>
                  <Text style={styles.specialization}>
                    {assignedDoctor.specialization}
                  </Text>
                  <Text style={styles.hospital}>{assignedDoctor.hospital}</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('DoctorProfile', { doctor: assignedDoctor })}
                >
                  View Profile
                </Button>
              </View>
            ) : (
              <Text style={styles.noDataText}>No doctor assigned</Text>
            )}
          </Card.Content>
        </Card>

        {/* Guardian Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Guardian</Text>
            </View>
            {guardian ? (
              <View style={styles.profileSection}>
                <View style={styles.profileInfo}>
                  <Text style={styles.guardianName}>{guardian.fullName}</Text>
                  <Text style={styles.relationship}>
                    {guardian.relationship_to_patient}
                  </Text>
                  <Text style={styles.contact}>📞 {guardian.contactNumber}</Text>
                </View>
                <Button
                  mode="outlined"
                  onPress={() => navigation.navigate('GuardianProfile', { guardian })}
                >
                  View Profile
                </Button>
              </View>
            ) : (
              <Text style={styles.noDataText}>No guardian assigned</Text>
            )}
          </Card.Content>
        </Card>

        {/* Notifications Section */}
        {notifications.length > 0 && (
          <Card style={styles.sectionCard}>
            <Card.Content>
              <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Notifications</Text>
                <Chip style={styles.notificationCount}>
                  {notifications.length}
                </Chip>
              </View>
              <FlatList
                data={notifications}
                renderItem={renderNotificationItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            </Card.Content>
          </Card>
        )}

        {/* Medications Section */}
        <Card style={styles.sectionCard}>
          <Card.Content>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Medication Reminders</Text>
              <Button
                mode="contained"
                compact
                onPress={() => navigation.navigate('AddMedication')}
              >
                Add New
              </Button>
            </View>
            
            {medications.length > 0 ? (
              <FlatList
                data={medications}
                renderItem={renderMedicationItem}
                keyExtractor={(item) => item.id}
                scrollEnabled={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Text style={styles.emptyStateText}>No medications scheduled</Text>
                <Button
                  mode="contained"
                  onPress={() => navigation.navigate('AddMedication')}
                >
                  Add Your First Medication
                </Button>
              </View>
            )}
          </Card.Content>
        </Card>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f4f7',
  },
  headerCard: {
    margin: 16,
    backgroundColor: '#3b5998',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  conditionText: {
    fontSize: 16,
    color: 'white',
    opacity: 0.9,
  },
  sectionCard: {
    margin: 16,
    marginTop: 0,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  profileSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  profileInfo: {
    flex: 1,
  },
  doctorName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  guardianName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  specialization: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  relationship: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  hospital: {
    fontSize: 12,
    color: '#888',
  },
  contact: {
    fontSize: 12,
    color: '#888',
  },
  noDataText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    fontStyle: 'italic',
    marginVertical: 20,
  },
  medicationCard: {
    marginBottom: 12,
    backgroundColor: 'white',
  },
  medicationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  medicationName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#3b5998',
  },
  medicationDetails: {
    marginLeft: 8,
  },
  dosage: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  frequency: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  supplyContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  scheduleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333',
  },
  scheduleItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  scheduleTime: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  takenButton: {
    marginLeft: 'auto',
  },
  notificationCard: {
    marginBottom: 8,
    backgroundColor: '#e3f2fd',
  },
  notificationMessage: {
    fontSize: 14,
    marginBottom: 4,
  },
  notificationTime: {
    fontSize: 12,
    color: '#666',
  },
  notificationCount: {
    backgroundColor: '#ff4444',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#888',
    marginBottom: 16,
    textAlign: 'center',
  },
});