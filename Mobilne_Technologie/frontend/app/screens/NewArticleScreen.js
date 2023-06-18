import React, {useEffect, useState} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import axios from 'axios';
import checkConnection from '../components/CheckConnection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ObjectToString from '../components/stringify';
import asyncStorage from '@react-native-async-storage/async-storage/src/AsyncStorage';

export default function NewArticleScreen({navigation, route}) {
  const articleID = route.params.articleID;
  const userID = route.params.id;
  const [nazov, setNazov] = useState('');
  const [obsah, setObsah] = useState('');
  const [kategoria, setKategoria] = useState('');

  const [nazovM, setNazovM] = useState('Nazov');
  const [obsahM, setObsahM] = useState('Obsah');
  const [kategoriaM, setKategoriaM] = useState('Kategoria');

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('my_articles');
      return JSON.parse(jsonValue);
    } catch (e) {}
  };

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('my_articles', jsonValue);
    } catch (e) {}
  };

  const onSubmitHandler = async event => {
    try {
      let jsonResp = await checkConnection();
      if (articleID) {
        try {
          const response = await axios.put(
            `${API_URL}/article/saveUpdatedArticle/${articleID}`,
            {
              nazov: nazov,
              kategoria: kategoria,
              obsah: obsah,
            },
          );
          if (response.status === 200) {
            navigation.replace('MyArticlesScreen', {id: userID});
          } else {
            throw new Error('An error has occurred');
          }
        } catch (error) {
          alert('An error has occurred');
        }
      } else {
        try {
          const response = await axios.post(`${API_URL}/article/new`, {
            autor_id: userID,
            nazov: nazov,
            kategoria: kategoria,
            obsah: obsah,
          });
          if (response.status === 200) {
            navigation.replace('MyArticlesScreen', {id: userID});
          } else {
            throw new Error('An error has occurred');
          }
        } catch (error) {
          alert('An error has occurred');
        }
      }
    } catch (error) {
      if (articleID) {
        const type = 'modifiedArticle';
        const data = {
          type: type,
          articleID: articleID,
          nazov: nazov,
          kategoria: kategoria,
          obsah: obsah,
        };
        try {
          const data1 = await getData('my_articles');
          for (const d of data1.clanky) {
            console.debug(d);
            if (d.id === articleID) {
              d.nazov = nazov;
              d.kategoria = kategoria;
              d.obsah = obsah;
              await storeData(data1);
              break;
            }
          }
        } catch (error) {}
        globalQuerryStorage.push({data: data});
        ObjectToString();
        await asyncStorage.setItem(
          'global',
          JSON.stringify(globalQuerryStorage),
        );
      } else {
        const type = 'newArticle';
        const data = {
          type: type,
          autor_id: userID,
          nazov: nazov,
          kategoria: kategoria,
          obsah: obsah,
        };
        globalQuerryStorage.push({data: data});
        ObjectToString();
        await asyncStorage.setItem(
          'global',
          JSON.stringify(globalQuerryStorage),
        );
      }
      navigation.replace('MyArticlesScreen', {id: userID});
    }
  };

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        const data = await getData('my_articles');
        try {
          for (const d of data.clanky) {
            console.debug(d);
            if (d.id === articleID) {
              setNazovM(d.nazov);
              setKategoriaM(d.kategoria);
              setObsahM(d.obsah);
              setNazov(d.nazov);
              setKategoria(d.kategoria);
              setObsah(d.obsah);
              break;
            }
          }
        } catch (error) {}
      } catch (error) {}
    };
    if (articleID) {
      fetchFromDB().catch(console.error);
    }
  }, [articleID]);

  return (
    <ScrollView style={styles.background}>
      <View style={styles.background1}>
        <TouchableOpacity
          style={styles.menuButton}
          onPress={() => navigation.replace('Menu', {id: userID})}>
          <Text style={styles.loginText}>Menu</Text>
        </TouchableOpacity>
        <Text style={styles.header}>Novy clanok!</Text>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputText}
            placeholder={'Nazov'}
            defaultValue={nazovM}
            placeholderTextColor={'#003f5c'}
            onChangeText={setNazov}
          />
        </View>
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.inputText}
            defaultValue={kategoriaM}
            placeholder={'Kategoria'}
            placeholderTextColor={'#003f5c'}
            onChangeText={setKategoria}
          />
        </View>
        <View style={styles.inputContainer10}>
          <TextInput
            multiline={true}
            defaultValue={obsahM}
            numberOfLines={10}
            style={styles.inputText1}
            placeholder={'Obsah'}
            placeholderTextColor={'#003f5c'}
            onChangeText={setObsah}
          />
        </View>
        <TouchableOpacity style={styles.loginButton} onPress={onSubmitHandler}>
          <Text style={styles.loginText}>Uverejnit Clanok</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'lightgray',
  },
  background1: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    width: '90%',
    marginLeft: '5%',
    fontWeight: '500',
    fontSize: 35,
    color: '#0c0909',
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: '#857270',
    textAlign: 'center',
    marginTop: 5,
    marginBottom: 10,
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
  inputContainer10: {
    width: '80%',
    backgroundColor: '#fff',
    borderRadius: 25,
    height: 200,
    marginBottom: 20,
    justifyContent: 'center',
    padding: 20,
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
  menuButton: {
    width: '100%',
    backgroundColor: '#63a0d0',
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  loginText: {
    color: 'white',
    fontSize: 15,
  },
  inputText: {
    height: 50,
    color: '#003f5c',
  },
  inputText1: {
    textAlignVertical: 'top',
    height: 200,
    color: '#003f5c',
  },
});
