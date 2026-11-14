import { build } from 'esbuild';
import { fileURLToPath } from 'node:url';
await build({entryPoints:[fileURLToPath(new URL('./engine-source.js',import.meta.url))],bundle:true,format:'esm',minify:true,outfile:fileURLToPath(new URL('../vendor/browser-photo/engine-v47.js',import.meta.url)),legalComments:'linked',plugins:[{name:'shared-three',setup(b){b.onResolve({filter:/^three$/},()=>({path:'three',external:true}))}}]});
