import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, View, TouchableOpacity, Image} from 'react-native';
import axios from 'axios';
import checkConnection from '../components/CheckConnection';
import onlineSync from '../components/Querry';

import {launchImageLibrary} from 'react-native-image-picker';
import asyncStorage from '@react-native-async-storage/async-storage/src/AsyncStorage';
import ObjectToString from '../components/stringify';
//import AsyncStorage from "@react-native-async-storage/async-storage";

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

export default function ProfileScreen({navigation, route}) {
  const userID = route.params.id;
  const [profileImage, setProfileImage] = useState(null);
  const [isLoading, setLoading] = useState(true);
  const [meno, setmeno] = useState('');
  const [heslo, setheslo] = useState('');
  const [email, setemail] = useState('');

  useEffect(() => {
    const fetchfromdb = async () => {
      try {
        let res = await checkConnection();
        let sync = await onlineSync();
        try {
          fetch(`${API_URL}/user/${userID}`)
            .then(response => response.json())
            .then(json => {
              setmeno(json.meno);
              setemail(json.email);
              setheslo(json.heslo);
            })
            .catch(error => alert(error));
          fetch(`${API_URL}/user/photo/${userID}`)
            .then(response => response.json()) // get response, convert to json
            .then(json => {
              let path = json.obrazok;
              path = path.split(/\s*\\\s*/);
              let modifiedAPI = API_URL + '/';
              if (path[1] === 'profile.png') {
                setProfileImage(null);
              } else {
                setProfileImage(modifiedAPI + path[1]);
              }
            })
            .catch(error => alert(error)) // display errors
            .finally(() => setLoading(false)); // change loading state
        } catch (err) {}
      } catch (error) {
        if (error.name === 'AbortError') {
          alert('Network Error');
        } else {
          alert(error.message);
        }
        try {
          const meno_off = await asyncStorage.getItem('user_name');
          const email_off = await asyncStorage.getItem('user_email');
          const heslo_off = await asyncStorage.getItem('user_pass');

          try {
            const fotka = await asyncStorage.getItem('photo_uri');
            if (fotka !== null) {
              setProfileImage(fotka);
            }
          } catch (err) {
            console.debug(err);
          }

          setmeno(meno_off);
          setemail(email_off);
          setheslo(heslo_off);
        } catch (err) {
          console.error(err);
        }
      }
    };
    fetchfromdb()
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userID]);

  const openGallery = async () => {
    const images = await launchImageLibrary(options);
    if (!images.didCancel) {
      setProfileImage(images.assets[0].uri);
      await asyncStorage.setItem('photo_name', images.assets[0].fileName);
      await asyncStorage.setItem('photo_uri', images.assets[0].uri);
      await asyncStorage.setItem('photo_type', images.assets[0].type);

      const formdata = new FormData();
      formdata.append('obrazok', {
        name: images.assets[0].fileName,
        uri: images.assets[0].uri,
        type: images.assets[0].type,
      });
      const data = {
        type: 'uploadPhoto',
        userID: userID,
        photo_name: images.assets[0].fileName,
        photo_uri: images.assets[0].uri,
        photo_type: images.assets[0].type,
      };
      if (globalQuerryStorage.length > 0) {
        for (let i = 0; i < globalQuerryStorage.length; i++) {
          if (data.photo_name !== globalQuerryStorage[i].data.photo_name) {
            globalQuerryStorage.push({data: data});
          }
        }
      } else {
        globalQuerryStorage.push({data: data});
      }
      ObjectToString();
      await asyncStorage.setItem('global', JSON.stringify(globalQuerryStorage));
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
      } catch (error) {
        console.log(error);
      }
    } else {
      console.log('zrusil vyber fotky');
    }
  };
  return (
    <View style={styles.background}>
      {isLoading ? (
        <Text>NACITAVANIE</Text>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.navigate('Menu', {id: userID})}>
            <Text style={styles.loginText}>Menu</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Profil</Text>
          <TouchableOpacity onPress={() => openGallery()}>
            {profileImage ? (
              <Image style={styles.image} source={{uri: profileImage}} />
            ) : (
              <Image
                style={styles.image}
                source={require('../images/user.png')}
              />
            )}
          </TouchableOpacity>
          <Text style={styles.userInfo}>Meno: {meno}</Text>
          <Text style={styles.userInfo}>Heslo: {heslo}</Text>
          <Text style={styles.userInfo}>Email: {email}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'lightgray',
  },
  image: {
    alignSelf: 'center',
    width: 200,
    height: 200,
    marginTop: 10,
  },
  userInfo: {
    fontWeight: '500',
    fontSize: 25,
    color: '#0c0909',
    borderWidth: 3,
    backgroundColor: '#63a0d0',
    textAlign: 'auto',
    marginTop: 15,
  },
  header: {
    fontWeight: '500',
    fontSize: 35,
    color: '#0c0909',
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: '#857270',
    textAlign: 'center',
    marginTop: 5,
  },
  menuButton: {
    width: '100%',
    backgroundColor: '#63a0d0',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loginText: {
    color: 'white',
    fontSize: 15,
  },
});
