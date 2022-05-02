import { PersonDTO } from '@steggy/controller-shared';
import { is } from '@steggy/utilities';
import { Layout, notification, Typography } from 'antd';
import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import { store } from '../../store';
import {
  ADMIN_KEY,
  BASE_URL,
  CurrentUserContext,
  IsAuthContext,
  PROFILE_ID,
  sendRequest,
} from '../../types';
import { EntityPage } from '../entities';
import { GroupPage } from '../groups';
import { HomePage } from '../home';
import { PeoplePage } from '../people';
import { RoomPage } from '../rooms';
import { RoutinePage } from '../routines';
import { SettingsPage } from '../settings';
import { ApplicationMenu } from './ApplicationMenu';
import { Header } from './Header';

const { Sider, Content } = Layout;

export function App() {
  const [collapsed, setCollapsed] = useState(false);
  const [baseUrl, setBaseURL] = useState(localStorage.getItem(BASE_URL));
  const [adminKey, setAdminKey] = useState(localStorage.getItem(ADMIN_KEY));

  const [profile, setProfile] = useState<PersonDTO>();
  const [profileId, setProfileId] = useState<string>(
    localStorage.getItem(PROFILE_ID),
  );
  sendRequest.configure({ key: adminKey });
  sendRequest.configure({ base: baseUrl });

  //
  // Selected user profile
  useEffect(() => {
    if (is.empty(profileId)) {
      setProfile(undefined);
      localStorage.removeItem(PROFILE_ID);
      return;
    }
    localStorage.setItem(PROFILE_ID, profileId);
    async function load() {
      const person = await sendRequest<PersonDTO>({
        url: `/person/${profileId}`,
      });
      setProfile(person);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profileId, adminKey, baseUrl]);
  //
  // Admin key
  useEffect(() => {
    localStorage.setItem(ADMIN_KEY, adminKey);
    sendRequest.configure({ key: adminKey });
  }, [adminKey]);
  //
  // Base url
  useEffect(() => {
    localStorage.setItem(BASE_URL, baseUrl);
    sendRequest.configure({ base: baseUrl });
  }, [baseUrl]);

  async function updatePin(
    type: string,
    target: string,
    add: boolean,
  ): Promise<void> {
    if (!profile) {
      notification.error({
        message: `Cannot toggle pins without a selected profile. How did you call this?!`,
      });
      return;
    }
    let pinned_items = profile?.pinned_items ?? [];
    if (add) {
      if (
        !pinned_items.some(item => item.type === type && item.target === target)
      ) {
        pinned_items.push({ target, type });
      }
    } else {
      pinned_items = pinned_items.filter(
        item => !(item.type === type && item.target === target),
      );
    }
    const person = await sendRequest<PersonDTO>({
      body: { pinned_items } as Partial<PersonDTO>,
      method: 'put',
      url: `/person/${profileId}`,
    });
    setProfile(person);
  }

  return (
    <IsAuthContext.Provider
      value={{
        base: baseUrl,
        key: adminKey,
        updateBase: base => setBaseURL(base),
        updateKey: key => setAdminKey(key),
      }}
    >
      <CurrentUserContext.Provider
        value={{
          load: id => setProfileId(id),
          person: profile,
          togglePin: (type, target, add) => updatePin(type, target, add),
        }}
      >
        <Provider store={store}>
          {/* eslint-disable-next-line spellcheck/spell-checker */}
          <Layout style={{ minHeight: '100vh' }}>
            <Sider
              collapsible
              collapsed={collapsed}
              onCollapse={state => setCollapsed(state)}
            >
              <ApplicationMenu isConfigured={!is.empty(adminKey)} />
            </Sider>
            <Layout>
              <Header />
              <Content>
                {is.empty(adminKey) ? (
                  <SettingsPage />
                ) : (
                  <Switch>
                    <Route path="/entities" component={EntityPage} />
                    <Route path="/groups" component={GroupPage} />
                    <Route path="/people" component={PeoplePage} />
                    <Route path="/rooms" component={RoomPage} />
                    <Route path="/routines" component={RoutinePage} />
                    <Route path="/settings" component={SettingsPage} />
                    {/* Order matters, derp */}
                    <Route path="/" component={HomePage} />
                  </Switch>
                )}
              </Content>
              <Layout.Footer style={{ textAlign: 'center' }}>
                <Typography.Link
                  href="https://github.com/ccontour/steggy"
                  target="_blank"
                >
                  {'@steggy '}
                  <span role="img" aria-label="dinosaur icon">
                    🦕
                  </span>
                </Typography.Link>
              </Layout.Footer>
            </Layout>
          </Layout>
        </Provider>
      </CurrentUserContext.Provider>
    </IsAuthContext.Provider>
  );
}
