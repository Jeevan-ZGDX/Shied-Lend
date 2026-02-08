# Security Policy

## Overview
Shied-Lend is a privacy-preserving lending protocol built on the Stellar blockchain using zero-knowledge proofs. Security is fundamental to our project, especially given the sensitive nature of financial transactions and cryptographic operations.

## Reporting Security Vulnerabilities
We take security seriously and appreciate the community's help in identifying and reporting vulnerabilities responsibly.

### Disclosure Process
If you discover a security vulnerability, please **do not** open a public GitHub issue. Instead:
1. **Email us** at [security contact - jeevansri15@gmail.com, devarajanm.magesh@gmail.com, pd652027@gmail.com]
2. **Include details:**
   - Type and description of the vulnerability
   - Affected components (e.g., contracts, proving service, C++ circuits)
   - Steps to reproduce (if applicable)
   - Potential impact assessment
   - Suggested remediation (if you have one)

3. **Timeline expectations:**
   - Acknowledgment within 48 hours
   - Initial assessment within 1 week
   - Updates on remediation progress every 2 weeks
   - Public disclosure coordinated with you after patches are released

## Security Considerations
### Smart Contracts
- All Stellar smart contracts undergo rigorous testing
- See `/contracts` for deployment details and `/contracts.json` for contract references
- Critical vulnerabilities should be reported immediately

### Cryptographic Circuits
- Zero-knowledge proof circuits are located in `/circuits`
- Circuit correctness is crucial for protocol security
- Any proofs of unsoundness or soundness issues are critical

### Proving Service
- The proving service (`/proving-service`) handles sensitive proof generation
- Issues with proof correctness or information leakage should be reported urgently
- We maintain a broken service reference (`/proving-service-broken`) for testing purposes

### C++ Implementation
- The majority of the codebase is C++/Rust (97.3%)
- Memory safety issues, integer overflows, and undefined behavior are critical
- Low-level cryptographic operations require careful review

## Security Best Practices
### For Users
- Never share your private keys
- Verify contract addresses before transactions
- Use official deployment addresses from `/lending_address.txt`, `/liquidator_address.txt`, and `/vault_address.txt`
- Monitor transaction logs for unauthorized activity

### For Developers Contributing
- Review the preflight checks in `preflight_check.sh`
- Run deployment and test scripts (`deploy-and-test.sh`, `test.sh`) to validate changes
- Use the provided test suite before submitting pull requests
- Follow Rust safety guidelines (for modules using Rust)
- Implement bounds checking in C++ code

## Known Limitations
- This project is currently in hackathon stage and should not be used in production without additional audits
- The codebase includes experimental features and broken proving service references for testing
- Zero-knowledge proofs are only as secure as their implementation and circuit design

## Security Audits
As of now, comprehensive third-party security audits have not been completed. Users should exercise caution and await professional security reviews before using this in production.

## Dependencies
Please keep dependencies in `Cargo.toml` and `Cargo.lock` up to date:
- Regularly check for security advisories
- Update dependencies responsibly with proper testing
- Use `cargo audit` to identify known vulnerabilities

## Code Review
All code changes undergo review before merging. Security considerations include:
- Memory safety (especially in C++ code)
- Input validation
- Cryptographic correctness
- Side-channel resistance
- State machine consistency

## Responsible Disclosure Timeline
We follow a 90-day coordinated disclosure timeline:
- Day 0: Vulnerability reported
- Day 0-30: Investigation and initial patch development
- Day 30-60: Testing and validation
- Day 60-90: Public release preparation
- Day 90+: Public disclosure
Extensions may be negotiated for complex vulnerabilities.

## Questions?
For security-related questions (non-vulnerability), please check:
- `/README.md` for project overview
- Existing issues and discussions
- Smart contract documentation

## License
This project is licensed under the MIT License. See `/LICENSE` for details.

---

**Last Updated:** February 2026

*This security policy will be updated as the project evolves. Check back regularly for updates.*
