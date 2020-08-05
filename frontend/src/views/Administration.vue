<!--
Copyright (c) 2020 by SAP SE or an SAP affiliate company. All rights reserved. This file is licensed under the Apache Software License, v. 2 except as noted otherwise in the LICENSE file

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

     http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
 -->

<template>
  <v-container fluid>
    <v-row no-gutters>
      <v-col cols="12" md="6">
        <v-row no-gutters class="flex-column">
          <v-col class="pa-3">
            <v-card>
              <v-toolbar flat dark dense :color="color">
                <v-toolbar-title class="subtitle-1">Details</v-toolbar-title>
              </v-toolbar>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-information-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Name</v-list-item-subtitle>
                    <v-list-item-title>
                      {{projectName}}
                    </v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <copy-btn :color="color" :clipboard-text="projectName" tooltip-text="Copy project name to clipboard"></copy-btn>
                  </v-list-item-action>
                </v-list-item>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-text-subject</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Description</v-list-item-subtitle>
                    <v-list-item-title class="wrap-text">
                      <editable-text
                        :read-only="!canPatchProject"
                        :color="color"
                        :value="description"
                        :save="updateDescription"
                      />
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider inset/>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-account-cog-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Technical Contact</v-list-item-subtitle>
                    <v-list-item-title>
                      <editable-account
                        :read-only="!canPatchProject"
                        :color="color"
                        :value="technicalContact"
                        :items="userList"
                        :rules="[rules.technicalContact]"
                        placeholder="Select the technical contact"
                        no-data-text="No project member available"
                        :save="updateTechnicalContact"
                      ></editable-account>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider inset/>
                <v-list-item v-if="createdBy">
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-account-clock-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Created By</v-list-item-subtitle>
                    <v-list-item-title>
                      <account-avatar :account-name="createdBy" mail-to :color="color"></account-avatar>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon v-if="!createdBy" :color="color">mdi-clock-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Created At</v-list-item-subtitle>
                    <v-list-item-title>
                      <v-tooltip right>
                        <template v-slot:activator="{ on }">
                          <span v-on="on" class="subtitle-1">{{createdAt}}</span>
                        </template>
                        <time-string :dateTime="creationTimestamp" :pointInTime="-1"></time-string>
                      </v-tooltip>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <v-divider inset/>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-label-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>Purpose</v-list-item-subtitle>
                    <v-list-item-title class="wrap-text">
                      <editable-text
                        :read-only="!canPatchProject"
                        :color="color"
                        :value="purpose"
                        :save="updatePurpose"
                      />
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
                <template v-if="slaDescriptionCompiledMarkdown">
                  <v-divider inset/>
                  <v-list-item>
                    <v-list-item-avatar>
                      <v-icon :color="color">mdi-file-document-outline</v-icon>
                    </v-list-item-avatar>
                    <v-list-item-content>
                      <v-list-item-subtitle>{{slaTitle}}</v-list-item-subtitle>
                      <v-list-item-title class="markdown wrap-text" v-html="slaDescriptionCompiledMarkdown"></v-list-item-title>
                    </v-list-item-content>
                  </v-list-item>
                </template>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
      <v-col cols="12" md="6">
        <v-row no-gutters class="flex-column">
          <v-col v-if="canDeleteProject" class="pa-3">
            <v-card>
              <v-toolbar flat dark dense :color="color">
                <v-toolbar-title class="subtitle-1">Lifecycle</v-toolbar-title>
              </v-toolbar>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-delete-circle-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Delete Project</v-list-item-title>
                  </v-list-item-content>
                  <v-list-item-action>
                    <v-tooltip v-if="canDeleteProject" top>
                      <template v-slot:activator="{ on }">
                        <div v-on="on">
                          <v-btn :color="color" :disabled="isDeleteButtonDisabled" icon @click.native.stop="showDialog">
                            <v-icon>mdi-delete</v-icon>
                          </v-btn>
                        </div>
                      </template>
                      <span v-text="isDeleteButtonDisabled ? 'You can only delete projects that do not contain clusters' : 'Delete Project'" />
                    </v-tooltip>
                  </v-list-item-action>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col v-if="costObjectSettingEnabled" class="pa-3">
            <v-card>
              <v-toolbar flat dark dense :color="color">
                <v-toolbar-title class="subtitle-1">Billing</v-toolbar-title>
              </v-toolbar>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-credit-card-outline</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-subtitle>{{costObjectTitle}}</v-list-item-subtitle>
                    <v-list-item-title>
                      <editable-text
                        :read-only="!canPatchProject"
                        :color="color"
                        :value="costObject"
                        :rules="[rules.costObject]"
                        :save="updateCostObject"
                      >
                        <template v-if="costObjectDescriptionCompiledMarkdown" v-slot:info>
                          <v-alert icon="mdi-information-outline" dense text tile :color="color" class="mb-0" >
                            <div class="alertBannerMessage" v-html="costObjectDescriptionCompiledMarkdown"></div>
                          </v-alert>
                        </template>
                      </editable-text>
                    </v-list-item-title>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
          <v-col v-if="isKubeconfigEnabled" class="pa-3">
            <v-card>
              <v-toolbar flat dark dense :color="color">
                <v-toolbar-title class="subtitle-1">Access</v-toolbar-title>
              </v-toolbar>
              <v-list>
                <v-list-item>
                  <v-list-item-avatar>
                    <v-icon :color="color">mdi-file</v-icon>
                  </v-list-item-avatar>
                  <v-list-item-content>
                    <v-list-item-title>Command Line Interface Access</v-list-item-title>
                    <v-list-item-subtitle class="wrap-text">
                      Go to
                      <router-link :to="{ name: 'Account', query: { namespace: this.namespace } }" :class="textColor">
                        My Account
                      </router-link>
                      to download the <tt>kubeconfig</tt> for this project.
                    </v-list-item-subtitle>
                  </v-list-item-content>
                </v-list-item>
              </v-list>
            </v-card>
          </v-col>
        </v-row>
      </v-col>
    </v-row>

    <g-dialog
      defaultColor="red"
      :errorMessage.sync="errorMessage"
      :detailedErrorMessage.sync="detailedErrorMessage"
      ref="gDialog">
      <template v-slot:caption>
        Confirm Delete
      </template>
      <template v-slot:message>
        Are you sure to delete the project <b>{{projectName}}</b>?
        <br />
        <i class="red--text">The operation can not be undone.</i>
      </template>
    </g-dialog>

  </v-container>
</template>

<script>
import { mapGetters, mapState, mapActions } from 'vuex'
import CopyBtn from '@/components/CopyBtn'
import EditableText from '@/components/editable/EditableText'
import EditableAccount from '@/components/editable/EditableAccount'
import AccountAvatar from '@/components/AccountAvatar'
import GDialog from '@/components/dialogs/GDialog'
import TimeString from '@/components/TimeString'
import { errorDetailsFromError } from '@/utils/error'
import { compileMarkdown, getProjectDetails, textColor, isServiceAccount, gravatarUrlGeneric } from '@/utils'
import get from 'lodash/get'
import set from 'lodash/set'
import includes from 'lodash/includes'
import isEmpty from 'lodash/isEmpty'

export default {
  name: 'administration',
  components: {
    CopyBtn,
    EditableAccount,
    EditableText,
    AccountAvatar,
    GDialog,
    TimeString
  },
  data () {
    return {
      color: 'blue-grey darken-2',
      edit: false,
      editTechnicalContact: false,
      technicalContactMessages: [],
      errorMessage: undefined,
      detailedErrorMessage: undefined,
      rules: {
        technicalContact: value => {
          if (!value) {
            return 'Technical Contact is required'
          }
          if (!includes(this.userList, value)) {
            return 'Technical Contact must be a project member'
          }
          return true
        },
        costObject: (value = '') => {
          if (!this.costObjectRegExp) {
            return true
          }
          return this.costObjectRegExp.test(value) || this.costObjectErrorMessage
        }
      }
    }
  },
  computed: {
    ...mapState([
      'cfg',
      'namespace'
    ]),
    ...mapGetters([
      'shootList',
      'projectList',
      'memberList',
      'canPatchProject',
      'canDeleteProject',
      'projectFromProjectList',
      'costObjectSettings',
      'isKubeconfigEnabled'
    ]),
    project () {
      return this.projectFromProjectList
    },
    projectDetails () {
      return getProjectDetails(this.project)
    },
    userList () {
      const members = new Set()
      for (const { username } of this.memberList) {
        if (!isServiceAccount(username)) {
          members.add(username)
        }
      }
      if (this.technicalContact) {
        members.add(this.technicalContact)
      }
      return Array.from(members)
    },
    costObjectSettingEnabled () {
      return !isEmpty(this.costObjectSettings)
    },
    costObjectTitle () {
      return get(this.costObjectSettings, 'title')
    },
    costObjectRegExp () {
      const pattern = get(this.costObjectSettings, 'regex')
      return pattern ? RegExp(pattern) : null
    },
    costObjectErrorMessage () {
      return get(this.costObjectSettings, 'errorMessage')
    },
    costObjectDescriptionCompiledMarkdown () {
      const description = get(this.costObjectSettings, 'description')
      return compileMarkdown(description)
    },
    projectName () {
      return this.projectDetails.projectName
    },
    technicalContact () {
      return this.projectDetails.technicalContact
    },
    technicalContactAvatarUrl () {
      return gravatarUrlGeneric(this.technicalContact, 48)
    },
    costObject () {
      return this.projectDetails.costObject
    },
    createdAt () {
      return this.projectDetails.createdAt
    },
    creationTimestamp () {
      return this.projectDetails.creationTimestamp
    },
    createdBy () {
      return this.projectDetails.createdBy
    },
    description () {
      return this.projectDetails.description
    },
    purpose () {
      return this.projectDetails.purpose
    },
    isDeleteButtonDisabled () {
      return this.shootList.length > 0
    },
    sla () {
      return this.cfg.sla || {}
    },
    slaDescriptionCompiledMarkdown () {
      return compileMarkdown(this.sla.description, this.color)
    },
    slaTitle () {
      return this.sla.title
    },
    textColor () {
      return textColor(this.color)
    }
  },
  methods: {
    ...mapActions([
      'patchProject',
      'deleteProject'
    ]),
    onEditTechnicalContact () {
      this.editTechnicalContact = !this.editTechnicalContact
      if (this.editTechnicalContact) {
        this.$nextTick(() => this.$refs.technicalContact.activateMenu())
      }
    },
    updateTechnicalContact (value) {
      return this.updateProperty('owner', value)
    },
    updateDescription (value) {
      if (!value) {
        value = null
      }
      return this.updateProperty('description', value)
    },
    updatePurpose (value) {
      if (!value) {
        value = null
      }
      return this.updateProperty('purpose', value)
    },
    updateCostObject (value) {
      if (this.costObjectSettingEnabled) {
        if (!value) {
          value = null
        }
        return this.updateProperty('costObject', value, {
          error: 'Failed to update billing information of project'
        })
      }
    },
    async updateProperty (key, value, options = {}) {
      const { metadata: { name, namespace } } = this.project
      try {
        const mergePatchDocument = {
          metadata: { name, namespace }
        }
        switch (key) {
          case 'costObject':
            set(mergePatchDocument, ['metadata', 'annotations', 'billing.gardener.cloud/costObject'], value)
            break
          default:
            set(mergePatchDocument, ['data', key], value)
            break
        }
        // eslint-disable-next-line no-unused-vars
        const body = await this.patchProject(mergePatchDocument)
      } catch (err) {
        const { error = `Failed to update project ${key}` } = options
        throw Object.assign(new Error(error), errorDetailsFromError(err))
      }
    },
    async showDialog () {
      this.$refs.gDialog.showDialog()

      const confirmed = await this.$refs.gDialog.confirmWithDialog()
      if (confirmed) {
        try {
          await this.deleteProject(this.project)
          if (this.projectList.length > 0) {
            const p1 = this.projectList[0]
            this.$router.push({ name: 'ShootList', params: { namespace: p1.metadata.namespace } })
          } else {
            this.$router.push({ name: 'Home', params: { } })
          }
        } catch (err) {
          const errorDetails = errorDetailsFromError(err)
          this.errorMessage = 'Failed to delete project'
          this.detailedErrorMessage = errorDetails.detailedMessage
          console.error(this.errorMessage, errorDetails.errorCode, errorDetails.detailedMessage, err)
          this.showDialog()
        }
      }
    },
    reset () {
      this.errorMessage = undefined
      this.detailedMessage = undefined
      this.edit = false
    }
  }
}
</script>

<style lang="scss" scoped>
  .markdown {
    ::v-deep > p {
      margin: 0px;
    }
  }
  .wrap-text {
    line-height: inherit;
    overflow: auto !important;
    white-space: normal !important;
  }
</style>