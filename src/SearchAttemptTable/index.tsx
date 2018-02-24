import * as React from 'react';
import { AutoSizer, Column as VirtColumn, Table } from 'react-virtualized';
import { Input } from 'semantic-ui-react';
import SearchApi from 'js-worker-search';
import SearchInputPresenter from './SearchInput';

interface Column {
  key: string | number;
  label: string;
  width: number;
}

interface Props {
  data: {}[];
  columns: Column[];
  filter?: string;
}

interface State {
  searchApi: any;
  filter: string;
  rowsToRender?: number[];
  search: string;
  searchIndex?: number;
  searchResults?: number[];
}

const VirtTable = (props: Props) => {
  return (
    <AutoSizer>
      {({ height, width }) => (
        <Table
          headerHeight={30}
          height={height}
          rowCount={props.data.length}
          rowGetter={({ index }) => props.data[index]}
          rowHeight={30}
          width={width}
        >
          {props.columns.map((column: Column) => {
            return (
              <VirtColumn
                key={column.key}
                label={column.label}
                dataKey={column.key}
                width={column.width}
              />
            );
          })}
        </Table>
      )}
    </AutoSizer>
  );
};

export default class Container extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      searchApi: new SearchApi(),
      filter: '',
      search: '',
      rowsToRender: undefined,
      searchResults: undefined
    };
  }

  componentDidMount() {
    this.indexData(this.props.data);
  }

  componentWillReceiveProps(nextProps: Props) {
    if (this.props.data !== nextProps.data) {
      this.state.searchApi._search._worker.terminate();
      this.setState({ searchApi: new SearchApi(), rowsToRender: undefined }, () => this.indexData(nextProps.data));
    }
  }

  indexData(data: {}[]) {
    for (let i = 0; i < data.length; i++) {
      const row: string = JSON.stringify(data[i])
        .replace(/{|}/g, '')
        .replace(/"[^,]*?":/g, '')
        .replace(/"/g, '')
        .replace(/,/g, ' ')
        .trim();
      this.state.searchApi.indexDocument(i, row);
    }
  }

  filter = (filter: string) => {
    this.setState({ filter }, () => {
      this.state.searchApi.search(this.state.filter)
        .then((result) => {
          this.setState({ rowsToRender: result });
        })
        .catch((error) => console.error(error));
    });
  }

  search = (search: string) => {
    this.setState({ search }, () => {
      this.state.searchApi.search(this.state.search)
        .then((result) => {
          const searchResults: number[] = this.state.rowsToRender
            ? this.searchFilteredResults(result, this.state.rowsToRender)
            : result;
          this.setState({ searchResults }, () => console.log(this.state.searchResults));
        })
        .catch((error) => console.error(error));
    });
  }

  searchFilteredResults(searchResults: number[], renderedRows: number[]): number[] {
    const matches: number[] = [];
    for (let i = 0; i < searchResults.length; i++) {
      if (renderedRows.indexOf(searchResults[i]) !== -1) {
        matches.push(searchResults[i]);
      }
    }
    return matches;
  }

  render() {
    const data = this.state.rowsToRender ? (this.state.rowsToRender as number[]).map((rowIndex) => {
      return this.props.data[rowIndex];
    }) : this.props.data;

    return (
      <React.Fragment>
        <Input
          label="Filter"
          type="text"
          onChange={(e: React.FormEvent<HTMLInputElement>) => this.filter(e.currentTarget.value)}
          value={this.state.filter}
        />
        <SearchInputPresenter
          matches={this.state.searchResults}
          next={(row: number) => console.log(data[row])}
          search={this.search}
        />
        <VirtTable columns={this.props.columns} data={data} />
      </React.Fragment>
    );
  }
}
