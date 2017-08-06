<template>
  <div id="amz-extra-info">
    {{title}}
  </div>
</template>

<script lang="babel" type="text/babel">
  export default {
    props: {
      title: String
    },
    data() {
      return {
        
      }
    },
    mounted() {
      console.log("mounted");
    }
  };
</script>

<style lang="stylus" type="text/scss">
  #amz-extra-info {
    display: none;
  }
</style>
