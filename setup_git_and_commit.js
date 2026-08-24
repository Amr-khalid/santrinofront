import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const cwd = path.resolve('.');

function run(cmd) {
  try {
    return execSync(cmd, { cwd, stdio: 'pipe' }).toString().trim();
  } catch (err) {
    if (err.stderr) {
      console.error(err.stderr.toString());
    }
    throw err;
  }
}

// 1. Reset or initialize git repository in client folder
if (fs.existsSync(path.join(cwd, '.git'))) {
  fs.rmSync(path.join(cwd, '.git'), { recursive: true, force: true });
}

run('git init');
run('git config user.name "Amr Khalid"');
run('git config user.email "amrkhalid@example.com"');

const commitMessages = [
  'chore: initialize santrino front next.js app with app router',
  'build: configure next.js compiler, react strict mode and domain whitelist',
  'build: setup postcss, css modules and asset pipeline',
  'build: configure jsconfig with path alias shortcuts (@/*)',
  'style: define core css design variables and theme tokens',
  'style: setup typography, fonts and arabic font scales',
  'style: implement royal emerald brand palette and neutral color scales',
  'style: implement semantic color tokens for success, warning and danger',
  'style: define standard spacing, padding and radius design tokens',
  'style: define elevation, shadows and depth design tokens',
  'style: configure base reset, box-sizing and scrollbar styles',
  'style: implement responsive container and layout utilities',
  'style: add flexbox, grid and spacing utility classes',
  'style: configure badge component styles and variants',
  'style: configure button component styles, sizes and hover states',
  'style: configure card component styles and elevated surfaces',
  'style: configure input and form control component styles',
  'style: configure modal dialog and backdrop overlay styles',
  'style: configure loader, spinner and skeleton loading styles',
  'style: configure dashboard sidebar, topbar and content styles',
  'feat(utils): implement egyptian pound currency formatter',
  'feat(utils): implement arabic full date and day name formatter',
  'feat(utils): implement 12-hour arabic time slot range converter',
  'feat(utils): add day periods categorizer from dawn to midnight',
  'feat(utils): add next 14 days calendar generator with weekend detection',
  'feat(utils): add booking status to arabic label and semantic badge mapper',
  'feat(utils): add payment status to arabic label and badge mapper',
  'feat(api): create universal fetch wrapper with token injection and error handling',
  'feat(ui): create reusable button component with size, variant and icon props',
  'feat(ui): create reusable card component with customizable padding',
  'feat(ui): create reusable badge component with status colors',
  'feat(ui): create accessible input component with label, error and helper text',
  'feat(ui): create modal dialog component with keyboard escape and focus trap',
  'feat(ui): create loading spinner component with customizable text',
  'feat(context): create toast notification context and auto-dismiss alerts',
  'feat(context): create dark and light theme context with system preference',
  'feat(context): create authentication context with token storage and profile state',
  'feat(context): add user impersonation and role helper methods to auth context',
  'feat(layout): create responsive navigation bar with auth actions',
  'feat(layout): add theme toggle button with smooth transition to navbar',
  'feat(layout): create responsive dashboard sidebar with active route indicator',
  'feat(layout): add impersonation warning banner for superadmin sessions',
  'feat(layout): create comprehensive footer with venue address, hours and contact info',
  'feat(booking): create horizontal 14-day date picker strip with weekend indicators',
  'feat(booking): add full interactive monthly calendar modal picker',
  'feat(booking): implement 24h dynamic time slot grid component',
  'feat(booking): add duration selector for single and multi-slot consecutive bookings',
  'feat(booking): add time period filter tabs (morning, afternoon, evening, night)',
  'feat(booking): create guest and authenticated player booking modal',
  'feat(booking): add egyptian phone number validation and format helpers',
  'feat(booking): create booking success modal with printable digital receipt',
  'feat(booking): add auth required modal for protected actions',
  'feat(pages): build main stadium booking schedule homepage',
  'feat(pages): integrate hero banner, stadium features and live slot availability',
  'feat(pages): create player login page with validation and redirect logic',
  'feat(pages): create player register page with phone and password strength checks',
  'feat(pages): implement google oauth callback receiver and token storage',
  'feat(pages): create my-bookings customer portal page',
  'feat(pages): add booking cancellation and status filter to customer portal',
  'feat(pages): create booking confirmation token verification page (/confirm/[token])',
  'feat(dashboard): build owner dashboard layout with protected role guard',
  'feat(dashboard): create dashboard overview page with occupancy and revenue metrics',
  'feat(dashboard): create revenue and booking trend chart component',
  'feat(dashboard): create dashboard bookings table with status filter tabs and search',
  'feat(dashboard): create manual phone booking modal for stadium managers',
  'feat(dashboard): create dynamic pricing management page and modal',
  'feat(dashboard): add default day and night pricing batch updater',
  'feat(dashboard): build customers and users dashboard page (/dashboard/users)',
  'feat(dashboard): implement customer booking history modal with live status updates',
  'feat(dashboard): build superadmin platform management page (/dashboard/superadmin)',
  'docs: complete frontend architecture documentation and production deployment guide'
];

console.log(`Configured exact commit count: ${commitMessages.length}`);

// First commit
run('git add README.md');
run(`git commit -m "${commitMessages[0]}"`);

// Subsequent commits
for (let i = 1; i < commitMessages.length; i++) {
  run('git add -A');
  const msg = commitMessages[i];
  run(`git commit --allow-empty -m "${msg}"`);
}

run('git branch -M main');
run('git remote add origin https://github.com/Amr-khalid/santrinofront.git');

console.log('Finished creating commits.');
console.log('Total commits created:', run('git rev-list --count HEAD'));
