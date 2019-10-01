# AWS profile CLI & Utils

Utility methods for updating AWS profile credentials on a machine.

Run with the companion CLI [aws-profile-cli](https://www.npmjs.com/package/aws-profile-cli)

```bash
npm install aws-profile-cli -g

# Switch accounts with awss
awss

? Which profile do you want to switch to?
- CompanyBlah
- AccountTwo
- PersonalPetProjects
```

![profile-switcher](https://user-images.githubusercontent.com/532272/46390869-e1c15680-c68e-11e8-9978-8ee00796c5f5.gif)

## Security

**WARNING** Please setup [2 factor authentication in AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable_virtual.html) to avoid AWS admin credentials from being stolen & exploited.

See [assume-role](https://github.com/remind101/assume-role) CLI for MFA.

