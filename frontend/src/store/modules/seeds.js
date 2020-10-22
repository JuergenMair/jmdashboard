//
// Copyright (c) 2020 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//

import { getSeeds } from '@/utils/api'
import find from 'lodash/find'

// initial state
const state = {
  all: []
}

// getters
const getters = {
  items (state) {
    return state.all
  },
  seedByName (state) {
    return name => find(state.all, ['metadata.name', name])
  }
}

// actions
const actions = {
  async getAll ({ commit, state }) {
    const { data } = await getSeeds()
    commit('RECEIVE', data)
    return state.all
  }
}

// mutations
const mutations = {
  RECEIVE (state, items) {
    state.all = items
  }
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations
}