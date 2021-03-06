import * as React from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';
import AreaClass from '../lib/Area';
import { areaNamesWithRandomEncounters, numToHexString } from '../lib/lib';
import { Container, DropdownProps, Form } from 'semantic-ui-react';

interface Props extends RouteComponentProps<any> {
  areas: {
    [key: string]: AreaClass
  };
}

interface State {
  rng: string;
  iterations: number;
  partylevel: number;
  realistic: boolean;
  areas: string[];
}

class RunAssistantForm extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      rng: numToHexString(0x12),
      iterations: 1000,
      partylevel: 0,
      realistic: true,
      areas: []
    };
  }

  handleInputChange = (event: React.FormEvent<HTMLInputElement>, { checked, name, value }) => {
    this.setState(prevState => ({ ...prevState, [name]: checked || value }));
  }

  handleAreaChange = (e: React.SyntheticEvent<HTMLElement>, data: DropdownProps) => {
    this.setState({ areas: data.value as string[] });
  }

  handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params: URLSearchParams = new URLSearchParams();
    Object.keys(this.state).forEach((key) => {
      params.append(key, this.state[key]);
    });
    this.props.history.push(`/runassist/result?${params.toString()}`);
  }

  render() {
    return (
      <Container textAlign="center">
        <Form size="large" onSubmit={this.handleSubmit}>
          <Form.Input
            label="Initial RNG Value"
            name="rng"
            type="text"
            value={this.state.rng}
            onChange={this.handleInputChange}
          />
          <Form.Input
            label="Iterations"
            name="iterations"
            type="number"
            step={500}
            value={this.state.iterations}
            onChange={this.handleInputChange}
          />
          <Form.Input
            label="Party Level"
            name="partylevel"
            type="number"
            value={this.state.partylevel}
            onChange={this.handleInputChange}
          />
          <Form.Dropdown
            label="Areas"
            placeholder="Area"
            options={areaNamesWithRandomEncounters.map(name =>
              ({ key: name, value: name, text: this.props.areas[name].name })
            )}
            value={this.state.areas}
            onChange={this.handleAreaChange}
            multiple={true}
            search={true}
            selection={true}
          />
          <Form.Checkbox
            label="Realistic Mode"
            name="realistic"
            checked={this.state.realistic}
            onChange={this.handleInputChange}
          />
          <Form.Button type="submit" content="Generate Encounters" primary={true}/>
        </Form>
      </Container>
    );
  }
}

export default withRouter(RunAssistantForm);
