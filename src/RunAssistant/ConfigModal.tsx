import * as React from 'react';
import { connect } from 'react-redux';
import { Form, Header, Modal } from 'semantic-ui-react';
import { State as ReducerState, TableConfig } from './interfaces';
import { Column } from '../Table/interfaces';
import {
  changeUseImages,
  changeColumnWidth,
  changeColumnVisibility,
  changeRowFontSize,
  changeTableHeaderHeight,
  changeTableRowHeight,
  resetToDefault
} from './actions/config';

interface Props {
  trigger: React.ReactNode;
  useImages: boolean;
  columns: Column[];
  table: TableConfig;
  changeUseImages: (useImages: boolean) => any;
  changeColumnVisibility: (index: number, show: boolean) => any;
  changeColumnWidth: (index: number, width: number) => any;
  changeRowFontSize: (size: number) => any;
  changeTableHeaderHeight: (height: number) => any;
  changeTableRowHeight: (height: number) => any;
  resetToDefault: () => any;
}

const mapStateToProps = (state: ReducerState) => ({
  ...state.config
});

const mapDispatchToProps = {
  changeUseImages,
  changeColumnVisibility,
  changeColumnWidth,
  changeRowFontSize,
  changeTableRowHeight,
  changeTableHeaderHeight,
  resetToDefault
};

const saveToLocalStorage = (props => {
  window.localStorage.setItem('config', JSON.stringify({
    useImages: props.useImages,
    columns: props.columns,
    table: props.table
  }));
});

const ConfigModal = (props: Props) => (
  <Modal trigger={props.trigger}>
    <Modal.Header>
      Run Assistant Configuration
    </Modal.Header>
    <Modal.Content>
      <Form>
        <Header>Run Assistant</Header>
        <Form.Group inline={true}>
          <Form.Checkbox
            checked={props.useImages}
            onChange={() => props.changeUseImages(!props.useImages)}
            label="Use Enemy Images"
            toggle={true}
          />
        </Form.Group>
        <Header>Table</Header>
        <Form.Group widths="equal" label="Default Visible Columns">
          {props.columns.map((column, index) => (
            <Form.Checkbox
              key={column.key}
              checked={column.show !== false}
              onChange={() => props.changeColumnVisibility(index, !column.show)}
              label={column.label}
            />
          ))}
        </Form.Group>
        <Form.Group>
          <Form.Input
            type="number"
            onChange={
              (e: React.FormEvent<HTMLInputElement>) => props.changeRowFontSize(parseInt(e.currentTarget.value))
            }
            min={4}
            max={72}
            step={2}
            value={props.table.rowStyle.fontSize}
            label="Font Size (px)"
          />
          <Form.Input
            type="number"
            onChange={
              (e: React.FormEvent<HTMLInputElement>) => props.changeTableRowHeight(parseInt(e.currentTarget.value))
            }
            min={10}
            max={120}
            step={10}
            value={props.table.rowHeight}
            label="Table Row Height (px)"
          />
          <Form.Input
            type="number"
            onChange={
              (e: React.FormEvent<HTMLInputElement>) => props.changeTableHeaderHeight(parseInt(e.currentTarget.value))
            }
            min={10}
            max={120}
            step={10}
            value={props.table.headerHeight}
            label="Header Row Height (px)"
          />
        </Form.Group>
        <Form.Group inline={true}>
          <Form.Button content="Save Settings" primary={true} onClick={() => saveToLocalStorage(props)}/>
          <Form.Button content="Reset to Default" onClick={() => props.resetToDefault()}/>
        </Form.Group>
      </Form>
    </Modal.Content>
  </Modal>
);

export default connect(mapStateToProps, mapDispatchToProps)(ConfigModal);
