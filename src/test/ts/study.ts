// ts不能直接被浏览器识别及运行，要先编译生成对应的 js 文件，
// 运行 TypeScript(ts) 脚本条件及方法：
// 1、全局安装 typescript 模块：npm install -g typescript
//    1.1、执行 tsc test.ts 编译，会自动在同目录下编译生成同名的 js 文件 test.js 文件
//    1.2、node test.js // 执行生成的 js 文件
// 2、全局安装 ts-node 模块，直接运行 ts 脚本文件，它会自动帮我们编译并运行，省去手动转换为 js 文件的步骤：
//    2.1、 安装 npm install -g ts-node
//    2.2、执行  ts-node ./test.ts ，其内部帮我们编译生成并运行对应的 js 脚本，但不会自动生成对应的 js 文件
//    2.3、如果执行如上 2.2 ts-node test.ts 命令报如下错误：TypeError [ERR_UNKNOWN_FILE_EXTENSION]: Unknown file extension ".ts"，
//         则，需要在 ts 脚本所在目录下新建 tsconfig.json 文件，加入如下内容：{ "ts-node": {"esm": true} }


// TypeScript(ts) 数据类型：
// 1、和 js 一样的基本类型（number、string、boolean、undefine、null、symbol）、对象类型（对象、数组、函数等）
// 2、ts特有的：联合类型、用户自定义类型（类型别名）、接口、元组、字面量类型、枚举、void、any

// 1、ts 基本类型
// 类型注解（声明）并初始化
let num: number = 10
console.log('num:', num)
let num2: number  // 先声明，但不赋值，值为 undefined
console.log('num2', num2)  // undefined
// let num: number = NaN  // number 类型也可以赋值为 NaN，如 let num: number = NaN

// 类型推论：ts允许变量声明并初始化具体值时，省略类型声明，ts会自动进行类型推断，如下等于 let str: string = 'abc'
let str = 'abc'
let str2: string = 'abc'
// let bool: boolean = 'true'   // 声明布尔类型，赋值字符串，报错

let undef: undefined = undefined   // 【注意】任何类型，都可以赋值为 undefined 或 null，如 let num:number = undefined
console.log('undef:', undef)   // undefined   

let nul: null = null             // 【注意】任何类型，都可以赋值为 undefined 或 null，如 let num:number = null
console.log('nul:', null)    // null     

let symb: symbol = Symbol('sym')
console.log('symb:', symb)  // Symbol(sym)
console.log('symb:', symb.description)  // 输出 symbol 变量描述(别名)：sym

let symb2 = Symbol('sym')
console.log('symb === symb2', symb === symb2)  // false，

let symb3 = Symbol.for('sym')
let symb4 = Symbol.for('sym')
console.log('symb === symb4', symb3 === symb4)  // true，Symbol.for('sym')，加了 for 才是全局注册symbol变量，才是引用，才是相同

// 数组类型
let arr: number[] = [1, 2, 3]  // 推荐格式
// 或
let arr2: Array<string> = ['a', 'b', 'c']

// 2、ts 特有类型：
// ******** 2.1、联合类型 ********
// 用 | 分隔多个类型
let numStr: (number | string) = 'abc'  // 只能赋值为数值或字符串，这种格式的联合类型，括号可加，可不加
// 声明只能包含数值或字符串类型元素的数组
let arrNumStr: (number | string)[] = ['a', 1] // 可赋初值为[]、null、undefined

// ******** 2.2、自定义类型（用 type 关键字将的多个复杂的基本类型定义为自定义类型） ********
type Arr4NumStr = (number | string)[]
let arrNumStr2: Arr4NumStr = ['a', 1]

// ******** 2.3、接口（将多个对象的共用属性定义为一个接口进行行引用） ********
interface IAnimal {
    weight: number,
    height: number,
    name: string,
    eat(fool: string): void,  // 返回值为空类型（无返回值）
    sing: (song: string) => string  // 返回值为字符串
}

// let panda: IAnimal = {}  // (X) let/const都不能初值为 {}，可以赋值为 null、undefined
let panda: IAnimal
let dog: IAnimal = null
let horse: IAnimal = undefined
const tiger: IAnimal = {   // 赋对象属性时，必须要把接口每个属性及方法都赋值
    weight: 60,
    height: 80,
    name: 'tiger',
    eat: (fool) => { console.log(`tiger's foold is ${fool}`) },
    sing(song) { return `tiger sing song is ${song}` }
}
console.log('tiger object info is:', tiger)
tiger.eat('meat');
console.log(tiger.sing('kong koog'))

// 接口的继承 - extends
interface IFly extends IAnimal {
    age: number
}


// ******** 2.4、元组（数组的特殊形式，用于指定数组元素的个数及类型，如坐标）********
let position: [number, number] = [68.22, 13.17]

// ******** 2.5、字面量类型（直接用值指定为类型） ********
let num3: 18 = 18  // 只能赋值为 18、null、 undefined
// let num4: 18 = 19  // 赋值为 19 报错
let num5: 18  // 不赋值，为 undefined
console.log('num5', num5)

// 字面量类型 + 联合类型（|）特殊应用（特殊的 enum 枚举类型）
type customEnum = ('yes' | 'no' | 1 | 0)
let res: customEnum = 'yes'  // 值只能是 'yes'、'no'、1、0 其中一个


// ******** 2.6、枚举类型 （enum 关键字声明一个枚举类型） ********
enum Direction { Up, Down, Left, Right }  // 只指定枚举键名，不赋值，默认值为 0，后续逐个加1
let enum1: Direction = Direction.Up
console.log('enum1', enum1)  // 0
console.log(Direction.Down)  // 1
// 为枚举键名指定值
enum MyDirection { Up = 'up', Down = 'down', Left = 'left', Right = 'right' }
let enum2: MyDirection = MyDirection.Up
console.log('enum2', enum2) // 'up'
enum MyDirection2 { Up = 'up', Down = 0, Left, Right }  // Down 赋值为0后，后面逐个加1，Left值为1，Right为2


// ******** 2.7、函数类型（参数类型 + 返回值类型）、可选参数表示符?（可选参数不能赋默认值） ********
// 函数声明形式
function add(num1: number, num2: number = 3, num3?: number): number {
    return num1 + num2
}
let sum: number = add(2)
console.log('sum:', sum)  // 5

// 箭头函数表达式：可以用以上函数声明的形式（推荐）
const add2 = (num1: number, num2: number = 3, num3?: number): number => {
    return num1 + num2
}
// 箭头函数表达式：也可以用如下的箭头参数返回值类型声明（不支持函数声明形式），注意这种声明的参数赋初值，不能放在类型声明里面
const add3: (num1: number, num2?: number, num3?: number) => number = (num1, num2 = 3) => {
    return num1 + num2
}
let sum3 = add3(5)
console.log('sum3', sum3)  // 8


// ******** 2.8、类型推断（如果变量声明时赋确定的初值， null、undefined 除外，可以不用声明类型） ********
let num6 = 6
// 函数有确定的返回值时，也可以不用指定返回值类型（但建议指定）
function add4(num1: number, num2: number = 3)/*:number*/ {
    return num1 + num2
}

// ******** 2.7、类型断言（强制转换类型） ********
// 极个别情况下， ts 返回有的数据类型，可能只是一个超集类型，并不是一个具体类型，
// 这样，可能就会调用不了具体类型特有的属性或方法，如：通过 document.getElementByxxx 方法 document.querySelector 方法
// 获取的 DOM 元素对象，默认返回的都是超集对象 HTMLElement，只有 dom 元素一些共用的属性或方法，如 id 等
/* const a = document.getElementById('alink')  //返回  HTMLElement DOM对象
// a.href = 'http://www.baidu.com' // 报错，HTMLElement DOM对象没有 href 属性
const a2 = document.getElementById('alink') as HTMLAnchorElement  // 通过 as 关键字转换为具体的超链接对象 HTMLAnchorElement
a2.href = 'http://www.baidu.com'  // 这样就不会报错了

// 类型断言（强制类型转换）另一个形式（不推荐，一些框架可能不支持，如 React、Angular）
const a3 = <HTMLAnchorElement>document.getElementById('alink')
a3.href = 'http://www.baidu.com' */


function f(a: number): void {
    return null
}

console.log('f()', f(1))
