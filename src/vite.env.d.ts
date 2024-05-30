declare module "*.vue" {
    import type { DefineComponent } from "vue";

    const vueComponent: DefineComponent<{}, {}, any>;

    export default vueComponent;
}

// 允许支持导入以下没有类型声明的 js 文件不报错误
declare module "@/router/index.js"

declare module "@/utils/Message.js"

declare module "@/utils/Msgbox.js"

declare module "@/utils/Request.js"

declare module "@/utils/Tools.js"

// 允许支持导入 .ts、.tsx 文件不报错误提示
declare module "*.ts"
declare module "*.tsx"
