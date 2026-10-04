// node:test runs and reports imported tests, and sets a failing exit status.
// Run in the main process so restricted environments do not hide isolated suites.
import './data-protection.test';
import './frontend-initialization.test';
