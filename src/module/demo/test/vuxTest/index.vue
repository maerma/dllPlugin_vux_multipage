<template>
  <div>
    <group>
      <cell title="title" value="value"></cell>
    </group>
    <section style="margin-top: .5rem;">
      <x-button type="primary">primary</x-button>
    </section>
  </div>
</template>

<script>
import { Group, Cell, XButton } from 'vux'

export default {
  components: {
    Group,
    Cell,
    XButton
  }
}
</script>