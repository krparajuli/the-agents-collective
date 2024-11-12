// HTML template for the form
const formHTML = `
<!DOCTYPE html>
<html>
<head>
    <title>Agents Form</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        form { margin-bottom: 20px; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f2f2f2; }
    </style>
</head>
<body>
    <h2>The Agents Collective</h2>
    Malware is a real threat. Help us keep it at bay by submitting your browser info.
    We use this info to create real looking browser scenarios to trap and investigate malwares - in order to keep all of us safe.
    Read more here at <a href="https://kalsec.notion.site/The-Agents-Collective-Project-13c4fb26a3f380b0aa75c4b8491a5e49">The Agents Collective - KalSec</a>

    <h3>Please submit the info of the system you are using to fill this form.</h3>

    <form method="POST">

        <div>
            <label for="name">Browser:</label> &nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="browser" placeholder="Required" required>
          </div>
          <br>
          <div>
            <label for="name">Browser Version:</label> &nbsp;
            <input type="text" id="name" name="browser_version" placeholder="Optional [Best effort please]" >
          </div>
          <br>
          <div>
            <label for="name">OS:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="os" placeholder="Optional [Best effort please]" >
          </div>
          <br>
          <div>
            <label for="name">OS Version:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="os_version"  placeholder="Optional [Best effort please]">
          </div>
          <br>
          <div>
            <label for="name">Device Type:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="device_type"  placeholder="Required"  required>
          </div>
          <br>
          <div>
            <label for="name">Device Brand:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="device_brand"  placeholder="Required"  required>
          </div>
          <br>
          <div>
            <label for="name">Device Model:</label> &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            <input type="text" id="name" name="device_model" placeholder="Required" required>
          </div>
        <br>
        <button type="submit">Submit</button>
    </form>
    {{TABLE_CONTENT}}
</body>
</html>
`;

// Function to generate table HTML from data
function generateTableHTML(data) {
  if (data.length === 0) return "<p>No submissions yet.</p>";

  let tableHTML = `
        <h2>Submissions</h2>
        <table>
            <tr>
            <th>ID</th>
            <th>User Agent</th>
            <th>Browser</th>
            <th>Browser Version</th>
            <th>OS</th>
            <th>OS Version</th>
            <th>Device Type</th>
            <th>Device Brand</th>
            <th>Device Model</th>
            </tr>
    `;

  data.forEach((row) => {
    tableHTML += `
            <tr>
                <td>${row.id}</td>
                <td>${row.user_agent}</td>
                <td>${row.browser}</td>
                <td>${row.browser_version}</td>
                <td>${row.os}</td>
                <td>${row.os_version}</td>
                <td>${row.device_type}</td>
                <td>${row.device_brand}</td>
                <td>${row.device_model}</td>
            </tr>
        `;
  });

  tableHTML += "</table>";
  return tableHTML;
}

export default {
  async fetch(request, env) {
    // Handle different HTTP methods
    switch (request.method) {
      case "POST":
        return handlePost(request, env);
      case "GET":
        return handleGet(request, env);
      default:
        return new Response("Method not allowed", { status: 405 });
    }
  },
};

async function handleGet(request, env) {
  // Fetch all submissions from the database
  const { results } = await env.DB.prepare(
    "SELECT * FROM agents ORDER BY created_at DESC",
  ).all();

  // Generate the complete HTML with the table
  const html = formHTML.replace(
    "{{TABLE_CONTENT}}",
    generateTableHTML(results),
  );

  return new Response(html, {
    headers: { "Content-Type": "text/html" },
  });
}

async function handlePost(request, env) {
  const formData = await request.formData();
  const headers = Object.fromEntries(request.headers);

  // Extract form data
  const browser = formData.get("browser");
  const browserVersion = formData.get("browser_version");
  const os = formData.get("os");
  const osVersion = formData.get("os_version");
  const deviceType = formData.get("device_type");
  const deviceBrand = formData.get("device_brand");
  const deviceModel = formData.get("device_model");

  // Get current timestamp
  const timestamp = new Date().toISOString();

  // Insert data into database
  await env.DB.prepare(
    `INSERT INTO agents (
      browser, browser_version, os, os_version,
      device_type, device_brand, device_model,
      user_agent, all_http_headers, cf_request_headers, ip, created_at)
      VALUES (
        ?,  ?,  ?,  ?,
        ?,  ?,  ?,
        ?,  ?,  ?,  ?,  ?
      )`,
  )
    .bind(
      browser,
      browserVersion,
      os,
      osVersion,
      deviceType,
      deviceBrand,
      deviceModel,
      headers["user-agent"] || "Unknown",
      JSON.stringify(headers),
      JSON.stringify(request.headers),
      request.headers.get("cf-connecting-ip") || "Unknown",
      timestamp,
    )
    .run();

  // Redirect back to GET to show the updated list
  return Response.redirect(request.url, 302);
}
