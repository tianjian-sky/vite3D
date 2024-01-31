
export const initWasm = (type) => {
    const p = new Promise((resolve, reject) => {
        import('../../../../../static/static_linking/staticLink.wasm.js')
            .then(res => {
                res.default({ __jsRegisters: {} }).then(WASM => {
                    resolve(WASM)
                })
            })

    })
    return p
}