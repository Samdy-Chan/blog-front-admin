#### ==== 老陈个人博客（ChenBlog）前端（后台管理端）项目 ===

##### 【前端框架及技术】：Vue3（vue-router、pinia[状态管理插件]）+ ElementPlus(UI) + ES6 + SCSS + TypeScript（部分页面或组件采用，如 BlogDetail.vue、MyInfo.vue等，ts类型声明文件所在目录 src/ts/types） + （Markdown编辑器 + HtmlEditor编辑器 = 双编辑器随意切换）

##### 【后端框架及技术】：nodejs + express + fileUpload + cors + body-parser + MySQL5.7

##### 【技术要点】：
###### 1、封装了 axios 的请求和响应拦截器（src/utils/Request.js）：请求前，根据传的 showLoading 参数，是否显示“正在加载中”遮罩层提示，响应数据前，根据后端返回的数据，判断如果返回 status = 'error'，显示错误提示信息；

###### 2、使用 pinia（状态管理插件，相当于 vue2 的 vuex ） + pinia-plugin-persistedstate + js-cookie 插件编写代码实现了自定义 cookieStorage 存储对象，将配置了自动将数据持久化到 sessionStorage 和 cookieStorage，详见 ./src/store 文件下的 js 配置文件；

###### 3、自己封装了好用的自定义 Table 组件，主要集成了 ElementPlus UI 组件库的 el-table 表格组件、el-pagination 分页组件，定义了表格组件列插槽，和分页参数（总记录数total、当前页码 currentPage、每页记录数 pageSize）传入每列插槽内容和分页参数即可。

###### 使用

###### 4、自己封装了自定义图片上传组件 CoverUpload，加入了要上传的文件是否损坏、大小限制、文件扩展名限制等功能，配合后端 node.js 的 fileUpload 插件进行图片上传保存；

...........

#### 项目界面预览图

![输入图片说明](src/assets/previews/blog-front-admin_1.png)

![输入图片说明](src/assets/previews/blog-front-admin_2.png)

![输入图片说明](src/assets/previews/blog-front-admin_3.png)

![输入图片说明](src/assets/previews/blog-front-admin_4.png)

![输入图片说明](src/assets/previews/blog-front-admin_5.png)