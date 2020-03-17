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

import { number } from '@storybook/addon-knobs';
import React from 'react';

import { AreaSeries, Axis, Chart, Position, ScaleType, Settings } from '../../src';
import { SeededDataGenerator } from '../../src/mocks/utils';

export const example = () => {
  const dg = new SeededDataGenerator();
  const data = dg.generateSimpleSeries(31);
  const customStyle = {
    tickLabelPadding: number('Tick Label Padding', 0),
  };

  return (
    <Chart className="story-chart">
      <Settings debug={true} />
      <Axis
        id="bottom"
        position={Position.Bottom}
        title="Bottom axis"
        showOverlappingTicks={true}
        style={customStyle}
      />
      <AreaSeries
        id="lines"
        xScaleType={ScaleType.Linear}
        yScaleType={ScaleType.Linear}
        xAccessor="x"
        yAccessors={['y']}
        data={data}
      />
    </Chart>
  );
};