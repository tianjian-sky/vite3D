export const initWasm = (type) => {
    const p = new Promise((resolve, reject) => {
        import('../../../../../static/dy_linking/dynLink.wasm.js')
            .then(res => {
                console.log(res)
                res.default({ __jsRegisters: {} }).then(WASM => {
                    resolve(WASM)
                })
            })
    })
    return p
}