import * as vm from 'vm';
import { Compiler, CompilerOptions } from "../compiler/Compiler";
import { GraffDocument } from "../compiler/GraffDocument";

const SourceTextModule = (vm as any).SourceTextModule

export class ModuleVM {
    constructor(
        public header: string,
        public body: string,
        public context: vm.Context = vm.createContext({ $module: {} })
    ) { }
    async eval(timeout: number = 1000): Promise<($start?: any) => any> {
        let { context } = this
        let wrap = `
        ${this.header}

        $module.export = function ($start){
            var $exit

            ${this.body}

            return $exit;
        };`
        let mod = new SourceTextModule(wrap, {
            context,
        })
        async function linker(specifier: string, referencingModule: string) {
            // From https://github.com/nodejs/node/issues/27387#issuecomment-486486686
            let mod = await import(specifier)
            let mod_src = Object.keys(mod)
                .filter(name => name !== 'default')
                .map((x) => `export const ${x} = import.meta.mod.${x};`)
                .join('\n')
            return new SourceTextModule(
                mod_src,
                {
                    context,
                    initializeImportMeta(meta: any) {
                        meta.mod = mod
                    },
                }
            );
        }
        await mod.link(linker)
        await mod.evaluate({ timeout })
        return mod.context.$module.export
    }
}
export function DocumentToJSModule(document: GraffDocument) {
    let opt = new CompilerOptions()
    let comp = new Compiler(opt);
    let { header, body } = document.ToJavaScriptHeaderAndBody(comp);
    let run = new ModuleVM(header, body);
    return run.eval();
}
