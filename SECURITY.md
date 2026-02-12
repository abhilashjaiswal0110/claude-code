# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**Please do not report security vulnerabilities through public GitHub issues.**

Instead, please report them via:

1. **GitHub Security Advisories**: https://github.com/abhilashjaiswal0110/claude-code/security/advisories/new
2. **Email**: abhilash.jaiswal@atos.net

Please include the following information:

- Type of vulnerability
- Full paths of source file(s) related to the vulnerability
- Location of the affected source code (tag/branch/commit or direct URL)
- Step-by-step instructions to reproduce the issue
- Proof-of-concept or exploit code (if possible)
- Impact of the issue, including how an attacker might exploit it

## Security Measures

This repository implements the following security measures:

### Code Security
- **CodeQL Analysis**: Automated security scanning on every PR
- **Dependency Scanning**: Automated vulnerability detection in dependencies
- **Secret Scanning**: Prevents accidental commit of secrets and API keys
- **Copilot Security Review**: AI-powered security review on code changes

### Branch Protection
- **Required PR Reviews**: All changes must go through pull requests
- **Status Checks**: Automated CI/CD must pass before merge
- **Commit Signing**: Verified commits from authenticated authors
- **Branch Restrictions**: Direct pushes to main branch are blocked

### Access Control
- **Least Privilege**: Minimum necessary permissions for contributors
- **Protected Branches**: Main branch protected with multiple safeguards
- **Code Owners**: Critical files require specific reviewer approval

### Dependency Management
- **Regular Updates**: Dependabot monitors and updates dependencies
- **License Compliance**: Automated license checking
- **Audit Scanning**: npm audit runs on every build

## Best Practices for Contributors

1. **Never commit sensitive data**: API keys, passwords, tokens, or secrets
2. **Update dependencies**: Keep npm packages up to date
3. **Follow secure coding guidelines**: Use parameterized queries, input validation
4. **Review security warnings**: Address Copilot and CodeQL findings
5. **Use environment variables**: Store configuration in .env files (never committed)

## Vulnerability Response Timeline

- **Critical**: Response within 24 hours, patch within 7 days
- **High**: Response within 3 days, patch within 14 days
- **Medium**: Response within 7 days, patch within 30 days
- **Low**: Best effort basis

## Security Updates

Security updates will be released as needed and communicated through:
- GitHub Security Advisories
- Release notes
- Commit messages with `fix(security):` prefix

## Compliance

This project follows:
- OWASP Top 10 security practices
- GitHub recommended security settings
- Enterprise security standards for Atos GDC India

## Questions?

For security-related questions that are not vulnerabilities, open a discussion in the Security category.
