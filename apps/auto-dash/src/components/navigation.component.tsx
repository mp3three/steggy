import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import React from 'react';

import { App } from './App';
import { LoftComponent } from './Loft';

const { Navigator, Screen } = createStackNavigator();

const HomeNavigator = () => (
  <Navigator>
  <Screen name="Home" component={App} />
    <Screen name="Details" component={LoftComponent} />
  </Navigator>
);

export const AppNavigator = ():JSX.Element => (
  <NavigationContainer>
    <HomeNavigator />
  </NavigationContainer>
);
