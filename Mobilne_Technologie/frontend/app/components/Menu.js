import React from 'react';
import {StyleSheet, Text, TouchableOpacity, View} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Menu({navigation, route}) {
  const userID = route.params.id;
  const storeData = async value => {
    try {
      const jsonValue = JSON.stringify(value);
      await AsyncStorage.setItem('id', jsonValue);
      await AsyncStorage.setItem('my_articles', jsonValue);
    } catch (e) {}
  };
  const onSubmitHandler = async event => {
    try {
      storeData(null).then(r => navigation.replace('LoginScreen'));
    } catch (error) {}
  };
  return (
    <View style={[styles.navigationContainer]}>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.replace('HomeScreen', {id: userID})}>
        <Text style={styles.loginText}>Domov</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.replace('MyArticlesScreen', {id: userID})}>
        <Text style={styles.loginText}>Moje clanky</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.replace('NewArticleScreen', {id: userID})}>
        <Text style={styles.loginText}>Napisat novy clanok</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={() => navigation.replace('ProfileScreen', {id: userID})}>
        <Text style={styles.loginText}>Profil</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.loginButton}
        onPress={onSubmitHandler}>
        <Text style={styles.loginText}>Odhlasenie</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  loginButton: {
    width: '100%',
    backgroundColor: '#63a0d0',
    height: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
    marginBottom: 5,
  },
  search: {
    fontWeight: 'bold',
    fontSize: 20,
    marginTop: 10,
    marginRight: 10,
  },
  navbar: {
    top: 0,
    left: 0,
    width: '100%',
  },
  menu: {
    marginTop: 5,
    marginLeft: 5,
    maxWidth: 30,
    maxHeight: 30,
  },
  navigationContainer: {
    backgroundColor: '#ecf0f1',
  },
});
