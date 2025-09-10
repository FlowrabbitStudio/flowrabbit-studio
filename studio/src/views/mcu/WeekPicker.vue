<template>
 
    <div class="MCUWeekPicker" >
        <span class="mdi mdi-chevron-left" @click="onBack()"/> {{label}}
        <span class="mdi mdi-chevron-right" @click="onForward()" v-if="value > 0"/>
    </div>
   
</template>

<script>



export default {
  props:['value'],
  data: function() {
    return {
      day: 1000 * 24 * 60 * 60,
      week: 1
    };
  },
  components: {},
  computed: {
    label () {
      let now = new Date().getTime()
      let w = (this.day * 7 * this.week)
      let from = now - w  - this.value * w
      let to = now - this.value * w
      return this.printDate(from) + ' - ' + this.printDate(to)
    }
  },
  methods: {
    onBack () {
      this.onChange(this.value + 1)
    },
    onForward () {
      this.onChange(this.value - 1)
    },
    onChange (value) {
        let now = new Date().getTime()
        let w = (this.day * 7 * this.week)
        let from = now - w  - value * w
        let to = now - value * w
        this.$emit('change', from, to, value)
        this.$emit('input', value)
    },
    printDate (ms) {
      var date = new Date(ms);
      return date.toLocaleDateString();
    }
  },
  async mounted () {
  }
}
</script>

