import fs from "node:fs";
import path from "node:path";

function renderHtml() {
  const framerIndexPath = path.join(process.cwd(), "src", "framer", "index.html");
  return fs.readFileSync(framerIndexPath, "utf8");
}

export default function TestingPage1() {
  const html = renderHtml();

  return (
    <iframe
      title="Framer Testing - Original"
      srcDoc={html}
      style={{ width: "100%", height: "100vh", border: 0 }}
      sandbox="allow-scripts allow-forms allow-same-origin"
    />
  );
}
