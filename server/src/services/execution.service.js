const axios = require('axios');
const vm = require('vm');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com/submissions?wait=true';

// Language ID mapping for Judge0 CE API
const JUDGE0_LANGUAGE_MAP = {
    python: 71,      // Python 3 (3.8.1)
    javascript: 63,  // Node.js (12.14.0)
    java: 62,        // Java (OpenJDK 13.0.1)
    cpp: 54          // C++ (GCC 9.2.0)
};

const JUDGE0_LANGUAGE_IDS = JUDGE0_LANGUAGE_MAP;

/**
 * Normalizes output strings for consistent test comparisons
 */
const normalizeOutput = (str) => {
    if (!str && str !== 0) return '';
    return String(str)
        .replace(/\r\n/g, '\n')
        .trim();
};

/**
 * Robust comparison between actual stdout and expected test output
 */
const areOutputsEqual = (actual, expected) => {
    const normActual = normalizeOutput(actual);
    const normExpected = normalizeOutput(expected);
    if (normActual === normExpected) return true;

    // Ignore whitespace variations (e.g. "[0, 1]" vs "[0,1]")
    const stripA = normActual.replace(/\s+/g, '');
    const stripE = normExpected.replace(/\s+/g, '');
    if (stripA === stripE) return true;

    // Handle boolean casing (e.g. Python "True" vs JSON "true")
    if (stripA.toLowerCase() === stripE.toLowerCase()) return true;

    // Handle string quotes variations (e.g. "olleh" vs olleh)
    const unquotedA = normActual.replace(/^"|"$/g, '');
    const unquotedE = normExpected.replace(/^"|"$/g, '');
    if (unquotedA === unquotedE) return true;

    // JSON parsing check for arrays/objects
    try {
        const parsedA = JSON.parse(normActual);
        const parsedE = JSON.parse(normExpected);
        if (JSON.stringify(parsedA) === JSON.stringify(parsedE)) return true;
    } catch (e) {}

    // Numeric comparison for floats/integers (e.g. 2.0 vs 2)
    const numA = Number(normActual);
    const numE = Number(normExpected);
    if (!isNaN(numA) && !isNaN(numE) && Math.abs(numA - numE) < 1e-5) return true;

    return false;
};

/**
 * Wrap candidate code with test case execution harness
 */
const prepareCodeForExecution = (code, language, input, problem = null) => {
    const rawInput = typeof input === 'object' ? JSON.stringify(input) : String(input || '');
    const escapedInput = rawInput.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$');

    const fnNamePython = problem?.functionName?.python || '';
    const fnNameJS = problem?.functionName?.javascript || '';
    const fnNameJava = problem?.functionName?.java || '';
    const fnNameCpp = problem?.functionName?.cpp || '';

    switch (language) {
        case 'python': {
            if (code.includes("if __name__ == '__main__':") || code.includes('sys.stdin.read()')) {
                return code;
            }

            return `${code}

# --- Execution Test Runner Harness ---
if __name__ == '__main__':
    import sys, json, types

    raw_input_data = """${escapedInput}"""
    lines = [l.strip() for l in raw_input_data.strip().splitlines() if l.strip()]
    args = []
    for line in lines:
        try:
            args.append(json.loads(line))
        except Exception:
            args.append(line)

    fn = None
    target_name = "${fnNamePython}"
    if target_name and target_name in globals() and callable(globals()[target_name]):
        fn = globals()[target_name]
    else:
        # Fallback: find candidate defined function
        candidate_funcs = [
            obj for name, obj in list(globals().items())
            if isinstance(obj, types.FunctionType) and not name.startswith('_')
        ]
        if candidate_funcs:
            fn = candidate_funcs[-1]

    if fn:
        try:
            res = fn(*args)
            if res is not None:
                if isinstance(res, bool):
                    print("true" if res else "false")
                elif isinstance(res, (dict, list)):
                    print(json.dumps(res))
                elif isinstance(res, float):
                    print(f"{res:.1f}" if res.is_integer() else f"{res}")
                else:
                    print(json.dumps(res) if isinstance(res, str) else str(res))
        except Exception as e:
            print(f"RUNTIME_ERROR: {e}", file=sys.stderr)
`;
        }

        case 'javascript': {
            return `${code}

// --- Execution Test Runner Harness ---
(function() {
    try {
        const rawInputData = \`${escapedInput}\`;
        const lines = rawInputData.split(/\\r?\\n/).map(l => l.trim()).filter(l => l.length > 0);
        const args = lines.map(line => {
            try {
                return JSON.parse(line);
            } catch (e) {
                return line;
            }
        });

        let fn = null;
        const targetName = "${fnNameJS}";
        if (targetName && typeof globalThis[targetName] === 'function') {
            fn = globalThis[targetName];
        } else if (typeof twoSum === 'function') {
            fn = twoSum;
        } else if (typeof solve === 'function') {
            fn = solve;
        }

        if (fn) {
            const res = fn(...args);
            if (res !== undefined) {
                console.log(JSON.stringify(res));
            }
        }
    } catch (err) {
        console.error('RUNTIME_ERROR:', err.message);
    }
})();
`;
        }

        case 'java': {
            const cleanCode = code.replace(/public\s+class\s+Solution/g, 'class Solution').replace(/public\s+class\s+Main/g, 'class Main');
            if (cleanCode.includes('public static void main')) return cleanCode;

            return `${cleanCode}

class Main {
    public static void main(String[] args) {
        try {
            java.util.Scanner sc = new java.util.Scanner(System.in);
            StringBuilder sb = new StringBuilder();
            while (sc.hasNextLine()) {
                sb.append(sc.nextLine()).append("\\n");
            }
            String input = sb.toString().trim();
            // Reflection or solution instantiation
            Solution sol = new Solution();
            java.lang.reflect.Method[] methods = Solution.class.getDeclaredMethods();
            if (methods.length > 0) {
                java.lang.reflect.Method m = methods[0];
                for (java.lang.reflect.Method candidate : methods) {
                    if (candidate.getName().equals("${fnNameJava}")) {
                        m = candidate;
                        break;
                    }
                }
                m.setAccessible(true);
                // Call method with parsed arguments if available or run with input
                System.out.println("Executed " + m.getName());
            }
        } catch (Exception e) {
            System.err.println("RUNTIME_ERROR: " + e.getMessage());
        }
    }
}
`;
        }

        case 'cpp': {
            if (code.includes('int main(') || code.includes('int main ()')) return code;

            return `${code}

int main() {
    try {
        Solution sol;
        // Standard runner
    } catch (exception& e) {
        cerr << "RUNTIME_ERROR: " << e.what() << endl;
    }
    return 0;
}
`;
        }

        default:
            return code;
    }
};

/**
 * Execute code via Local VM (for JavaScript) or Judge0 CE Sandbox
 */
const executeCode = async (code, language, stdin = '') => {
    // 1. Local Isolated VM Execution for JavaScript (Instant & Offline-capable)
    if (language === 'javascript') {
        try {
            let stdoutLogs = [];
            const customConsole = {
                log: (...args) => stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                error: (...args) => stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' ')),
                warn: (...args) => stdoutLogs.push(args.map(a => typeof a === 'object' ? JSON.stringify(a) : String(a)).join(' '))
            };

            const sandbox = {
                console: customConsole,
                JSON,
                Array,
                Object,
                Math,
                String,
                Number,
                Boolean,
                Map,
                Set,
                RegExp,
                parseInt,
                parseFloat,
                Buffer
            };
            sandbox.globalThis = sandbox;

            const context = vm.createContext(sandbox);
            const script = new vm.Script(code);
            script.runInContext(context, { timeout: 3000 });

            const stdout = stdoutLogs.join('\n');
            const hasError = stdout.includes('RUNTIME_ERROR');

            return {
                stdout: normalizeOutput(stdout),
                stderr: hasError ? 'Runtime execution error' : '',
                output: normalizeOutput(stdout),
                code: hasError ? 1 : 0,
                signal: null,
                isExecutionFailure: false
            };
        } catch (vmErr) {
            return {
                stdout: '',
                stderr: vmErr.message,
                output: '',
                code: 1,
                signal: 'SIGKILL',
                isExecutionFailure: false
            };
        }
    }

    // 2. Remote Judge0 CE Sandbox Execution for Python, Java, C++
    try {
        const langId = JUDGE0_LANGUAGE_MAP[language] || JUDGE0_LANGUAGE_MAP.python;
        const headers = { 'Content-Type': 'application/json' };
        if (process.env.JUDGE0_API_KEY) {
            headers['X-RapidAPI-Key'] = process.env.JUDGE0_API_KEY;
            headers['X-Auth-Token'] = process.env.JUDGE0_API_KEY;
        }

        const response = await axios.post(JUDGE0_API_URL, {
            source_code: code,
            language_id: langId,
            stdin: stdin || '',
            cpu_time_limit: 4.0,
            memory_limit: 128000
        }, { 
            timeout: 12000,
            headers
        });

        const data = response.data || {};
        const stdout = decodeBase64IfNeeded(data.stdout);
        const stderr = decodeBase64IfNeeded(data.stderr || data.compile_output);
        const isSuccess = data.status && data.status.id === 3; // 3 = Accepted in Judge0

        return {
            stdout: normalizeOutput(stdout),
            stderr: normalizeOutput(stderr),
            output: normalizeOutput(stdout || stderr),
            code: isSuccess ? 0 : (data.status ? data.status.id : 1),
            signal: data.status ? data.status.description : null,
            isExecutionFailure: false
        };
    } catch (error) {
        console.warn('[ExecutionService] Judge0 Sandbox API warning:', error.message);
        return {
            stdout: '',
            stderr: error.response?.data?.message || error.message || 'Execution service temporarily unavailable.',
            output: '',
            code: 1,
            signal: 'SERVICE_UNAVAILABLE',
            isExecutionFailure: true
        };
    }
};

const decodeBase64IfNeeded = (str) => {
    if (!str) return '';
    try {
        if (str.length % 4 === 0 && /^[A-Za-z0-9+/=]+$/.test(str.trim())) {
            const decoded = Buffer.from(str, 'base64').toString('utf8');
            if (decoded && !/\0/.test(decoded)) return decoded;
        }
    } catch (e) {}
    return str;
};

/**
 * Run a set of test cases against candidate code
 */
const runTestCases = async (code, language, testCases = [], problem = null) => {
    const results = [];
    let passedCount = 0;
    let hasExecutionFailure = false;

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const stdin = String(test.input || '');
        const wrappedCode = prepareCodeForExecution(code, language, test.input, problem);
        const startTime = Date.now();
        const execRes = await executeCode(wrappedCode, language, stdin);
        const executionTimeMs = Date.now() - startTime;

        if (execRes.isExecutionFailure) {
            hasExecutionFailure = true;
        }

        const actualOutput = execRes.stdout;
        const expectedOutput = test.expectedOutput;
        const passed = !execRes.isExecutionFailure &&
            execRes.code === 0 &&
            !execRes.stderr.includes('RUNTIME_ERROR') &&
            areOutputsEqual(actualOutput, expectedOutput);

        if (passed) passedCount++;

        results.push({
            testId: test.id || i + 1,
            input: test.input,
            expectedOutput: test.expectedOutput,
            actualOutput: actualOutput || execRes.stderr || 'No output',
            passed,
            executionTimeMs,
            error: execRes.stderr || null
        });
    }

    return {
        results,
        passedCount,
        totalCount: testCases.length,
        passPercentage: testCases.length > 0 ? Math.round((passedCount / testCases.length) * 100) : 100,
        hasExecutionFailure
    };
};

module.exports = {
    JUDGE0_LANGUAGE_MAP,
    JUDGE0_LANGUAGE_IDS,
    executeCode,
    runTestCases,
    normalizeOutput,
    areOutputsEqual,
    prepareCodeForExecution
};
