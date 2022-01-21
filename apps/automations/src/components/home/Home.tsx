import { Layout, Typography } from 'antd';
import React from 'react';

const { Link, Title } = Typography;
const { Footer } = Layout;

export class HomePage extends React.Component {
  override render() {
    return <Title>Home Page</Title>;
  }
}
