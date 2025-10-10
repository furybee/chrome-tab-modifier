# Security Testing Guide

This guide explains how to run security scans locally before pushing to CI.

## ClamAV Malware Scan

### Installation

**macOS:**
```bash
brew install clamav
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install clamav clamav-daemon
```

### Update Virus Database

```bash
# Stop the freshclam daemon if running
sudo systemctl stop clamav-freshclam  # Linux
# or
brew services stop clamav  # macOS

# Update the database
sudo freshclam
# or
freshclam  # if running as user
```

### Run Scan Locally

```bash
# Scan the repository (excluding node_modules, .git, dist)
clamscan -r -i --exclude-dir=node_modules --exclude-dir=.git --exclude-dir=dist .
```

**Options:**
- `-r` : Recursive scan
- `-i` : Only show infected files
- `--exclude-dir` : Exclude specific directories

### Expected Output

If no malware is detected:
```
----------- SCAN SUMMARY -----------
Known viruses: 8700000
Engine version: 1.0.0
Scanned directories: X
Scanned files: XXX
Infected files: 0
Data scanned: XX.XX MB
Time: XX.XXX sec (X m XXs)
Start Date: YYYY:MM:DD HH:MM:SS
End Date:   YYYY:MM:DD HH:MM:SS
```

## Other Security Scans

### Semgrep

```bash
# Install
pip install semgrep

# Run scan
semgrep scan --config auto .
```

### Gitleaks (Secret Detection)

```bash
# Install
brew install gitleaks  # macOS
# or download from https://github.com/gitleaks/gitleaks/releases

# Run scan
gitleaks detect --source . --no-git
```

### Dependency Audit

```bash
# Check for vulnerable dependencies
npx audit-ci --package-manager yarn --severity high
```

### All Tests

```bash
# Run unit tests with coverage
yarn test
yarn coverage
```

## Continuous Integration

All these scans run automatically in GitHub Actions on every push:

- **Test** : Unit tests with coverage
- **Semgrep** : SAST security scanning
- **CodeQL** : Advanced security analysis
- **Gitleaks** : Secret detection
- **Dependency Audit** : npm/yarn vulnerability check
- **ClamAV** : Malware detection

Check `.github/workflows/ci.yml` for the full CI configuration.

## Troubleshooting

### ClamAV Database Update Fails

If `freshclam` fails with permission errors:
```bash
sudo freshclam
```

If it fails because the daemon is running:
```bash
# Linux
sudo systemctl stop clamav-freshclam
sudo freshclam
sudo systemctl start clamav-freshclam

# macOS
brew services stop clamav
freshclam
brew services start clamav
```

### ClamAV Scan Takes Too Long

Use the `-i` flag to only show infected files and speed up output:
```bash
clamscan -r -i --exclude-dir=node_modules .
```

### False Positives

If ClamAV reports a false positive:
1. Verify the file is legitimate
2. Report to ClamAV: https://www.clamav.net/reports/fp
3. Add to exclusion list if needed
