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

export interface Dimensions {
  top: number;
  left: number;
  width: number;
  height: number;
}

// fixme consider switching from `number` to `Pixels` or similar, once nominal typing is added
export interface PerSideDistance {
  top: number;
  bottom: number;
  left: number;
  right: number;
}

// fixme consider deactivating @typescript-eslint/no-empty-interface
// see https://github.com/elastic/elastic-charts/pull/660#discussion_r419474171
export type Margins = PerSideDistance;
