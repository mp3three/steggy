import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Button,
  Divider,
  Icon,
  IconRegistry,
  Layout,
  Text,
  TopNavigation,
  TopNavigationAction
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import React from 'react';
import { ImageProps } from 'react-native';

import { STYLES } from '../styles';

const HeartIcon = (properties?: Partial<ImageProps>): React.ReactElement<ImageProps> => (
  <Icon {...properties} name='heart'/>
);
const BackIcon = (properties:Record<string,unknown>) => (
  <Icon {...properties} name='arrow-back' />
);
export class App extends React.Component {
  // #region Public Methods

  public backAction():JSX.Element{
    return (
      <TopNavigationAction
        icon={BackIcon}
        onPress={() => console.log('hello world')}

  // #endregion Public Methods
/ >
    );
  }
  public render():JSX.Element {
    return (
      <>
      <IconRegistry icons={EvaIconsPack}/>
      <ApplicationProvider {...eva} theme={eva.dark}>
        <Layout style={STYLES.container}>
        <TopNavigation
          style={STYLES.topNavigation}
          title='Auto Dash'  />
          <Divider />
          <Text style={STYLES.text} category='h1'>
            Welcome to UI Kitten 😻
          </Text>
          <Text style={STYLES.text} category='s1'>
            Start with editing App.js to configure your App
          </Text>
          <Text style={STYLES.text} appearance='hint'>
            For example, try changing theme to Dark by using eva.dark
          </Text>
          <Button style={STYLES.likeButton} accessoryLeft={HeartIcon}>
            LIKE
          </Button>
        </Layout>
      </ApplicationProvider>
    </>
    )
  }
}
