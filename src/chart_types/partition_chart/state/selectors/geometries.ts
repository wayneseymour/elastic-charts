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
 * under the License.
 */

import createCachedSelector from 're-reselect';

import { ChartType } from '../../..';
import { CategoryKey } from '../../../../common/category';
import { Pixels, Ratio } from '../../../../common/geometry';
import { SmallMultiplesSpec, SpecType } from '../../../../specs';
import { getChartContainerDimensionsSelector } from '../../../../state/selectors/get_chart_container_dimensions';
import { getChartIdSelector } from '../../../../state/selectors/get_chart_id';
import { getChartThemeSelector } from '../../../../state/selectors/get_chart_theme';
import { getSpecs } from '../../../../state/selectors/get_settings_specs';
import { getSpecsFromStore } from '../../../../state/utils';
import { Dimensions } from '../../../../utils/dimensions';
import { config } from '../../layout/config';
import { nullShapeViewModel, QuadViewModel, ShapeViewModel } from '../../layout/types/viewmodel_types';
import { getShapeViewModel } from '../../layout/viewmodel/scenegraph';
import { IndexedContinuousDomainFocus } from '../../renderer/canvas/partition';
import { getPartitionSpecs } from './get_partition_specs';
import { getTrees, StyledTree } from './tree';

const horizontalSplit = (s?: SmallMultiplesSpec) => s?.splitHorizontally;
const verticalSplit = (s?: SmallMultiplesSpec) => s?.splitVertically;

function getInterMarginSize(size: Pixels, startMargin: Ratio, endMargin: Ratio) {
  return size * (1 - Math.min(1, startMargin + endMargin));
}

/** @internal */
export const partitionMultiGeometries = createCachedSelector(
  [getSpecs, getPartitionSpecs, getChartContainerDimensionsSelector, getTrees, getChartThemeSelector],
  (specs, partitionSpecs, parentDimensions, trees, { background }): ShapeViewModel[] => {
    const smallMultiplesSpecs = getSpecsFromStore<SmallMultiplesSpec>(specs, ChartType.Global, SpecType.SmallMultiples);

    // todo make it part of configuration
    const outerSpecDirection = ['horizontal', 'vertical', 'zigzag'][0];

    const innerBreakdownDirection = horizontalSplit(smallMultiplesSpecs[0])
      ? 'horizontal'
      : verticalSplit(smallMultiplesSpecs[0])
      ? 'vertical'
      : 'zigzag';

    const { width: marginedWidth, height: marginedHeight } = parentDimensions;

    const outerPanelCount = partitionSpecs.length;
    const zigzagColumnCount = Math.ceil(Math.sqrt(outerPanelCount));
    const zigzagRowCount = Math.ceil(outerPanelCount / zigzagColumnCount);

    const outerWidthRatio =
      outerSpecDirection === 'horizontal'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
        ? 1 / zigzagColumnCount
        : 1;
    const outerHeightRatio =
      outerSpecDirection === 'vertical'
        ? 1 / outerPanelCount
        : outerSpecDirection === 'zigzag'
        ? 1 / zigzagRowCount
        : 1;

    const chartWidth = getInterMarginSize(marginedWidth, config.margin.left, config.margin.right);
    const chartHeight = getInterMarginSize(marginedHeight, config.margin.top, config.margin.bottom);

    const result = partitionSpecs.flatMap((spec, index) => {
      return trees.map(({ name, style, tree: t }: StyledTree, innerIndex, a) => {
        const innerPanelCount = a.length;
        const outerPanelWidth = chartWidth * outerWidthRatio;
        const outerPanelHeight = chartHeight * outerHeightRatio;
        const outerPanelArea = outerPanelWidth * outerPanelHeight;
        const innerPanelTargetArea = outerPanelArea / innerPanelCount;
        const innerPanelTargetHeight = Math.sqrt(innerPanelTargetArea); // attempting squarish inner panels

        const innerZigzagRowCountEstimate = Math.max(1, Math.floor(outerPanelHeight / innerPanelTargetHeight)); // err on the side of landscape aspect ratio
        const innerZigzagColumnCount = Math.ceil(a.length / innerZigzagRowCountEstimate);
        const innerZigzagRowCount = Math.ceil(a.length / innerZigzagColumnCount);
        const innerRowCount =
          innerBreakdownDirection === 'vertical'
            ? a.length
            : innerBreakdownDirection === 'zigzag'
            ? innerZigzagRowCount
            : 1;
        const innerColumnCount =
          innerBreakdownDirection === 'vertical'
            ? 1
            : innerBreakdownDirection === 'zigzag'
            ? innerZigzagColumnCount
            : a.length;
        const innerRowIndex =
          innerBreakdownDirection === 'vertical'
            ? innerIndex
            : innerBreakdownDirection === 'zigzag'
            ? Math.floor(innerIndex / innerZigzagColumnCount)
            : 0;
        const innerColumnIndex =
          innerBreakdownDirection === 'vertical'
            ? 0
            : innerBreakdownDirection === 'zigzag'
            ? innerIndex % innerZigzagColumnCount
            : innerIndex;
        const topOuterRatio =
          outerSpecDirection === 'vertical'
            ? index / outerPanelCount
            : outerSpecDirection === 'zigzag'
            ? Math.floor(index / zigzagColumnCount) / zigzagRowCount
            : 0;
        const topInnerRatio =
          outerHeightRatio *
          (innerBreakdownDirection === 'vertical'
            ? innerIndex / a.length
            : innerBreakdownDirection === 'zigzag'
            ? Math.floor(innerIndex / innerZigzagColumnCount) / innerZigzagRowCount
            : 0);
        const panelHeightRatio =
          outerHeightRatio *
          (innerBreakdownDirection === 'vertical'
            ? 1 / a.length
            : innerBreakdownDirection === 'zigzag'
            ? 1 / innerZigzagRowCount
            : 1);
        const leftOuterRatio =
          outerSpecDirection === 'horizontal'
            ? index / outerPanelCount
            : outerSpecDirection === 'zigzag'
            ? (index % zigzagColumnCount) / zigzagColumnCount
            : 0;
        const leftInnerRatio =
          outerWidthRatio *
          (innerBreakdownDirection === 'horizontal'
            ? innerIndex / a.length
            : innerBreakdownDirection === 'zigzag'
            ? (innerIndex % innerZigzagColumnCount) / innerZigzagColumnCount
            : 0);
        const panelWidthRatio =
          outerWidthRatio *
          (innerBreakdownDirection === 'horizontal'
            ? 1 / a.length
            : innerBreakdownDirection === 'zigzag'
            ? 1 / innerZigzagColumnCount
            : 1);
        return getShapeViewModel(spec, parentDimensions, t, background.color, style, {
          index,
          innerIndex,
          partitionLayout: spec.config.partitionLayout ?? config.partitionLayout,
          panelTitle: String(name),
          top: topOuterRatio + topInnerRatio,
          height: panelHeightRatio,
          left: leftOuterRatio + leftInnerRatio,
          width: panelWidthRatio,
          innerRowCount,
          innerColumnCount,
          innerRowIndex,
          innerColumnIndex,
        });
      });
    });

    return result.length === 0 ? [nullShapeViewModel(config, { x: outerWidthRatio, y: outerHeightRatio })] : result;
  },
)(getChartIdSelector);

function focusRect(quadViewModel: QuadViewModel[], { left, width }: Dimensions, drilldown: CategoryKey[]) {
  return drilldown.length === 0
    ? { x0: left, x1: left + width }
    : quadViewModel.find(
        ({ path }) => path.length === drilldown.length && path.every(({ value }, i) => value === drilldown[i]),
      ) ?? { x0: left, x1: left + width };
}

/** @internal */
export const partitionDrilldownFocus = createCachedSelector(
  [
    partitionMultiGeometries,
    getChartContainerDimensionsSelector,
    (state) => state.interactions.drilldown,
    (state) => state.interactions.prevDrilldown,
  ],
  (multiGeometries, chartDimensions, drilldown, prevDrilldown): IndexedContinuousDomainFocus[] =>
    multiGeometries.map(({ quadViewModel, index, innerIndex }) => {
      const { x0: currentFocusX0, x1: currentFocusX1 } = focusRect(quadViewModel, chartDimensions, drilldown);
      const { x0: prevFocusX0, x1: prevFocusX1 } = focusRect(quadViewModel, chartDimensions, prevDrilldown);
      return { currentFocusX0, currentFocusX1, prevFocusX0, prevFocusX1, index, innerIndex };
    }),
)((state) => state.chartId);

/** @internal */
export const partitionGeometries = createCachedSelector(
  [partitionMultiGeometries],
  (multiGeometries: ShapeViewModel[]) => {
    return [
      multiGeometries.length > 0 // singleton!
        ? multiGeometries[0]
        : nullShapeViewModel(),
    ];
  },
)(getChartIdSelector);
