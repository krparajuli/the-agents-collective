CREATE TABLE agents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    device_type TEXT DEFAULT "N/A",
    device_brand TEXT DEFAULT "N/A",
    device_model TEXT DEFAULT "N/A",
    os TEXT DEFAULT "N/A",
    os_version TEXT DEFAULT "N/A",
    browser TEXT DEFAULT "N/A",
    browser_version TEXT DEFAULT "N/A",

    user_agent TEXT DEFAULT "N/A",
    all_http_headers TEXT DEFAULT "N/A",
    cf_request_headers TEXT DEFAULT "N/A",
    ip TEXT DEFAULT "N/A", --- Collected for value resolution
    created_at TEXT        --- IP and time based resolution
);
