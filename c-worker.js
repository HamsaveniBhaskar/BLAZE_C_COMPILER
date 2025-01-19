const { parentPort, workerData } = require("worker_threads");
const { execSync } = require("child_process");
const os = require("os");
const fs = require("fs");
const path = require("path");

// Utility function to clean up temporary files
function cleanupFiles(...files) {
    files.forEach((file) => {
        try {
            fs.unlinkSync(file);
        } catch (err) {
            // Ignore errors (for files that may not exist)
        }
    });
}

// Worker logic
(async () => {
    const { code, input } = workerData;

    // Paths for temporary C source file and compiled binary
    const tmpDir = os.tmpdir();
    const sourceFile = path.join(tmpDir, `temp_${Date.now()}.c`);
    const outputFile = path.join(tmpDir, `output_${Date.now()}`);

    try {
        // Write the C code to the source file
        fs.writeFileSync(sourceFile, code);

        // Compile the C code using GCC
        try {
            execSync(`gcc -o ${outputFile} ${sourceFile}`, { encoding: "utf-8" });
        } catch (error) {
            cleanupFiles(sourceFile, outputFile);
            return parentPort.postMessage({
                error: { fullError: `Compilation Error:\n${error.message}` },
            });
        }

        // Execute the compiled binary
        let output = "";
        try {
            output = execSync(`${outputFile}`, {
                input,
                encoding: "utf-8",
            });
        } catch (error) {
            cleanupFiles(sourceFile, outputFile);
            return parentPort.postMessage({
                error: { fullError: `Runtime Error:\n${error.message}` },
            });
        }

        // Clean up temporary files after execution
        cleanupFiles(sourceFile, outputFile);

        // Send the output back to the main thread
        parentPort.postMessage({
            output: output || "No output received!",
        });
    } catch (err) {
        cleanupFiles(sourceFile, outputFile);
        return parentPort.postMessage({
            error: { fullError: `Server error: ${err.message}` },
        });
    }
})();
