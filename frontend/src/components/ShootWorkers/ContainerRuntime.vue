
<!--
SPDX-FileCopyrightText: 2021 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
-->

<template>
  <div class="d-flex flex-row">
    <v-select
      color="primary"
      item-color="primary"
      :items="criItems"
      :error-messages="getErrorMessages('criName')"
      @input="onInputCriName"
      @blur="$v.criName.$touch()"
      v-model="criName"
      label="Container Runtime"
    ></v-select>
    <v-select
      v-if="criContainerRuntimeTypes.length"
      class="ml-1"
      color="primary"
      item-color="primary"
      :items="criContainerRuntimeTypes"
      v-model="selectedCriContainerRuntimeTypes"
      label="Additional OCI Runtimes"
      multiple
      chips
      small-chips
      deletable-chips
    ></v-select>
  </div>
</template>

<script>
import { getValidationErrors } from '@/utils'
import { required } from 'vuelidate/lib/validators'
import find from 'lodash/find'
import map from 'lodash/map'
import get from 'lodash/get'
import set from 'lodash/set'
import unset from 'lodash/unset'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'

const validationErrors = {
  criName: {
    required: 'An explicit container runtime configuration is required',
    validCriName: 'The selected machine image does not support the selected container runtime'
  }
}

export default {
  props: {
    worker: {
      type: Object,
      required: true
    },
    machineImageCri: {
      type: Array,
      default: () => []
    },
    kubernetesVersion: {
      type: String,
      required: true
    }
  },
  data () {
    return {
      valid: undefined,
      validationErrors
    }
  },
  validations () {
    return this.validators
  },
  computed: {
    validCriNames () {
      return map(this.machineImageCri, 'name')
    },
    criItems () {
      const criItems = map(this.validCriNames, name => {
        return {
          value: name,
          text: name
        }
      })
      if (this.criName && !includes(criItems, this.criName)) {
        criItems.push({
          value: this.criName,
          text: this.criName,
          disabled: true
        })
      }
      return criItems
    },
    criContainerRuntimeTypes () {
      const containerRuntime = find(this.machineImageCri, ['name', this.criName])
      const ociRuntimes = get(containerRuntime, 'containerRuntimes', [])
      return map(ociRuntimes, 'type')
    },
    criName: {
      get () {
        return get(this.worker, 'cri.name')
      },
      set (value) {
        this.$set(this.worker, 'cri', {
          ...this.worker.cri,
          name: value
        })
      }
    },
    selectedCriContainerRuntimeTypes: {
      get () {
        const criContainerRuntimes = get(this.worker, 'cri.containerRuntimes')
        return criContainerRuntimes
          ? map(criContainerRuntimes, 'type')
          : undefined
      },
      set (value) {
        if (!isEmpty(value)) {
          const criContainerRuntimes = map(value, type => ({ type }))
          set(this.worker, 'cri.containerRuntimes', criContainerRuntimes)
        } else {
          unset(this.worker, 'cri.containerRuntimes')
        }
      }
    },
    validators () {
      return {
        criName: {
          required,
          validCriName: value => {
            return includes(this.validCriNames, value)
          }
        }
      }
    }
  },
  methods: {
    getErrorMessages (field) {
      return getValidationErrors(this, field)
    },
    onInputCriName (value) {
      this.selectedCriContainerRuntimeTypes = undefined
      this.$v.criName.$touch()
      this.validateInput()
    },
    validateInput () {
      if (this.valid !== !this.$v.$invalid) {
        this.valid = !this.$v.$invalid
        this.$emit('valid', { id: this.worker.id, valid: this.valid })
      }
    }
  },
  mounted () {
    this.$v.$touch()
    this.validateInput()
  },
  watch: {
    criItems (criItems) {
      this.$v.$touch()
      this.validateInput()
    }
  }
}
</script>
