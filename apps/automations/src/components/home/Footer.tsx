import { Layout, Typography } from 'antd';
import React from 'react';

const { Link } = Typography;
const { Footer } = Layout;

export class HomePage extends React.Component {
  override render() {
    return (
      <Footer style={{ textAlign: 'center' }}>
        <Link href="https://github.com/ccontour/text-based" target="_blank">
          Github -@text-based
        </Link>
      </Footer>
    );
  }
}
