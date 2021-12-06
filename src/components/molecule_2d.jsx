/**
 * Copyright 2016 Autodesk Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import React from 'react';
import PropTypes from 'prop-types';
import {
  event as d3Event,
  forceLink,
  forceManyBody,
  forceSimulation,
  forceCenter,
  select,
  zoom,
} from 'd3';
import Nodes from '../components/nodes.jsx';
import Links from '../components/links.jsx';
import moleculeUtils from '../utils/molecule_utils';
import molViewUtils from '../utils/mol_view_utils';

class Molecule2d extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedAtomIds: props.selectedAtomIds || [],
    };
  }

  componentDidMount() {
    this.renderD3();
  }

  componentWillReceiveProps(nextProps) {
    if (!moleculeUtils.compareIds(this.state.selectedAtomIds, nextProps.selectedAtomIds)) {
      this.setState({
        selectedAtomIds: nextProps.selectedAtomIds,
      });
    }
  }

  componentDidUpdate() {
    this.renderD3();
  }

  onClickNode = (node) => {
    const selectedAtomIds = this.state.selectedAtomIds.slice(0);
    const index = selectedAtomIds.indexOf(node.id);

    if (index !== -1) {
      selectedAtomIds.splice(index, 1);
    } else {
      selectedAtomIds.push(node.id);
    }

    this.setState({
      selectedAtomIds,
    });

    this.props.onChangeSelection(selectedAtomIds);
  }

  onDragStartedNode = (d) => {
    if (!d3Event.active) {
      this.simulation.alphaTarget(0.3).restart();
    }
    d.fx = d.x;
    d.fy = d.y;
  }

  onDragEndedNode = (d) => {
    if (!d3Event.active) {
      this.simulation.alphaTarget(0);
    }
    d.fx = null;
    d.fy = null;
  }

  initZoom() {
    if (!this.svg) {
      return;
    }

    const zoomHandler = zoom().on('zoom', () => {
      select(this.svg)
        .selectAll(function () {
          return this.childNodes;
        })
        .attr('transform', d3Event.transform);
    });

    select(this.svg).call(zoomHandler);
  }

  renderTransform = () => {
    if (!this.svg) {
      return;
    }

    const container = select(this.svg);

    // Nodes
    container.selectAll('.node')
      .attr('transform', d =>
        `translate(${d.x || 0},${d.y || 0})`
      );

    // Links
    const links = container.selectAll('.link');

    // keep edges pinned to their nodes
    links.selectAll('line')
      .attr('x1', d => d.source.x || 0)
      .attr('y1', d => d.source.y || 0)
      .attr('x2', d => d.target.x || 0)
      .attr('y2', d => d.target.y || 0);

    // keep edge labels pinned to the edges
    links.selectAll('text')
      .attr('x', d =>
        ((d.source.x || 0) + (d.target.x || 0)) / 2.0
      )
      .attr('y', d =>
        ((d.source.y || 0) + (d.target.y || 0)) / 2.0
      );
  }

  renderD3() {
    this.simulation = forceSimulation()
      .force('link', forceLink()
        .distance(d => molViewUtils.withDefault(d.distance, 20))
        .strength(d => molViewUtils.withDefault(d.strength, 1.0))
      )
      .force('charge', forceManyBody())
      .force('center', forceCenter(this.props.width / 2, this.props.height / 2));

    this.simulation
        .nodes(this.nodes)
        .on('tick', () => this.renderTransform());

    this.simulation.force('link')
      .id(d => d.id)
      .links(this.links);

    if (this.props.scrollZoom) {
      this.initZoom();
    }
  }

  render() {
    if (!this.props.modelData) {
      this.props.modelData = { nodes: [], links: [] };
    }
    this.nodes = moleculeUtils.updateModels(this.nodes || [], this.props.modelData.nodes);
    this.links = moleculeUtils.updateModels(this.links || [], this.props.modelData.links);

    return (
      <svg
        ref={(c) => { this.svg = c; }}
        width={this.props.width}
        height={this.props.height}
      >
        <Links
          links={this.links}
        />
        <Nodes
          selectedAtomIds={this.state.selectedAtomIds}
          nodes={this.nodes}
          onClickNode={this.onClickNode}
          onDragStartedNode={this.onDragStartedNode}
          onDragEndedNode={this.onDragEndedNode}
        />
      </svg>
    );
  }
}

Molecule2d.defaultProps = {
  width: 500.0,
  height: 500.0,
  selectedAtomIds: [],
  onChangeSelection: () => {},
  modelData: { nodes: [], links: [] },
  scrollZoom: false,
};

Molecule2d.propTypes = {
  width: PropTypes.number,
  height: PropTypes.number,
  modelData: PropTypes.shape({
    nodes: PropTypes.array,
    links: PropTypes.array,
  }).isRequired,
  selectedAtomIds: PropTypes.arrayOf(PropTypes.number),
  onChangeSelection: PropTypes.func,
  scrollZoom: PropTypes.bool,
};

export default Molecule2d;
