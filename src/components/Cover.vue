<template>
  <div class="cover">
    <img :src="coverImg" />
  </div>
</template>

<script setup>
import { computed, getCurrentInstance } from 'vue'
const { proxy } = getCurrentInstance()

const props = defineProps({
  cover: {
    type: String,
    default: '',
  },
})

// 定义计算属性 coverImg
const coverImg = computed(() => {
  // 图片网络路径前缀
  const img_prefix = 'http://localhost:3001' + proxy.globalInfo.imageUrl

  // 如果传过来的缩略图为 null 或 '' 空串，则显示默认图片
  if (!props.cover) {
    return img_prefix + 'default.png'
  } else {
    return img_prefix + props.cover
  }
})

// console.log('props.cover:', props.cover)
</script>

<style lang="scss" scoped>
.cover {
  width: 60px;
  height: 60px;
  img {
    width: 100%;
    height: 100%;
  }
}
</style>