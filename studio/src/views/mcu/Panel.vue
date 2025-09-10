<template>
  <div>
    <section class="section">
      <div class="container">
        <div class="columns is-centered">
          <div class="column is-12-desktop" v-if="transparent === true">
             <slot></slot>
          </div>
          <div class="column is-12-desktop" v-else>
        
            <div class="card box">
              <div class="card-content">
                <slot></slot>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
export default {
  props:['transparent'],
  methods: {},
  mounted() {},
};
</script>

