import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import StackNavigator from './app/components/StackNavigator';

global.API_URL = 'http://192.168.217.161:3000';
global.globalQuerryStorage = [];

export default function App() {
  return (
    <NavigationContainer>
      <StackNavigator />
    </NavigationContainer>
  );
}
