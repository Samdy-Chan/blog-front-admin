<template>
  <div :style="{ width: w + 'px', height: h + 'px', overflow: 'hidden' }">
    <canvas type="2d" class="yzm-canvas" @click="getYzm"></canvas>
  </div>
</template>

<script>
import { onMounted } from 'vue'

export default {
  name: 'hm-yzm',
  props: {
    // 验证码画布的宽度
    w: {
      type: Number,
      default: 120,
    },
    // 验证码画布的高度
    h: {
      type: Number,
      default: 40,
    },
    // 验证码默认字符数
    rndStrLen: {
      type: Number,
      default: 4,
    },
  },
  emits: ['getYzm'],

  setup(props, context) {
    onMounted(() => {
      getYzm()
    })

    async function getYzm() {
      // yzm() 返回的是 promise 对象，所以要用 async + await 获取
      let yzm = await yzmCode()
      // console.log('yzm:', yzm)
      // 调用父组件的 getYzm 函数，把验证码传给父组件
      context.emit('getYzm', yzm)
    }

    /**
     * 以 promise + await 方式获取 canvas 画布节点函数
     */
    // function getCanvas() {
    //   return new Promise((resolve, reject) => {
    //     const canvas = document.querySelector('.yzm-canvas')
    //     resolve(canvas)
    //   })
    // }

    /**
     * 生成画布验证码函数
     */
    function yzmCode() {
      /**
       * @name rndNum
       * 用于生成 min 到 max 之间的随机验证码、颜色的基本随机数函数 rndNum
       */
      function rndNum(min, max) {
        // Math.random() 是只生成 0 - 1 之间的随机小数
        return parseInt(Math.random() * (max - min) + min)
      }

      /**
       * @name rndColor
       * 调用以上 rndNum 生成随机颜色的函数 rndColor
       */
      function rndColor(min, max) {
        let r = rndNum(min, max)
        let g = rndNum(min, max)
        let b = rndNum(min, max)
        // 返回随机颜色的样式字符串，如 rgb(0,255,22)
        return `rgb(${r}, ${g}, ${b})`
      }

      // 获取 canvas 节点实例
      const canvas = document.querySelector('.yzm-canvas')
      console.log('canvas:', canvas)

      // 设置绘制 canvas 使用 2d 画笔
      const ctx = canvas.getContext('2d')

      ctx.clearRect(0, 0, props.w, props.h)
      // ctx.beginPath()

      // 设置绘制的背景颜色样式，rgb(r, g, b)，数据越大，颜色越浅
      ctx.fillStyle = rndColor(150, 230)
      // 绘制 canvas 背景颜色，fillRect()前两个参数 0, 0 表示 x, y 坐标，0, 0 表示右上角开始绘制；
      // props.w ,props.h 表示绘制的宽度大小，默认绘制黑色
      ctx.fillRect(0, 0, props.w, props.h)

      // 设置验证码使用的随机字符串
      const str =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'

      // 保存生成的随机字符串
      let rndStr = ''
      // 保存生成拼接的验证码串
      let result = ''
      // 循环生成 props.rndStrLen 个随机验证码
      for (let i = 0; i < props.rndStrLen; i++) {
        rndStr = str[rndNum(0, str.length)]

        // 随机设置生成验证码的字体大小
        let fs = rndNum(props.w * 0.2, props.w * 0.25)
        ctx.font = fs + 'px Simhei' // Simhei 是雅黑字体

        // 设置验证码字符基线对齐方式
        ctx.textBaseline = 'top'

        // 随机设置字体的颜色
        ctx.fillStyle = rndColor(80, 150)

        // 先保存设置
        ctx.save()

        // 设置每个字符的坐标位移，Y坐标不变，为12
        ctx.translate(props.w * 0.25 * i + 12, 12)

        // 随机设置验证码字符的旋转角度（角度不要太大）
        let deg = rndNum(-30, 30)
        ctx.rotate((deg * Math.PI) / 180)

        // 填充验证码，坐标 0, 0 是以以上 translate 位置后的坐标为起点，0， 0不是指左上角
        // ctx.fillText(rndStr, 0, 0)
        ctx.fillText(rndStr, props.w * -0.1, props.w * -0.1) // 有点偏右和偏下，可以住回移动10px

        // 每循环一次，都要复原一次设置（防止影响其它字符）
        ctx.restore()

        // 保存生成拼接的验证码串
        result += rndStr
      }

      // 随机生成干扰线（5条）
      for (let i = 0; i < 5; i++) {
        // 设置开始绘制路径
        ctx.beginPath()
        // 设置起始绘制线段的位置，x坐标：为 0 到 props.w（canvas宽度）之间的随机数， y坐标：为 0 到 props.h（canvas高度）之间的随机数
        ctx.moveTo(rndNum(0, props.w), rndNum(0, props.h))
        // 设置结束绘制线段的位置，x坐标：为 0 到 props.w（canvas宽度）之间的随机数， y坐标：为 0 到 props.h（canvas高度）之间的随机数
        ctx.lineTo(rndNum(0, props.w), rndNum(0, props.h))
        // 设置绘制线段的颜色样式
        ctx.strokeStyle = rndColor(150, 230)
        // 关闭绘制路径
        ctx.closePath()
        // 绘制路径
        ctx.stroke()
      }

      // 随机生产 30 个干扰的小圆点
      for (let i = 0; i < 30; i++) {
        ctx.beginPath()
        // arc() 绘制圆点
        ctx.arc(rndNum(0, props.w), rndNum(0, props.h), 1, 0, 2 * Math.PI)
        ctx.closePath()
        ctx.fillStyle = rndColor(150, 200)
        ctx.fill()
      }

      // 返回生成的验证码纯文本
      return result
    }

    // 暴露给 html 模板要引用的属性数据或方法
    return {
      getYzm,
    }
  },
}
</script>

<style lang="scss" scoped>
</style>