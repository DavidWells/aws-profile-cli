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

## Security

**WARNING** Please setup [2 factor authentication in AWS](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_credentials_mfa_enable_virtual.html) to avoid AWS admin credentials from being stolen & exploited.

