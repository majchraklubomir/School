import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
} from 'react-native';
import axios from 'axios';
import checkConnection from '../components/CheckConnection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import asyncStorage from '@react-native-async-storage/async-storage/src/AsyncStorage';

export default function LoginScreen({navigation}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const gotoregister = () => {
    navigation.replace('RegisterScreen');
  };

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('id', jsonValue);
    } catch (e) {}
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('id');
      return JSON.parse(jsonValue);
    } catch (e) {}
  };
  const onSubmitHandler = async event => {
    try {
      let jsonResp = await checkConnection();
      try {
        const response = await axios.post(`${API_URL}/sign/user`, {
          heslo: password,
          email: email,
        });
        if (response.status === 200) {
          fetch(`${API_URL}/sign/${email}`)
            .then(res => res.json()) // get response, convert to json
            .then(json => {
              storeData(json);
            })
            .catch(error => alert(error)) // display errors
            .finally(async a => {
              const data = await getData('id');
              const userID = data.id;
              const user_data = await axios.get(`${API_URL}/user/${userID}`);
              try {
                await asyncStorage.setItem('user_ID', JSON.stringify(userID));
                await asyncStorage.setItem('user_name', user_data.data.meno);
                await asyncStorage.setItem('user_email', user_data.data.email);
                await asyncStorage.setItem('user_pass', user_data.data.heslo);
              } catch (err) {
                console.error(err);
              }
              navigation.replace('HomeScreen', {id: data.id});
            });
        }
      } catch (error) {
        alert(error);
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        alert('Network Error');
      } else {
        alert(error.message);
      }
    }
  };

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const data = await getData('id');
        const global = await asyncStorage.getItem('global');
        if (JSON.parse(global) !== null) {
          globalQuerryStorage = JSON.parse(global);
        }

        if (data !== null) {
          navigation.replace('HomeScreen', {id: data.id});
        }
      } catch (e) {}
    };
    fetchFromDB().catch(console.error);
  }, []);

  return (
    <View style={styles.background}>
      <Text style={styles.header}>Prihlásenie!</Text>
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
          secureTextEntry
          style={styles.inputText}
          placeholder={'Heslo'}
          placeholderTextColor={'#003f5c'}
          onChangeText={setPassword}
        />
      </View>
      <TouchableOpacity style={styles.loginButton} onPress={onSubmitHandler}>
        <Text style={styles.loginText}>Prihlás sa</Text>
      </TouchableOpacity>
      <View>
        <Text style={styles.noAccount}>Este nemas ucet ?</Text>
      </View>
      <TouchableOpacity onPress={gotoregister}>
        <Text style={styles.register}>Zaregistruj sa </Text>
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
    marginBottom: 40,
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
  forgotPass: {
    color: '#63a0d0',
    fontSize: 15,
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
  noAccount: {
    color: 'black',
    fontSize: 15,
  },
  register: {
    color: '#3d83bb',
    fontWeight: 'bold',
    fontSize: 30,
    marginTop: 10,
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 15,
  },
});
