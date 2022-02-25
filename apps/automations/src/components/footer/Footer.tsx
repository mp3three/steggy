import { Layout, Typography } from 'antd';
import React from 'react';

const { Link } = Typography;
const { Footer } = Layout;

export class Foot extends React.Component {
  override render() {
    return (
      <Footer style={{ textAlign: 'center' }}>
        <Link href="https://github.com/ccontour/automagical" target="_blank">
          @automagical
        </Link>
      </Footer>
    );
  }
}
