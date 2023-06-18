import React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import Menu from './Menu';
import HomeScreen from '../screens/HomeScreen';
import LoginScreen from '../screens/LoginScreen';
import ArticleScreen from '../screens/ArticleScreen';
import MyArticlesScreen from '../screens/MyArticlesScreen';
import NewArticleScreen from '../screens/NewArticleScreen';
import ProfileScreen from '../screens/ProfileScreen';
import RegisterScreen from '../screens/RegisterScreen';

const Stack = createNativeStackNavigator();

const StackNavigator = () => {
  return (
    <Stack.Navigator
      screenOptions={{gestureEnabled: false, headerShown: false}}>
      <Stack.Screen name="LoginScreen" component={LoginScreen} />
      <Stack.Screen name="HomeScreen" component={HomeScreen} />
      <Stack.Screen name="ArticleScreen" component={ArticleScreen} />
      <Stack.Screen name="Menu" component={Menu} />
      <Stack.Screen name="MyArticlesScreen" component={MyArticlesScreen} />
      <Stack.Screen name="NewArticleScreen" component={NewArticleScreen} />
      <Stack.Screen name="ProfileScreen" component={ProfileScreen} />
      <Stack.Screen name="RegisterScreen" component={RegisterScreen} />
    </Stack.Navigator>
  );
};

export default StackNavigator;
