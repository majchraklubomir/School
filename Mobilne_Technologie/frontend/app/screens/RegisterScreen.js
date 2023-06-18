import React, {useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import {launchImageLibrary} from 'react-native-image-picker';
import checkConnection from '../components/CheckConnection';

export default function RegisterScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [meno, setMeno] = useState('');
  const [photoName, setPhotoName] = useState('Kliknutim vyber profilovu fotku');
  const [photoURI, setPhotoUri] = useState('');
  const [photoType, setPhotoType] = useState('');

  const options = {
    title: 'Select Image',
    type: 'Library',
    options: {
      maxHeight: 200,
      maxWidth: 200,
      selectionLimit: 1,
      mediaType: 'photo',
      includeBase64: false,
    },
  };

  const goBack = () => {
    navigation.navigate('LoginScreen');
  };
  const Gallery = async () => {
    const image = await launchImageLibrary(options);
    setPhotoName(image.assets[0].fileName);
    setPhotoUri(image.assets[0].uri);
    setPhotoType(image.assets[0].type);
  };
  const registerHandler = async () => {
    try {
      const responseEmail = await axios.get(
        `${API_URL}/sign/checkEmail/${email}`,
      );
      if (responseEmail.status === 200) {
        try {
          const response = await axios.post(`${API_URL}/sign/newUser`, {
            meno: meno,
            heslo: password,
            email: email,
          });
          if (response.status === 201) {
            const data = await axios.get(`${API_URL}/sign/${email}`);
            const userID = data.data.id;
            if (photoURI === '') {
              navigation.navigate('HomeScreen', {id: userID});
            } else {
              const formdata = new FormData();
              formdata.append('obrazok', {
                name: photoName,
                uri: photoURI,
                type: photoType,
              });
              try {
                const res = await axios.put(
                  `${API_URL}/user/updatePhoto/${userID}`,
                  formdata,
                  {
                    headers: {
                      accept: 'application/json',
                      'Content-Type': 'multipart/form-data',
                    },
                  },
                );
                console.log(res.data);
              } catch (error) {
                console.log(error.response.data);
              }
              navigation.navigate('HomeScreen', {id: userID});
            }
          } else {
            throw new Error('An error has occurred');
          }
        } catch (error) {
          alert('An error has occurred');
        }
      } else {
        throw new Error('An error has occurred');
      }
    } catch (error) {
      alert('An error has occured');
    }
  };
  return (
    <View style={styles.background}>
      <Text style={styles.header}>Registracia</Text>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputText}
          placeholder={'Email'}
          placeholderTextColor={'#003f5c'}
          textContentType={'emailAddress'}
          keyboardType={'email-address'}
          onChangeText={setEmail}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputText}
          placeholder={'Meno'}
          placeholderTextColor={'#003f5c'}
          onChangeText={setMeno}
        />
      </View>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.inputText}
          placeholder={'Heslo'}
          placeholderTextColor={'#003f5c'}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.inputContainer} onPress={Gallery}>
        <Text style={styles.inputPhoto}>{photoName}</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.loginButton} onPress={registerHandler}>
        <Text style={styles.loginText}> Registrovat</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.backButton} onPress={goBack}>
        <Text style={styles.loginText}> Spat</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'lightgray',
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    fontWeight: 'bold',
    fontSize: 50,
    color: '#0c0909',
    marginBottom: 50,
  },
  inputContainer: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 25,
    height: 50,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
  },
  inputText: {
    height: 50,
    color: '#003f5c',
  },
  inputPhoto: {
    height: 20,
    color: '#003f5c',
  },
  loginButton: {
    width: '80%',
    backgroundColor: '#63a0d0',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 30,
    marginBottom: 30,
  },
  backButton: {
    width: '60%',
    backgroundColor: '#3d3c38',
    borderRadius: 25,
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: 'white',
    fontWeight: '400',
    fontSize: 20,
  },
});
