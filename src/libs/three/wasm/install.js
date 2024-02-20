export const initWasm = (type) => {
    const p = new Promise((resolve, reject) => {
        import('../../../../static/three.wasm.js')
            .then(res => {
                console.log('initWasm', res)
                res.default({ __jsRegisters: {} }).then(WASM => {
                    resolve(WASM)
                })
            })
    })
    return p
}