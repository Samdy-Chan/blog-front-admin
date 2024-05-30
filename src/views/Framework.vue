<template>
  <div class="layout">
    <el-container>
      <el-header class="header">
        <div class="logo">ChenBlog</div>
        <div class="user-info">
          <span>欢迎回来，</span>
          <el-dropdown trigger="click" :split-button="false">
            <div>
              <span class="nick-name">{{ user.nick_name }}</span>
              <span class="iconfont icon-close"></span>
            </div>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="toMyInfo">个人信息</el-dropdown-item>
                <el-dropdown-item @click="logout">退出</el-dropdown-item>
                <!-- disabled 禁止选择 -->
                <!-- <el-dropdown-item disabled>Action 4</el-dropdown-item> -->
                <!-- divided: 有顶部线条 -->
                <!-- <el-dropdown-item divided>Action 5</el-dropdown-item> -->
              </el-dropdown-menu>
            </template>
          </el-dropdown>
          <!-- 头像 -->
          <div class="avatar">
            <img :src="proxy.globalInfo.imageUrl + user.avatar" />
          </div>
        </div>
      </el-header>
      <el-container class="container">
        <el-aside width="200px" class="left-aside">
          <div>
            <el-button class="post-btn"
              >发布<span style="font-size: 18px">＋</span></el-button
            >
          </div>
          <div class="menu-panel">
            <ul>
              <li v-for="(menu, index) of menuList" :key="index">
                <span class="menu-title-p" @click="menu.open = !menu.open">
                  <span :class="['iconfont', menu.icon]"></span>
                  <span class="menu-title">{{ menu.title }}</span>
                  <span
                    :class="[
                      'iconfont',
                      'open-close',
                      menu.open ? 'icon-open' : 'icon-close',
                    ]"
                  ></span>
                </span>
                <ul v-show="menu.open" class="sub-menu">
                  <li v-for="(subMenu, index) in menu.children" :key="index">
                    <router-link
                      :to="subMenu.path"
                      :class="[
                        'sub-menu-item',
                        subMenu.path == activePath ? 'active' : '',
                      ]"
                    >
                      {{ subMenu.title }}
                    </router-link>
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </el-aside>
        <el-main class="right-main">
          <router-view />
        </el-main>
      </el-container>
    </el-container>
  </div>
</template>


<script setup>
// 导入 vue3 所需组合 api
import { ref, reactive, getCurrentInstance, watch } from 'vue'
const { proxy } = getCurrentInstance()

// 导入路由 api
import { useRouter, useRoute } from 'vue-router'
const router = useRouter()
const route = useRoute()

// 导入 userStore
import { useUserStore } from '@/store/userStore.js'
import { storeToRefs } from 'pinia'
const userStore = useUserStore()
// 从 store 中解构 state 数据时，如果解构的不是对象（而是普通类型），则要用 pinia 的 storeToRefs() 方法，将其转换为引用
// state 中的数据（user => userStore.user），而不是创建一个新的变量 user，但这里的 user 在 state 中是一个对象，所以也
// 可以不用storeToRefs()转换，但用 storeToRefs 转换后，访问.value 访问 user 里的属性，如 user.value.nick_name
let { user } = storeToRefs(userStore)

// 定义左则边栏菜单项列表

/************** 属性数据定义区域 - start **************/
const menuList = ref([
  {
    title: '博客',
    icon: 'icon-blog',
    open: true,
    children: [
      {
        title: '博客管理',
        path: '/blog/list',
      },
      {
        title: '分类管理',
        path: '/blog/category',
      },
    ],
  },
  {
    title: '专题',
    icon: 'icon-zhuanti',
    open: true,
    children: [
      {
        title: '专题管理',
        path: '/special/list',
      },
    ],
  },
  {
    title: '设置',
    icon: 'icon-settings',
    open: true,
    children: [
      {
        title: '个人信息设置',
        path: '/settings/my',
      },
      {
        title: '博客成员',
        path: '/settings/user',
      },
      {
        title: '系统设置',
        path: '/settings/system',
        roleType: 1,
      },
    ],
  },
  {
    title: '回收站',
    icon: 'icon-delete',
    open: true,
    children: [
      {
        title: '回收站',
        path: '/recycle/list',
      },
    ],
  },
])

/************** 属性定义区域 - end **************/

/************** 函数方法定义区域 - start **************/

// 侧边栏右侧展开/收缩箭头点击事件
const openClose = (index) => {
  let open = menuList.value[index].open
  menuList.value[index].open = !open
}

// 点击右上角[个人信息]跳转页面处理函数
const toMyInfo = () => {
  router.push('/settings/my')
}

// 点击右上角[退出]登录处理函数
const logout = async () => {
  const res = await proxy.Msgbox.confirm('确定要退出登录吗？')
  if (res === 'confirm') {
    user.value = {}
    // router.push('/login')  // 注释此行即可，App.vue 的全局监听 watch，清空 user 信息，会自动实时跳转到登录页面
  }
}
/************** 函数方法定义区域 - end **************/

/************** 监听/计算属性等定义区域 - start **************/
// 保存当前路由路径，以便在 css 进行侧边栏菜单当前背景色设置
let activePath = ref(null)

// 监听路由切换
watch(
  route,
  (newVal, oldVal) => {
    activePath.value = newVal.path
  },
  { immediate: true, deep: true }
)

/************** 监听/计算属性等定义区域 - end **************/
</script>

<style lang="scss" scoped>
.layout {
  .header {
    border-bottom: 1px solid #000;
    display: flex;
    justify-content: space-between;
    align-items: center;

    .logo {
      font-size: 30px;
    }

    .user-info {
      display: flex;
      align-items: center;

      .nick-name {
        cursor: pointer;
        color: rgb(6, 143, 234);
      }

      .icon-close {
        cursor: pointer;
        font-size: 14px;
        margin-left: 4px;
      }

      .avatar {
        width: 40px;
        height: 40px;
        border-radius: 20px;
        overflow: hidden;
        margin-left: 6px;

        img {
          width: 100%;
          height: 100%;
        }
      }
    }
  }

  .container {
    padding-top: 10px;
    background-color: #f5f6f7;
    height: calc(100vh - 60px); // 减去 .header 头部 60px 高度

    .left-aside {
      padding: 0 15px;
      width: 260px;

      .post-btn {
        background-color: green;
        color: #fff;
        height: 40px;
        width: 100%;
      }

      .menu-panel {
        margin-top: 5px;

        ul,
        li {
          padding: 0;
          margin: 0;
          list-style: none;
        }

        .menu-title-p {
          padding: 0 5px;
          display: flex;
          line-height: 45px;
          cursor: pointer;

          .iconfont {
            font-size: 18px;
            color: #91949a;
          }

          .menu-title {
            flex: 1;
            color: #3f4042;
            margin-left: 15px;
          }

          .open-close {
            width: 20px;
            font-size: 16px;
          }
        }

        .menu-title-p:hover {
          background-color: #ddd;
        }

        .sub-menu {
          font-size: 14px;

          .sub-menu-item {
            display: block;
            padding-left: 38px;
            line-height: 40px;
            text-decoration: none;
            color: #3f4042;
          }

          .active {
            background-color: #ddd;
            color: rgb(204, 70, 8);
          }

          .sub-menu-item:hover {
            background-color: #ddd;
          }
        }
      }
    }

    .right-main {
      position: relative;
      background-color: #fff;
    }
  }
}
</style>