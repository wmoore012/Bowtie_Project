# Security Policy

## Supported Versions

This project is currently in MVP/academic development phase. Security updates are applied to the `main` branch.

| Version | Supported          |
| ------- | ------------------ |
| main    | :white_check_mark: |
| < 1.0   | :x:                |

## Reporting a Vulnerability

**⚠️ DO NOT open public issues for security vulnerabilities.**

We take security seriously. If you discover a security vulnerability, please report it privately using one of the methods below.

### Preferred: GitHub Security Advisory

1. Go to the [Security tab](../../security/advisories)
2. Click "Report a vulnerability"
3. Fill out the advisory form with details

### Alternative: Email

If GitHub Security Advisories are unavailable, email the maintainers:

**Email:** wmoore012@[institution-domain] (replace with actual contact)  
**Subject:** `[SECURITY] Brief description`

**Include in your report:**
- Description of the vulnerability
- Steps to reproduce
- Affected versions/components
- Potential impact
- Proof of concept (if available)
- Suggested fix (if you have one)

### PGP Encryption (Optional)

For highly sensitive reports, you may encrypt your email using PGP.

**PGP Key Fingerprint:** [Add if available]  
**Public Key:** [Link to public key if available]

## What to Expect

### Response Timeline

- **Initial acknowledgment:** Within 3 business days
- **Triage and assessment:** Within 1 week
- **Fix timeline:** Depends on severity (see below)
- **Public disclosure:** Coordinated with reporter

### Severity Levels

| Severity | Response Time | Examples |
|----------|---------------|----------|
| **Critical** | 24-48 hours | RCE, authentication bypass, data breach |
| **High** | 3-5 days | XSS, CSRF, privilege escalation |
| **Medium** | 1-2 weeks | Information disclosure, DoS |
| **Low** | 2-4 weeks | Minor information leaks, edge cases |

### Our Process

1. **Acknowledge** receipt of your report
2. **Validate** the vulnerability
3. **Assign** an owner to develop a fix
4. **Develop** and test the fix
5. **Coordinate** disclosure timeline with you
6. **Release** the fix
7. **Publish** security advisory and credit reporter (if desired)

## Public Disclosure

We believe in responsible disclosure:

- We will work with you to determine an appropriate disclosure timeline
- Typically 90 days after initial report or when fix is released (whichever comes first)
- We will credit you in the security advisory (unless you prefer to remain anonymous)
- Please do not publicly disclose until we've released a fix

## Security Best Practices for Contributors

### Do Not Commit Secrets

**Never commit:**
- API keys, tokens, or credentials
- Private keys or certificates
- Database passwords
- Environment variables with sensitive data

**If you accidentally commit a secret:**
1. **Immediately notify** the maintainers
2. **Rotate/revoke** the secret
3. **Do not** just delete the commit (it's still in history)
4. We will help you properly remove it from git history

### Code Security Guidelines

When contributing code:

- **Validate all inputs** – Never trust user input
- **Sanitize outputs** – Prevent XSS attacks
- **Use parameterized queries** – Prevent SQL injection (if applicable)
- **Avoid `eval()` and `dangerouslySetInnerHTML`** – Unless absolutely necessary and properly sanitized
- **Keep dependencies updated** – Run `npm audit` regularly
- **Follow principle of least privilege** – Minimal permissions needed

### Dependency Security

- Review `npm audit` output before submitting PRs
- Address high/critical vulnerabilities before merging
- Document any accepted risks in PR description
- Use `npm audit fix` to automatically update vulnerable dependencies

### Frontend-Specific Concerns

This is a client-side React application. Be aware of:

- **XSS vulnerabilities** – Sanitize user-generated content
- **Prototype pollution** – Validate object keys
- **Supply chain attacks** – Vet dependencies carefully
- **Client-side secrets** – Never store secrets in frontend code
- **CORS misconfigurations** – If adding API calls

## Scope

### In Scope

- Security vulnerabilities in application code
- Dependency vulnerabilities (high/critical severity)
- Authentication/authorization issues (if added in future)
- XSS, CSRF, injection vulnerabilities
- Sensitive data exposure

### Out of Scope

- Social engineering attacks
- Physical attacks
- DoS attacks requiring significant resources
- Issues in third-party services (report to them directly)
- Theoretical vulnerabilities without proof of concept
- Issues requiring physical access to user's machine
- Browser-specific bugs (report to browser vendors)

## Academic & Company Context

**Important:** This repository serves dual purposes:

1. **Academic project** for M.S. Data Science coursework
2. **MVP** for potential company use

### Special Considerations

- **Academic integrity:** Security issues should not be used to gain unfair academic advantage
- **Company data:** If you discover company-sensitive data in the repo, report immediately via security channels
- **Instructor notification:** Critical security issues may be reported to course instructors
- **Professional standards:** Treat security reports with the same professionalism expected in industry

## Security Features

### Current Security Measures

- **TypeScript strict mode** – Type safety
- **ESLint security rules** – Static analysis
- **Dependency scanning** – Automated vulnerability detection
- **No backend** – Client-side only (reduces attack surface)
- **No authentication** – No user data stored (currently)
- **Content Security Policy** – (Planned)

### Planned Security Enhancements

- [ ] Content Security Policy headers
- [ ] Subresource Integrity (SRI) for CDN resources
- [ ] Regular security audits
- [ ] Automated dependency updates via Dependabot
- [ ] Security-focused code review checklist

## Contact

**Project Lead:** @wmoore012  
**Security Email:** [Add email]  
**GitHub:** [Repository security tab](../../security)

---

**Thank you for helping keep Bowtie Builder Pro secure!** Responsible disclosure helps protect both the academic community and potential real-world users.

