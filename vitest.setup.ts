import {afterEach, expect} from 'vitest';
import {cleanup} from '@testing-library/react';
import * as matchers from '@testing-library/jest-dom/matchers';
// OR for newer versions:
// import * as matchers from '@testing-library/jest-dom';

expect.extend(matchers);

afterEach(() => {
    cleanup();
});