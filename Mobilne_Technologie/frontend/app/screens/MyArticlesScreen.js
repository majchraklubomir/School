import React, {useEffect, useState} from 'react';
import {
  Button,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import axios from 'axios';
import checkConnection from '../components/CheckConnection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import onlineSync from '../components/Querry';
import ObjectToString from '../components/stringify';
import asyncStorage from '@react-native-async-storage/async-storage/src/AsyncStorage';

export default function MyArticlesScreen({navigation, route}) {
  let usrID = route.params.id;
  const [isLoading, setLoading] = useState(true);
  const [clanky, setClanky] = useState([]);

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('my_articles', jsonValue);
    } catch (e) {}
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('my_articles');
      return JSON.parse(jsonValue);
    } catch (e) {}
  };

  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        let jsonResp = await checkConnection();
        let sync = await onlineSync();
        try {
          fetch(`${API_URL}/article/user/${usrID}`)
            .then(response => response.json()) // get response, convert to json
            .then(json => {
              storeData(json).then(async r => {
                const data = await getData('my_articles');
                setClanky(data.clanky);
              });
            })
            .catch(error => alert(error)) // display errors
            .finally(() => setLoading(false)); // change loading state
        } catch (e) {}
      } catch (error) {
        if (error.name === 'AbortError') {
          alert('Network Error');
        } else {
          alert(error.message);
        }
        const data = await getData('my_articles');
        if (data !== null) {
          setClanky(data.clanky);
        }
        setLoading(false);
      }
    };
    fetchFromDB().catch(console.error);
  }, [usrID]);

  async function onDeleteHandler(id) {
    if (id === null) {
      return;
    }
    setLoading(true);
    try {
      let jsonResp = await checkConnection();
      try {
        const response = await axios.delete(`${API_URL}/article/${id}`);
        if (response.status === 200) {
          navigation.replace('MyArticlesScreen', {id: usrID});
        } else {
          throw new Error('An error has occurred');
        }
      } catch (error) {
        alert('An error has occurred');
      }
    } catch (error) {
      const dataToDelete = await getData('my_articles');
      console.debug(dataToDelete);
      for (const d of dataToDelete.clanky) {
        if (d.id === id) {
          d.id = null;
          d.nazov = 'Zmazany';
          d.kategoria = 'Zmazany';
          d.obsah = 'Zmazany';
          storeData(dataToDelete).then(async r => {
            const data = await getData('my_articles');
            setClanky(data.clanky);
          });
          break;
        }
      }
      const typ = 'deleteArticle';
      const data = {
        type: typ,
        articleID: id,
      };
      globalQuerryStorage.push({data: data});
      ObjectToString();
      await asyncStorage.setItem(
        'global',
        JSON.stringify(globalQuerryStorage),
      );
    }
    setLoading(false);
  }

  function onModifyHandler(usrID, id) {
    if (id === null) {
      return;
    }
    navigation.navigate('NewArticleScreen', {
      id: usrID,
      articleID: id,
    });
  }

  return (
    <View style={styles.background}>
      {isLoading ? (
        <Text>NACIVANIE</Text>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.replace('Menu', {id: usrID})}>
            <Text style={styles.loginText}>Menu</Text>
          </TouchableOpacity>
          <Text style={styles.header}>Moje clanky!</Text>
          <FlatList
            data={clanky}
            keyExtractor={({id}, index) => id}
            renderItem={({item}) => (
              <View>
                <View style={styles.inputContainer}>
                  <TouchableOpacity
                    onPress={() =>
                      navigation.replace('ArticleScreen', {
                        itemID: item.id,
                        id: usrID,
                      })
                    }>
                    <Text style={styles.articeHeader}>{item.nazov}</Text>
                    <Text style={styles.articleCategory}>
                      Kategoria: {item.kategoria}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View style={styles.inputContainer1}>
                  <Button
                    title={'Zmazat clanok'}
                    style={styles.deleteButton}
                    onPress={() => onDeleteHandler(item.id)}
                  />
                  <Button
                    title={'Upravit clanok'}
                    style={styles.modifyButton}
                    onPress={() => onModifyHandler(usrID, item.id)}
                  />
                </View>
              </View>
            )}
          />
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
  deleteButton: {
    width: '30%',
    backgroundColor: '#d7162f',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modifyButton: {
    width: '30%',
    backgroundColor: '#704498',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
  },
  inputContainer1: {
    marginLeft: 20,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 30,
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
    width: '90%',
    alignSelf: 'center',
    backgroundColor: '#63a0d0',
    flex: 1,
    marginBottom: 10,
  },
  articeHeader: {
    fontWeight: 'bold',
    fontSize: 30,
    marginBottom: 5,
    marginLeft: 5,
  },
  articleCategory: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 5,
  },
  articleAutor: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 5,
    marginBottom: 5,
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
});
