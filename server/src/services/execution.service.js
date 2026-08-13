const axios = require('axios');
const vm = require('vm');

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://ce.judge0.com/submissions?wait=true';

// Language ID mapping for Judge0 CE API
const JUDGE0_LANGUAGE_MAP = {
    python: 100, // Python (3.12.5)
    javascript: 97, // JavaScript (Node.js 20.17.0)
    java: 91, // Java (JDK 17.0.6)
    cpp: 105 // C++ (GCC 14.1.0)
};

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
 * Wrap candidate code with test case execution harness if needed
 */
const prepareCodeForExecution = (code, language, input) => {
    const formattedInput = typeof input === 'object' ? JSON.stringify(input) : String(input);
    
    switch (language) {
        case 'python':
            return `${code}\n\n# Execution Test Runner\nif __name__ == '__main__':\n    import json, sys\n    try:\n        input_val = json.loads('''${formattedInput}''')\n    except:\n        input_val = '''${formattedInput}'''\n    try:\n        if 'two_sum' in globals():\n            result = two_sum(*input_val) if isinstance(input_val, list) else two_sum(input_val)\n        elif 'solve' in globals():\n            result = solve(*input_val) if isinstance(input_val, list) else solve(input_val)\n        else:\n            result = None\n        print(json.dumps(result) if result is not None else '')\n    except Exception as e:\n        print(f"RUNTIME_ERROR: {e}", file=sys.stderr)\n`;

        case 'javascript':
            return `${code}\n\n// Execution Test Runner\ntry {\n    const inputVal = JSON.parse(\`${formattedInput}\`);\n    let result;\n    if (typeof twoSum === 'function') {\n        result = Array.isArray(inputVal) ? twoSum(...inputVal) : twoSum(inputVal);\n    } else if (typeof solve === 'function') {\n        result = Array.isArray(inputVal) ? solve(...inputVal) : solve(inputVal);\n    }\n    if (result !== undefined) console.log(JSON.stringify(result));\n} catch (err) {\n    console.error('RUNTIME_ERROR:', err.message);\n}\n`;

        case 'java': {
            const cleanCode = code.replace(/public\s+class\s+Solution/g, 'class Solution').replace(/public\s+class\s+Main/g, 'class Main');
            if (cleanCode.includes('public static void main')) return cleanCode;
            
            const isSolve = cleanCode.includes('solve(') || cleanCode.includes('solve ');

            let javaInputSetup = '';
            if (isSolve) {
                const strInput = Array.isArray(input) ? input[0] : input;
                javaInputSetup = `
class Main {
    public static void main(String[] args) {
        try {
            String s = ${JSON.stringify(String(strInput || ''))};
            boolean res = Solution.solve(s);
            System.out.println(res);
        } catch (Exception e) {
            System.err.println("RUNTIME_ERROR: " + e.getMessage());
        }
    }
}`;
            } else {
                const numsArr = Array.isArray(input) && Array.isArray(input[0]) ? input[0].join(',') : '2,7,11,15';
                const targetVal = Array.isArray(input) && typeof input[1] === 'number' ? input[1] : 9;
                javaInputSetup = `
class Main {
    public static void main(String[] args) {
        try {
            int[] nums = new int[]{${numsArr}};
            int target = ${targetVal};
            int[] res = Solution.twoSum(nums, target);
            System.out.println(java.util.Arrays.toString(res).replace(" ", ""));
        } catch (Exception e) {
            System.err.println("RUNTIME_ERROR: " + e.getMessage());
        }
    }
}`;
            }
            return `${cleanCode}\n\n${javaInputSetup}\n`;
        }

        case 'cpp': {
            if (code.includes('int main(') || code.includes('int main ()')) return code;
            const isSolve = code.includes('solve(') || code.includes('solve ');

            let cppInputSetup = '';
            if (isSolve) {
                const strInput = Array.isArray(input) ? input[0] : input;
                cppInputSetup = `
int main() {
    try {
        string s = ${JSON.stringify(String(strInput || ''))};
        bool res = solve(s);
        cout << (res ? "true" : "false") << endl;
    } catch (exception& e) {
        cerr << "RUNTIME_ERROR: " << e.what() << endl;
    }
    return 0;
}`;
            } else {
                const numsArr = Array.isArray(input) && Array.isArray(input[0]) ? input[0].join(',') : '2, 7, 11, 15';
                const targetVal = Array.isArray(input) && typeof input[1] === 'number' ? input[1] : 9;
                cppInputSetup = `
int main() {
    try {
        vector<int> nums = {${numsArr}};
        int target = ${targetVal};
        vector<int> res = twoSum(nums, target);
        cout << "[" << res[0] << "," << res[1] << "]" << endl;
    } catch (exception& e) {
        cerr << "RUNTIME_ERROR: " << e.what() << endl;
    }
    return 0;
}`;
            }
            return `${code}\n\n${cppInputSetup}\n`;
        }

        default:
            return code;
    }
};

/**
 * Execute code via Judge0 CE Sandbox / Local VM
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
                parseFloat
            };

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
                signal: null
            };
        } catch (vmErr) {
            return {
                stdout: '',
                stderr: vmErr.message,
                output: '',
                code: 1,
                signal: 'SIGKILL'
            };
        }
    }

    // 2. Remote Judge0 CE Engine Execution for Python, Java, C++ (and JS fallback)
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
            cpu_time_limit: 3.0,
            memory_limit: 128000
        }, { 
            timeout: 10000,
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
        console.warn('[ExecutionService] Sandbox API warning:', error.message);
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
        // Handle optional base64 encoded Judge0 outputs
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
const runTestCases = async (code, language, testCases = []) => {
    const results = [];
    let passedCount = 0;
    let hasExecutionFailure = false;

    for (let i = 0; i < testCases.length; i++) {
        const test = testCases[i];
        const wrappedCode = prepareCodeForExecution(code, language, test.input);
        const startTime = Date.now();
        const execRes = await executeCode(wrappedCode, language, String(test.input || ''));
        const executionTimeMs = Date.now() - startTime;

        if (execRes.isExecutionFailure) {
            hasExecutionFailure = true;
        }

        const actualOutput = execRes.stdout;
        const expectedOutput = normalizeOutput(typeof test.expectedOutput === 'object' ? JSON.stringify(test.expectedOutput) : test.expectedOutput);
        
        const passed = !execRes.isExecutionFailure && execRes.code === 0 && !execRes.stderr.includes('RUNTIME_ERROR') && (actualOutput === expectedOutput || actualOutput.replace(/\s+/g, '') === expectedOutput.replace(/\s+/g, ''));
        
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
    executeCode,
    runTestCases
};
