<template>
  <div class="MatcLight">
    <h1>Bebugger Test</h1>
 
    <PreviewDegugger ref="previewDebugger"/>

  </div>
</template>

<style>
  @import url("../style/matc.css");

  .MatcAnimtationPlayer{
    display: inline-block;
    margin: 10px;
    border: 1px dashed orange;
    vertical-align: top;
  }
</style>

<script>

import PreviewDegugger from '../canvas/toolbar/components/PreviewDebugger.vue'

export default {
  name: "PreviewDeguggerTest",
  mixins: [],
  data: function() {
    return {
    };
  },
  components: {
    'PreviewDegugger': PreviewDegugger
  },
  methods: {

  },
  mounted() {
    this.$refs.previewDebugger.setModel({
      widgets: {
        'w1': {
          props : {
            databinding: {
              'var1': 'users',
              'var2': 'selectedUser.name',
              'var3': 'selectedUser.lastname',
              'var4': 'checked',
              'var5': 'service',
              'var6': 'fruits',
            }
          }
        }
      }
    })
    this.$refs.previewDebugger.onOpen()
    this.$refs.previewDebugger.setData(JSON.stringify({
      users: [
        {
          name: 'Nerea', lastname: 'Jenson'
        },
        {
          name: 'Jan', lastname: 'Pressler'
        },
        {
          name: 'Peter', lastname: 'oerling', pets: ['Cat', 'Dog']
        },
      ],
      fruits: ['Apple', 'Bannana', 'Organge'],
      service: 'testomesto.com',
      checked: true,
      selectedUser: {
        name: 'Benna',
        lastname: 'M'
      }
    }))
  }
};
</script>
