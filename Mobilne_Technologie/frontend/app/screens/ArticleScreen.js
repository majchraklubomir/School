import React, {useEffect, useState} from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import checkConnection from '../components/CheckConnection';

export default function ArticleScreen({route, navigation}) {
  const itemId = route.params.itemID;
  const userID = route.params.id;
  const [isLoading, setLoading] = useState(true);
  const [nazov, setNazov] = useState([]);
  const [obsah, setObsah] = useState([]);
  const [kategoria, setKategoria] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/article/${itemId}`)
      .then(response => response.json()) // get response, convert to json
      .then(json => {
        setNazov(json.nazov);
        setObsah(json.obsah);
        setKategoria(json.kategoria);
      })
      .catch(error => alert(error)) // display errors
      .finally(() => setLoading(false)); // change loading state
  }, [itemId]);
  return (
    <View style={styles.background}>
      {isLoading ? (
        <Text>NACIVANIE</Text>
      ) : (
        <View>
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => navigation.replace('Menu', {id: userID})}>
            <Text style={styles.loginText}>Menu</Text>
          </TouchableOpacity>
          <View style={styles.inputContainer}>
            <Text style={styles.header}>{nazov}</Text>
          </View>
          <View style={styles.inputContainer1}>
            <Text style={styles.content}>{obsah}</Text>
          </View>
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
  header: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#0c0909',
    marginBottom: 20,
  },
  inputContainer: {
    alignSelf: 'center',
  },
  inputContainer1: {
    width: '90%',
    marginLeft: '5%',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 30,
    backgroundColor: '#e8c8c8',
  },
  articleCategory: {
    fontWeight: 'bold',
    fontSize: 20,
    marginLeft: 5,
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
  content: {
    color: 'black',
    fontSize: 16,
  },
});
