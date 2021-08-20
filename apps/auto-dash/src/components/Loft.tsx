import * as eva from '@eva-design/eva';
import {
  ApplicationProvider,
  Button,
  Divider, IconRegistry,
  Layout, TopNavigation
} from '@ui-kitten/components';
import { EvaIconsPack } from '@ui-kitten/eva-icons';
import React from 'react';
import { SafeAreaView } from 'react-native';

import { STYLES } from '../styles';

export class LoftComponent extends React.Component {
  // #region Public Methods

  public render(): JSX.Element {
    return (
      <>
        <IconRegistry icons={EvaIconsPack} />
        <ApplicationProvider {...eva} theme={eva.dark}>
          <SafeAreaView style={STYLES.safeArea}>
            <TopNavigation title="Auto Dash" style={STYLES.topNavigation} />
            <Divider />
            <Layout style={STYLES.container}>
              <Button>OPEN DETAILS</Button>
            </Layout>
          </SafeAreaView>
        </ApplicationProvider>
      </>
    );
  }

  // #endregion Public Methods
}
