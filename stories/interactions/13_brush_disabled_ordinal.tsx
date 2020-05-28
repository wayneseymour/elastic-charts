/*
 * Licensed to Elasticsearch B.V. under one or more contributor
 * license agreements. See the NOTICE file distributed with
 * this work for additional information regarding copyright
 * ownership. Elasticsearch B.V. licenses this file to you under
 * the Apache License, Version 2.0 (the "License"); you may
 * not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License. */

import { action } from '@storybook/addon-actions';
import React from 'react';
import { Axis, Chart, LineSeries, Position, ScaleType, Settings } from '../../src/';

import { getChartRotationKnob } from '../utils/knobs';

export const Example = () => {
  return (
    <Chart className="story-chart">
      <Settings onBrushEnd={action('onBrushEnd')} rotation={getChartRotationKnob()} />
      <Axis id="bottom" position={Position.Bottom} title="bottom" showOverlappingTicks={true} />
      <Axis id="left" title="left" position={Position.Left} />
      <LineSeries
        id="lines"
        xScaleType={ScaleType.Ordinal}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={[
          { x: 'a', y: 2 },
          { x: 'b', y: 7 },
          { x: 'c', y: 3 },
          { x: 'd', y: 6 },
        ]}
      />
    </Chart>
  );
};
