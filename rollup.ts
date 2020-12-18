import commonjs from "@rollup/plugin-commonjs";
import resolve from "@rollup/plugin-node-resolve";
import { rollup } from "rollup";

(async () => {
    const bundleThirdparty = await rollup({
        input: "src/mobx.ts",
        plugins: [
            resolve(),
            commonjs()
        ]
    });
    await bundleThirdparty.write({
        dir: "src",
        format: 'amd',
        amd: {
            define: "sap.ui.define"
        },
        exports: "default"
    });
    
})();