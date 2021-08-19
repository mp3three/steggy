import React from 'react';
import {
  Image,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import openURLInBrowser from 'react-native/Libraries/Core/Devtools/openURLInBrowser';
import {
  Colors,
  DebugInstructions,
  ReloadInstructions,
} from 'react-native/Libraries/NewAppScreen';

const App = () => {
  return (
    <>
      <StatusBar barStyle="dark-content" />
      <SafeAreaView>
        <ScrollView
          contentInsetAdjustmentBehavior="automatic"
          style={styles.scrollView}
        >
          <View style={styles.header}>
            <Image style={styles.logo} source={require('./logo.png')} />
            <Text style={styles.heading} testID="heading">
              Welcome to AutoDash!!!!
            </Text>
          </View>
          <View style={styles.body}>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Step One</Text>
              <Text style={styles.sectionDescription}>
                Edit{' '}
                <Text style={styles.highlight}>apps/auto-dash/App.tsx</Text> to
                change this screen and then come back to see your edits.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>See Your Changes</Text>
              <Text style={styles.sectionDescription}>
                <ReloadInstructions /> Alternatively, press{' '}
                <Text style={styles.highlight}>R</Text> in the bundler terminal
                window.
              </Text>
            </View>
            <View style={styles.sectionContainer}>
              <Text style={styles.sectionTitle}>Debug</Text>
              <Text style={styles.sectionDescription}>
                <DebugInstructions />
              </Text>
            </View>
            <View style={styles.footer}>
              <Text style={styles.sectionTitle}>Learn More</Text>
              <TouchableOpacity
                accessibilityRole="button"
                onPress={() => openURLInBrowser('https://nx.dev')}
                testID="nx-link"
              >
                <Text style={styles.sectionDescription}>
                  Visit <Text style={styles.link}>nx.dev</Text> for more info
                  about Nx.
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
};

const styles = StyleSheet.create({
  body: {
    backgroundColor: '#FF0000',
  },
  footer: {
    color: Colors.dark,
    fontSize: 12,
    fontWeight: '600',
    padding: 4,
    paddingRight: 12,
    textAlign: 'right',
  },
  header: {
    alignItems: 'center',
    backgroundColor: '#143055',
    flex: 1,
    justifyContent: 'center',
    paddingVertical: 24,
  },
  heading: {
    color: Colors.lighter,
    fontSize: 24,
    fontWeight: '600',
  },
  highlight: {
    fontWeight: '700',
  },
  link: {
    color: '#45bc98',
  },
  logo: {
    height: 180,
    resizeMode: 'contain',
    width: 200,
  },
  scrollView: {
    backgroundColor: Colors.lighter,
  },
  sectionContainer: {
    marginTop: 32,
    paddingHorizontal: 24,
  },
  sectionDescription: {
    color: Colors.dark,
    fontSize: 18,
    fontWeight: '400',
    marginTop: 8,
  },
  sectionTitle: {
    color: Colors.black,
    fontSize: 24,
    fontWeight: '600',
  },
});

export default App;
