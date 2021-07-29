
import React, {Component} from 'react';
import { BlessedIntrinsicElements } from 'react-blessed';

export class Log extends Component {

  public render():BlessedIntrinsicElements['box'] {
    return (
      <box
        label="Log"
        style={{bg:'#FF000'}}
        width="60%"
        height="70%"
        draggable={true}>
        {'Hello'}, {0}, {'World'}
      </box>
    );
  }

}
