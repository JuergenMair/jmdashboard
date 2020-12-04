<!--
SPDX-FileCopyrightText: 2020 SAP SE or an SAP affiliate company and Gardener contributors

SPDX-License-Identifier: Apache-2.0
 -->

<template>
  <g-dialog
    :confirmButtonText="confirmButtonText"
    max-width="750px"
    max-height="100vh"
    defaultColor="cyan-darken-2"
    ref="gDialog"
    >
    <template v-slot:caption>
      <template v-if="needsUpdate">
        Update Service Account
      </template>
      <template v-else>
        Add Service Account
      </template>
    </template>
    <template v-slot:message>
      <div key="confirm-message" style="min-height:100px">
        <div>
          <span v-if="needsUpdate">To access the garden cluster the <tt>{{serviceAccountName}}</tt> service account requires the <tt>admin</tt> role.</span>
          <span v-else>To access the garden cluster a dedicated service account is required.</span>
        </div>
        <div>
           <span v-if="needsUpdate">Do you want grant the <tt>admin</tt> role to the service account?</span>
           <span v-else>Do you want to create the <tt>{{serviceAccountName}}</tt> service account and add it as member with <tt>admin</tt> role to this project?</span>
          <v-list>
            <v-list-item>
              <v-list-item-content>
                <v-list-item-title class="wrap-text">
                  <account-avatar :account-name="serviceAccountUsername"></account-avatar>
                </v-list-item-title>
              </v-list-item-content>
              <v-list-item-action>
                <service-account-roles :role-display-names="desiredRoleDisplayNames"></service-account-roles>
              </v-list-item-action>
            </v-list-item>
          </v-list>
        </div>
      </div>
      <g-alert
        color="error"
        class="ma-0"
        :message.sync="errorMessage"
        :detailedMessage.sync="detailedErrorMessage"
      ></g-alert>
    </template>
  </g-dialog>
</template>

<script>
import GDialog from '@/components/dialogs/GDialog'
import AccountAvatar from '@/components/AccountAvatar'
import GAlert from '@/components/GAlert'
import ServiceAccountRoles from '@/components/ServiceAccountRoles'
import { errorDetailsFromError, isConflict } from '@/utils/error'
import { mapActions } from 'vuex'
import get from 'lodash/get'
import { sortedRoleDisplayNames } from '@/utils'

export default {
  name: 'WebterminalServiceAccountDialog',
  components: {
    GDialog,
    GAlert,
    AccountAvatar,
    ServiceAccountRoles
  },
  props: {
    namespace: {
      type: String
    }
  },
  data () {
    return {
      errorMessage: undefined,
      detailedErrorMessage: undefined,
      member: undefined
    }
  },
  computed: {
    needsUpdate () {
      return !!this.member
    },
    confirmButtonText () {
      if (this.needsUpdate) {
        return 'Update'
      }
      return 'Add'
    },
    serviceAccountName () {
      return 'dashboard-webterminal'
    },
    serviceAccountUsername () {
      return `system:serviceaccount:${this.namespace}:${this.serviceAccountName}`
    },
    desiredRoleDisplayNames () {
      return sortedRoleDisplayNames(this.desiredRoles)
    },
    desiredRoles () {
      const roles = [...get(this.member, 'roles', [])]
      roles.push('admin')
      return roles
    }
  },
  methods: {
    ...mapActions([
      'addMember',
      'updateMember'
    ]),
    async promptForConfirmation (member) {
      this.member = member

      return await this.$refs.gDialog.confirmWithDialog(async () => {
        return this.addServiceAccount()
      })
    },
    async addServiceAccount () {
      if (!this.namespace) {
        // eslint-disable-next-line no-console
        console.error('no namespace set')
        return false
      }

      try {
        if (this.needsUpdate) {
          await this.updateMember({
            name: this.serviceAccountUsername,
            roles: this.desiredRoles,
            description: 'Service account required to manage temporary service accounts for the webterminal feature of the gardener dashboard'
          })
        } else {
          await this.addMember({
            name: this.serviceAccountUsername,
            roles: ['admin'],
            description: 'Service account required to manage temporary service accounts for the webterminal feature of the gardener dashboard'
          })
        }
        return true
      } catch (err) {
        const errorDetails = errorDetailsFromError(err)
        if (isConflict(err)) {
          return true // service account already exists
        } else {
          this.errorMessage = 'Failed to add service account'
        }
        this.detailedErrorMessage = errorDetails.detailedMessage
        // eslint-disable-next-line no-console
        console.error(this.errorMessage, errorDetails.errorCode, errorDetails.detailedMessage, err)
        return false
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .wrap-text {
    white-space: normal;
  }
</style>