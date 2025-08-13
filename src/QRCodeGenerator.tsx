import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, Alert } from 'react-native';

interface PersonData {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
}

const QRCodeGenerator = (): React.JSX.Element => {
  const [personData, setPersonData] = useState<PersonData>({
    id: 'EMP001',
    name: 'John Doe',
    email: 'john.doe@company.com',
    phone: '+1-555-0123',
    department: 'Engineering',
    position: 'Senior Developer',
  });

  const [generatedData, setGeneratedData] = useState('');

  const generateQRData = () => {
    const jsonData = JSON.stringify(personData);
    setGeneratedData(jsonData);
    Alert.alert('QR Data Generated', `Use this data to create a QR code:\n\n${jsonData}`);
  };

  const generateCSVData = () => {
    const csvData = `${personData.id},${personData.name},${personData.email},${personData.phone},${personData.department},${personData.position}`;
    setGeneratedData(csvData);
    Alert.alert('CSV Data Generated', `Use this data to create a QR code:\n\n${csvData}`);
  };

  const updateField = (field: keyof PersonData, value: string) => {
    setPersonData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>QR Code Data Generator</Text>
      <Text style={styles.subtitle}>Generate test data for QR scanner</Text>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>ID:</Text>
        <TextInput
          style={styles.input}
          value={personData.id}
          onChangeText={(text) => updateField('id', text)}
          placeholder="Enter ID"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Name:</Text>
        <TextInput
          style={styles.input}
          value={personData.name}
          onChangeText={(text) => updateField('name', text)}
          placeholder="Enter Name"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Email:</Text>
        <TextInput
          style={styles.input}
          value={personData.email}
          onChangeText={(text) => updateField('email', text)}
          placeholder="Enter Email"
          keyboardType="email-address"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Phone:</Text>
        <TextInput
          style={styles.input}
          value={personData.phone}
          onChangeText={(text) => updateField('phone', text)}
          placeholder="Enter Phone"
          keyboardType="phone-pad"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Department:</Text>
        <TextInput
          style={styles.input}
          value={personData.department}
          onChangeText={(text) => updateField('department', text)}
          placeholder="Enter Department"
        />
      </View>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Position:</Text>
        <TextInput
          style={styles.input}
          value={personData.position}
          onChangeText={(text) => updateField('position', text)}
          placeholder="Enter Position"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={generateQRData}>
          <Text style={styles.buttonText}>Generate JSON Data</Text>
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.button} onPress={generateCSVData}>
          <Text style={styles.buttonText}>Generate CSV Data</Text>
        </TouchableOpacity>
      </View>

      {generatedData && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Generated Data:</Text>
          <Text style={styles.resultText}>{generatedData}</Text>
          <Text style={styles.instruction}>
            Copy this data and use an online QR code generator to create a QR code for testing.
          </Text>
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  inputContainer: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    marginTop: 20,
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  resultContainer: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  resultText: {
    fontSize: 14,
    color: '#666',
    backgroundColor: '#f8f9fa',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  instruction: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default QRCodeGenerator;
