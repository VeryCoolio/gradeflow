import { execFileSync } from "node:child_process";
import console from "node:console";
import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { fileURLToPath, URL } from "node:url";
import ts from "typescript";

// Frozen starting point: this visual change must not move its own comparison base.
const DEFAULT_REFERENCE = "ada6c55";
const repoRoot = path.resolve(fileURLToPath(new URL("../..", import.meta.url)));
const reference =
  process.argv.find((argument) => argument.startsWith("--ref="))?.slice(6) ??
  DEFAULT_REFERENCE;
const failures = [];
const allowedExistingStyles = new Set(["app/src/styles.css"]);
const knownUntrackedFiles = new Set([
  "app/scripts/verify-redesign.mjs",
  // Present before this task; deliberately neither inspected nor changed here.
  "app/src/main.ts",
]);
const decorativeTags = new Set([
  "svg",
  "g",
  "path",
  "circle",
  "rect",
  "line",
  "polyline",
  "polygon",
  "ellipse",
  "defs",
  "linearGradient",
  "radialGradient",
  "stop",
  "clipPath",
  "mask",
  "pattern",
]);

function git(...args) {
  return execFileSync("git", args, { cwd: repoRoot });
}

function attribute(element, name) {
  return element.attributes.properties.find(
    (property) =>
      ts.isJsxAttribute(property) && property.name.getText() === name,
  );
}

function literalAttribute(element, name, value) {
  const initializer = attribute(element, name)?.initializer;
  return initializer && ts.isStringLiteral(initializer)
    ? initializer.text === value
    : false;
}

function isStaticDecoration(node) {
  if (!ts.isJsxElement(node) && !ts.isJsxSelfClosingElement(node)) return false;
  const opening = ts.isJsxElement(node) ? node.openingElement : node;
  if (
    opening.tagName.getText() !== "svg" ||
    !literalAttribute(opening, "aria-hidden", "true") ||
    !literalAttribute(opening, "focusable", "false")
  ) {
    return false;
  }
  let safe = true;
  function check(child) {
    if (
      ts.isJsxExpression(child) ||
      ts.isJsxSpreadAttribute(child) ||
      (ts.isJsxText(child) && child.text.trim()) ||
      (ts.isJsxAttribute(child) && /^on[A-Z]/.test(child.name.getText())) ||
      ((ts.isJsxOpeningElement(child) || ts.isJsxSelfClosingElement(child)) &&
        !decorativeTags.has(child.tagName.getText()))
    ) {
      safe = false;
    }
    ts.forEachChild(child, check);
  }
  check(node);
  return safe;
}

function project(node, classString = false) {
  if (isStaticDecoration(node)) return null;
  if (ts.isJsxAttribute(node) && node.name.getText() === "className") {
    if (!node.initializer || ts.isStringLiteral(node.initializer)) return null;
    // Only class tokens can vary. Conditions, substitutions and calls remain.
    return {
      kind: "DynamicClassName",
      expression: project(node.initializer, true),
    };
  }
  if (ts.isJsxText(node)) {
    const text = node.text.replace(/\s+/g, " ").trim();
    return text ? { kind: "JsxText", text } : null;
  }
  const children = [];
  const preserveCallValues =
    ts.isCallExpression(node) || ts.isNewExpression(node);
  ts.forEachChild(node, (child) => {
    const projected = project(child, classString && !preserveCallValues);
    if (projected !== null) children.push(projected);
  });
  const result = { kind: ts.SyntaxKind[node.kind], children };
  if (ts.isStringLiteral(node) || ts.isNoSubstitutionTemplateLiteral(node)) {
    result.text = classString ? "[class token]" : node.text;
  } else if (
    ts.isTemplateHead(node) ||
    ts.isTemplateMiddle(node) ||
    ts.isTemplateTail(node)
  ) {
    result.text = classString ? "[class token]" : node.text;
  } else if (
    ts.isIdentifier(node) ||
    ts.isNumericLiteral(node) ||
    ts.isBigIntLiteral(node) ||
    ts.isRegularExpressionLiteral(node) ||
    ts.isPrivateIdentifier(node)
  ) {
    result.text = node.text;
  }
  return result;
}

function parse(source, file = "check.tsx") {
  const tree = ts.createSourceFile(
    file,
    source,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TSX,
  );
  if (tree.parseDiagnostics.length) {
    throw new Error(`Cannot parse ${file}; run the TypeScript check.`);
  }
  return project(tree);
}

function firstDifference(before, after, location = "root") {
  if (typeof before !== typeof after) return { location, before, after };
  if (before === null || after === null || typeof before !== "object") {
    return before === after ? null : { location, before, after };
  }
  const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of keys) {
    const difference = firstDifference(
      before[key],
      after[key],
      `${location}.${key}`,
    );
    if (difference) return difference;
  }
  return null;
}

function selfCheck() {
  const baseline =
    'const number = 112; const View = () => <button className="old" aria-label="Save" onClick={() => save(1)}><svg role="img" width={number}><circle cx="60" /></svg>Save<a href="/template.csv" download="template.csv">Download</a></button>;';
  const decoration =
    '<svg aria-hidden="true" focusable="false" viewBox="0 0 24 24"><path d="M0 0L24 24" /></svg>';
  const cases = [
    [
      "class tokens",
      baseline.replace('className="old"', 'className="new"'),
      true,
    ],
    [
      "static decoration",
      baseline.replace("Save<a", `${decoration}Save<a`),
      true,
    ],
    ["visible text", baseline.replace("Save<a", "Changed<a"), false],
    [
      "accessible name",
      baseline.replace('aria-label="Save"', 'aria-label="Changed"'),
      false,
    ],
    ["event callback", baseline.replace("save(1)", "erase(1)"), false],
    ["numeric value", baseline.replace("number = 112", "number = 113"), false],
    ["download link", baseline.replace("/template.csv", "/other.csv"), false],
    [
      "download name",
      baseline.replace('download="template.csv"', 'download="other.csv"'),
      false,
    ],
    ["chart geometry", baseline.replace('cx="60"', 'cx="61"'), false],
    [
      "decorative event",
      baseline.replace(
        "Save<a",
        `${decoration.replace('focusable="false"', 'focusable="false" onClick={erase}')}Save<a`,
      ),
      false,
    ],
  ];
  const dynamic =
    'const View = () => <button className={selected ? "one" : "two"}>Save</button>;';
  cases.push([
    "dynamic class condition",
    dynamic.replace("selected ?", "other ?"),
    false,
    dynamic,
  ]);
  for (const [name, candidate, equal, original = baseline] of cases) {
    const actualEqual =
      firstDifference(parse(original), parse(candidate)) === null;
    if (actualEqual !== equal)
      failures.push({ file: "self-check", rule: name });
  }
  return cases.length;
}

const selfChecks = selfCheck();
const protectedFiles = git(
  "ls-tree",
  "-rz",
  "--name-only",
  reference,
  "--",
  "app",
  "legacy-source",
  "reference",
)
  .toString("utf8")
  .split("\0")
  .filter(Boolean);
let exactFiles = 0;
let presentationFiles = 0;
for (const file of protectedFiles) {
  const currentPath = path.join(repoRoot, file);
  if (!existsSync(currentPath)) {
    failures.push({ file, rule: "existing file removed" });
    continue;
  }
  const before = git("show", `${reference}:${file}`);
  const after = readFileSync(currentPath);
  if (allowedExistingStyles.has(file)) {
    presentationFiles++;
  } else if (
    file.startsWith("app/src/") &&
    file.endsWith(".tsx") &&
    !file.endsWith(".test.tsx")
  ) {
    presentationFiles++;
    try {
      const difference = firstDifference(
        parse(before.toString("utf8"), file),
        parse(after.toString("utf8"), file),
      );
      if (difference)
        failures.push({ file, rule: "source AST changed", ...difference });
    } catch (error) {
      failures.push({ file, rule: error.message });
    }
  } else {
    exactFiles++;
    if (!before.equals(after))
      failures.push({ file, rule: "protected bytes changed" });
  }
}
const baselinePaths = new Set(protectedFiles);
const newFiles = new Set(
  [
    git("ls-files", "-z", "--", "app"),
    git("ls-files", "--others", "--exclude-standard", "-z", "--", "app"),
  ].flatMap((output) => output.toString("utf8").split("\0").filter(Boolean)),
);
for (const file of newFiles) {
  if (!baselinePaths.has(file) && !knownUntrackedFiles.has(file))
    failures.push({ file, rule: "new app file requires review" });
}
console.log(
  JSON.stringify(
    {
      reference: git("rev-parse", reference).toString("utf8").trim(),
      result: failures.length ? "FAIL" : "PASS",
      exactFiles,
      presentationFiles,
      selfChecks,
      failures,
      limits: [
        "CSS, visual contrast, visibility, focus and runtime rendering require separate browser checks.",
        "Only static aria-hidden SVG decoration and class tokens are exempted from the TSX AST comparison.",
        "Whitespace-only JSX text and comments are ignored; meaningful copy and all existing non-class attributes remain checked.",
        "Pre-existing untracked app/src/main.ts is outside this Git comparison and deliberately untouched.",
      ],
    },
    null,
    2,
  ),
);
process.exitCode = failures.length ? 1 : 0;
