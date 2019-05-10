let fs = require('fs')
let path = require('path')
let pathAdress = path.join(__dirname,'../txt.js')

function readFile(_path,encoding='utf8'){
    return new Promise((resolve,reject)=>{
        fs.readFile(_path,encoding,(err,context)=>{
            console.log('err',err)
            resolve(context)
        })
    })
   
}
async function writeFile(_path,context){
  let a = await  fs.writeFile(_path,context,(err)=>{
      console.log('err',err)
  })
}

module.exports = {
    readFile,
    writeFile
}
// fs.readFile('./test.js','utf8',(err,data)=>{})
// fs.writeFile('./test.js',{ket:1},()=>{}) //文件不存在创建新的,若有会覆盖,内容回调toString()