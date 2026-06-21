import fs from "fs";
import path from "path";

const root = process.cwd();

const IGNORE = new Set([
    "node_modules",
    ".next",
    ".git",
    "dist",
    "build",
    "coverage",
    ".turbo",
    ".vercel",
    ".cache",
    "out",
    "prisma/migrations",
]);

const MAX_DEPTH = 6;

function shouldIgnore(relativePath) {
    return [...IGNORE].some((ignored) => {
        return relativePath === ignored || relativePath.startsWith(`${ignored}/`);
    });
}

function printTree(dir, prefix = "", depth = 0) {
    if (depth > MAX_DEPTH) return;

    const entries = fs
        .readdirSync(dir, { withFileTypes: true })
        .filter((entry) => {
            const relativePath = path.relative(root, path.join(dir, entry.name));
            return !shouldIgnore(relativePath);
        })
        .sort((a, b) => {
            if (a.isDirectory() && !b.isDirectory()) return -1;
            if (!a.isDirectory() && b.isDirectory()) return 1;
            return a.name.localeCompare(b.name);
        });

    entries.forEach((entry, index) => {
        const isLast = index === entries.length - 1;
        const connector = isLast ? "└── " : "├── ";
        const nextPrefix = isLast ? "    " : "│   ";

        const fullPath = path.join(dir, entry.name);

        console.log(`${prefix}${connector}${entry.name}${entry.isDirectory() ? "/" : ""}`);

        if (entry.isDirectory()) {
            printTree(fullPath, prefix + nextPrefix, depth + 1);
        }
    });
}

console.log(`\nProject structure: ${path.basename(root)}\n`);
printTree(root);
console.log("");
