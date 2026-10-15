const fs = require("fs");

const file = "src/App.jsx";
let app = fs.readFileSync(file, "utf8");

app = app.replace(
  /import Login from "\.\/Login";\s*/,
  ""
);

app = app.replace(
  /const \[loggedIn, setLoggedIn\] = useState\([\s\S]*?\);\s*/,
  ""
);

app = app.replace(
  /const \[currentUser, setCurrentUser\] = useState\([\s\S]*?\);\s*/,
  'const [currentUser] = useState("AI Voice Tester");\n'
);

app = app.replace(
  /useEffect\(\(\) => \{\s*if \(!loggedIn\) \{\s*return;\s*\}\s*checkBackend\(\);\s*loadCustomers\(\);\s*\}, \[loggedIn\]\);/,
  'useEffect(() => {\n    checkBackend();\n    loadCustomers();\n  }, []);'
);

app = app.replace(
  /const handleLogin = \(name\) => \{[\s\S]*?\n  \};\s*const handleLogout = \(\) => \{[\s\S]*?\n  \};\s*/,
  ""
);

app = app.replace(
  /if \(!loggedIn\) \{\s*return <Login onLogin=\{handleLogin\} \/>;\s*\}\s*/,
  ""
);

app = app.replace(
  /<div className="brand-title">\s*DDL LAB\s*<\/div>/g,
  '<div className="brand-title">AI Voice Tester</div>'
);

app = app.replace(
  /DDL LAB AI VOICE/g,
  "AI VOICE TESTER"
);

app = app.replace(
  /DDL LAB Voice Agent/g,
  "AI Voice Tester"
);

app = app.replace(
  /\{currentUser \|\| "DDL LAB Admin"\}/g,
  "AI Voice Tester"
);

app = app.replace(
  /<button\s+className="icon-button"\s+title="Logout"\s+onClick=\{handleLogout\}[\s\S]*?<\/button>/,
  ""
);

if (app.includes("loggedIn") || app.includes("handleLogin") || app.includes("<Login")) {
  console.error("Update stopped: login references remain. Backup is preserved.");
  process.exit(1);
}

fs.writeFileSync(file, app, "utf8");
console.log("App.jsx updated successfully.");
