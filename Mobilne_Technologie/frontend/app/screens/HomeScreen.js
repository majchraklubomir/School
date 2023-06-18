import React, {useEffect, useState} from 'react';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import checkConnection from '../components/CheckConnection';
import AsyncStorage from '@react-native-async-storage/async-storage';
import onlineSync from '../components/Querry';

export default function HomeScreen({navigation, route}) {
  const userID = route.params.id;
  const [isLoading, setLoading] = useState(true);
  const [clanky, setClanky] = useState([]);

  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('articles', jsonValue);
    } catch (e) {}
  };

  const getData = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('articles');
      return JSON.parse(jsonValue);
    } catch (e) {}
  };
  useEffect(() => {
    const fetchFromDB = async () => {
      try {
        let jsonResp = await checkConnection();
        let sync = await onlineSync();
        try {
          fetch(`${API_URL}/article/`)
            .then(response => response.json()) // get response, convert to json
            .then(json => {
              storeData(json).then(async r => {
                const data = await getData('articles');
                setClanky(data.clanky);
              });
            })
            .catch(error => alert(error)) // display errors
            .finally(async a => {
              setLoading(false);
            }); // change loading state
        } catch (e) {}
      } catch (error) {
        if (error.name === 'AbortError') {
          alert('Network Error');
        } else {
          alert(error.message);
        }
        const data = await getData('articles');
        setClanky(data.clanky);
        setLoading(false);
      }
    };
    fetchFromDB().catch(console.error);

  }, []);
  return (
    <ScrollView style={styles.background}>
      {isLoading ? (
        <Text>NACITAVANIE</Text>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.replace('Menu', {id: userID})}>
            <Text style={styles.loginText}>Menu</Text>
          </TouchableOpacity>
          <Text style={styles.header} numberOfLines={1}>
            Najnovsie clanky
          </Text>
          <FlatList
            data={clanky}
            keyExtractor={({id}, index) => id}
            renderItem={({item}) => (
              <View style={styles.inputContainer}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.replace('ArticleScreen', {
                      id: userID,
                      itemID: item.id,
                    })
                  }>
                  <Text style={styles.articeHeader}>{item.nazov}</Text>
                  <Text style={styles.articleCategory}>
                    Kategoria: {item.kategoria}
                  </Text>
                  <Text style={styles.articleAutor}>Autor: {item.meno}</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    backgroundColor: 'lightgray',
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
