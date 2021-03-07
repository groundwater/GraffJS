import { test } from 'tap';
import { ModuleVM } from './ModuleVM';

test('ModuleVM', async ({ test }) => {
    test('Accept', async ({ test }) => {
        test('End-to-End', async ({ equal }) => {
            let mod = new ModuleVM(
                `import {inspect} from 'util'`,
                `$exit = inspect({hello:"World"})`
            );
            let out = await mod.eval();
            equal(out(), `{ hello: 'World' }`);
        });
    });
});
