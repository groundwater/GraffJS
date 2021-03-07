import * as vm from 'vm';
import { Compiler, CompilerOptions } from "../compiler/Compiler";
import { IRDocument } from "../compiler/ir/IRDocument";

export class ScriptVM {
    constructor(
        public source: string,
        public context: vm.Context = vm.createContext({})
    ) { }
    eval(timeout: number = 1000): ($start?: any) => any {
        let wrap = `(function ($start){
            
            ${this.source}

            return $exit;
        });`;
        let out = vm.runInContext(wrap, this.context, {
            timeout,
        });
        return out;
    }
}
export function DocumentToJSFunction(document: IRDocument) {
    let opt = new CompilerOptions();
    let comp = new Compiler(opt);
    let src = document.ToJavaScript(comp);
    let run = new ScriptVM(src);
    return run.eval();
}

