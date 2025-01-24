/**
 * 提取源代码中所有FormattedMessage组件展示的文字，生成json文件供后续翻译多国语言
 * */
const fs = require('fs')
const path = require('path')
const { glob } = require('glob')
const babel = require("@babel/core");
const traverse = require("@babel/traverse");
const cwd = path.resolve('.')

let records = {}
glob('**/*.{ts,tsx,js,jsx}', {
    nodir: true,
    ignore: ['node_modules/**', 'public/**',  'dist/**', 'config/**', 'extractTexts.js', 'i18n.ts']
}, (err, matches) => {
    if (err) throw err;
    for (const filePath of matches) {
        const fullPath = path.join(cwd, filePath)
        const fileContent = fs.readFileSync(fullPath, {
            encoding: 'utf8'
        })
        const comName = 'FormattedMessage'
        const importName = comName
        if (fileContent.match(`export class ${comName}`)) continue
        // if (!filePath.includes('index3')) continue
        const options = {
            ast: true,
            filename: filePath,
            plugins: [['@babel/plugin-proposal-decorators', { version: 'legacy' }]],
            presets: [['@babel/preset-react', {}], ['@babel/preset-typescript', {}]]
        }
        let importNameAlias = importName
        let needTraverse = false
        const { code, ast } = babel.transformSync(fileContent, options)
        const record = {}
        const __getVarDeclNode = (varName) => {
            let result
            traverse.default(ast, {
                VariableDeclarator: function(path) {
                    if (path.node.id.name == varName) {
                        result = path.node
                    }
                }
            })
            return result
        }
        // get import node
        traverse.default(ast, {
            ImportDeclaration: function(path) {
                const target = path.node.specifiers.find(item => item.type == 'ImportSpecifier' && item.imported.name == importName) // 暂不考虑 default import
                if (target) {
                    needTraverse = true
                    if (target.local.name != target.imported.name) {
                        importNameAlias = target.local.name
                    }
                }
            }
        })
        if (needTraverse) {
            traverse.default(ast, {
                enter(path) {
                    if (path.node.type === 'CallExpression') {
                        if (path.node.arguments[0] && [importNameAlias, importName].includes(path.node.arguments[0].name)) { // <FormattedMessage id="xxx" /> -> React.createElement('FormattedMessage', {id: 'xxx'})
                            const objArgNode = path.node.arguments[1] && path.node.arguments[1].type == 'ObjectExpression' ? path.node.arguments[1] : null
                            const idKvNode = objArgNode && objArgNode.properties && objArgNode.properties.find(node => node.key.name == 'id')
                            if (idKvNode) {
                                if (idKvNode.value.type == 'StringLiteral') {
                                    record[idKvNode.value.value] = 1
                                } else {
                                    console.error('Unknown id kv node format', idKvNode)
                                }
                            } else { // <FormattedMessage ...__props /> -> React.createElement('FormattedMessage', __props)
                                for (const argNode of path.node.arguments.slice(1)) {
                                    if (argNode.type == 'Identifier') {
                                        const varName = argNode.name
                                        const varDeclNode = __getVarDeclNode(varName)
                                        if (varDeclNode) {
                                            const idKvNode = varDeclNode && varDeclNode.init.properties && varDeclNode.init.properties.find(node => node.key.name == 'id')
                                            if (idKvNode) {
                                                if (idKvNode.value.type == 'StringLiteral') {
                                                    record[idKvNode.value.value] = 1
                                                    break
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });
        }
        Object.assign(records, record)
        // fs.writeFileSync('./ast.json', JSON.stringify(ast))
        // fs.writeFileSync('code.js', code)
    }
})
console.warn('--records', records)
