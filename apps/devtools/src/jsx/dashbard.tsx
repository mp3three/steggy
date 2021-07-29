import blessed from 'blessed';
import React, {Component} from 'react';
import {render} from 'react-blessed';

/**
 * Stylesheet
 */
const stylesheet = {
  bordered: {
    border: {
      type: 'line'
    },
    style: {
      border: {
        fg: 'blue'
      }
    }
  }
};

/**
 * Top level component.
 */
class Dashboard extends Component {

  public render() {
    return (
      <element>
        <Log />
        <Request />
        <Response />
        <Jobs />
        <Stats />
      </element>
    );
  }

}

/**
 * Log component.
 */
class Log extends Component {

  public render() {
    return (
      <box
        label="Log"
        style={{bg:'#FF000'}}
        className={stylesheet.bordered}
        width="60%"
        height="70%"
        draggable={true}>
        {'Hello'}, {0}, {'World'}
      </box>
    );
  }

}

/**
 * Request component.
 */
class Request extends Component {

  public render() {
    return (
      <box label="Request" className={stylesheet.bordered} top="70%" width="30%">
        {0}
      </box>
    );
  }

}
/**
 * Response component.
 */
class Response extends Component {
  // #region Public Methods

  public render() {
    return (
      <box
        label="Response"
        className={stylesheet.bordered}
        top="70%"
        left="30%"
        width="30%"
      />
    );
  }

}

/**
 * Jobs component.
 */
class Jobs extends Component {

  public render() {
    return (
      <box
        label="Jobs"
        className={stylesheet.bordered}
        left="60%"
        width="40%"
        height="60%"
      />
    );
  }

}

/**
 * Stats component.
 */
class Stats extends Component {

  public render() {
    return (
      <box
        label="Stats"
        className={stylesheet.bordered}
        top="70%"
        left="60%"
        width="40%"
        height="31%">
        Some stats
      </box>
    );
  }

}

/**
 * Rendering the screen.
 */
const screen = blessed.screen({
  autoPadding: true,
  smartCSR: true,
  title: 'react-blessed dashboard'
});

screen.key(['escape', 'q', 'C-c'], function (ch, key) {
  return process.exit(0);
});

render(<Dashboard />, screen);
