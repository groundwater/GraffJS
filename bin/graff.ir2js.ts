import { Compiler, CompilerOptions } from "../src/compiler/Compiler";
import { timestwo_src } from '../src/compiler/examples/timestwo';

if (!module.parent) {
    let opt = new CompilerOptions();
    let comp = new Compiler(opt);
    let src = timestwo_src.ToJavaScript(comp);
    console.log(src);
}
