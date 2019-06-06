import React from 'react';
import PropTypes from 'prop-types';

class ExampleSettings extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAtomIds: '',
    };
  }

  componentWillReceiveProps(nextProps) {
    this.setState({
      selectedAtomIds: JSON.stringify(nextProps.selectedAtomIds),
    });
  }

  onChangeSelection = (event) => {
    this.setState({
      selectedAtomIds: event.target.value,
    });
  }

  onBlurSelection = (event) => {
    let selectedAtomIds;

    try {
      selectedAtomIds = JSON.parse(event.target.value);
    } catch (err) {
      throw err;
    }

    this.props.onChangeSelection(selectedAtomIds);
  }

  render() {
    return (
      <div>
        <button onClick={this.props.onToggleMolecule}>
          Toggle Molecule
        </button>
        <h4>selectedAtomIds</h4>
        <input
          value={this.state.selectedAtomIds}
          onChange={this.onChangeSelection}
          onBlur={this.onBlurSelection}
        />
      </div>
    );
  }
}

ExampleSettings.propTypes = {
  selectedAtomIds: PropTypes.arrayOf(PropTypes.number),
  onChangeSelection: PropTypes.func,
  onToggleMolecule: PropTypes.func,
};

export default ExampleSettings;
