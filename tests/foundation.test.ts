import { expect, test } from 'vitest';
import { templateIds } from '../shared/src/index';
test('four distinct supported designs',()=>{expect(new Set(templateIds).size).toBe(4);});
