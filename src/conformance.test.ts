/**
 * Data-driven conformance test suite.
 *
 * Dynamically generates tests from data.json (shared with the Python reference).
 * Kept alongside data.test.ts (hand-written) for double-check coverage.
 */

import { conformance_testdata, ConformanceTestEntry } from './conformance.js';
import { gen_meta_code } from './metacode.js';
import { gen_text_code } from './code-content-text.js';
import { gen_image_code } from './code-content-image.js';
import { gen_audio_code } from './code-content-audio.js';
import { gen_video_code } from './code-content-video.js';
import { gen_mixed_code } from './code-content-mixed.js';
import { gen_data_code } from './code-data.js';
import { gen_instance_code } from './code-instance.js';
import { gen_iscc_code } from './iscc-code.js';

// Map function names from data.json to actual callable functions.
// Each dispatcher receives the pre-converted inputs array and returns
// the result object produced by the corresponding gen_* function.
const DISPATCHERS: Record<string, (inputs: unknown[]) => Promise<Record<string, unknown>>> = {
    gen_meta_code_v0: async (inputs) => {
        const [name, description, meta, bits] = inputs;
        // In data.json, meta can be null, a plain string, or a JSON object.
        // gen_meta_code expects meta as a string (JSON or Data-URL).
        let metaStr: string | undefined;
        if (meta != null && typeof meta === 'object') {
            metaStr = JSON.stringify(meta);
        } else if (typeof meta === 'string') {
            metaStr = meta;
        }
        return await gen_meta_code(
            name as string,
            (description as string) || undefined,
            metaStr,
            bits as number | undefined,
        );
    },

    gen_text_code_v0: async (inputs) => {
        const [text, bits] = inputs;
        return await gen_text_code(text as string, bits as number);
    },

    gen_image_code_v0: async (inputs) => {
        const [pixels, bits] = inputs;
        return await gen_image_code(pixels as number[], bits as number);
    },

    gen_audio_code_v0: async (inputs) => {
        const [fingerprint, bits] = inputs;
        return await gen_audio_code(fingerprint as number[], bits as number);
    },

    gen_video_code_v0: async (inputs) => {
        const [frames, bits] = inputs;
        return await gen_video_code(frames as number[][], bits as number);
    },

    gen_mixed_code_v0: async (inputs) => {
        const [codes, bits] = inputs;
        return await gen_mixed_code(codes as string[], bits as number);
    },

    gen_data_code_v0: async (inputs) => {
        const [stream, bits] = inputs;
        return await gen_data_code(stream as Buffer, bits as number);
    },

    gen_instance_code_v0: async (inputs) => {
        const [stream, bits] = inputs;
        return await gen_instance_code(stream as Buffer, bits as number);
    },

    gen_iscc_code_v0: async (inputs) => {
        const [codes] = inputs;
        return gen_iscc_code(codes as string[]);
    },
};

// Load all test entries once
const testEntries = conformance_testdata();

// Group entries by function name for describe blocks
const grouped: Record<string, ConformanceTestEntry[]> = {};
for (const entry of testEntries) {
    if (!grouped[entry.func_name]) {
        grouped[entry.func_name] = [];
    }
    grouped[entry.func_name].push(entry);
}

for (const [funcName, entries] of Object.entries(grouped)) {
    describe(`[conformance] ${funcName}`, () => {
        const dispatcher = DISPATCHERS[funcName];
        if (!dispatcher) {
            test.skip(`${funcName} - no dispatcher registered`, () => {});
            return;
        }

        for (const entry of entries) {
            test(entry.test_name, async () => {
                const result = await dispatcher(entry.inputs);

                // Assert every expected output field
                for (const [key, expectedValue] of Object.entries(entry.outputs)) {
                    const actualValue = result[key];
                    if (Array.isArray(expectedValue)) {
                        // Compare arrays by value (e.g. "parts")
                        expect(actualValue).toEqual(expectedValue);
                    } else {
                        expect(actualValue).toBe(expectedValue);
                    }
                }
            });
        }
    });
}
